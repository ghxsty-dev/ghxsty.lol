# ghxsty.lol

Modern public profil platformu.

## Teknoloji

- Next.js 15 App Router
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui tarzı yeniden kullanılabilir UI bileşenleri
- Supabase Auth ve PostgreSQL
- Cloudflare R2 medya depolama
- Vercel deployment

## Klasör Yapısı

```txt
src/app
  (auth)/login
  (auth)/register
  dashboard
  [username]
src/components
  dashboard
  profile
  ui
src/lib
  r2.ts
  supabase
  themes.ts
  validation.ts
  utils.ts
src/types
supabase/schema.sql
```

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` değerleri:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET=ghxsty-media
CLOUDFLARE_R2_PUBLIC_URL=https://cdn.ghxsty.lol
```

## Supabase

1. Supabase projesi oluştur.
2. `supabase/schema.sql` dosyasını SQL Editor içinde çalıştır.
3. Authentication > Providers altında Email provider açık olmalı.
4. Google OAuth istenirse Authentication > Providers > Google içinden client bilgileri girilebilir.

Şifreler uygulama veritabanında tutulmaz. Kimlik doğrulama tamamen Supabase Auth üzerinden yapılır.

## Cloudflare R2

1. Cloudflare Dashboard içinde R2 bucket oluştur: `ghxsty-media`.
2. R2 > Manage R2 API Tokens içinden Object Read & Write yetkili token oluştur.
3. Account ID, Access Key ID ve Secret Access Key değerlerini `.env.local` içine ekle.
4. Bucket için public/custom domain ayarla. Önerilen: `cdn.ghxsty.lol`.
5. `CLOUDFLARE_R2_PUBLIC_URL` değerini bu public domain olarak gir.

Avatar, arka plan ve müzik dosyaları R2 üzerinde tutulur. Supabase içinde yalnızca bu dosyaların public URL kayıtları saklanır.

## Vercel

1. Repo’yu Vercel’e bağla.
2. Environment Variables alanına şunları ekle:
   - `NEXT_PUBLIC_SITE_URL=https://siteadi.com`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CLOUDFLARE_R2_ACCOUNT_ID`
   - `CLOUDFLARE_R2_ACCESS_KEY_ID`
   - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
   - `CLOUDFLARE_R2_BUCKET`
   - `CLOUDFLARE_R2_PUBLIC_URL`
3. Supabase Auth > URL Configuration içinde Site URL ve Redirect URLs değerlerine production domainini ekle.
4. Deploy et.

## Komutlar

```bash
npm run dev
npm run lint
npm run build
```
