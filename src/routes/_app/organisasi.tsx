import { createFileRoute } from "@tanstack/react-router";
import { OrganisasiPage } from "@/features/master-pages";
export const Route = createFileRoute("/_app/organisasi")({ component: OrganisasiPage });
