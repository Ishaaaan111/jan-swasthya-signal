import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  // Filter navigation links based on user role
  const navItems = user
    ? user.role === "admin"
      ? [
          { to: "/", label: "Dashboard" },
          { to: "/admin", label: "State Admin Console" },
          { to: "/pharmacy", label: "Pharmacy Portal" },
          { to: "/how-it-works", label: "How It Works" },
        ]
      : user.role === "pharmacy"
        ? [
            { to: "/pharmacy", label: "Pharmacy Portal" },
            { to: "/how-it-works", label: "How It Works" },
          ]
        : [
            { to: "/", label: "Dashboard" },
            { to: "/how-it-works", label: "How It Works" },
          ]
    : [];

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border shadow-xs">
      {/* Top National / State Administrative Bar */}
      <div className="bg-primary text-primary-foreground px-5 py-1 text-[11px] font-medium tracking-wide">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold uppercase tracking-wider">
              Government of Tamil Nadu
            </span>
            <span className="text-white/40">|</span>
            <span className="text-white/90">
              Department of Public Health &amp; Preventive Medicine
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-white/80">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Integrated Disease Surveillance Programme (IDSP)
            </span>
            <span>SIH 2026 Portal</span>
          </div>
        </div>
      </div>

      {/* Main Official Header */}
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-2.5">
        {/* Left Branding with Emblem */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center size-11 rounded-lg bg-white border border-border p-1 shadow-xs">
            <img
              src="/logo.png"
              alt="Government Emblem"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-bold text-foreground tracking-tight leading-tight">
                Jan Swasthya Signal Grid
              </h1>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase border border-primary/20">
                Pincode Surveillance
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Predictive Disease Cluster Surveillance • Thanjavur District
            </p>
          </div>
        </div>

        {/* Right Navigation & Designation Profile */}
        <div className="flex flex-wrap items-center gap-3">
          {navItems.length > 0 && (
            <nav className="flex items-center gap-1 bg-surface-2 p-1 rounded-md border border-border">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="rounded px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground shadow-xs"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* User Session Controls */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* DHO Profile Badge */}
              <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3 py-1 text-xs shadow-xs">
                <span
                  className={`size-2 rounded-full ${
                    user.role === "admin"
                      ? "bg-purple-600"
                      : user.role === "pharmacy"
                        ? "bg-blue-600"
                        : "bg-emerald-600"
                  }`}
                />
                <div className="leading-tight">
                  <div className="font-semibold text-foreground text-xs">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">
                    {user.role === "dho" ? "District Health Officer" : user.role === "admin" ? "State Administrator" : "Pharmacy Partner"}
                  </div>
                </div>
              </div>

              {/* Theme Toggle (Left of Sign Out) */}
              <ThemeToggle />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-high-soft hover:text-high hover:border-high/30 transition-colors shadow-xs cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
