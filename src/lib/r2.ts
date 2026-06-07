import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type R2Config = {
  bucket: string;
  publicUrl: string;
};

let cachedClient: S3Client | null = null;

function getR2Config(): R2Config {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error(
      "Cloudflare R2 ayarları eksik. .env.local ve Vercel Environment Variables alanlarını kontrol et.",
    );
  }

  return { bucket, publicUrl };
}

function getR2Client() {
  if (cachedClient) {
    return cachedClient;
  }

  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 erişim anahtarları eksik.");
  }

  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedClient;
}

export function getR2ObjectKeyFromUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!publicUrl || !url.startsWith(`${publicUrl}/`)) {
    return null;
  }

  try {
    return decodeURIComponent(url.slice(publicUrl.length + 1));
  } catch {
    return null;
  }
}

export async function uploadR2Object({
  key,
  file,
  contentType,
}: {
  key: string;
  file: File;
  contentType: string;
}) {
  const { bucket, publicUrl } = getR2Config();
  const buffer = Buffer.from(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${publicUrl}/${encodeURI(key)}`;
}

export async function deleteR2ObjectByUrl(url?: string | null) {
  const key = getR2ObjectKeyFromUrl(url);
  if (!key) {
    return;
  }

  const { bucket } = getR2Config();

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
