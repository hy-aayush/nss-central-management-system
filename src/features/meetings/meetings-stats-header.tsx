import {
  CalendarCheck2,
  CircleDashed,
  TriangleAlert,
  Users,
} from "lucide-react";

import { MetricStrip } from "@/components/shared/metric-strip";
import { formatClockTimeIST, formatDateIST } from "@/lib/time";
import type { Meeting } from "@/types/event";

interface MeetingsStatsHeaderProps {
  meetings: Meeting[];
}

export function MeetingsStatsHeader({ meetings }: MeetingsStatsHeaderProps) {
  const completed = meetings.filter(
    (meeting) => meeting.status === "COMPLETED",
  );
  const upcoming = meetings
    .filter(
      (meeting) =>
        meeting.status === "SCHEDULED" || meeting.status === "RESCHEDULED",
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const needsReview = meetings.filter((meeting) => meeting.needsReview);
  const withMinutes = completed.filter((meeting) => meeting.mom);

  return (
    <MetricStrip
      columns={4}
      items={[
        {
          label: "Meetings",
          value: meetings.length,
          hint: `${completed.length} completed · ${upcoming.length} upcoming`,
          icon: CalendarCheck2,
        },
        {
          label: "Next meeting",
          value: upcoming[0]
            ? formatDateIST(`${upcoming[0].date}T00:00:00+05:30`)
            : "—",
          hint: upcoming[0]
            ? `${upcoming[0].type === "PROJECT" ? upcoming[0].project : upcoming[0].type.toLowerCase()} · ${formatClockTimeIST(upcoming[0].startTime)}`
            : "Nothing scheduled",
          icon: Users,
        },
        {
          label: "Minutes on record",
          value: withMinutes.length,
          hint: `of ${completed.length} completed meetings`,
          icon: CircleDashed,
          tone: withMinutes.length === completed.length ? "success" : "default",
        },
        {
          label: "Needs review",
          value: needsReview.length,
          hint:
            needsReview.length > 0 ? "Finalise or cancel" : "Everything closed",
          icon: TriangleAlert,
          tone: needsReview.length > 0 ? "warning" : "success",
        },
      ]}
      footer="Meetings store their status: scheduled, ongoing, completed, rescheduled or cancelled. Attendance locks at midnight IST and the minutes are capped at 100 words."
    />
  );
}
