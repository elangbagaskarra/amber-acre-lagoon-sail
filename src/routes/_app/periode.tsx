import { createFileRoute } from "@tanstack/react-router";
import { PeriodePage } from "@/features/master-pages";
export const Route = createFileRoute("/_app/periode")({ component: PeriodePage });
