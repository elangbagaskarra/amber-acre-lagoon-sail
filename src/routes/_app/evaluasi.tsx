import { createFileRoute } from "@tanstack/react-router";
import { AssessPage } from "@/features/assess-pages";
export const Route = createFileRoute("/_app/evaluasi")({ component: () => <AssessPage mode="self" /> });
