import { createFileRoute } from "@tanstack/react-router";
import { PanduanPage } from "@/features/rest-pages";
export const Route = createFileRoute("/_app/panduan")({ component: PanduanPage });
