import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-start gap-4">
        <Avatar className="h-16 w-16 rounded-xl">
          {photoUrl && <AvatarImage src={photoUrl} alt={pet.name} />}
          <AvatarFallback className="rounded-xl text-lg">
            {pet.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{pet.name}</h3>
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className="text-xs"
            >
              {isConnected ? "Online" : "Offline"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {pet.breed?.name} · {pet.gender === "MALE" ? "Male" : "Female"}
          </p>
          <p className="text-sm text-muted-foreground">
            {pet.weight}lb · {age} years old
          </p>
          {pet.homeCityState && (
            <p className="text-xs text-muted-foreground">
              {pet.homeCityState}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
