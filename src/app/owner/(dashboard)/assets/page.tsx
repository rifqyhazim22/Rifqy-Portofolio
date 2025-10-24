import { AssetLibraryPanel } from "./AssetLibraryPanel";
import { listMediaAssets } from "@/lib/supabase/owner-assets";

export default async function OwnerAssetsPage() {
  const assets = await listMediaAssets();

  return (
    <div className="owner-dashboard" data-animate>
      <AssetLibraryPanel assets={assets} />
    </div>
  );
}
