"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { finalizeEventUploadAction } from "@/app/dashboard/events/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function uploadToR2({
  uploadUrl,
  file,
  contentType,
  onProgress,
}: {
  uploadUrl: string;
  file: File;
  contentType: string;
  onProgress: (progress: number) => void;
}) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.timeout = 60 * 60 * 1000;
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      reject(new Error(`R2 upload başarısız: HTTP ${xhr.status}`));
    };

    xhr.onerror = () => {
      reject(new Error("R2 upload isteği başarısız. Bucket CORS ayarlarını kontrol et."));
    };
    xhr.ontimeout = () => {
      reject(new Error("R2 upload zaman aşımına uğradı."));
    };
    xhr.onabort = () => {
      reject(new Error("R2 upload iptal edildi."));
    };

    xhr.send(file);
  });
}

export function EventMediaUploader({
  eventId,
  kind,
  label,
  accept,
}: {
  eventId: string;
  kind: "video" | "thumbnail";
  label: string;
  accept: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(false);

  async function upload() {
    if (!file) {
      setStatus("Dosya seç.");
      return;
    }

    setPending(true);
    setProgress(0);

    try {
      setStatus("Upload URL hazırlanıyor...");
      const response = await fetch("/api/events/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          kind,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        uploadUrl?: string;
        publicUrl?: string;
        key?: string;
        contentType?: string;
        error?: string;
      };

      if (!response.ok || !payload.uploadUrl || !payload.publicUrl || !payload.key || !payload.contentType) {
        setStatus(payload.error ?? "Upload URL alınamadı.");
        return;
      }

      setStatus("R2 yükleniyor...");
      await uploadToR2({
        uploadUrl: payload.uploadUrl,
        file,
        contentType: payload.contentType,
        onProgress: setProgress,
      });

      setStatus("Veritabanına kaydediliyor...");
      await finalizeEventUploadAction({
        eventId,
        kind,
        publicUrl: payload.publicUrl,
        key: payload.key,
      });

      setStatus("Yüklendi.");
      setFile(null);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload başarısız.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2 rounded-md border border-white/10 bg-white/[0.04] p-3">
      <Label>{label}</Label>
      <Input
        type="file"
        accept={accept}
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          setStatus(null);
          setProgress(0);
        }}
      />
      <Button type="button" onClick={() => void upload()} disabled={pending || !file} variant="secondary">
        {pending ? "Yükleniyor..." : "Yükle"}
      </Button>
      {pending || progress > 0 ? (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">%{progress}</p>
        </div>
      ) : null}
      {status ? <p className="text-xs text-zinc-400">{status}</p> : null}
      {file ? (
        <p className="text-xs text-zinc-500">
          {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
        </p>
      ) : null}
    </div>
  );
}
