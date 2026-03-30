import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload
 * Accepts a multipart form with a "file" field.
 * Compresses images to max 1200px wide, quality 80, and uploads to Cloudinary.
 * Returns { url, public_id }.
 *
 * Used for user identity document uploads during signup.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) ?? "bms-documents";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxBytes = 10 * 1024 * 1024; // 10 MB hard limit
    if (file.size > maxBytes) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, WebP or PDF." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadOptions: object = {
          folder,
          resource_type: file.type === "application/pdf" ? "raw" : "image",
          // Compress + resize images automatically
          ...(file.type !== "application/pdf" && {
            transformation: [
              { width: 1200, crop: "limit" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          }),
        };

        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error || !result) reject(error ?? new Error("Upload failed"));
            else resolve(result as { secure_url: string; public_id: string });
          }
        );
        stream.end(buffer);
      }
    );

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("[upload] unexpected error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
