import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Compass,
  LayoutDashboard,
  Palette,
  UserRound,
} from "lucide-react";
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

  const primaryHref = user ? "/dashboard" : "/register";
  const primaryLabel = user ? "Dashboard" : "Profilini oluştur";

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-normal">
          <Image src="/glitch-logo.png" alt="ghxsty.lol" width={30} height={30} className="rounded-md" />
          ghxsty.lol
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/discover" className="hidden h-10 items-center rounded-md px-3 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white sm:inline-flex">
            Keşfet
          </Link>
          <Link href="/events" className="hidden h-10 items-center rounded-md px-3 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white sm:inline-flex">
            Etkinlikler
          </Link>
          {user ? (
            <>
              {profile?.username ? (
                <Link href={`/${profile.username}`} className="hidden h-10 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white sm:inline-flex">
                  <UserRound className="h-4 w-4" />
                  Profilim
                </Link>
              ) : null}
              <Link href="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200">
                Dashboard
                <LayoutDashboard className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden h-10 items-center rounded-md px-3 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white sm:inline-flex">
                Giriş yap
              </Link>
              <Link href="/register" className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200">
                Kayıt ol
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-normal sm:text-6xl">
            ghxsty.lol
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            Profilini, linklerini, müziğini, temalarını ve etkinliklerini tek
            yerde topla. Kısa URL’in sende kalsın.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={primaryHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/discover" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15">
              Keşfet
              <Compass className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="rounded-md border border-white/10 bg-[#101014] p-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-fuchsia-300 via-cyan-200 to-white" />
              <div>
                <p className="text-xl font-bold">@ghxsty</p>
                <p className="text-sm text-zinc-400">ghxsty.lol/ghxsty</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {["GitHub", "Discord", "YouTube", "Spotify"].map((item) => (
                <div key={item} className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-zinc-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-10 md:grid-cols-4">
          {[
            { href: "/dashboard", title: "Profil", text: "Görünüm, medya ve linkler.", Icon: UserRound },
            { href: "/themes", title: "Temalar", text: "Hazır görünümleri kullan.", Icon: Palette },
            { href: "/events", title: "Etkinlikler", text: "Watch Party odalarına katıl.", Icon: Calendar },
            { href: "/discover", title: "Keşfet", text: "Diğer profilleri gez.", Icon: Compass },
          ].map(({ href, title, text, Icon }) => (
            <Link key={title} href={href} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
              <Icon className="h-5 w-5 text-zinc-300" />
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
