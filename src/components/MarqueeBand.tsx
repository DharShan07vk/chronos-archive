import React from "react";
import { cn } from "@/lib/utils";

const MarqueeBand: React.FC<{ className?: string }> = ({ className }) => {
  const text = "SECURE • ENCRYPTED • TIME-LOCKED • FOREVER • ";
  const repeated = text.repeat(8);

  return (
    <div className={cn("w-full overflow-hidden border-y-2 border-foreground bg-foreground text-background py-4", className)}>
      <div className="animate-marquee whitespace-nowrap font-heading text-2xl md:text-3xl uppercase tracking-widest">
        <span>{repeated}</span>
        <span>{repeated}</span>
      </div>
    </div>
  );
};

export default MarqueeBand;
