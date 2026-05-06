"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  fetchProject,
  STATUS_LABEL,
  STATUS_COLOR,
  type Project,
  type ProjectStatus,
} from "@/lib/api";

interface Props {
  projectId: number;
  initialStatus: ProjectStatus;
}

/**
 * Badge de status do projeto que se atualiza automaticamente enquanto o
 * pipeline está em curso. Sem isso, o header ficava "preso" no status
 * inicial do Server Component (ex: "Aguardando dados") mesmo depois do
 * backend transicionar pra "processing" no continueAgent.
 *
 * Polling roda enquanto status está em estado intermediário; para quando
 * chegar a estado terminal (approved, rejected, draft).
 */
export function ProjectStatusBadge({ projectId, initialStatus }: Props) {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<ProjectStatus>(initialStatus);

  useEffect(() => {
    // Pollar enquanto o pipeline está em curso ou aguardando algo do user.
    const isTransient = (s: ProjectStatus) =>
      [
        "processing",
        "waiting_for_input",
        "pending_confirmation",
        "draft",
      ].includes(s);

    if (!isTransient(status)) return;

    const interval = setInterval(async () => {
      const token = await getToken();
      const res = await fetchProject(projectId, token);
      if (res.ok && res.data?.status) {
        const newStatus = res.data.status as ProjectStatus;
        if (newStatus !== status) {
          setStatus(newStatus);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [status, projectId, getToken]);

  const label = STATUS_LABEL[status] ?? status;
  const color = STATUS_COLOR[status] ?? "var(--text-muted)";

  return (
    <span
      style={{
        fontSize: "0.85rem",
        color,
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        padding: "0.4rem 0.85rem",
        borderRadius: "999px",
        whiteSpace: "nowrap",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
