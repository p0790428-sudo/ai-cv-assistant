import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/AuthShell";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Hireform" },
      { name: "description", content: "Create your Hireform account." },
    ],
  }),
  component: () => <AuthShell mode="signup" />,
});
