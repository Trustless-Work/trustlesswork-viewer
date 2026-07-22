import { Info } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const InfoTooltip = ({ content, className = "" }: InfoTooltipProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Info
        size={17}
        weight="regular"
        className={`cursor-help text-foreground transition-opacity hover:opacity-70 ${className}`}
      />
    </TooltipTrigger>
    <TooltipContent className="max-w-sm text-sm">
      <p className="whitespace-pre-wrap break-words">{content}</p>
    </TooltipContent>
  </Tooltip>
);
