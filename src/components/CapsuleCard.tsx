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
      {/* Status Stamp */}
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

      {/* Access Type Badge */}
      {capsule.accessType === "SHARED" ? (
        <div className="absolute top-4 left-4 font-mono text-xs uppercase px-2 py-1 border-2 border-accent bg-accent text-background">
          Shared
        </div>
      ):(
      <div className="absolute top-4 left-4 font-mono text-xs uppercase px-2 py-1 border-2 border-accent bg-accent text-background">
          Owned
      </div>

      )}


      {/* Title */}
      <h3 className="font-heading mt-6 text-xl uppercase mb-4 pr-20">{capsule.title}</h3>

      {/* Shared By (for received capsules) */}
      {capsule.accessType === "SHARED" && capsule.sharedByEmail && (
        <div className="mb-3 p-2 bg-muted border border-foreground">
          <p className="font-mono text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">Shared by:</span> {capsule.sharedByEmail}
          </p>
        </div>
      )}

      {/* Media Preview (only if not locked) */}
      {!capsule.isLocked && (capsule.photos?.length > 0 || capsule.videos?.length > 0) && (
        <div className="mb-4 p-3 bg-muted border border-foreground">
          <p className="font-mono text-xs text-muted-foreground mb-2">
            📦 {(capsule.photos?.length ?? 0) + (capsule.videos?.length ?? 0)} media files
          </p>
        </div>
      )}

      {/* Locked Message */}
      {capsule.isLocked && (
        <div className="mb-3 p-2 bg-muted border border-foreground">
          <p className="font-mono text-xs text-muted-foreground">
            🔒 This capsule is locked until {capsule.unlockAt.toLocaleDateString()}
          </p>
        </div>
      )}

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
