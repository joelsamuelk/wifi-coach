"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineAlert } from "@/components/wifi/inline-alert";
import {
  FLOOR_OPTIONS,
  ROOM_TYPE_OPTIONS,
  type Room,
} from "@/lib/types";

interface RoomModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; floor: Room["floor"]; type: Room["type"] }) => Promise<void> | void;
  initial?: { name: string; floor: Room["floor"]; type: Room["type"] };
  title?: string;
  error?: string | null;
}

export function RoomModal({
  open,
  onClose,
  onSave,
  initial,
  title = "Add Room",
  error,
}: RoomModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [floor, setFloor] = useState<Room["floor"]>(initial?.floor ?? "Ground");
  const [type, setType] = useState<Room["type"]>(initial?.type ?? "Living");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setName(initial?.name ?? "");
    setFloor(initial?.floor ?? "Ground");
    setType(initial?.type ?? "Living");
    setLocalError(null);
  }, [initial, open]);

  const disabled = useMemo(() => !name.trim() || saving, [name, saving]);

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError("Room name is required.");
      return;
    }

    try {
      setSaving(true);
      setLocalError(null);
      await onSave({ name: trimmedName, floor, type });
      onClose();
    } catch (saveError) {
      setLocalError(
        saveError instanceof Error ? saveError.message : "Could not save this room.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="room-name">Room name</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Living Room"
              className="text-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Floor</Label>
              <Select value={floor} onValueChange={(value) => setFloor(value as Room["floor"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLOOR_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as Room["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {localError || error ? (
            <InlineAlert variant="warning">{localError ?? error}</InlineAlert>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={disabled}>
            {saving ? "Saving..." : "Save Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
