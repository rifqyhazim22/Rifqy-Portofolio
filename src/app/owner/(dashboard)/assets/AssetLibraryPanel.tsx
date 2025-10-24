"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  confirmAssetUploadAction,
  deleteAssetAction,
  requestAssetUploadAction,
  updateAssetMetadataAction,
} from "./actions";
import type { MediaAssetRecord, MediaAssetStatus } from "@/lib/supabase/owner-assets";

const STATUS_OPTIONS: MediaAssetStatus[] = ["draft", "published", "archived"];

const formatTimestamp = (value: string) => {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

type AssetLibraryPanelProps = {
  assets: MediaAssetRecord[];
};

export const AssetLibraryPanel = ({ assets }: AssetLibraryPanelProps) => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, MediaAssetStatus>>({});
  const [pendingAssets, setPendingAssets] = useState<Record<string, Partial<MediaAssetRecord>>>({});
  const [isPending, startTransition] = useTransition();

  const metrics = useMemo(() => {
    const total = assets.length;
    const published = assets.filter((item) => item.status === "published").length;
    const draft = assets.filter((item) => item.status === "draft").length;
    return { total, published, draft };
  }, [assets]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const file = files[0];
    setIsUploading(true);
    setFeedback(null);

    try {
      const { uploadUrl, path } = await requestAssetUploadAction({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      });

      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      await confirmAssetUploadAction({
        path,
        mimeType: file.type,
        status: file.type.startsWith("image/") ? "published" : "draft",
        title: file.name.replace(/\.[^.]+$/, ""),
      });

      setFeedback("Asset uploaded successfully");
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to upload asset");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = (asset: MediaAssetRecord) => {
    const pending = pendingAssets[asset.id] ?? {};
    const status = selectedStatus[asset.id] ?? asset.status;

    startTransition(async () => {
      try {
        await updateAssetMetadataAction({
          id: asset.id,
          title: pending.title ?? asset.title ?? undefined,
          description: pending.description ?? asset.description ?? undefined,
          altText: pending.alt_text ?? asset.alt_text ?? undefined,
          status,
          tags: pending.tags as string[] | undefined,
          slug: pending.slug as string | undefined,
        });
        setFeedback("Asset saved");
        setPendingAssets((prev) => {
          const next = { ...prev };
          delete next[asset.id];
          return next;
        });
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to update asset");
      }
    });
  };

  const handleDelete = (asset: MediaAssetRecord) => {
    if (!confirm(`Hapus asset ${asset.title ?? asset.file_path}?`)) return;

    startTransition(async () => {
      try {
        await deleteAssetAction(asset.id);
        setFeedback("Asset removed");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to delete asset");
      }
    });
  };

  const updatePending = (id: string, key: keyof MediaAssetRecord, value: unknown) => {
    setPendingAssets((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  return (
    <section className="owner-story-card owner-story-card--wide" data-kind="assets">
      <header className="owner-story-card__header">
        <div className="owner-story-card__title">
          <h3>Assets library</h3>
          <p>Upload dan kelola gambar, video, atau dokumen yang digunakan di website.</p>
        </div>
        <div className="owner-story-card__header-actions">
          <div className="owner-story-card__metrics" aria-label="Assets overview">
            <article>
              <span>Total</span>
              <strong>{metrics.total}</strong>
            </article>
            <article>
              <span>Published</span>
              <strong>{metrics.published}</strong>
            </article>
            <article>
              <span>Drafts</span>
              <strong>{metrics.draft}</strong>
            </article>
          </div>
          <label className="owner-story-card__button owner-story-card__button--upload">
            <input
              type="file"
              onChange={(event) => handleUpload(event.target.files)}
              accept="image/*,video/*,audio/*,application/pdf"
              disabled={isUploading}
              hidden
            />
            {isUploading ? "Uploading…" : "Upload asset"}
          </label>
        </div>
      </header>

      {feedback && <p className="owner-story-card__feedback owner-story-card__feedback--global">{feedback}</p>}

      <div className="owner-assets__grid">
        {!assets.length && (
          <div className="owner-panel__empty owner-panel__empty--tall">
            <h4>Belum ada asset</h4>
            <p>Mulai dengan mengunggah gambar atau file lain. Asset yang dipublish langsung bisa dipakai di frontend.</p>
          </div>
        )}

        {assets.map((asset) => {
          const pending = pendingAssets[asset.id] ?? {};
          const status = selectedStatus[asset.id] ?? asset.status;
          const previewUrl = asset.type === "image" ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/owner-assets/${asset.file_path}` : null;

          return (
            <article key={asset.id} className="owner-asset-card">
              <header>
                <div>
                  <strong>{pending.title ?? asset.title ?? asset.file_path}</strong>
                  <span>{asset.mime_type ?? "Unknown type"}</span>
                </div>
                <time>{formatTimestamp(asset.updated_at)}</time>
              </header>

              {previewUrl && (
                <div className="owner-asset-card__preview">
                  <Image src={previewUrl} alt={asset.alt_text ?? "Asset preview"} width={320} height={200} />
                </div>
              )}

              <div className="owner-asset-card__fields">
                <label className="owner-panel__field owner-panel__field--inline">
                  <span>Title</span>
                  <input
                    defaultValue={asset.title ?? ""}
                    onChange={(event) => updatePending(asset.id, "title", event.target.value)}
                    placeholder="Judul asset"
                  />
                </label>
                <label className="owner-panel__field owner-panel__field--inline">
                  <span>Alt text</span>
                  <input
                    defaultValue={asset.alt_text ?? ""}
                    onChange={(event) => updatePending(asset.id, "alt_text", event.target.value)}
                    placeholder="Deskripsi singkat"
                  />
                </label>
                <label className="owner-panel__field owner-panel__field--inline">
                  <span>Status</span>
                  <select
                    value={status}
                    onChange={(event) =>
                      setSelectedStatus((prev) => ({
                        ...prev,
                        [asset.id]: event.target.value as MediaAssetStatus,
                      }))
                    }
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <footer>
                <button
                  type="button"
                  onClick={() => handleDelete(asset)}
                  className="owner-panel__secondary owner-panel__secondary--danger"
                  disabled={isPending}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate(asset)}
                  className="owner-panel__primary"
                  disabled={isPending}
                >
                  {isPending ? "Saving…" : "Save"}
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
};
