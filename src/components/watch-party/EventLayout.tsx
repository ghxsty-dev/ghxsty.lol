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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        {player}
        <div className="grid gap-4 lg:grid-cols-2">{side}</div>
      </div>
      <aside>{chat}</aside>
    </div>
  );
}
