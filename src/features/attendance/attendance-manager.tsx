"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AttendanceEventSelector } from "./attendance-event-selector";
import { AttendanceRosterTable } from "./attendance-roster-table";
import { getEventParticipants, getAttendanceCorrections } from "@/lib/mock-data";
import type { EventRecord } from "@/types/event";

interface AttendanceManagerProps {
  events: EventRecord[];
}

export function AttendanceManager({ events }: AttendanceManagerProps) {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("eventId");

  // Determine currently selected event
  const selectedEvent = useMemo(() => {
    if (eventIdParam) {
      const found = events.find((e) => String(e.id) === eventIdParam);
      if (found) return found;
    }
    // Default to the first available event
    return events[0];
  }, [events, eventIdParam]);

  const participants = useMemo(() => {
    if (!selectedEvent) return [];
    return getEventParticipants(selectedEvent.id);
  }, [selectedEvent]);

  const corrections = useMemo(() => {
    if (!selectedEvent) return [];
    return getAttendanceCorrections(selectedEvent.id);
  }, [selectedEvent]);

  if (!selectedEvent) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No event sessions are currently available for attendance marking.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Session Picker Bar */}
      <AttendanceEventSelector
        events={events}
        selectedEventId={selectedEvent.id}
      />

      {/* Interactive Roster & Roll-Call Table */}
      <AttendanceRosterTable
        key={selectedEvent.id}
        event={selectedEvent}
        initialParticipants={participants}
        initialCorrections={corrections}
      />
    </div>
  );
}
