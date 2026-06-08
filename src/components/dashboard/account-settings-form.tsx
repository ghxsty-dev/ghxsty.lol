"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateUsernameAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Güncelleniyor..." : "Kullanıcı adını değiştir"}
    </Button>
  );
}

export function AccountSettingsForm({ username }: { username: string }) {
  const [state, action] = useActionState(updateUsernameAction, {});

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="account_username">Kullanıcı adı</Label>
          <Input
            id="account_username"
            name="username"
            defaultValue={username}
            pattern="^[a-z0-9_-]{3,20}$"
            required
          />
          <p className="text-xs text-zinc-500">
            3-20 karakter, küçük harf, rakam, tire veya alt çizgi.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="account_username_password">Mevcut şifre</Label>
          <Input
            id="account_username_password"
            name="username_password"
            type="password"
            autoComplete="current-password"
            placeholder="Kullanıcı adını değiştirmek için gerekli"
          />
          <p className="text-xs text-zinc-500">
            Kullanıcı adı 24 saatte en fazla 2 kez değiştirilebilir.
          </p>
        </div>
      </div>
      {state.error || state.success ? (
        <p className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-200">
          {state.error ?? state.success}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
