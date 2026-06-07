"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogIn, UserPlus } from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import {
  discordLoginAction,
  loginAction,
  registerAction,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Turnstile } from "@/components/turnstile";

type AuthFormProps = {
  mode: "login" | "register";
  next?: string;
  turnstileSiteKey?: string;
};

function SubmitButton({ mode }: { mode: "login" | "register" }) {
  const { pending } = useFormStatus();
  const Icon = mode === "login" ? LogIn : UserPlus;

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <Icon className="h-4 w-4" />
      {pending ? "İşleniyor..." : mode === "login" ? "Giriş yap" : "Kayıt ol"}
    </Button>
  );
}

export function AuthForm({ mode, next, turnstileSiteKey }: AuthFormProps) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction] = useActionState(action, {});
  const isLogin = mode === "login";

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        {!isLogin ? (
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı adı</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              pattern="^[a-z0-9_-]{3,20}$"
              placeholder="ghxsty"
              required
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={6}
            required
          />
        </div>
        {!isLogin && turnstileSiteKey ? (
          <Turnstile siteKey={turnstileSiteKey} />
        ) : null}
        {state.error ? (
          <p className="rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="rounded-md border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            {state.success}
          </p>
        ) : null}
        <SubmitButton mode={mode} />
      </form>
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-white/10" />
        veya
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <form action={discordLoginAction}>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Button type="submit" variant="secondary" className="w-full">
          <FaDiscord className="h-4 w-4" />
          Discord ile devam et
        </Button>
      </form>
      <p className="text-center text-sm text-zinc-400">
        {isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}{" "}
        <Link
          className="font-medium text-white underline-offset-4 hover:underline"
          href={isLogin ? "/register" : "/login"}
        >
          {isLogin ? "Kayıt ol" : "Giriş yap"}
        </Link>
      </p>
    </div>
  );
}
