import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/AuthShell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Hireform" },
      { name: "description", content: "Sign in to analyze CVs with AI." },
    ],
  }),
  component: () => <AuthShell mode="login" />,
});
