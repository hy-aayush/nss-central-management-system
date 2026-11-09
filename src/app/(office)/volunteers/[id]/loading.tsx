import { DetailRouteSkeleton } from "@/components/shared/route-skeleton";

export default function VolunteerDetailLoading() {
  return <DetailRouteSkeleton label="Loading the volunteer record…" cards={3} />;
}
