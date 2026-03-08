"use client";

import { useState } from "react";
import { ChatPanel } from "~/components/chat-panel";
import { PetProfileCard } from "~/components/pet-profile-card";
import { ActivityWidget } from "~/components/activity-widget";
import { LocationWidget } from "~/components/location-widget";
import { DeviceStatusWidget } from "~/components/device-status-widget";
import { BaseStationsWidget } from "~/components/base-stations-widget";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { LogOut, PanelRight } from "lucide-react";
import type { FiPet, FiBase } from "~/types/fi";
import type { PetAllInfoResponse } from "~/types/fi";

interface DashboardProps {
  pets: FiPet[];
  bases: FiBase[];
  initialPetDetails: PetAllInfoResponse["data"]["pet"] | null;
  userEmail: string;
}

export function Dashboard({ pets, bases, initialPetDetails, userEmail }: DashboardProps) {
  const router = useRouter();
  const pet = pets[0] ?? null;
  const [sheetOpen, setSheetOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const connType = pet?.device?.lastConnectionState?.__typename;
  const isConnected =
    connType === "ConnectedToUser" ||
    connType === "ConnectedToBase" ||
    connType === "ConnectedToCellular";

  const dailySteps = initialPetDetails?.dailyStepStat?.totalSteps ?? 0;
  const stepGoal = initialPetDetails?.dailyStepStat?.stepGoal ?? 1;
  const stepPercent = Math.min(Math.round((dailySteps / stepGoal) * 100), 100);

  const deviceWithColors = initialPetDetails
    ? {
        ...initialPetDetails.device,
        availableLedColors:
          initialPetDetails.device.availableLedColors?.length > 0
            ? initialPetDetails.device.availableLedColors
            : pet?.device?.availableLedColors ?? [],
      }
    : null;

  function renderWidgets(animate: boolean) {
    if (!pet) {
      return (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No pets found. Make sure your Fi collar is set up.
        </div>
      );
    }

    const Wrapper = animate ? motion.div : "div";
    const getProps = (delay: number) =>
      animate
        ? { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.4, delay } }
        : {};

    return (
      <>
        <Wrapper {...getProps(0)}>
          <PetProfileCard pet={pet} />
        </Wrapper>

        {initialPetDetails && (
          <>
            <Wrapper {...getProps(0.1)}>
              <ActivityWidget
                daily={initialPetDetails.dailyStepStat}
                weekly={initialPetDetails.weeklyStepStat}
                monthly={initialPetDetails.monthlyStepStat}
              />
            </Wrapper>
            <Wrapper {...getProps(0.2)}>
              <LocationWidget activity={initialPetDetails.ongoingActivity} />
            </Wrapper>
            <Wrapper {...getProps(0.3)}>
              {deviceWithColors && (
                <DeviceStatusWidget device={deviceWithColors} petId={pet.id} />
              )}
            </Wrapper>
            {bases.length > 0 && (
              <Wrapper {...getProps(0.4)}>
                <BaseStationsWidget bases={bases} />
              </Wrapper>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/50 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">open-fi</h1>
          {pet && (
            <span className="hidden rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground sm:inline">
              {pet.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground lg:inline">{userEmail}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>

          {/* Mobile sheet trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground lg:hidden" />
              }
            >
              <PanelRight className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="!w-full overflow-y-auto sm:!w-[420px] sm:!max-w-[420px]">
              <SheetHeader>
                <SheetTitle>{pet?.name ?? "Pet Info"}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-6">
                {renderWidgets(false)}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Mobile compact stats bar */}
      {pet && initialPetDetails && (
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-2 lg:hidden">
          {pet.photos?.first?.image?.fullSize && (
            <img
              src={pet.photos.first.image.fullSize}
              alt={pet.name}
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
          <span className="text-sm font-medium">{pet.name}</span>
          <span className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? "Live" : "Offline"}
            </span>
          </span>
          <span className="text-muted-foreground">·</span>
          <div className="flex flex-col gap-0.5">
            <div className="h-1.5 w-20 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all"
                style={{ width: `${stepPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {dailySteps.toLocaleString()} / {stepGoal.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Chat panel */}
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatPanel />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden w-[400px] flex-col gap-4 overflow-y-auto border-l border-border/50 p-4 lg:flex">
          {renderWidgets(true)}
        </div>
      </div>
    </div>
  );
}
