"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AtSign } from "lucide-react";
import { completeUsernameSetupAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types/database";

function SaveUsernameButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <AtSign className="h-4 w-4" />
      {pending ? "Kaydediliyor..." : "Kullanıcı adını kaydet"}
    </Button>
  );
}

export function UsernameSetup({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(completeUsernameSetupAction, {});

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/20">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-sm font-medium text-zinc-300">Son bir adım</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal">
            Profil linkin için kullanıcı adı seç
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Bu ad public profil URL&apos;in olacak. Örneğin ghxsty.lol/ghxsty.
          </p>
        </div>
        <form action={action} className="grid gap-3 sm:min-w-[360px]">
          <div className="grid gap-2">
            <Label htmlFor="setup_username">Kullanıcı adı</Label>
            <Input
              id="setup_username"
              name="username"
              autoComplete="username"
              pattern="^[a-z0-9_-]{3,20}$"
              placeholder="ghxsty"
              required
            />
          </div>
          <input
            type="hidden"
            name="display_name"
            value={profile.display_name ?? ""}
          />
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
          <SaveUsernameButton />
        </form>
      </div>
    </section>
  );
}
