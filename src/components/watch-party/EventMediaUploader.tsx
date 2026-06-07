"use client";

import { useState, useTransition } from "react";
import { finalizeEventUploadAction } from "@/app/dashboard/events/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function upload() {
    if (!file) {
      setStatus("Dosya seç.");
      return;
    }

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
    const payload = (await response.json()) as {
      uploadUrl?: string;
      publicUrl?: string;
      key?: string;
      error?: string;
    };

    if (!response.ok || !payload.uploadUrl || !payload.publicUrl || !payload.key) {
      setStatus(payload.error ?? "Upload URL alınamadı.");
      return;
    }

    setStatus("R2 yükleniyor...");
    const uploadResponse = await fetch(payload.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      setStatus("R2 upload başarısız.");
      return;
    }

    setStatus("Kaydediliyor...");
    startTransition(async () => {
      await finalizeEventUploadAction({
        eventId,
        kind,
        publicUrl: payload.publicUrl!,
        key: payload.key!,
      });
      setStatus("Yüklendi.");
    });
  }

  return (
    <div className="space-y-2 rounded-md border border-white/10 bg-white/[0.04] p-3">
      <Label>{label}</Label>
      <Input type="file" accept={accept} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <Button type="button" onClick={() => void upload()} disabled={pending || !file} variant="secondary">
        {pending ? "Kaydediliyor..." : "Yükle"}
      </Button>
      {status ? <p className="text-xs text-zinc-400">{status}</p> : null}
    </div>
  );
}
