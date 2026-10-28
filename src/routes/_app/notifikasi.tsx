import { createFileRoute } from "@tanstack/react-router";
import { NotifikasiPage } from "@/features/rest-pages";
export const Route = createFileRoute("/_app/notifikasi")({ component: NotifikasiPage });
