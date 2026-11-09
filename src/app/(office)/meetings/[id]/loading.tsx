import { DetailRouteSkeleton } from "@/components/shared/route-skeleton";

export default function MeetingDetailLoading() {
  return <DetailRouteSkeleton label="Loading the meeting record…" cards={3} />;
}
