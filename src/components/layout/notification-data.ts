export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: "warning" | "info" | "success";
  read: boolean;
}

/**
 * Synthetic notification fixtures.
 *
 * Kept in a plain module (no components, no client directive) so both the
 * topbar trigger — which only needs the unread count — and the lazily loaded
 * panel read the same list without either one pulling in the other's markup.
 */
export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Attendance correction pending approval: Project Aarogya Blood Drive",
    time: "12m ago",
    type: "warning",
    read: false,
  },
  {
    id: "notif-2",
    title: "Central event 'Mega Tree Plantation 2026' published to calendar",
    time: "1h ago",
    type: "info",
    read: false,
  },
  {
    id: "notif-3",
    title: "Weekly automated volunteer attendance snapshot archived",
    time: "3h ago",
    type: "success",
    read: true,
  },
];
