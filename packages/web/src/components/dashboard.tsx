"use client";

import { ChatPanel } from "~/components/chat-panel";
import { PetProfileCard } from "~/components/pet-profile-card";
import { ActivityWidget } from "~/components/activity-widget";
import { LocationWidget } from "~/components/location-widget";
import { DeviceStatusWidget } from "~/components/device-status-widget";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import type { FiPet } from "~/types/fi";
import type { PetAllInfoResponse } from "~/types/fi";

interface DashboardProps {
  pets: FiPet[];
  initialPetDetails: PetAllInfoResponse["data"]["pet"] | null;
  userEmail: string;
}

export function Dashboard({ pets, initialPetDetails, userEmail }: DashboardProps) {
  const router = useRouter();
  const pet = pets[0] ?? null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">open-fi</h1>
          {pet && (
            <span className="text-sm text-muted-foreground">
              {pet.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{userEmail}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat panel - left side */}
        <div className="flex flex-1 flex-col border-r">
          <ChatPanel />
        </div>

        {/* Widgets - right side */}
        <div className="hidden w-[380px] flex-col gap-4 overflow-y-auto p-4 lg:flex">
          {pet && <PetProfileCard pet={pet} />}

          {initialPetDetails && (
            <>
              <ActivityWidget
                daily={initialPetDetails.dailyStepStat}
                weekly={initialPetDetails.weeklyStepStat}
                monthly={initialPetDetails.monthlyStepStat}
              />
              <LocationWidget activity={initialPetDetails.ongoingActivity} />
              <DeviceStatusWidget device={initialPetDetails.device} />
            </>
          )}

          {!pet && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No pets found. Make sure your Fi collar is set up.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
