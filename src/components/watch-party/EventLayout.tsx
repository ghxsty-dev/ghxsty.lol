import type { ReactNode } from "react";

export function EventLayout({
  player,
  chat,
  side,
}: {
  player: ReactNode;
  chat: ReactNode;
  side: ReactNode;
}) {
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        {player}
        <div className="grid gap-4 lg:grid-cols-2">{side}</div>
      </div>
      <aside className="xl:sticky xl:top-4 xl:self-start">{chat}</aside>
    </div>
  );
}
