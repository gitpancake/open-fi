"use client";

import { ChatPanel } from "~/components/chat-panel";
import { PetProfileCard } from "~/components/pet-profile-card";
import { ActivityWidget } from "~/components/activity-widget";
import { LocationWidget } from "~/components/location-widget";
import { DeviceStatusWidget } from "~/components/device-status-widget";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { LogOut } from "lucide-react";
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
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">open-fi</h1>
          {pet && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {pet.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{userEmail}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Chat panel - left side */}
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatPanel />
        </div>

        {/* Widgets - right side */}
        <div className="hidden w-[400px] flex-col gap-4 overflow-y-auto border-l border-border/50 p-4 lg:flex">
          {pet && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
            >
              <PetProfileCard pet={pet} />
            </motion.div>
          )}

          {initialPetDetails && (
            <>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <ActivityWidget
                  daily={initialPetDetails.dailyStepStat}
                  weekly={initialPetDetails.weeklyStepStat}
                  monthly={initialPetDetails.monthlyStepStat}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <LocationWidget activity={initialPetDetails.ongoingActivity} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <DeviceStatusWidget
                  device={{
                    ...initialPetDetails.device,
                    availableLedColors:
                      initialPetDetails.device.availableLedColors?.length > 0
                        ? initialPetDetails.device.availableLedColors
                        : pet.device?.availableLedColors ?? [],
                  }}
                  petId={pet.id}
                />
              </motion.div>
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
