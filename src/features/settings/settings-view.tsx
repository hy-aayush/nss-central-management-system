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
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-border/60 bg-card/70 p-1 backdrop-blur-sm">
        <TabsTrigger value="overview" className="gap-1.5 text-[0.6875rem]">
          <Server className="size-3.5" />
          <span>Environment &amp; guards</span>
        </TabsTrigger>
        <TabsTrigger value="guardrails" className="gap-1.5 text-[0.6875rem]">
          <Sliders className="size-3.5" />
          <span>Soft rules (S-01–S-09)</span>
        </TabsTrigger>
        <TabsTrigger value="emergency" className="gap-1.5 text-[0.6875rem]">
          <ShieldAlert className="size-3.5" />
          <span>Emergency controls</span>
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
