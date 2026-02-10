import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

function FormField({ label, error, className = "", children }: FormFieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-semibold text-slate-800 ${className}`.trim()}>
      {label}
      {children}
      {error ? <span className="text-xs font-medium text-rose-700">{error}</span> : null}
    </label>
  );
}

export default FormField;

