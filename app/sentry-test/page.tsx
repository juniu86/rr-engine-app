/**
 * Página temporária pra validar se o Sentry está capturando erros do
 * cliente E se o tunnel route (/monitoring) está ativo. Remove esse
 * arquivo após validar — não deve ir pra produção real.
 */
"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
  const [status, setStatus] = useState<string>("");

  function disparaErro() {
    const id = Date.now();
    try {
      throw new Error(`teste sentry tunnel ${id}`);
    } catch (err) {
      Sentry.captureException(err);
      setStatus(`Evento ${id} enviado. Confere a aba Network — request deve ir pra /monitoring/...`);
    }
  }

  function disparaErroSemCatch() {
    const id = Date.now();
    setStatus(`Disparando erro não tratado ${id} em 2s...`);
    setTimeout(() => {
      throw new Error(`teste sentry uncaught ${id}`);
    }, 2000);
  }

  return (
    <main style={{ padding: "3rem 1.5rem", minHeight: "60vh", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>Teste Sentry — Validação de tunnel</h1>
      <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
        Esta página é temporária. Use pra validar se o Sentry captura erros e
        se o tunnel `/monitoring` está ativo (passa por baixo de adblockers e
        ITP do Safari em modo privado).
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <button
          onClick={disparaErro}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#1652f0",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Disparar erro (com captureException)
        </button>
        <button
          onClick={disparaErroSemCatch}
          style={{
            padding: "0.75rem 1.5rem",
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Disparar erro não tratado (uncaught)
        </button>
      </div>

      {status && (
        <div
          style={{
            padding: "1rem",
            background: "rgba(22, 82, 240, 0.1)",
            border: "1px solid rgba(22, 82, 240, 0.3)",
            borderRadius: "8px",
            color: "#cbd5e1",
          }}
        >
          {status}
        </div>
      )}

      <div style={{ marginTop: "2rem", color: "#94a3b8", fontSize: "0.9rem" }}>
        <strong>Como validar:</strong>
        <ol style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li>Abre F12 → aba Rede/Network</li>
          <li>Marca &quot;Desativar cache&quot;</li>
          <li>Filtro: digite <code>monitoring</code></li>
          <li>Clica num dos botões acima</li>
          <li>
            Se aparecer request pra <code>engine.rres.com.br/monitoring/...</code>
            com status 200 → tunnel funcionando, capturado em qualquer browser/modo
          </li>
          <li>
            Se aparecer request pra <code>*.ingest.sentry.io</code> direto
            → tunnel não está ativo, build precisa ser revisto
          </li>
        </ol>
      </div>
    </main>
  );
}
