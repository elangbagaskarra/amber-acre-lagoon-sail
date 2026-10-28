import { createFileRoute } from "@tanstack/react-router";
import { LaporanPage } from "@/features/rest-pages";
export const Route = createFileRoute("/_app/laporan")({ component: LaporanPage });
