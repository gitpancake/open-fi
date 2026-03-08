import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { FiPet } from "~/types/fi";

interface PetProfileCardProps {
  pet: FiPet;
}

function getAge(year: number, month: number, day: number): string {
  const now = new Date();
  const birth = new Date(year, month - 1, day);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years === 0) return `${months}mo`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}mo`;
}

export function PetProfileCard({ pet }: PetProfileCardProps) {
  const photoUrl = pet.photos?.first?.image?.fullSize;
  const age = getAge(pet.yearOfBirth, pet.monthOfBirth, pet.dayOfBirth);
  const connectionType = pet.device?.lastConnectionState?.__typename;
  const weightKg = pet.weight;
  const weightLbs = Math.round(weightKg * 2.20462);

  const isConnected =
    connectionType === "ConnectedToUser" ||
    connectionType === "ConnectedToBase" ||
    connectionType === "ConnectedToCellular";

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 pt-5">
        <Avatar className="h-20 w-20 rounded-full ring-2 ring-border">
          {photoUrl && <AvatarImage src={photoUrl} alt={pet.name} className="object-cover" />}
          <AvatarFallback className="rounded-full text-xl font-semibold">
            {pet.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold leading-none">{pet.name}</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-black px-2 py-0.5 text-[10px] font-medium text-white">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {pet.breed?.name} · {pet.gender === "MALE" ? "Male" : "Female"}
          </p>
          <p className="text-sm text-muted-foreground">
            {weightLbs}lb / {weightKg}kg · {age}
          </p>
          {pet.homeCityState && (
            <p className="text-xs text-muted-foreground/70">
              {pet.homeCityState}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
