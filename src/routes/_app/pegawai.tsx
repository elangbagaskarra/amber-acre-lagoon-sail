import { createFileRoute } from "@tanstack/react-router";
import { PegawaiPage } from "@/features/master-pages";
export const Route = createFileRoute("/_app/pegawai")({ component: PegawaiPage });
