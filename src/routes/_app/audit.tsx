import { createFileRoute } from "@tanstack/react-router";
import { AuditPage } from "@/features/rest-pages";
export const Route = createFileRoute("/_app/audit")({ component: AuditPage });
