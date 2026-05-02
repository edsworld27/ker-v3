"use client";

// /admin/reservations/resources — Bookable resources configuration.
// Tables, rooms, services, equipment with availability windows + capacity.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function ReservationResourcesPage() {
  return (
    <PluginPageScaffold
      pluginId="reservations"
      eyebrow="Reservations"
      title="Resources"
      description="Tables, rooms, services, equipment — the things visitors can book. Each resource has availability windows and capacity."
      backHref="/admin/reservations"
      backLabel="Reservations"
      emptyTitle="No resources configured"
      emptyHint="Add a resource (e.g. 'Table for 4', 'Massage room', '60-min consultation') with its weekly availability and capacity."
    />
  );
}
