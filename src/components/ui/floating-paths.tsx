import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

// Static version: same path artwork, no animation (animation made the site lag).
export function FloatingPathsBackground({
  position,
  children,
  className,
  pathClassName,
}: {
  position: number;
  className?: string;
  pathClassName?: string;
  children?: React.ReactNode;
}) {
  const paths = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
          380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
          152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
          684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
      })),
    [position],
  );

  return (
    <div className={cn("w-full relative", className)}>
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className={cn("w-full h-full", pathClassName ?? "text-slate-950 dark:text-white")}
          viewBox="0 0 696 316"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          {paths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.08 + path.id * 0.012}
            />
          ))}
        </svg>
      </div>
      {children}
    </div>
  );
}
