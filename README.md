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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET=ghxsty-media
CLOUDFLARE_R2_PUBLIC_URL=https://cdn.ghxsty.lol
CRON_SECRET=change-this-long-random-secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/discord/callback
```

## Supabase

1. Supabase projesi oluştur.
2. `supabase/schema.sql` dosyasını SQL Editor içinde çalıştır.
3. Authentication > Providers altında Email provider açık olmalı.
4. Discord ile giriş için Authentication > Providers > Discord açık olmalı.
5. Discord Developer Portal > OAuth2 > Redirects içine Supabase callback URL eklenmeli:
   - `https://PROJECT_REF.supabase.co/auth/v1/callback`
6. Supabase Auth > URL Configuration içinde app callback URL değerleri eklenmeli:
   - `http://localhost:3000/auth/callback`
   - `https://ghxsty.lol/auth/callback`

Şifreler uygulama veritabanında tutulmaz. Kimlik doğrulama tamamen Supabase Auth üzerinden yapılır.

## Cloudflare R2

1. Cloudflare Dashboard içinde R2 bucket oluştur: `ghxsty-media`.
2. R2 > Manage R2 API Tokens içinden Object Read & Write yetkili token oluştur.
3. Account ID, Access Key ID ve Secret Access Key değerlerini `.env.local` içine ekle.
4. Bucket için public/custom domain ayarla. Önerilen: `cdn.ghxsty.lol`.
5. `CLOUDFLARE_R2_PUBLIC_URL` değerini bu public domain olarak gir.
6. R2 bucket CORS policy içine upload için şu izinleri ekle:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://ghxsty.lol",
      "https://www.ghxsty.lol"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Avatar, arka plan ve müzik dosyaları R2 üzerinde tutulur. Supabase içinde yalnızca bu dosyaların public URL kayıtları saklanır.

## Watch Party

Watch Party için Supabase SQL Editor içinde `supabase/migrations/watch_party_schema.sql` dosyasını çalıştır.

- Admin/moderatör paneli: `/dashboard/events`
- Public liste: `/events`
- Public etkinlik sayfası: `/events/[eventId]`
- Video upload R2 presigned URL ile yapılır; R2 secret client tarafına çıkmaz.
- Temizlik endpoint’i: `/api/events/cleanup`

Vercel Cron kullanacaksan `/api/events/cleanup` endpoint’ine `Authorization: Bearer CRON_SECRET` header’ı gönderilecek şekilde ayarla. Bu endpoint süresi geçmiş ended event videolarını R2’den siler ve event’i `deleted` durumuna alır.

## Bot Koruması

Kayıt formu Cloudflare Turnstile ile korunabilir.

1. Cloudflare Dashboard > Turnstile içinden widget oluştur.
2. Hostname olarak production domainini ve localhost geliştirme adresini ekle.
3. Site key değerini `NEXT_PUBLIC_TURNSTILE_SITE_KEY` içine ekle.
4. Secret key değerini `TURNSTILE_SECRET_KEY` içine ekle.

`TURNSTILE_SECRET_KEY` tanımlıysa kayıt formunda gelen Turnstile token sunucuda doğrulanır.

## Discord

Dashboard içinden Discord hesabı bağlanabilir.

1. Discord Developer Portal içinde application oluştur.
2. OAuth2 redirect URL olarak local ve production callback adreslerini ekle:
   - `http://localhost:3000/api/discord/callback`
   - `https://ghxsty.lol/api/discord/callback`
3. `.env.local` içine `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` ve `DISCORD_REDIRECT_URI` ekle.
4. Production için Vercel Environment Variables alanına aynı değerleri gir.
5. Supabase SQL Editor içinde `supabase/discord-integration.sql` dosyasını çalıştır.

Canlı Discord etkinliği için public profilde Lanyard API kullanılır. Lanyard veri dönmezse yalnızca bağlı Discord profil bilgisi gösterilir.

## Vercel

1. Repo’yu Vercel’e bağla.
2. Environment Variables alanına şunları ekle:
   - `NEXT_PUBLIC_SITE_URL=https://siteadi.com`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLOUDFLARE_R2_ACCOUNT_ID`
   - `CLOUDFLARE_R2_ACCESS_KEY_ID`
   - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
   - `CLOUDFLARE_R2_BUCKET`
   - `CLOUDFLARE_R2_PUBLIC_URL`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_REDIRECT_URI`
3. Supabase Auth > URL Configuration içinde Site URL ve Redirect URLs değerlerine production domainini ekle.
4. Deploy et.

## Komutlar

```bash
npm run dev
npm run lint
npm run build
```
