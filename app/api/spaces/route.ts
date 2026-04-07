import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicSpaces } from "@/lib/data/spaces";

/**
 * GET /api/spaces
 * Returns all publicly-listed spaces with any admin overrides merged in.
 * No auth required — used by the user-facing spaces list.
 */
export async function GET() {
  const staticSpaces = getPublicSpaces();

  try {
    const adminDb = createAdminClient();
    const { data: overrides } = await adminDb
      .from("space_overrides")
      .select("space_id, status, description, capacity");

    if (!overrides || overrides.length === 0) {
      return NextResponse.json({ spaces: staticSpaces });
    }

    // Build a lookup map
    const overrideMap: Record<string, { status?: string; description?: string; capacity?: number }> = {};
    for (const o of overrides) {
      overrideMap[o.space_id] = {
        status:      o.status,
        description: o.description,
        capacity:    o.capacity,
      };
    }

    // Merge overrides into static space data
    const merged = staticSpaces.map((space) => {
      const override = overrideMap[space.id];
      if (!override) return space;

      return {
        ...space,
        // Map admin status to space availability
        availability:
          override.status === "inactive" || override.status === "maintenance"
            ? "closed" as const
            : space.availability,
        // If inactive, mark as not publicly listed so it's hidden
        isPubliclyListed:
          override.status === "inactive" ? false : space.isPubliclyListed,
        description:
          override.description ?? space.description,
        capacity:
          override.capacity ?? space.capacity,
      };
    });

    return NextResponse.json({ spaces: merged });
  } catch {
    // If DB fails, fall back to static data
    return NextResponse.json({ spaces: staticSpaces });
  }
}
