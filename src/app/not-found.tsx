import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050507] px-4 text-center text-white">
      <div>
        <p className="text-sm text-zinc-400">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal">
          Profil bulunamadı
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
          Bu kullanıcı adıyla herkese açık bir profil yok.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </main>
  );
}
