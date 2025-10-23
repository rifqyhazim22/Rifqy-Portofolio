import type { UpsertTestimonialInput } from "@/lib/supabase/owner-content";

export const buildTestimonialInput = (
  body: Record<string, unknown>,
): UpsertTestimonialInput | null => {
  const name = typeof body.name === "string" ? body.name : null;
  const quote = typeof body.quote === "string" ? body.quote : null;

  if (!name || !name.trim() || !quote || !quote.trim()) {
    return null;
  }

  const input: UpsertTestimonialInput = {
    name,
    quote,
    role: typeof body.role === "string" ? body.role : undefined,
    company: typeof body.company === "string" ? body.company : undefined,
    avatarUrl:
      typeof body.avatarUrl === "string" ? body.avatarUrl : undefined,
    status:
      body.status === "draft" || body.status === "published"
        ? body.status
        : undefined,
  };

  if (body.displayOrder === null) {
    input.displayOrder = null;
  } else if (typeof body.displayOrder === "number") {
    input.displayOrder = Number.isFinite(body.displayOrder)
      ? body.displayOrder
      : undefined;
  } else if (
    typeof body.displayOrder === "string" &&
    body.displayOrder.trim()
  ) {
    const parsed = Number(body.displayOrder);
    if (!Number.isNaN(parsed)) {
      input.displayOrder = parsed;
    }
  }

  return input;
};
