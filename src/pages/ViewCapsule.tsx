import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { gsap } from "gsap";
import { useCapsules } from "@/store/capsuleStore";
import BrutalistButton from "@/components/BrutalistButton";

const ViewCapsule: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCapsule } = useCapsules();
  const capsule = getCapsule(id || "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !capsule) return;

    const tl = gsap.timeline();
    const left = containerRef.current.querySelector(".barn-left");
    const right = containerRef.current.querySelector(".barn-right");
    const content = containerRef.current.querySelector(".content-reveal");

    tl.set(content, { opacity: 0 })
      .to(left, { yPercent: -100, duration: 1, ease: "power3.inOut", delay: 0.5 })
      .to(right, { yPercent: 100, duration: 1, ease: "power3.inOut" }, "<")
      .to(content, { opacity: 1, duration: 0.5 })
      .eventCallback("onComplete", () => setRevealed(true));

    return () => { tl.kill(); };
  }, [capsule]);

  if (!capsule) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl mb-4">CAPSULE NOT FOUND</h1>
          <Link to="/dashboard"><BrutalistButton>Back to Archive</BrutalistButton></Link>
        </div>
      </div>
    );
  }

  if (capsule.isLocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b-2 border-foreground px-6 py-4">
          <Link to="/" className="font-heading text-2xl uppercase tracking-widest">Chronos</Link>
        </nav>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="border-2 border-foreground p-12 brutalist-shadow text-center max-w-md">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">#{capsule.id}</p>
            <h1 className="text-4xl mb-4">{capsule.title}</h1>
            <div className="border-2 border-foreground px-4 py-2 inline-block rotate-[-6deg] font-heading text-2xl mb-6">
              LOCKED
            </div>
            <p className="font-mono text-sm text-muted-foreground mb-6">
              This capsule unlocks on {capsule.unlockAt.toLocaleDateString()}
            </p>
            <Link to="/dashboard"><BrutalistButton variant="outline">Back to Archive</BrutalistButton></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative overflow-hidden">
      {/* Barn Door Overlay */}
      <div className="barn-left fixed inset-0 bg-foreground z-50 h-1/2" />
      <div className="barn-right fixed inset-x-0 bottom-0 bg-foreground z-50 h-1/2" />

      {/* Nav */}
      <nav className="border-b-2 border-foreground px-6 py-4 flex items-center justify-between relative z-10">
        <Link to="/" className="font-heading text-2xl uppercase tracking-widest">Chronos</Link>
        <Link to="/dashboard"><BrutalistButton variant="outline" className="text-sm px-4 py-2">Back to Archive</BrutalistButton></Link>
      </nav>

      {/* Content */}
      <div className="content-reveal grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-65px)]">
        {/* Left: Meta */}
        <div className="border-r-0 md:border-r-2 border-foreground p-8 md:p-12 flex flex-col justify-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">File Record</p>

          <div className="space-y-6">
            <div className="border-b border-foreground pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">Document ID</span>
              <span className="font-mono text-lg">#{capsule.id}</span>
            </div>
            <div className="border-b border-foreground pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">Title</span>
              <span className="font-heading text-2xl uppercase">{capsule.title}</span>
            </div>
            <div className="border-b border-foreground pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">Date Created</span>
              <span className="font-mono text-lg">{capsule.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="border-b border-foreground pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">Date Opened</span>
              <span className="font-mono text-lg">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="border-b border-foreground pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">Weather (Archived)</span>
              <span className="font-mono text-lg">{capsule.weather || "N/A"}</span>
            </div>
            {capsule.shareEmail && (
              <div className="border-b border-foreground pb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">Shared With</span>
                <span className="font-mono text-lg">{capsule.shareEmail}</span>
              </div>
            )}
          </div>

          <div className="mt-8 border-2 border-accent px-4 py-2 inline-block rotate-[-3deg] font-heading text-xl text-accent self-start">
            OPENED
          </div>
        </div>

        {/* Right: Content */}
        <div className="p-8 md:p-12 flex items-center justify-center bg-card">
          <div className="border-2 border-foreground p-8 md:p-12 max-w-lg w-full bg-card brutalist-shadow">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">Capsule Contents</p>
            <p className="font-mono text-base leading-relaxed whitespace-pre-wrap">{capsule.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCapsule;
