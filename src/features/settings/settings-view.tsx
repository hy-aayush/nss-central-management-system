"use client";

import { useState } from "react";
import { Server, Sliders, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsSystemOverview } from "./settings-system-overview";
import { SettingsGuardrailsForm } from "./settings-guardrails-form";
import { SettingsEmergencyCard } from "./settings-emergency-card";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="bg-muted/40 p-1 border border-border/60">
        <TabsTrigger value="overview" className="gap-1.5 text-label-xs">
          <Server className="size-3.5" />
          <span>System Environment &amp; Free-Tier Guards</span>
        </TabsTrigger>
        <TabsTrigger value="guardrails" className="gap-1.5 text-label-xs">
          <Sliders className="size-3.5" />
          <span>Soft Rules &amp; Policies (S-01 to S-09)</span>
        </TabsTrigger>
        <TabsTrigger value="emergency" className="gap-1.5 text-label-xs">
          <ShieldAlert className="size-3.5 text-amber-600 dark:text-amber-400" />
          <span>Emergency Controls &amp; Circuit Breakers</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        <SettingsSystemOverview />
      </TabsContent>

      <TabsContent value="guardrails" className="mt-0">
        <SettingsGuardrailsForm />
      </TabsContent>

      <TabsContent value="emergency" className="mt-0">
        <SettingsEmergencyCard />
      </TabsContent>
    </Tabs>
  );
}
