"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useActionState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  addLinkAction,
  deleteLinkAction,
  reorderLinksAction,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MAX_PROFILE_LINKS } from "@/lib/limits";
import {
  LINK_ICON_OPTIONS,
  getLinkIcon,
  getLinkIconLabel,
} from "@/lib/link-icons";
import type { ProfileLink } from "@/types/database";

function SortableLink({ link }: { link: ProfileLink }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: link.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = getLinkIcon(link.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-white/10 bg-white/[0.06] p-3"
    >
      <button
        type="button"
        className="cursor-grab rounded-md p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
        aria-label="Sırala"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0">
        <p className="flex items-center gap-2 truncate text-sm font-medium text-white">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{link.title}</span>
        </p>
        <p className="truncate text-xs text-zinc-400">
          {getLinkIconLabel(link.icon)} · {link.url}
        </p>
      </div>
      <form action={deleteLinkAction}>
        <input type="hidden" name="id" value={link.id} />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label={`${link.title} linkini sil`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export function LinkManager({ links }: { links: ProfileLink[] }) {
  const [items, setItems] = useState(links);
  const [selectedIcon, setSelectedIcon] = useState("github");
  const [addState, addAction] = useActionState(addLinkAction, {});
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const limitReached = items.length >= MAX_PROFILE_LINKS;

  useEffect(() => {
    setItems(links);
  }, [links]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    startTransition(() => {
      void reorderLinksAction(reordered.map((item) => item.id));
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {items.length}/{MAX_PROFILE_LINKS} link kullanılıyor.
        </span>
        <span className="text-xs text-zinc-500">
          Limit, profilin okunabilir kalması için uygulanır.
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {LINK_ICON_OPTIONS.slice(0, 8).map((option) => {
          const Icon = getLinkIcon(option.key);
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelectedIcon(option.key)}
              className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-3 text-left text-sm text-zinc-200 transition hover:bg-white/10"
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>

      {addState.error ? (
        <p className="rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {addState.error}
        </p>
      ) : null}
      {addState.success ? (
        <p className="rounded-md border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {addState.success}
        </p>
      ) : null}

      <form action={addAction} className="grid gap-3 md:grid-cols-[1fr_1fr_0.8fr_auto]">
        <div className="space-y-2">
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            name="title"
            placeholder={getLinkIconLabel(selectedIcon)}
            disabled={limitReached}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            name="url"
            type="url"
            placeholder={
              LINK_ICON_OPTIONS.find((option) => option.key === selectedIcon)
                ?.placeholder ?? "https://example.com"
            }
            disabled={limitReached}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="icon">İkon</Label>
          <Select
            id="icon"
            name="icon"
            value={selectedIcon}
            onChange={(event) => setSelectedIcon(event.target.value)}
            disabled={limitReached}
          >
            {LINK_ICON_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full md:w-auto" disabled={limitReached}>
            <Plus className="h-4 w-4" />
            {limitReached ? "Limit dolu" : "Ekle"}
          </Button>
        </div>
      </form>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 opacity-100 transition data-[pending=true]:opacity-60" data-pending={isPending}>
            {items.map((link) => (
              <SortableLink key={link.id} link={link} />
            ))}
            {items.length === 0 ? (
              <p className="rounded-md border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-400">
                Henüz link eklenmedi.
              </p>
            ) : null}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
