import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Kayıt ol",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050507] px-4 py-10 text-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <Image src="/glitch-logo.png" alt="ghxsty.lol" width={22} height={22} className="rounded" />
            ghxsty.lol
          </Link>
          <CardTitle>Kayıt ol</CardTitle>
          <CardDescription>
            Kullanıcı adın public profil URL’in olur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="register" />
        </CardContent>
      </Card>
    </main>
  );
}
