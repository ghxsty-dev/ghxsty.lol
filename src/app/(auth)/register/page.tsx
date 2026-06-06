import type { Metadata } from "next";
import Link from "next/link";
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
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            LinkForge
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
