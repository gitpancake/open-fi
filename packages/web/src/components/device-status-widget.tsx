"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Signal } from "lucide-react";
import { cn } from "~/lib/utils";
import type { FiConnectionState, FiLedColor, FiOperationParams } from "~/types/fi";

interface DeviceStatusWidgetProps {
  device: {
    __typename: string;
    moduleId: string;
    info: string;
    operationParams: FiOperationParams;
    nextLocationUpdateExpectedBy: string;
    lastConnectionState: FiConnectionState;
    ledColor: FiLedColor;
    availableLedColors: FiLedColor[];
  };
  petId: string;
}

function getConnectionLabel(type: string): string {
  switch (type) {
    case "ConnectedToUser":
      return "Bluetooth";
    case "ConnectedToBase":
      return "Wi-Fi (Base)";
    case "ConnectedToCellular":
      return "Cellular";
    case "UnknownConnectivity":
      return "Unknown";
    default:
      return type;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function DeviceStatusWidget({ device, petId }: DeviceStatusWidgetProps) {
  const connType = device.lastConnectionState.__typename;
  const isConnected =
    connType === "ConnectedToUser" ||
    connType === "ConnectedToBase" ||
    connType === "ConnectedToCellular";
  const isLost = device.operationParams.mode === "LOST_DOG";

  const [activeColor, setActiveColor] = useState(device.ledColor);
  const [isChanging, setIsChanging] = useState(false);

  async function handleColorChange(color: FiLedColor) {
    if (color.ledColorCode === activeColor?.ledColorCode || isChanging) return;
    setIsChanging(true);
    try {
      const res = await fetch(`/api/device/${petId}/led`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ledColorCode: color.ledColorCode }),
      });
      if (res.ok) {
        setActiveColor(color);
      }
    } finally {
      setIsChanging(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Device
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-muted-foreground"
              }`}
            />
            <span className="text-sm font-medium">
              {getConnectionLabel(connType)}
            </span>
          </div>
        </div>

        {device.lastConnectionState.signalStrengthPercent !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Signal className="h-3.5 w-3.5" />
              Signal
            </span>
            <span className="font-medium">{device.lastConnectionState.signalStrengthPercent}%</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">LED</span>
            <span className="font-medium">{activeColor?.name ?? "Off"}</span>
          </div>
          {device.availableLedColors?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {device.availableLedColors.map((color) => (
                <button
                  key={color.ledColorCode}
                  onClick={() => handleColorChange(color)}
                  disabled={isChanging}
                  title={color.name}
                  className={cn(
                    "h-5 w-5 rounded-full ring-1 ring-border transition-all hover:scale-110 disabled:opacity-50",
                    activeColor?.ledColorCode === color.ledColorCode && "ring-2 ring-foreground scale-110"
                  )}
                  style={{ backgroundColor: `#${color.hexCode}` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last seen</span>
          <span className="font-medium">{timeAgo(device.lastConnectionState.date)}</span>
        </div>

        {isLost && (
          <Badge variant="destructive" className="w-full justify-center">
            Lost Dog Mode Active
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
