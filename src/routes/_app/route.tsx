import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <main className="grid min-h-screen place-items-center bg-cream text-muted">Memuat sesi…</main>;
  if (!user) return <Navigate to="/login" />;
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
