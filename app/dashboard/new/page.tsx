import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MemorialPdfUpload } from "@/components/MemorialPdfUpload";
import { SITE_URL } from "@/lib/site-config";
import { createProject } from "@/lib/api";

export const metadata: Metadata = {
  title: "Novo projeto",
  description: "Crie um novo projeto de orçamentação.",
  alternates: { canonical: `${SITE_URL}/dashboard/new` },
  robots: { index: false, follow: false },
};

async function createProjectAction(formData: FormData) {
  "use server";

  const { getToken } = await auth();
  const token = await getToken();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const contractType = String(formData.get("contractType") || "obra") as
    | "obra"
    | "manutencao";
  const location = String(formData.get("location") || "").trim();
  const restrictions = String(formData.get("restrictions") || "").trim();
  const memorialDescritivo = String(formData.get("memorialDescritivo") || "").trim();

  if (!name) {
    redirect("/dashboard/new?error=name_required");
  }

  const result = await createProject(
    {
      name,
      description: description || undefined,
      contractType,
      location: location || undefined,
      restrictions: restrictions || undefined,
      memorialDescritivo: memorialDescritivo || undefined,
    },
    token
  );

  if (!result.ok) {
    redirect(`/dashboard/new?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/dashboard/${result.data.projectId}`);
}

export default async function NewProject({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <Header showFullNav={false} />
      <main className="legal-main">
        <div className="container container-narrow">
          <div className="glass" style={{ padding: "2.5rem 2rem" }}>
            <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, margin: "0 0 0.5rem" }}>
              Novo projeto
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              Cole o memorial descritivo abaixo. O pipeline de 10 agentes vai processar e gerar proposta, memória de cálculo e cronograma.
            </p>

            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.875rem 1.125rem",
                  marginBottom: "1.5rem",
                  color: "var(--red)",
                  fontSize: "0.9rem",
                }}
              >
                {decodeURIComponent(error)}
              </div>
            )}

            <form action={createProjectAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <Field
                label="Nome do projeto"
                name="name"
                required
                placeholder="Ex: Reforma comercial Vânia"
                hint="Como você identifica esse projeto internamente"
              />

              <Field
                label="Descrição (opcional)"
                name="description"
                placeholder="Resumo do escopo, contexto comercial, etc"
              />

              <SelectField
                label="Tipo de contrato"
                name="contractType"
                defaultValue="obra"
                options={[
                  { value: "obra", label: "Obra completa" },
                  { value: "manutencao", label: "Manutenção / Reforma" },
                ]}
              />

              <Field
                label="Local da obra (opcional)"
                name="location"
                placeholder="Cidade/Estado, ex: São Paulo/SP"
                hint="Usado pra ajuste regional de preços"
              />

              <Field
                label="Restrições e condições especiais (opcional)"
                name="restrictions"
                placeholder="Ex: obra em prédio histórico, restrições de horário, acesso limitado"
                multiline
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Memorial descritivo</span>
                <MemorialPdfUpload targetTextareaName="memorialDescritivo" />
                <textarea
                  name="memorialDescritivo"
                  placeholder="Cole o texto aqui ou suba um PDF acima"
                  rows={12}
                  style={{
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.75rem 1rem",
                    color: "var(--text)",
                    fontSize: "0.95rem",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Aceita Markdown. PDF é processado no navegador, sem subir pro servidor.
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Criar projeto <span className="arrow">→</span>
                </button>
                <a href="/dashboard" className="btn btn-outline">
                  Cancelar
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  hint,
  multiline,
  rows,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-sm)",
    padding: "0.75rem 1rem",
    color: "var(--text)",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    outline: "none",
  };

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
        {label} {required && <span style={{ color: "var(--red)" }}>*</span>}
      </span>
      {multiline ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={rows || 3}
          style={inputStyle}
        />
      ) : (
        <input
          name={name}
          required={required}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
      {hint && (
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{hint}</span>
      )}
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        style={{
          width: "100%",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-sm)",
          padding: "0.75rem 1rem",
          color: "var(--text)",
          fontSize: "0.95rem",
          fontFamily: "inherit",
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "var(--bg-secondary)" }}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
