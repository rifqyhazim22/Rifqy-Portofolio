import type { UpdateDetail, UpdateItem } from "@/i18n/types";

export interface UpdatesContent {
  title: string;
  intro: string;
  list: UpdateItem[];
  details: Record<string, UpdateDetail>;
  spotlight: Array<{ title: string; summary: string; href: string }>;
}
