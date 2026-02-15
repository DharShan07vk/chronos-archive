import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
  lines?: number;
}

const GridContainer: React.FC<GridContainerProps> = ({ children, className, lines = 5 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const lineEls = containerRef.current.querySelectorAll(".grid-line");

    lineEls.forEach((line, i) => {
      gsap.fromTo(
        line,
        { width: "0%" },
        {
          width: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: `top+=${i * 15}% bottom`,
            end: `top+=${i * 15 + 30}% center`,
            scrub: true,
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [lines]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="grid-line absolute left-0 h-[2px] bg-foreground pointer-events-none"
          style={{ top: `${((i + 1) / (lines + 1)) * 100}%` }}
        />
      ))}
      {children}
    </div>
  );
};

export default GridContainer;
