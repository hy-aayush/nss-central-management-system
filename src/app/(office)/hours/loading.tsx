import { ListRouteSkeleton } from "@/components/shared/route-skeleton";

export default function HoursLoading() {
  return (
    <ListRouteSkeleton
      label="Loading service hours"
      filters={2}
      rows={9}
      columns={6}
    />
  );
}
