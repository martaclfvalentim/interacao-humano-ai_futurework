import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.39a4.6 4.6 0 01-2 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.32z" fill="#4285F4"/>
      <path d="M10 20c2.7 0 4.96-.9 6.61-2.45l-3.23-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.75-5.59-4.12H1.08v2.6A10 10 0 0010 20z" fill="#34A853"/>
      <path d="M4.41 11.88A6.01 6.01 0 014.1 10c0-.65.11-1.28.31-1.88V5.52H1.08A10 10 0 000 10c0 1.61.39 3.14 1.08 4.48l3.33-2.6z" fill="#FBBC05"/>
      <path d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.86-2.86A9.97 9.97 0 0010 0 10 10 0 001.08 5.52l3.33 2.6C5.2 5.71 7.4 3.96 10 3.96z" fill="#EA4335"/>
    </svg>
  );
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function ModalShell({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}

export function LoginModal({ onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }

    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("futurework_users") || "[]");
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) {
        setError("Incorrect email or password.");
        setLoading(false);
        return;
      }
      login({ name: found.name, email: found.email });
      setSuccess(true);
      setTimeout(onClose, 1000);
    }, 700);
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="p-8">
        <div className="mb-6 text-center">
          <h2 className="font-bold text-2xl text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2.5 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-all mb-1"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <Divider label="or" />

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6">
                <path d="M5 10l4 4 6-7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-semibold text-foreground">Signed in!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-foreground">Password</label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in…</span> : "Sign in"}
            </Button>
          </form>
        )}

        {!success && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Need an account?{" "}
            <button onClick={onSwitchToRegister} className="text-primary font-medium hover:underline">
              Sign up
            </button>
          </p>
        )}
      </div>
    </ModalShell>
  );
}

export function RegisterModal({ onClose, onSwitchToLogin }) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirm) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("futurework_users") || "[]");
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError("This email is already registered.");
        setLoading(false);
        return;
      }
      users.push({ name, email, password });
      localStorage.setItem("futurework_users", JSON.stringify(users));
      login({ name, email });
      setSuccess(true);
      setTimeout(onClose, 1000);
    }, 700);
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="p-8">
        <button
          onClick={onSwitchToLogin}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          ← Back to sign in
        </button>

        <div className="mb-6">
          <h2 className="font-bold text-2xl text-foreground mb-1">Create your account</h2>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6">
                <path d="M5 10l4 4 6-7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-semibold text-foreground">Account created!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating…</span> : "Create account"}
            </Button>
          </form>
        )}
      </div>
    </ModalShell>
  );
}
