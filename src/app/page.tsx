import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  Compass,
  LayoutDashboard,
  MessageCircle,
  Palette,
  Radio,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
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
  const modules = [
    {
      title: "Profil Alanı",
      text: "Kendi URL’in, linklerin, müziğin, avatar dekorasyonların ve temaların.",
      href: user ? "/dashboard" : "/register",
      status: "Aktif",
      Icon: UserRound,
    },
    {
      title: "Keşfet",
      text: "Topluluğun profillerini gez, oy ver ve öne çıkan arayüzleri gör.",
      href: "/discover",
      status: "Aktif",
      Icon: Compass,
    },
    {
      title: "Watch Party",
      text: "Admin etkinliklerinde videoyu, chat’i, anketleri ve duyuruları birlikte takip et.",
      href: "/events",
      status: "Aktif",
      Icon: Radio,
    },
    {
      title: "Topluluk Temaları",
      text: "Paylaşılan görünümleri incele, kendi profil görünümüne aktar.",
      href: "/themes",
      status: "Aktif",
      Icon: Palette,
    },
  ];

  const features = [
    {
      title: "Güvenli hesap ve roller",
      text: "Auth, admin/mod yetkileri ve güvenli panel akışları tek yerde.",
      Icon: ShieldCheck,
    },
    {
      title: "Canlı etkinlikler",
      text: "Senkron video, chat, anket, duyuru ve medya yönetimi.",
      Icon: Calendar,
    },
    {
      title: "Medya altyapısı",
      text: "Avatar, arka plan, müzik, video ve GIF deneyimi.",
      Icon: Upload,
    },
    {
      title: "Yakında sohbet",
      text: "Sohbet kanalları, DM ve topluluk odaları için hazır mimari.",
      Icon: MessageCircle,
    },
  ];

  const upcoming = [
    {
      title: "Sohbet Kanalları",
      text: "Sunucu/oda mantığında topluluk sohbetleri.",
      Icon: MessageCircle,
    },
    {
      title: "Mesajlaşma",
      text: "Kullanıcılar arası özel mesajlar ve bildirimler.",
      Icon: Users,
    },
    {
      title: "Topluluk Alanları",
      text: "Etkinlik, profil ve sohbetleri bir araya getiren alanlar.",
      Icon: Sparkles,
    },
  ];

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <nav className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-normal">
          <Image src="/glitch-logo.png" alt="ghxsty.lol" width={28} height={28} className="rounded-md" />
          ghxsty.lol
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/discover"
            className="hidden h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Keşfet
          </Link>
          <Link
            href="/themes"
            className="hidden h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Temalar
          </Link>
          <Link
            href="/events"
            className="hidden h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Etkinlikler
          </Link>
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

      <section className="mx-auto grid w-full max-w-[1500px] gap-8 px-4 pb-12 pt-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-md border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-zinc-300">
            Profil, etkinlik, keşif ve yakında sohbet alanı
          </p>
          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-normal sm:text-6xl">
            ghxsty.lol artık tek bir profil sayfasından daha fazlası.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">
            Kendi arayüzünü oluştur, topluluk profillerini keşfet, watch party
            etkinliklerine katıl ve ileride gelecek sohbet kanallarıyla aynı
            sosyal alan içinde kal.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
            >
              {user ? "Kontrol merkezine git" : "Hesap oluştur"}
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
            <Link
              href="/events"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Etkinlikler
              <Calendar className="h-4 w-4" />
            </Link>
            <Link
              href="/discover"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Keşfet
              <Compass className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {modules.map(({ title, text, href, status, Icon }) => (
            <Link key={title} href={href} className="group">
              <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                <CardContent className="flex h-full flex-col gap-5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-xs text-emerald-200">
                      {status}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm text-zinc-300 transition group-hover:text-white">
                    Aç
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Platform Haritası</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal">
              Her şey ana menüden erişilebilir.
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-zinc-400">
              Profil düzenleme artık sadece bir modül. ghxsty.lol; keşif,
              etkinlikler, temalar, medya ve yakında sohbet sistemlerini aynı
              yüzeyde toplayacak.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {features.map(({ title, text, Icon }) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
                <Icon className="mb-4 h-5 w-5 text-zinc-300" />
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Yakında</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal">Sosyal alan genişliyor.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Bu alanlar şimdiden ana sayfada yer alıyor; ileride route’lar
            eklendiğinde aynı menü düzeni bozulmadan büyüyecek.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {upcoming.map(({ title, text, Icon }) => (
            <div key={title} className="rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-5">
              <div className="flex items-center justify-between gap-3">
                <Icon className="h-5 w-5 text-zinc-300" />
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-zinc-400">
                  Hazırlanıyor
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-12 md:grid-cols-3">
          {[
            { name: "ghxsty", meta: "Profil + etkinlik yöneticisi", color: "from-fuchsia-400 to-cyan-300" },
            { name: "animecix", meta: "Topluluk tema üreticisi", color: "from-rose-300 to-sky-300" },
            { name: "johndoe", meta: "Keşif profili", color: "from-emerald-200 to-zinc-100" },
          ].map((example) => (
            <Card key={example.name} className="overflow-hidden">
              <CardContent className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4">
                <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${example.color}`} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">@{example.name}</p>
                  <p className="text-sm text-zinc-400">{example.meta}</p>
                </div>
                <span className="rounded-md border border-white/10 px-3 py-1 text-xs text-zinc-300">
                  /{example.name}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
