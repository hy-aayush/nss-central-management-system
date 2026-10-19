"use client";

import { useState } from "react";
import { UserPlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamStatsHeader } from "./team-stats-header";
import { TeamRosterTable } from "./team-roster-table";
import { RoleAssignmentDialog } from "./role-assignment-dialog";
import type { RosterEntry } from "@/types/auth";

interface TeamManagerProps {
  initialEntries: RosterEntry[];
}

export function TeamManager({ initialEntries }: TeamManagerProps) {
  const [entries, setEntries] = useState<RosterEntry[]>(initialEntries);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RosterEntry | null>(null);

  const handleEditRole = (entry: RosterEntry) => {
    setEditingEntry(entry);
    setAssignmentModalOpen(true);
  };

  const handleNewAssignment = () => {
    setEditingEntry(null);
    setAssignmentModalOpen(true);
  };

  const handleAssignmentSuccess = (updated: RosterEntry) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
  };

  const handleUpdateStatus = (entryId: number, newStatus: "ACTIVE" | "SUSPENDED") => {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, status: newStatus, accessStatus: newStatus } : e))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="size-4.5" />
          </div>
          <div>
            <h4 className="text-label-sm font-semibold text-foreground">
              Institutional Access Governance
            </h4>
            <p className="text-label-xs text-muted-foreground">
              Roster-gated Google Workspace credentials matching active assignments (Rule 1).
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleNewAssignment}
          className="h-8.5 text-label-xs self-start sm:self-auto gap-1.5 shadow-xs"
        >
          <UserPlus className="size-3.5" />
          Assign / Update Role
        </Button>
      </div>

      {/* Stats Header */}
      <TeamStatsHeader entries={entries} />

      {/* Roster Table */}
      <TeamRosterTable
        entries={entries}
        onEditRole={handleEditRole}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Role Assignment Dialog */}
      <RoleAssignmentDialog
        open={assignmentModalOpen}
        onOpenChange={setAssignmentModalOpen}
        entry={editingEntry}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  );
}
