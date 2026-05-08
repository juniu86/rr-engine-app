"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  updateSettings,
  type RegimeTributario,
} from "@/lib/api";

/**
 * Composição do BDI pela fórmula NBR 12721:
 *
 *   BDI = ((1 + AC + S + R + G) × (1 + DF) × (1 + L)) / (1 − I) − 1
 *
 * O campo "BDI total" não é editável — é derivado dos componentes em
 * tempo real. Aumentar Lucro deve refletir no BDI total automaticamente.
 *
 * Tributos por dentro: o I entra no denominador, garantindo que o
 * preço final cobre o imposto recolhido pela empresa sem comer da
 * margem. Cliente paga preço cheio.
 */

const REGIMES: { value: RegimeTributario; label: string }[] = [
  { value: "simples_nacional", label: "Simples Nacional" },
  { value: "lucro_presumido", label: "Lucro Presumido" },
  { value: "lucro_real", label: "Lucro Real" },
];

const SIMPLES_ANEXO_IV: Record<number, number> = {
  1: 4.5,
  2: 9.0,
  3: 10.2,
  4: 14.0,
  5: 22.0,
  6: 33.0,
};

interface InitialValues {
  regimeTributario?: RegimeTributario | null;
  faixaSimples?: number | null;
  issPercentual?: string | null;
  pisPercentual?: string | null;
  cofinsPercentual?: string | null;
  irpjPercentual?: string | null;
  csllPercentual?: string | null;
  lucroPercentual?: string | null;
  adminCentralPercentual?: string | null;
  despesasFinanceirasPercentual?: string | null;
  riscosPercentual?: string | null;
  seguroPercentual?: string | null;
  garantiaPercentual?: string | null;
  aliquotaTributosOverride?: string | null;
}

const num = (v: string | null | undefined, fallback = 0) => {
  if (v == null || v === "") return fallback;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

export function BdiSettingsForm({ initial }: { initial: InitialValues }) {
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(
    null
  );

  const [regime, setRegime] = useState<RegimeTributario | "">(
    initial.regimeTributario || ""
  );
  const [faixa, setFaixa] = useState<number | "">(
    initial.faixaSimples ?? ""
  );

  const [iss, setIss] = useState(initial.issPercentual || "5.00");
  const [pis, setPis] = useState(initial.pisPercentual || "0.65");
  const [cofins, setCofins] = useState(initial.cofinsPercentual || "3.00");
  const [irpj, setIrpj] = useState(initial.irpjPercentual || "1.20");
  const [csll, setCsll] = useState(initial.csllPercentual || "1.08");

  const [lucro, setLucro] = useState(initial.lucroPercentual || "8.00");
  const [admin, setAdmin] = useState(initial.adminCentralPercentual || "4.00");
  const [df, setDf] = useState(
    initial.despesasFinanceirasPercentual || "1.00"
  );
  const [riscos, setRiscos] = useState(initial.riscosPercentual || "1.00");
  const [seguros, setSeguros] = useState(initial.seguroPercentual || "0.80");
  const [garantias, setGarantias] = useState(
    initial.garantiaPercentual || "0.40"
  );
  const [aliquotaOverride, setAliquotaOverride] = useState(
    initial.aliquotaTributosOverride || ""
  );

  // Resolve I (alíquota de tributos sobre o faturamento) da mesma forma
  // que o backend (taxRateResolver). Mantém os dois lados em sincronia
  // — se aqui mostrar 14%, lá calcula com 14%.
  const aliquotaResolvida = useMemo(() => {
    if (aliquotaOverride && aliquotaOverride.trim() !== "") {
      return {
        rate: num(aliquotaOverride),
        source: "Override manual",
      };
    }
    if (regime === "simples_nacional") {
      if (typeof faixa === "number" && faixa in SIMPLES_ANEXO_IV) {
        return {
          rate: SIMPLES_ANEXO_IV[faixa],
          source: `Simples Nacional Anexo IV — faixa ${faixa}`,
        };
      }
      return {
        rate: 0,
        source: "Selecione a faixa do Simples",
      };
    }
    if (regime === "lucro_presumido" || regime === "lucro_real") {
      const soma =
        num(iss) + num(pis) + num(cofins) + num(irpj) + num(csll);
      return {
        rate: soma,
        source: `${regime === "lucro_presumido" ? "Lucro Presumido" : "Lucro Real"} — ISS + PIS + COFINS + IRPJ + CSLL`,
      };
    }
    return { rate: 0, source: "Selecione o regime tributário" };
  }, [regime, faixa, iss, pis, cofins, irpj, csll, aliquotaOverride]);

  const bdiTotal = useMemo(() => {
    const ac = num(admin) / 100;
    const s = num(seguros) / 100;
    const r = num(riscos) / 100;
    const g = num(garantias) / 100;
    const dfRate = num(df) / 100;
    const l = num(lucro) / 100;
    const i = aliquotaResolvida.rate / 100;
    if (i >= 1) return null; // inviável
    const bdi = ((1 + ac + s + r + g) * (1 + dfRate) * (1 + l)) / (1 - i) - 1;
    return bdi * 100;
  }, [admin, seguros, riscos, garantias, df, lucro, aliquotaResolvida]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const token = await getToken();
    const result = await updateSettings(
      {
        regimeTributario: regime || undefined,
        faixaSimples:
          regime === "simples_nacional" && typeof faixa === "number"
            ? (faixa as 1 | 2 | 3 | 4 | 5 | 6)
            : undefined,
        issPercentual: iss,
        pisPercentual: pis,
        cofinsPercentual: cofins,
        irpjPercentual: irpj,
        csllPercentual: csll,
        lucroPercentual: lucro,
        adminCentralPercentual: admin,
        despesasFinanceirasPercentual: df,
        riscosPercentual: riscos,
        seguroPercentual: seguros,
        garantiaPercentual: garantias,
        aliquotaTributosOverride:
          aliquotaOverride.trim() === "" ? null : aliquotaOverride,
        // BDI total é derivado — mantemos sincronizado no backend pra
        // referência (campo legado em company_settings).
        bdiPercentual:
          bdiTotal != null ? bdiTotal.toFixed(2) : undefined,
      },
      token
    );
    setSaving(false);
    if (result.ok) {
      setFeedback({ ok: true, msg: "Configurações de BDI salvas." });
    } else {
      setFeedback({ ok: false, msg: result.error });
    }
  }

  return (
    <form
      onSubmit={handleSave}
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      <Section title="Regime tributário">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Field label="Regime">
            <select
              value={regime}
              onChange={e => setRegime(e.target.value as RegimeTributario | "")}
              style={inputStyle}
            >
              <option value="">— selecione —</option>
              {REGIMES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          {regime === "simples_nacional" && (
            <Field label="Faixa do Simples (Anexo IV)">
              <select
                value={faixa}
                onChange={e =>
                  setFaixa(e.target.value === "" ? "" : Number(e.target.value))
                }
                style={inputStyle}
              >
                <option value="">— selecione —</option>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>
                    Faixa {n} — {SIMPLES_ANEXO_IV[n].toFixed(2)}%
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
      </Section>

      <Section title="Tributos (% sobre faturamento)">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
          }}
        >
          <NumberInput label="ISS" value={iss} onChange={setIss} />
          <NumberInput label="PIS" value={pis} onChange={setPis} />
          <NumberInput label="COFINS" value={cofins} onChange={setCofins} />
          <NumberInput label="IRPJ" value={irpj} onChange={setIrpj} />
          <NumberInput label="CSLL" value={csll} onChange={setCsll} />
        </div>
        <NumberInput
          label="Alíquota I — override manual (opcional)"
          value={aliquotaOverride}
          onChange={setAliquotaOverride}
          placeholder="Deixe vazio para usar o cálculo automático"
        />
        <Hint>
          Alíquota I resolvida hoje:{" "}
          <strong>{aliquotaResolvida.rate.toFixed(2)}%</strong>{" "}
          <span style={{ color: "var(--text-muted)" }}>
            ({aliquotaResolvida.source})
          </span>
        </Hint>
      </Section>

      <Section title="Componentes do BDI (NBR 12721)">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
          }}
        >
          <NumberInput label="Lucro (L) %" value={lucro} onChange={setLucro} />
          <NumberInput
            label="Admin central (AC) %"
            value={admin}
            onChange={setAdmin}
          />
          <NumberInput
            label="Despesas financeiras (DF) %"
            value={df}
            onChange={setDf}
          />
          <NumberInput
            label="Riscos (R) %"
            value={riscos}
            onChange={setRiscos}
          />
          <NumberInput
            label="Seguros (S) %"
            value={seguros}
            onChange={setSeguros}
          />
          <NumberInput
            label="Garantias (G) %"
            value={garantias}
            onChange={setGarantias}
          />
        </div>
      </Section>

      <Section title="BDI total (calculado)">
        <div
          style={{
            background: "rgba(34, 197, 246, 0.06)",
            border: "1px solid rgba(34, 197, 246, 0.25)",
            borderRadius: "var(--radius-sm)",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
              BDI total (NBR 12721)
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--cyan)" }}>
              {bdiTotal != null ? `${bdiTotal.toFixed(2)}%` : "—"}
            </div>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "right", maxWidth: "260px" }}>
            BDI = ((1 + AC + S + R + G) × (1 + DF) × (1 + L)) / (1 − I) − 1
          </div>
        </div>
        <Hint>
          Não é editável — recalcula em tempo real conforme você ajusta os
          componentes. Tributos (I) entram no denominador, garantindo que o
          preço final cobre o imposto sem comer da margem.
        </Hint>
      </Section>

      {feedback && (
        <div
          role="status"
          style={{
            background: feedback.ok
              ? "rgba(16, 185, 129, 0.08)"
              : "rgba(239, 68, 68, 0.08)",
            border: `1px solid ${feedback.ok ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            borderRadius: "var(--radius-sm)",
            padding: "0.875rem 1.125rem",
            color: feedback.ok ? "var(--green)" : "var(--red)",
            fontSize: "0.9rem",
          }}
        >
          {feedback.ok ? "✓ " : ""}
          {feedback.msg}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={saving}
        style={{ alignSelf: "flex-start", padding: "0.7rem 1.5rem" }}
      >
        {saving ? "Salvando..." : "Salvar BDI e tributos"}
      </button>
    </form>
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          margin: "0 0 1rem",
          color: "var(--cyan)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </Field>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "0.85rem",
        color: "var(--text-muted)",
        margin: 0,
        lineHeight: 1.6,
      }}
    >
      {children}
    </p>
  );
}
