/**
 * POST /api/upload/photo
 *
 * Receives a multipart upload of a single photo, stores it in the
 * `part-photos` Supabase Storage bucket via the admin client, and
 * returns the storage path so the client can then call
 * /api/search/parts with input_image_path set.
 *
 * Why server-side upload (not browser direct):
 * v1 has no auth, so the browser-side supabase client uses the anon
 * key. The bucket is private. Routing through the server keeps the
 * service-role key off the wire and avoids per-bucket RLS policies
 * for v1; tightening lands when auth lands post-v1.
 */
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/db/admin";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function extensionForType(type: string): string {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
    case "image/heif":
      return "heic";
    default:
      return "bin";
  }
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "invalid_form", message: "Body must be multipart/form-data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "no_file", message: "Missing 'file' field." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "empty_file", message: "File is empty." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: "too_large",
        message: `File too large (max ${MAX_BYTES / 1024 / 1024} MB).`,
      },
      { status: 413 },
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        error: "unsupported_type",
        message: `Unsupported file type: ${file.type}.`,
      },
      { status: 415 },
    );
  }

  const ext = extensionForType(file.type);
  const path = `${crypto.randomUUID()}.${ext}`;

  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage.from("part-photos").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json(
      {
        error: "upload_failed",
        message: uploadError.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ path, size: file.size, type: file.type });
}
