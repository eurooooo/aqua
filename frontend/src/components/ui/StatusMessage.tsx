import type { ReactNode } from "react";

type Variant = "info" | "success" | "error";

interface StatusMessageProps {
  variant: Variant;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  info: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

function StatusMessage({ variant, children }: StatusMessageProps) {
  return (
    <p className={`mt-3 rounded-lg border px-3 py-2 text-sm font-semibold ${styles[variant]}`}>
      {children}
    </p>
  );
}

export default StatusMessage;

