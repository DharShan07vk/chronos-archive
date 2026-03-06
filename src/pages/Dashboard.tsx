import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Archive, Clock, Filter } from "lucide-react";
import CapsuleCard from "@/components/CapsuleCard";
import BrutalistButton from "@/components/BrutalistButton";
import { useCapsules } from "@/store/capsuleStore";

type FilterType = "all" | "locked" | "open";

const Dashboard: React.FC = () => {
  const { capsules, loading } = useCapsules();
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = capsules.filter((c) => {
    if (filter === "locked") return c.isLocked;
    if (filter === "open") return !c.isLocked;
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b-2 border-foreground px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-heading text-2xl uppercase tracking-widest">Chronos</Link>
        <Link to="/create">
          <BrutalistButton variant="accent" className="text-sm px-4 py-2">
            <Plus className="w-4 h-4 mr-1 inline" /> New Capsule
          </BrutalistButton>
        </Link>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r-2 border-foreground p-6 hidden md:flex flex-col gap-6">
          <div>
            <h2 className="font-heading text-lg uppercase tracking-widest mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5" /> The Archive
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              {capsules.length} capsule{capsules.length !== 1 && "s"} stored
            </p>
          </div>

          <div className="border-t-2 border-foreground pt-4">
            <h3 className="font-heading text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </h3>
            <div className="flex flex-col gap-2">
              {(["all", "locked", "open"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`font-mono text-sm uppercase text-left px-3 py-2 border-2 transition-all duration-150 ${
                    filter === f
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  {f === "all" && "All Capsules"}
                  {f === "locked" && "🔒 Locked"}
                  {f === "open" && "📂 Open"}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-foreground pt-4 mt-auto">
            <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-5xl">
              {filter === "all" && "ALL CAPSULES"}
              {filter === "locked" && "LOCKED CAPSULES"}
              {filter === "open" && "OPEN CAPSULES"}
            </h1>
            <span className="font-mono text-sm text-muted-foreground">{filtered.length} results</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-2 border-foreground p-6 brutalist-shadow animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/2 mb-4" />
                  <div className="h-3 bg-muted rounded w-full mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border-2 border-foreground p-12 text-center brutalist-shadow">
              <p className="font-heading text-2xl mb-4">NO CAPSULES FOUND</p>
              <p className="font-mono text-sm text-muted-foreground mb-6">Create your first time capsule to get started.</p>
              <Link to="/create">
                <BrutalistButton variant="accent">Create Capsule</BrutalistButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filtered.map((c) => (
                <CapsuleCard key={c.id} capsule={c} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
