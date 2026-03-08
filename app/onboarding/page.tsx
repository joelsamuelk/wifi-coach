"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, MapPin, Plus, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WifiCoachLogo } from "@/components/wifi-coach-logo";
import { useOnboardingStore, useRoomsStore } from "@/lib/stores";
import { FLOOR_OPTIONS, ROOM_TYPE_OPTIONS, type RoomFloor, type RoomType } from "@/lib/types";

type OnboardingStep = "welcome" | "rooms";

const roomPresets = [
  { name: "Living Room", type: "Living" as RoomType },
  { name: "Bedroom", type: "Bedroom" as RoomType },
  { name: "Home Office", type: "Office" as RoomType },
  { name: "Kitchen", type: "Kitchen" as RoomType },
];

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((state) => state.complete);
  const addRoom = useRoomsStore((state) => state.addRoom);

  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [rooms, setRooms] = useState<Array<{ name: string; floor: RoomFloor; type: RoomType }>>([]);
  const [draftName, setDraftName] = useState("");
  const [draftFloor, setDraftFloor] = useState<RoomFloor>("Ground");
  const [draftType, setDraftType] = useState<RoomType>("Living");

  async function handleFinish() {
    for (const room of rooms) {
      try {
        await addRoom(room);
      } catch {
        // Ignore duplicates in onboarding preset flow.
      }
    }
    completeOnboarding();
    router.push("/");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 pb-8">
      <div className="flex justify-end pt-6">
        <button
          onClick={() => {
            completeOnboarding();
            router.push("/");
          }}
          className="text-sm font-medium text-muted-foreground"
        >
          Skip
        </button>
      </div>

      {step === "welcome" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <WifiCoachLogo size="xl" showText={false} />
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">Welcome to WiFi Coach</h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-[320px]">
              Check your home WiFi room by room and get simple, trustworthy advice on what to fix
              next.
            </p>
          </div>
          <div className="w-full max-w-sm rounded-3xl bg-card p-5 card-shadow text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wifi className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">What you&apos;ll get</p>
                <p className="text-sm text-muted-foreground mt-1">
                  A home score, room-by-room results, and plain-English fixes for weak coverage.
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setStep("rooms")}
            className="w-full max-w-sm min-h-[56px] text-base font-semibold rounded-2xl"
          >
            Set Up My Rooms
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      ) : null}

      {step === "rooms" ? (
        <div className="flex flex-1 flex-col gap-6 pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Add your rooms</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Start with the rooms where you care most about good WiFi.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-5 card-shadow space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Living Room"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Floor</Label>
                <Select value={draftFloor} onValueChange={(value) => setDraftFloor(value as RoomFloor)}>
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
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={draftType} onValueChange={(value) => setDraftType(value as RoomType)}>
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
            <Button
              variant="outline"
              onClick={() => {
                if (!draftName.trim()) {
                  return;
                }
                setRooms((current) => [
                  ...current,
                  { name: draftName.trim(), floor: draftFloor, type: draftType },
                ]);
                setDraftName("");
                setDraftFloor("Ground");
                setDraftType("Living");
              }}
              className="w-full min-h-[48px] rounded-xl font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Quick add</p>
            <div className="flex flex-wrap gap-2">
              {roomPresets
                .filter((preset) => !rooms.some((room) => room.name === preset.name))
                .map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      setRooms((current) => [
                        ...current,
                        { name: preset.name, floor: "Ground", type: preset.type },
                      ])
                    }
                    className="rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground card-shadow"
                  >
                    {preset.name}
                  </button>
                ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 card-shadow">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="font-semibold text-foreground">Rooms to scan</p>
            </div>
            <div className="space-y-2">
              {rooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No rooms added yet. You can still finish and add them later.
                </p>
              ) : (
                rooms.map((room) => (
                  <div
                    key={`${room.name}-${room.type}`}
                    className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {room.floor} · {room.type}
                      </p>
                    </div>
                    <Check className="h-4 w-4 text-score-great" />
                  </div>
                ))
              )}
            </div>
          </div>

          <Button
            onClick={() => void handleFinish()}
            className="w-full min-h-[56px] text-base font-semibold rounded-2xl"
          >
            Finish Setup
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
