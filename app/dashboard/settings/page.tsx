import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BillingSection } from "@/components/BillingSection";
import { SITE_URL } from "@/lib/site-config";
import { fetchSettings, updateSettings, type RegimeTributario } from "@/lib/api";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Configurações da empresa: BDI, regime tributário, impostos.",
  alternates: { canonical: `${SITE_URL}/dashboard/settings` },
  robots: { index: false, follow: false },
};

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const REGIMES: { value: RegimeTributario; label: string }[] = [
  { value: "simples_nacional", label: "Simples Nacional" },
  { value: "lucro_presumido", label: "Lucro Presumido" },
  { value: "lucro_real", label: "Lucro Real" },
];

async function updateSettingsAction(formData: FormData) {
  "use server";
  const { getToken } = await auth();
  const token = await getToken();

  const get = (k: string) => {
    const v = formData.get(k);
    return v ? String(v).trim() : undefined;
  };

  const result = await updateSettings(
    {
      companyName: get("companyName"),
      cnpj: get("cnpj"),
      // Backend espera enum estrito de UFs. Validação é só client-side
      // até implementar Zod refine; cast pra desbloquear o TypeScript.
      priceRegion: get("priceRegion") as
        | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO"
        | "MA" | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI"
        | "RJ" | "RN" | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO"
        | undefined,
      bdiPercentual: get("bdiPercentual"),
      regimeTributario: get("regimeTributario") as RegimeTributario | undefined,
      issPercentual: get("issPercentual"),
      pisPercentual: get("pisPercentual"),
      cofinsPercentual: get("cofinsPercentual"),
      irpjPercentual: get("irpjPercentual"),
      csllPercentual: get("csllPercentual"),
      adminCentralPercentual: get("adminCentralPercentual"),
      lucroPercentual: get("lucroPercentual"),
      riscosPercentual: get("riscosPercentual"),
    },
    token
  );

  if (!result.ok) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/dashboard/settings?saved=1");
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;

  const { getToken } = await auth();
  const token = await getToken();
  const result = await fetchSettings(token);
  const s = result.ok ? result.data : null;

  return (
    <>
      <Header showFullNav={false} />
      <main className="legal-main">
        <div className="container container-narrow">
          <div style={{ marginBottom: "1.5rem" }}>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem" }}>
              ← Dashboard
            </Link>
          </div>

          <div className="glass" style={{ padding: "2.5rem 2rem" }}>
            <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, margin: "0 0 0.5rem" }}>
              Configurações da empresa
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              Esses valores entram nos cálculos de todos os orçamentos novos.
            </p>

            {saved && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.875rem 1.125rem",
                  marginBottom: "1.5rem",
                  color: "var(--green)",
                  fontSize: "0.9rem",
                }}
              >
                ✓ Configurações salvas.
              </div>
            )}

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

            <div style={{ marginBottom: "2rem" }}>
              <BillingSection />
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border-strong)", margin: "0 0 2rem" }} />

            <form action={updateSettingsAction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <Section title="Identificação">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Input label="Razão social" name="companyName" defaultValue={s?.companyName || ""} placeholder="RR Engenharia LTDA" />
                  <Input label="CNPJ" name="cnpj" defaultValue={s?.cnpj || ""} placeholder="00.000.000/0001-00" />
                </div>
                <Select label="Estado padrão (ajuste regional de preços)" name="priceRegion" defaultValue={s?.priceRegion || "SP"}>
                  {ESTADOS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </Select>
              </Section>

              <Section title="Regime tributário">
                <Select label="Regime" name="regimeTributario" defaultValue={s?.regimeTributario || ""}>
                  <option value="">— selecione —</option>
                  {REGIMES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>
                <Hint>
                  Em <strong>Simples Nacional</strong> a alíquota é definida pela faixa de receita (configurável depois). Em <strong>Lucro Presumido</strong> e <strong>Lucro Real</strong>, preencha as alíquotas abaixo.
                </Hint>
              </Section>

              <Section title="Impostos (% sobre faturamento)">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                  <Input label="ISS" name="issPercentual" type="number" step="0.01" defaultValue={s?.issPercentual || ""} placeholder="5.00" />
                  <Input label="PIS" name="pisPercentual" type="number" step="0.01" defaultValue={s?.pisPercentual || ""} placeholder="0.65" />
                  <Input label="COFINS" name="cofinsPercentual" type="number" step="0.01" defaultValue={s?.cofinsPercentual || ""} placeholder="3.00" />
                  <Input label="IRPJ" name="irpjPercentual" type="number" step="0.01" defaultValue={s?.irpjPercentual || ""} placeholder="1.20" />
                  <Input label="CSLL" name="csllPercentual" type="number" step="0.01" defaultValue={s?.csllPercentual || ""} placeholder="1.08" />
                </div>
              </Section>

              <Section title="BDI e composição">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                  <Input label="BDI total (%)" name="bdiPercentual" type="number" step="0.01" defaultValue={s?.bdiPercentual || "25.00"} placeholder="25.00" />
                  <Input label="Lucro (%)" name="lucroPercentual" type="number" step="0.01" defaultValue={s?.lucroPercentual || ""} placeholder="8.00" />
                  <Input label="Admin central (%)" name="adminCentralPercentual" type="number" step="0.01" defaultValue={s?.adminCentralPercentual || ""} placeholder="4.00" />
                  <Input label="Riscos (%)" name="riscosPercentual" type="number" step="0.01" defaultValue={s?.riscosPercentual || ""} placeholder="1.50" />
                </div>
                <Hint>
                  BDI = (1+despesas indiretas) × (1+lucro+riscos) ÷ (1−impostos) − 1. Default 25% serve pra obras médias; ajuste conforme seu modelo comercial.
                </Hint>
              </Section>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Salvar configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--cyan)" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255, 255, 255, 0.04)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-sm)",
  padding: "0.7rem 0.95rem",
  color: "var(--text)",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  outline: "none",
};

function Input({
  label, name, defaultValue, placeholder, type = "text", step,
}: {
  label: string; name: string; defaultValue?: string; placeholder?: string; type?: string; step?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} type={type} step={step} style={inputStyle} />
    </label>
  );
}

function Select({
  label, name, defaultValue, children,
}: {
  label: string; name: string; defaultValue?: string; children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>
      <select name={name} defaultValue={defaultValue} style={inputStyle}>
        {children}
      </select>
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{children}</p>
  );
}
