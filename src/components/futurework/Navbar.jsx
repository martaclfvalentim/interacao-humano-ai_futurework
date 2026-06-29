import { useState } from "react";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { LoginModal, RegisterModal } from "./AuthModals";

const NAV_LINKS = [
  {
    label: "Product",
    children: [
      { label: "How it Works", desc: "See the full process from CV to offer" },
      { label: "Match Explainer", desc: "Understand how we score compatibility" },
      { label: "Skill Gap Analysis", desc: "Identify what to learn next" },
    ]
  },
  {
    label: "For Candidates",
    children: [
      { label: "Recent Graduates", desc: "Find your first real opportunity" },
      { label: "Career Changers", desc: "Leverage transferable skills" },
    ]
  },
  { label: "About", href: "#" },
  { label: "Pricing", href: "#" },
];

export default function Navbar({ onStartDemo, onGoHome }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [modal, setModal] = useState(null); // 'login' | 'register' | null

  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <button onClick={onGoHome} className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="FutureWork" className="h-8 w-auto" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map((link) => (
              <div key={link.label} className="relative">
                {link.children ? (
                  <button
                    className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <a href={link.href} className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all block">
                    {link.label}
                  </a>
                )}
                {link.children && (
                  <AnimatePresence>
                    {openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-border p-2 z-50"
                        onMouseEnter={() => setOpenDropdown(link.label)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        {link.children.map((child) => (
                          <button key={child.label} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-secondary transition-all">
                            <p className="text-sm font-medium text-foreground">{child.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{child.desc}</p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{firstName[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Hello, {firstName}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5" onClick={logout}>
                  <LogOut className="w-4 h-4" /> Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setModal("login")}>Sign in</Button>
                <Button size="sm" onClick={() => setModal("register")} className="bg-primary hover:bg-primary/90 font-medium">Register</Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={onStartDemo} className="font-medium">
              {user ? "Start analysis" : "Try for free"}
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-white overflow-hidden">
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <div key={link.label}>
                    <p className="px-3 py-2 text-sm font-semibold text-foreground">{link.label}</p>
                    {link.children?.map(child => (
                      <button key={child.label} className="w-full text-left px-6 py-2 text-sm text-muted-foreground hover:text-foreground">{child.label}</button>
                    ))}
                  </div>
                ))}
                <div className="pt-3 border-t border-border flex flex-col gap-2">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{firstName[0]?.toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium">Hello, {firstName}</span>
                      </div>
                      <Button variant="outline" className="w-full gap-2" onClick={() => { setMobileOpen(false); logout(); }}>
                        <LogOut className="w-4 h-4" /> Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" onClick={() => { setMobileOpen(false); setModal("login"); }}>Sign in</Button>
                      <Button className="w-full" onClick={() => { setMobileOpen(false); setModal("register"); }}>Register</Button>
                    </>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => { setMobileOpen(false); onStartDemo(); }}>
                    {user ? "Start analysis" : "Try for free"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {modal === "login" && <LoginModal onClose={() => setModal(null)} onSwitchToRegister={() => setModal("register")} />}
        {modal === "register" && <RegisterModal onClose={() => setModal(null)} onSwitchToLogin={() => setModal("login")} />}
      </AnimatePresence>
    </>
  );
}
