/**
 * Aparência customizada do Clerk pra alinhar com o dark mode da landing.
 * Aplicada nas páginas /sign-in, /sign-up e em UserButton no Header.
 *
 * Tipo inferido — não importamos `Appearance` de `@clerk/types` pra evitar
 * dependência extra que não está no `package.json`. TypeScript infere o
 * shape correto a partir do uso em `<SignIn appearance={...} />`.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#1652f0",
    colorBackground: "rgba(15, 40, 85, 0.55)",
    colorText: "#ffffff",
    colorTextSecondary: "#cbd5e1",
    colorInputBackground: "rgba(255, 255, 255, 0.06)",
    colorInputText: "#ffffff",
    colorDanger: "#ef4444",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorNeutral: "#94a3b8",
    borderRadius: "8px",
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: "0.95rem",
  },
  elements: {
    rootBox: {
      width: "100%",
      maxWidth: "440px",
    },
    card: {
      background: "rgba(15, 40, 85, 0.7)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
    },
    headerTitle: {
      color: "#ffffff",
      fontSize: "1.5rem",
      fontWeight: "700",
    },
    headerSubtitle: {
      color: "#cbd5e1",
    },
    socialButtonsBlockButton: {
      background: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      color: "#ffffff",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.2)",
      },
    },
    socialButtonsBlockButtonText: { color: "#ffffff" },
    socialButtonsProviderIcon: { filter: "none" },
    formFieldLabel: {
      color: "#cbd5e1",
      fontSize: "0.85rem",
      fontWeight: "500",
    },
    formFieldInput: {
      background: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      color: "#ffffff",
      "&:focus": {
        borderColor: "#1652f0",
        boxShadow: "0 0 0 3px rgba(22, 82, 240, 0.2)",
      },
      "&::placeholder": { color: "#94a3b8" },
    },
    formFieldInputShowPasswordButton: {
      color: "#94a3b8",
      "&:hover": { color: "#ffffff" },
    },
    formButtonPrimary: {
      background: "#1652f0",
      color: "#ffffff",
      fontWeight: "600",
      textTransform: "none",
      "&:hover": { background: "#0e3dc4" },
      "&:focus": { boxShadow: "0 0 0 3px rgba(22, 82, 240, 0.3)" },
    },
    footerActionText: { color: "#94a3b8" },
    footerActionLink: {
      color: "#06b6d4",
      "&:hover": { color: "#67e8f9" },
    },
    identityPreviewText: { color: "#ffffff" },
    identityPreviewEditButton: { color: "#06b6d4" },
    dividerLine: { background: "rgba(255, 255, 255, 0.1)" },
    dividerText: { color: "#94a3b8" },
    formFieldErrorText: { color: "#ef4444" },
    alertText: { color: "#ffffff" },
    alert: {
      background: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
    avatarBox: {
      width: "32px",
      height: "32px",
    },
    userButtonPopoverCard: {
      background: "rgba(15, 40, 85, 0.95)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
    },
    userButtonPopoverActionButton: {
      color: "#ffffff",
      "&:hover": { background: "rgba(255, 255, 255, 0.06)" },
    },
    userButtonPopoverFooter: { display: "none" },
  },
};
