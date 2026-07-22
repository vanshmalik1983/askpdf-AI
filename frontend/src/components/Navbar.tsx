import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = location.pathname === "/";

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b ${
        isLanding ? "border-transparent bg-paper/80" : "border-paper-line bg-paper/95"
      } backdrop-blur-md`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" aria-label="AskPDF AI home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {isLanding && (
            <>
              <a href="#how-it-works" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                How it works
              </a>
              <a href="#features" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                Features
              </a>
            </>
          )}

          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                Dashboard
              </Link>
              <Link to="/history" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                History
              </Link>
              <button onClick={handleLogout} className="btn-ghost">
                <LogOut size={15} strokeWidth={2.25} />
                Log out
              </button>
              <span className="hidden text-sm text-ink-faint lg:inline">Hi, {user.name.split(" ")[0]}</span>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary !py-2.5 !px-5">
                Get started
              </Link>
            </>
          )}
        </nav>

        <button
          className="text-ink md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-paper-line bg-paper px-6 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-4">
            {isLanding && (
              <>
                <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-ink-soft">
                  How it works
                </a>
                <a href="#features" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-ink-soft">
                  Features
                </a>
              </>
            )}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-ink">
                  Dashboard
                </Link>
                <Link to="/history" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-ink">
                  History
                </Link>
                <button onClick={handleLogout} className="text-left text-sm font-medium text-ink-soft">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-ink">
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary w-fit">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
