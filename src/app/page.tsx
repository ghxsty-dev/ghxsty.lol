import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };
  const examples = [
    { name: "ghxsty", theme: "Cyberpunk", color: "from-fuchsia-400 to-cyan-300" },
    { name: "animecix", theme: "Anime", color: "from-rose-300 to-sky-300" },
    { name: "johndoe", theme: "Glass", color: "from-emerald-200 to-zinc-100" },
  ];
  const features = [
    {
      title: "Güvenli auth",
      text: "Şifreler Supabase Auth tarafından yönetilir.",
      Icon: ShieldCheck,
    },
    {
      title: "Tema sistemi",
      text: "Dark, Light, Midnight, Cyberpunk, Anime ve Glass.",
      Icon: Palette,
    },
    {
      title: "Medya yükleme",
      text: "Avatar ve banner Supabase Storage üzerinde tutulur.",
      Icon: Upload,
    },
  ];

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-lg font-bold tracking-normal">
          LinkForge
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {profile?.username ? (
                <Link
                  href={`/${profile.username}`}
                  className="hidden h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white sm:inline-flex"
                >
                  <UserRound className="h-4 w-4" />
                  Profilim
                </Link>
              ) : null}
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
              >
                Dashboard
                <LayoutDashboard className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                Giriş yap
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
              >
                Kayıt ol
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-14 pt-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-md border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-zinc-300">
            Guns.lol, Carrd ve Linktree ruhunda
          </p>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-normal sm:text-6xl">
            Tüm kimliğini tek, hızlı ve temalı profilde topla.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            Benzersiz kullanıcı URL’i, sosyal linkler, görsel yükleme, tema
            seçimi ve Supabase Auth ile güvenli hesap akışı.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
            >
              {user ? "Dashboard'a git" : "Profilini oluştur"}
              <Sparkles className="h-4 w-4" />
            </Link>
            {!user ? (
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Giriş yap
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4">
          {examples.map((example) => (
            <Card key={example.name} className="overflow-hidden">
              <CardContent className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4">
                <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${example.color}`} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">@{example.name}</p>
                  <p className="text-sm text-zinc-400">{example.theme} tema</p>
                </div>
                <span className="rounded-md border border-white/10 px-3 py-1 text-xs text-zinc-300">
                  /{example.name}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
          {features.map(({ title, text, Icon }) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
              <Icon className="mb-4 h-5 w-5 text-zinc-300" />
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
