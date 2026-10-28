import { createFileRoute } from "@tanstack/react-router";
import { AssessPage } from "@/features/assess-pages";
export const Route = createFileRoute("/_app/hasil")({ component: () => <AssessPage mode="result" /> });
