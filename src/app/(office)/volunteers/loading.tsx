import { ListRouteSkeleton } from "@/components/shared/route-skeleton";

export default function VolunteersLoading() {
  return <ListRouteSkeleton label="Loading volunteer directory" rows={8} />;
}
