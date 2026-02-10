import type { ComponentPropsWithoutRef } from "react";

type PrimaryButtonProps = ComponentPropsWithoutRef<"button">;

function PrimaryButton({ className = "", ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400 ${className}`.trim()}
      {...props}
    />
  );
}

export default PrimaryButton;

