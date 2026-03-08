import { AdminHydrationProvider, AdminShell } from "@/components/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminHydrationProvider>
      <AdminShell>{children}</AdminShell>
    </AdminHydrationProvider>
  );
}
