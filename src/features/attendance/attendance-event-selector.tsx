"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import type { EventRecord } from "@/types/event";

interface AttendanceEventSelectorProps {
  events: EventRecord[];
  selectedEventId: number;
}

export function AttendanceEventSelector({
  events,
  selectedEventId,
}: AttendanceEventSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelectEvent = (idStr: string | null) => {
    if (!idStr) return;
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("eventId", idStr);
    router.replace(`?${current.toString()}`, { scroll: false });
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <Card className="p-4 bg-card border-border shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Dropdown selector */}
        <div className="space-y-1.5 flex-1 max-w-lg">
          <label className="text-label-xs uppercase tracking-wider text-muted-foreground font-semibold block">
            Select Active or Past Event Session
          </label>
          <Select value={String(selectedEventId)} onValueChange={handleSelectEvent}>
            <SelectTrigger className="bg-background border-border h-10 text-body-sm font-medium">
              <SelectValue placeholder="Choose an event drive..." />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {events.map((e) => (
                <SelectItem key={e.id} value={String(e.id)} className="py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{e.title}</span>
                    <span className="text-muted-foreground text-label-xs">
                      • {formatDateIST(e.startsAt)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Event Quick Overview Badge */}
        {selectedEvent && (
          <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/50 text-body-sm">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Calendar className="size-4.5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-label-sm">{selectedEvent.title}</span>
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 h-4 text-[10px] bg-primary/10 text-primary border-primary/20"
                >
                  {selectedEvent.type}
                </Badge>
              </div>
              <div className="text-label-xs text-muted-foreground flex items-center gap-2">
                <span>{formatDateIST(selectedEvent.startsAt)}, {formatTimeIST(selectedEvent.startsAt)}</span>
                <span>• {selectedEvent.venue}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
