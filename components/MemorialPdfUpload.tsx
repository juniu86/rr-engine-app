"use client";

import { useState } from "react";

interface Props {
  /** Nome do textarea pra qual o texto extraído deve ser populado */
  targetTextareaName: string;
}

/**
 * Upload de PDF que extrai o texto via pdf.js no cliente e popula
 * automaticamente o textarea de memorial. Usuário pode editar antes
 * de submeter o form.
 *
 * pdf.js é carregado dinamicamente (lazy import) — só baixa o bundle
 * quando o usuário escolhe arquivo, mantendo o bundle inicial leve.
 */
export function MemorialPdfUpload({ targetTextareaName }: Props) {
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFilename(file.name);
    setLoading(true);

    try {
      const text = await extractTextFromPdf(file);
      const textarea = document.querySelector<HTMLTextAreaElement>(
        `textarea[name="${targetTextareaName}"]`
      );
      if (textarea) {
        textarea.value = text;
        // Dispara evento pra eventuais listeners (form validation, React state)
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        setError(`Textarea com name="${targetTextareaName}" não encontrado`);
      }
    } catch (err) {
      setError(`Falha ao ler PDF: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        background: "rgba(6, 182, 212, 0.06)",
        border: "1px dashed rgba(6, 182, 212, 0.3)",
        borderRadius: "var(--radius-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: "rgba(6, 182, 212, 0.15)",
            border: "1px solid rgba(6, 182, 212, 0.4)",
            borderRadius: "var(--radius-sm)",
            cursor: loading ? "wait" : "pointer",
            fontSize: "0.9rem",
            color: "var(--cyan)",
            fontWeight: 600,
          }}
        >
          {loading ? "Extraindo..." : "Subir PDF"}
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFile}
            disabled={loading}
            style={{ display: "none" }}
          />
        </label>

        <div style={{ flex: 1, fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {filename ? (
            <span>
              <strong style={{ color: "var(--text)" }}>{filename}</strong>
              {!loading && !error && " — texto extraído e populado abaixo. Edite à vontade."}
            </span>
          ) : (
            "Sobe um memorial em PDF e o texto vai pra caixa abaixo automaticamente"
          )}
        </div>
      </div>

      {error && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Extrai todo o texto de um PDF usando pdfjs-dist no cliente.
 *
 * Usa import dinâmico — pdf.js (~3 MB) só baixa quando alguém realmente
 * sobe arquivo. Configura worker via CDN unpkg pra evitar build hoops.
 */
async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // @ts-ignore — pdfjs-dist não tem types perfeitos no entry "build/pdf"
  const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");

  // Configura worker via CDN (versão sincronizada com a instalada).
  // Alternativa: bundlar o worker localmente (mais robusto, mais setup).
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  const pieces: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Junta itens com espaço; quebras de linha entre blocos preservadas
    // grosseiramente via altura de y. Pra MVP, espaço simples basta.
    const text = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .filter((s: string) => s.trim().length > 0)
      .join(" ");
    pieces.push(text);
  }

  return pieces.join("\n\n");
}
