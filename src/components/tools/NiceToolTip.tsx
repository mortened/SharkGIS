// components/NiceTooltip.tsx
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
// This component provides a styled tooltip
export function NiceTooltip({
  children,
  label,
  side = "bottom",
}: {
  children: React.ReactNode;
  label: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={8}
          className="rounded-md bg-secondary text-zinc-100 text-xs shadow-lg px-3 py-2"
        >
          {label}
          <TooltipArrow className="fill-zinc-900" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
