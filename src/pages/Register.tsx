import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrutalistButton from "@/components/BrutalistButton";
import { useAuth } from "@/store/authStore";
const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(email, password, name);
    setLoading(false);
    if (success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b-2 border-foreground px-6 py-4">
        <Link to="/" className="font-heading text-2xl uppercase tracking-widest">Chronos</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="border-2 border-foreground bg-card p-8 md:p-10 brutalist-shadow">
            <h1 className="text-4xl md:text-5xl mb-2">REGISTER</h1>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
              Create your archive
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="brutalist-input w-full text-foreground"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="brutalist-input w-full text-foreground"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="brutalist-input w-full text-foreground"
                  required
                />
              </div>

              <BrutalistButton type="submit" variant="default" fullWidth className="mt-4" disabled={loading}>
                {loading ? "CREATING ACCOUNT..." : "CREATE ARCHIVE ACCOUNT"}
              </BrutalistButton>
            </form>

            <p className="font-mono text-xs text-muted-foreground mt-6 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-accent underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
