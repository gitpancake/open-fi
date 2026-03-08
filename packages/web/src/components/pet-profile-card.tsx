import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import type { FiPet } from "~/types/fi";

interface PetProfileCardProps {
  pet: FiPet;
}

export function PetProfileCard({ pet }: PetProfileCardProps) {
  const photoUrl = pet.photos?.first?.image?.fullSize;
  const age = new Date().getFullYear() - pet.yearOfBirth;
  const connectionType = pet.device?.lastConnectionState?.__typename;

  const isConnected =
    connectionType === "ConnectedToUser" ||
    connectionType === "ConnectedToBase" ||
    connectionType === "ConnectedToCellular";

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 pt-5">
        <Avatar className="h-20 w-20 rounded-2xl ring-2 ring-border">
          {photoUrl && <AvatarImage src={photoUrl} alt={pet.name} className="object-cover" />}
          <AvatarFallback className="rounded-2xl text-xl font-semibold">
            {pet.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold leading-none">{pet.name}</h3>
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0"
            >
              {isConnected ? "Online" : "Offline"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {pet.breed?.name} · {pet.gender === "MALE" ? "Male" : "Female"}
          </p>
          <p className="text-sm text-muted-foreground">
            {pet.weight}lb · {age}y
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
