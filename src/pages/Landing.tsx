import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/store/authStore";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lock, Clock, Archive, Send, Shield, Eye } from "lucide-react";
import GridContainer from "@/components/GridContainer";
import BrutalistButton from "@/components/BrutalistButton";
import MarqueeBand from "@/components/MarqueeBand";

gsap.registerPlugin(ScrollTrigger);

const LiveClock: React.FC = () => {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 47);
    return () => clearInterval(interval);
  }, []);

  const d = new Date(time);
  const hrs = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const secs = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");

  return (
    <div className="font-mono text-5xl md:text-7xl lg:text-8xl tracking-tight">
      <span>{hrs}</span>
      <span className="text-accent">:</span>
      <span>{mins}</span>
      <span className="text-accent">:</span>
      <span>{secs}</span>
      <span className="text-accent">.</span>
      <span className="text-muted-foreground">{ms}</span>
    </div>
  );
};

const features = [
  { icon: Lock, title: "Time-Locked", desc: "Set any date. Content stays sealed until then." },
  { icon: Shield, title: "Encrypted", desc: "Your memories are protected with military-grade security." },
  { icon: Send, title: "Share", desc: "Send capsules to friends, family, or your future self." },
  { icon: Eye, title: "Reveal", desc: "Experience the thrill of opening a message from the past." },
  { icon: Archive, title: "Archive", desc: "Store text, images, and moments for posterity." },
  { icon: Clock, title: "Precise", desc: "Down to the millisecond. Time waits for no one." },
];

const Landing: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(
      heroRef.current.querySelectorAll(".hero-text-line"),
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b-2 border-foreground px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-heading text-2xl uppercase tracking-widest">
          Chronos
        </Link>
        <div className="flex gap-4">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard">
                <BrutalistButton variant="outline" className="text-sm px-4 py-2">Dashboard</BrutalistButton>
              </Link>
              <BrutalistButton variant="accent" className="text-sm px-4 py-2" onClick={logout}>Logout</BrutalistButton>
            </>
          ) : (
            <>
              <Link to="/login">
                <BrutalistButton variant="outline" className="text-sm px-4 py-2">Login</BrutalistButton>
              </Link>
              <Link to="/create">
                <BrutalistButton variant="accent" className="text-sm px-4 py-2">Create Capsule</BrutalistButton>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="min-h-[80vh] grid grid-cols-1 md:grid-cols-2 border-b-2 border-foreground">
        <div className="flex flex-col justify-center p-8 md:p-16 border-r-0 md:border-r-2 border-foreground">
          <h1 className="hero-text-line text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-2">
            SEND IT
          </h1>
          <h1 className="hero-text-line text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-6">
            TO THE <span className="text-accent">FUTURE</span>
          </h1>
          <p className="hero-text-line font-mono text-sm md:text-base text-muted-foreground max-w-md mb-8">
            Archive your moments in time-locked digital capsules. Set a date. Seal it. Open it when the time comes.
          </p>
          <div className="hero-text-line">
            <Link to="/create">
              <BrutalistButton variant="accent">Archive a Moment</BrutalistButton>
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-8 md:p-16 bg-foreground text-background">
          <p className="font-mono text-xs uppercase tracking-[0.3em] mb-4 text-muted">Current Time</p>
          <LiveClock />
          <p className="font-mono text-xs uppercase tracking-[0.3em] mt-6 text-muted">Every moment counts</p>
        </div>
      </section>

      {/* Marquee */}
      <MarqueeBand />

      {/* Features */}
      <GridContainer lines={3} className="py-20 px-6 md:px-16">
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl mb-12 text-center">HOW IT <span className="text-accent">WORKS</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card border-2 border-foreground p-8 brutalist-shadow hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))] transition-all duration-150"
              >
                <f.icon className="w-10 h-10 mb-4" strokeWidth={1.5} />
                <h3 className="text-2xl mb-2">{f.title}</h3>
                <p className="font-mono text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </GridContainer>

      {/* CTA */}
      <section className="border-t-2 border-foreground bg-foreground text-background p-8 md:p-16 text-center">
        <h2 className="text-4xl md:text-6xl mb-4">READY TO <span className="text-accent">ARCHIVE</span>?</h2>
        <p className="font-mono text-sm text-muted mb-8 max-w-md mx-auto">
          Your first time capsule is waiting. What will you send to the future?
        </p>
        <Link to="/create">
          <BrutalistButton variant="accent">Create Your First Capsule</BrutalistButton>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-foreground px-6 py-6 flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>© 2026 PROJECT CHRONOS</span>
        <span>ALL MOMENTS ARCHIVED</span>
      </footer>
    </main>
  );
};

export default Landing;
