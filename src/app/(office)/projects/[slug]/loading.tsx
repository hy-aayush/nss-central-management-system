import { DetailRouteSkeleton } from "@/components/shared/route-skeleton";

export default function ProjectDetailLoading() {
  return <DetailRouteSkeleton label="Loading the project workspace…" cards={3} />;
}
