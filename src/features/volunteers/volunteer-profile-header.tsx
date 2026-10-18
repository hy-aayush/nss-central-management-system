import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import type { VolunteerDetail } from "@/types/volunteer";
import { PROJECT_COLOR_MAP } from "@/lib/constants";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Droplet,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface VolunteerProfileHeaderProps {
  volunteer: VolunteerDetail;
}

export function VolunteerProfileHeader({ volunteer }: VolunteerProfileHeaderProps) {
  const projColor = (volunteer.project && PROJECT_COLOR_MAP[volunteer.project]?.light) || "bg-primary/10 text-primary";
  const initials = volunteer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/volunteers"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "gap-1 text-xs text-muted-foreground hover:text-foreground -ml-2",
          })}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Directory
        </Link>

        <div className="flex items-center gap-2">
          <StatusBadge status={volunteer.status} type="volunteer" showDot className="text-xs px-2.5 py-0.5" />
          {volunteer.redFlagsCount > 0 && (
            <Badge variant="destructive" className="gap-1 text-xs">
              <ShieldAlert className="h-3 w-3" />
              {volunteer.redFlagsCount} Red Flag
            </Badge>
          )}
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="p-6 rounded-xl border border-border/70 bg-card/75 backdrop-blur-sm shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Initials Avatar */}
            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary border border-primary/30 flex items-center justify-center font-mono text-xl font-bold shadow-xs shrink-0">
              {initials}
            </div>

            {/* Name, Roll & Badges */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {volunteer.name}
                </h1>
                {volunteer.officeRole && (
                  <Badge variant="outline" className="text-xs font-semibold py-0.5 px-2 bg-primary/5 border-primary/30 text-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {volunteer.officeRole}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap font-mono">
                <span>Roll: <strong className="text-foreground">{volunteer.rollNumber}</strong></span>
                <span>•</span>
                <span>Batch: <strong className="text-foreground">{volunteer.batchYear}</strong></span>
                <span>•</span>
                <span>Academic Year: <strong className="text-foreground">{volunteer.year}th Year</strong></span>
              </div>
            </div>
          </div>

          {/* Project & Domain Quick Badges */}
          <div className="flex flex-col md:items-end gap-2 self-stretch md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Assigned Wing:</span>
              {volunteer.project ? (
                <Link
                  href={`/projects/${volunteer.project.toLowerCase()}`}
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold transition-opacity hover:opacity-80 ${projColor}`}
                >
                  {volunteer.project}
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground italic">Unassigned</span>
              )}
            </div>

            {volunteer.domains.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground">Domains:</span>
                {volunteer.domains.map((d) => (
                  <Badge key={d} variant="secondary" className="text-[10px] font-mono">
                    {d.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact & Demographics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{volunteer.email}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{volunteer.phone}</span>
            <span className="text-[10px] text-muted-foreground/60 italic">(Staff Only)</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{volunteer.cityState}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Hostel: <strong className="text-foreground">{volunteer.hostel}</strong></span>
            <span>•</span>
            <Droplet className="h-3 w-3 text-rose-500 shrink-0" />
            <span>{volunteer.bloodGroup}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
