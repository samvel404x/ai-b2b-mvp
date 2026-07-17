import Image from "next/image";
import { cn } from "@/lib/utils";

export function GeniusLogo({ className, preload = false }) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-visible",
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src="/genius-logo.png"
        alt=""
        fill
        preload={preload}
        sizes="64px"
        className="pointer-events-none select-none object-contain"
      />
    </span>
  );
}
