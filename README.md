# LinkForge

Guns.lol, Carrd ve Linktree benzeri modern public profil platformu.

## Teknoloji

- Next.js 15 App Router
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui tarzı yeniden kullanılabilir UI bileşenleri
- Supabase Auth, PostgreSQL ve Storage
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
```

## Supabase

1. Supabase projesi oluştur.
2. `supabase/schema.sql` dosyasını SQL Editor içinde çalıştır.
3. Authentication > Providers altında Email provider açık olmalı.
4. Google OAuth istenirse Authentication > Providers > Google içinden client bilgileri girilebilir.
5. Storage bucket ve RLS politikaları SQL dosyası tarafından oluşturulur.

Şifreler uygulama veritabanında tutulmaz. Kimlik doğrulama tamamen Supabase Auth üzerinden yapılır.

## Vercel

1. Repo’yu Vercel’e bağla.
2. Environment Variables alanına şunları ekle:
   - `NEXT_PUBLIC_SITE_URL=https://siteadi.com`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Supabase Auth > URL Configuration içinde Site URL ve Redirect URLs değerlerine production domainini ekle.
4. Deploy et.

## Komutlar

```bash
npm run dev
npm run lint
npm run build
```
