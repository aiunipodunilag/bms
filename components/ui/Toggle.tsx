import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Accessible CSS toggle switch — replaces ToggleLeft/ToggleRight icon hacks.
 *
 * Usage:
 *   <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
 */
export default function Toggle({ checked, onChange, disabled, size = "md", className }: ToggleProps) {
  const track = size === "sm" ? "h-4 w-7" : "h-5 w-9";
  const knob  = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const shift = size === "sm" ? "translate-x-3" : "translate-x-4";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent",
        "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1",
        checked ? "bg-violet-600" : "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed",
        track,
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? shift : "translate-x-0",
          knob,
        )}
      />
    </button>
  );
}
