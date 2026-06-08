import Link from "next/link";
import { createEventAction } from "@/app/dashboard/events/actions";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireModeratorOrAdmin } from "@/lib/permissions";

export default async function NewEventPage() {
  const { profile } = await requireModeratorOrAdmin("/dashboard");

  return (
    <main className="min-h-screen bg-[#050507] p-4 text-white">
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar username={profile.username} isAdmin />
        <div className="min-w-0">
        <Link href="/dashboard/events" className="text-sm text-zinc-400 hover:text-white">Events</Link>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Yeni Watch Party Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createEventAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık</Label>
                <Input id="title" name="title" required minLength={3} maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea id="description" name="description" maxLength={1000} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="starts_at">Başlangıç zamanı</Label>
                <Input id="starts_at" name="starts_at" type="datetime-local" />
              </div>
              <Button type="submit">Event oluştur</Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </main>
  );
}
