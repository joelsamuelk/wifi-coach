"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState, SurfaceCard } from "@/components/wifi/app-primitives";
import { RoomModal } from "@/components/wifi/room-modal";
import { ScoreBadge } from "@/components/wifi/score-badge";
import { useRoomsStore, useScanStore } from "@/lib/stores";
import type { Room } from "@/lib/types";

export default function RoomsPage() {
  const router = useRouter();
  const rooms = useRoomsStore((state) => state.rooms);
  const addRoom = useRoomsStore((state) => state.addRoom);
  const updateRoom = useRoomsStore((state) => state.updateRoom);
  const deleteRoom = useRoomsStore((state) => state.deleteRoom);
  const scans = useScanStore((state) => state.scans);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Room | null>(null);

  const roomRows = useMemo(
    () =>
      [...rooms]
        .sort((left, right) => left.createdAt - right.createdAt)
        .map((room) => {
          const latestResult = scans
            .map((scan) => scan.roomResults.find((result) => result.roomId === room.id))
            .find(Boolean);
          return { room, latestResult: latestResult ?? null };
        }),
    [rooms, scans],
  );

  return (
    <div className="flex flex-col gap-6 pb-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-foreground">Rooms</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {rooms.length} room{rooms.length === 1 ? "" : "s"} set up for guided scans
          </p>
        </div>
        <Button
          onClick={() => {
            setEditRoom(null);
            setModalOpen(true);
          }}
          className="min-h-[44px] font-semibold"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Room
        </Button>
      </div>

      {roomRows.length > 0 ? (
        <SurfaceCard className="overflow-hidden p-0">
          {roomRows.map(({ room, latestResult }) => (
            <div
              key={room.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/rooms/${room.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/rooms/${room.id}`);
                }
              }}
              className="flex cursor-pointer items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/30 first:rounded-t-[28px] last:rounded-b-[28px]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{room.name}</p>
                <p className="text-xs text-muted-foreground">
                  {room.floor} · {room.type}
                </p>
              </div>
              {latestResult ? (
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold leading-none tracking-tight text-foreground">
                    {latestResult.score}
                  </p>
                  <ScoreBadge label={latestResult.label} className="mt-1" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground shrink-0">Not scanned</p>
              )}
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setEditRoom(room);
                    setModalOpen(true);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label={`Edit ${room.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setPendingDelete(room);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label={`Delete ${room.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </SurfaceCard>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No rooms yet"
          description="Add the rooms in your home so WiFi Coach can guide you room by room."
          action={
            <Button
              onClick={() => {
                setEditRoom(null);
                setModalOpen(true);
              }}
              className="min-h-[48px] font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Room
            </Button>
          }
        />
      )}

      <RoomModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditRoom(null);
        }}
        title={editRoom ? "Edit Room" : "Add Room"}
        initial={
          editRoom
            ? { name: editRoom.name, floor: editRoom.floor, type: editRoom.type }
            : undefined
        }
        onSave={async (room) => {
          if (editRoom) {
            await updateRoom(editRoom.id, room);
          } else {
            await addRoom(room);
          }
        }}
      />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this room?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name} will be removed from your room list. Existing scan history will
              stay in history, but this room will no longer appear in new scans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Room</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => (pendingDelete ? deleteRoom(pendingDelete.id) : Promise.resolve())}
            >
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
