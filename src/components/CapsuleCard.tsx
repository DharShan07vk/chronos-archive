import React from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { Capsule } from "@/store/capsuleStore";

interface CapsuleCardProps {
  capsule: Capsule;
  className?: string;
}

const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule, className }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/capsule/${capsule.id}`)}
      className={cn(
        "relative bg-card border-2 border-foreground p-6 cursor-pointer brutalist-shadow",
        "transition-all duration-150 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))]",
        className
      )}
    >
      {/* Stamp */}
      <div
        className={cn(
          "absolute top-4 right-4 font-heading text-sm uppercase tracking-widest px-3 py-1 border-2 rotate-[-12deg]",
          capsule.isLocked
            ? "border-muted-foreground text-muted-foreground"
            : "border-accent text-accent"
        )}
      >
        {capsule.isLocked ? "LOCKED" : "OPEN"}
      </div>

      {/* ID */}
      <p className="font-mono text-xs text-muted-foreground mb-2">#{capsule.id}</p>

      {/* Title */}
      <h3 className="font-heading text-xl uppercase mb-4 pr-20">{capsule.title}</h3>

      {/* Metadata */}
      <div className="flex gap-6 font-mono text-xs text-muted-foreground border-t border-foreground pt-3 mt-3">
        <div>
          <span className="block uppercase text-[10px] tracking-widest">Created</span>
          {capsule.createdAt.toLocaleDateString()}
        </div>
        <div>
          <span className="block uppercase text-[10px] tracking-widest">Unlocks</span>
          {capsule.unlockAt.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default CapsuleCard;
