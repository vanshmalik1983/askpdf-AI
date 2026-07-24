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
  const firstName = user?.name.split(" ")[0];

  const normalLink =
    "text-sm font-medium text-ink-soft transition-all duration-200 hover:text-ink";

  const activeLink =
    "text-sm font-semibold text-ink transition-all duration-200";

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    navigate("/");
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b shadow-sm transition-all duration-300 ${
        isLanding
          ? "border-transparent bg-paper/80"
          : "border-paper-line bg-paper/95"
      } backdrop-blur-md`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" aria-label="AskPDF AI home">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {isLanding && (
            <>
              <a href="#how-it-works" className={normalLink}>
                How it works
              </a>

              <a href="#features" className={normalLink}>
                Features
              </a>
            </>
          )}

          {user ? (
            <>
              <Link
                to="/dashboard"
                className={
                  location.pathname === "/dashboard"
                    ? activeLink
                    : normalLink
                }
              >
                Dashboard
              </Link>

              <Link
                to="/history"
                className={
                  location.pathname === "/history"
                    ? activeLink
                    : normalLink
                }
              >
                History
              </Link>

              <button
                onClick={handleLogout}
                className="btn-ghost transition-all duration-200 hover:scale-105"
              >
                <LogOut size={15} strokeWidth={2.25} />
                Log out
              </button>

              <div className="hidden items-center gap-3 lg:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                  {firstName?.charAt(0).toUpperCase()}
                </div>

                <span className="text-sm font-medium text-ink-faint">
                  Hi, {firstName}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={normalLink}>
                Log in
              </Link>

              <Link
                to="/signup"
                className="btn-primary !px-5 !py-2.5 transition-all duration-200 hover:scale-105"
              >
                Get started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="text-ink md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-paper-line bg-paper px-6 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            {isLanding && (
              <>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md py-2 text-sm font-medium text-ink-soft"
                >
                  How it works
                </a>

                <a
                  href="#features"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md py-2 text-sm font-medium text-ink-soft"
                >
                  Features
                </a>
              </>
            )}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md py-2 text-sm font-medium text-ink"
                >
                  Dashboard
                </Link>

                <Link
                  to="/history"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md py-2 text-sm font-medium text-ink"
                >
                  History
                </Link>

                <button
                  onClick={handleLogout}
                  className="py-2 text-left text-sm font-medium text-ink-soft"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md py-2 text-sm font-medium text-ink"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-fit"
                >
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