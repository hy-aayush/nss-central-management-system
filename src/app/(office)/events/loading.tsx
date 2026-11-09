import { ListRouteSkeleton } from "@/components/shared/route-skeleton";

export default function EventsLoading() {
  return (
    <ListRouteSkeleton
      label="Loading events"
      filters={4}
      rows={10}
      columns={5}
    />
  );
}
