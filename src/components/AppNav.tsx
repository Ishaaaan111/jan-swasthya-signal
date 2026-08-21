import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

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
          { to: "/admin", label: "Admin Console" },
          { to: "/", label: "DHO dashboard" },
          { to: "/pharmacy", label: "Pharmacy portal" },
          { to: "/how-it-works", label: "How it works" },
        ]
      : user.role === "pharmacy"
        ? [
            { to: "/pharmacy", label: "Pharmacy portal" },
            { to: "/how-it-works", label: "How it works" },
          ]
        : [
            { to: "/", label: "DHO dashboard" },
            { to: "/how-it-works", label: "How it works" },
          ]
    : [{ to: "/login", label: "Sign In" }];

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="National Health Emblem"
            className="size-9 rounded-full object-contain bg-white/10 p-0.5 border border-border shadow-md"
          />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-tight">Jan Swasthya Signal Grid</p>
            <p className="text-[11px] text-muted-foreground">
              Predictive disease cluster detection · Thanjavur district
            </p>
          </div>
        </div>

        {/* Center / Right Nav Links & User Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Session Controls */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Active User Badge */}
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs">
                <span
                  className={`size-2 rounded-full ${
                    user.role === "admin"
                      ? "bg-purple-500"
                      : user.role === "pharmacy"
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                  }`}
                />
                <span className="font-medium text-foreground">{user.name}</span>
                <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] uppercase font-bold text-muted-foreground">
                  {user.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-high-soft hover:text-high hover:border-high/40 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
