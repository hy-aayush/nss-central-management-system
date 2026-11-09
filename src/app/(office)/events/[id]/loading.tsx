import { DetailRouteSkeleton } from "@/components/shared/route-skeleton";

export default function EventDetailLoading() {
  return <DetailRouteSkeleton label="Loading the event record…" cards={4} />;
}
