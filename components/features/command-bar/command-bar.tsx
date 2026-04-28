"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { partSearchResponseSchema } from "@/lib/ai/part-search/schema";

import { PartSearchResults } from "../part-search/results";

const PLACEHOLDER = "Type a part, describe a job, or describe a vendor email...";

interface UploadedImage {
  path: string;
  previewUrl: string;
  fileName: string;
}

interface UploadResponse {
  path: string;
  size: number;
  type: string;
  error?: string;
  message?: string;
}

/**
 * Home command bar — single point of entry per design-guide.
 * Accepts text, an image (file picker / drag-drop / paste), or both.
 *
 * Submit flow with image:
 *   1. Image is already uploaded by the time the user submits — the
 *      upload happens as soon as the file lands on the form, so by
 *      submit time we have a storage path.
 *   2. submit() sends { input_text, input_image_path }, both optional
 *      individually but at least one required (validated server-side).
 *
 * Cmd+K behavior (unchanged from T0.4):
 *   - On `/` → focus the input directly.
 *   - From any other page → push to `/?cmd=1`; the mount effect picks
 *     that up and focuses.
 */
export function CommandBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [text, setText] = useState("");
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/search/parts",
    schema: partSearchResponseSchema,
  });

  // Honor `?cmd=1` arrival: focus and clear the param.
  useEffect(() => {
    if (searchParams?.get("cmd") === "1") {
      inputRef.current?.focus();
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  // Listen for the focus event from the global Cmd+K handler.
  useEffect(() => {
    const onFocus = () => inputRef.current?.focus();
    window.addEventListener("maintenance:focus-command-bar", onFocus);
    return () => window.removeEventListener("maintenance:focus-command-bar", onFocus);
  }, []);

  // Revoke any blob URL we created when this component unmounts or the
  // image changes — avoids leaking a few hundred KB per upload.
  useEffect(() => {
    return () => {
      if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    };
  }, [image?.previewUrl]);

  const uploadFile = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as UploadResponse;
      if (!res.ok || !json.path) {
        URL.revokeObjectURL(previewUrl);
        setUploadError(json.message ?? "Upload failed.");
        return;
      }
      // If we already had an image (overwrite), revoke the prior preview.
      if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
      setImage({ path: json.path, previewUrl, fileName: file.name });
    } catch (err) {
      URL.revokeObjectURL(previewUrl);
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onFilePicked = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset so picking the same file twice still triggers change.
    e.target.value = "";
  };

  const onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          uploadFile(file);
          return;
        }
      }
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (Array.from(e.dataTransfer.types).includes("Files")) {
      e.preventDefault();
      setIsDragging(true);
    }
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    }
  };

  const clearImage = () => {
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
    setUploadError(null);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!image && trimmed.length < 2) return;
    submit({
      ...(trimmed.length >= 2 ? { input_text: trimmed } : {}),
      ...(image ? { input_image_path: image.path } : {}),
    });
  };

  return (
    <div
      className="flex w-full flex-col gap-4"
      onPaste={onPaste}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="command-bar-input" className="sr-only">
          Search parts, contractors, or compose a vendor email
        </label>
        <div
          className={`border-input bg-background focus-within:border-ring focus-within:ring-ring/30 flex items-center gap-2 rounded-md border px-3 py-2 transition-colors focus-within:ring-2 ${isDragging ? "border-ring ring-ring/30 ring-2" : ""}`}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isLoading}
            aria-label="Add a photo"
            title="Add a photo (or paste / drag in)"
            className="text-muted-foreground hover:text-foreground inline-flex h-6 w-6 items-center justify-center rounded transition-colors disabled:opacity-60"
          >
            <ImagePlus className="h-4 w-4" aria-hidden />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={onFilePicked}
            className="hidden"
          />
          <input
            id="command-bar-input"
            ref={inputRef}
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (text.length > 0) {
                  e.preventDefault();
                  setText("");
                } else {
                  inputRef.current?.blur();
                }
              }
            }}
            placeholder={PLACEHOLDER}
            disabled={isLoading}
            className="placeholder:text-muted-foreground/70 w-full bg-transparent text-base outline-none disabled:opacity-60"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={() => stop()}
              aria-label="Cancel search"
              className="text-muted-foreground hover:text-foreground inline-flex h-6 w-6 items-center justify-center rounded transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <kbd className="text-muted-foreground border-border bg-muted hidden h-6 items-center rounded border px-1.5 font-mono text-[11px] select-none sm:inline-flex">
              ⌘K
            </kbd>
          )}
        </div>

        {(image || uploading || uploadError) && (
          <div className="mt-2 flex items-center gap-3">
            {uploading && (
              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                Uploading…
              </span>
            )}
            {image && !uploading && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt={image.fileName}
                  className="border-border h-12 w-12 rounded border object-cover"
                />
                <span className="text-muted-foreground truncate text-xs">{image.fileName}</span>
                <button
                  type="button"
                  onClick={clearImage}
                  aria-label="Remove image"
                  className="text-muted-foreground hover:text-foreground inline-flex h-6 w-6 items-center justify-center rounded transition-colors"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </>
            )}
            {uploadError && (
              <span role="alert" className="text-destructive text-xs">
                {uploadError}
              </span>
            )}
          </div>
        )}

        {isLoading && (
          <p className="text-muted-foreground mt-2 inline-flex items-center gap-1.5 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            Searching…
          </p>
        )}
      </form>

      {!object && !isLoading && !error && !image && (
        <p className="text-muted-foreground/70 text-xs">
          Try{" "}
          <button
            type="button"
            onClick={() => {
              setText("drain pump for Hobart CL44e dishwasher");
              inputRef.current?.focus();
            }}
            className="text-muted-foreground hover:text-foreground font-mono underline-offset-2 hover:underline"
          >
            drain pump for Hobart CL44e dishwasher
          </button>
          , or paste / drag in a photo of a nameplate.{" "}
          <kbd className="border-border bg-muted ml-1 inline-flex h-4 items-center rounded border px-1 font-mono text-[10px] select-none">
            Esc
          </kbd>{" "}
          clears the input.
        </p>
      )}

      <PartSearchResults data={object} isLoading={isLoading} error={error} />
    </div>
  );
}
