import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, type UserRole, ROLE_PRESETS } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login · Jan Swasthya Signal Grid" },
      {
        name: "description",
        content: "Role-based authentication for District Health Officers, Pharmacy Partners, and State Admins.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("dho");
  const [email, setEmail] = useState(ROLE_PRESETS.dho.email);
  const [password, setPassword] = useState("••••••••••••");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(ROLE_PRESETS[role].email);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    login(selectedRole);

    if (selectedRole === "dho") {
      navigate({ to: "/" });
    } else if (selectedRole === "pharmacy") {
      navigate({ to: "/pharmacy" });
    } else {
      navigate({ to: "/admin" });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Background ambient medical grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, oklch(0.65 0.24 25 / 0.15) 0%, transparent 70%), linear-gradient(to right, oklch(1 0 0 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 32px 32px, 32px 32px",
        }}
      />

      <div className="relative w-full max-w-xl">
        {/* Header Branding */}
        <div className="text-center mb-6">
          {/* National Health Emblem */}
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="National Health Emblem — Health For All"
              className="size-24 rounded-full object-cover shadow-2xl shadow-primary/30 border-2 border-primary/30 ring-4 ring-primary/10"
            />
          </div>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-high/40 bg-high-soft px-3.5 py-1.5 mb-3">
            <span className="size-2 rounded-full bg-high animate-ping" />
            <span className="text-xs font-semibold tracking-wide text-high uppercase">
              Secure Surveillance Gateway
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground sm:text-4xl">
            Jan Swasthya Signal Grid
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            District disease cluster prediction &amp; mobile health fleet dispatch system
          </p>
        </div>

        {/* Auth Card */}
        <div className="panel p-6 sm:p-8 backdrop-blur-xl border-border/80 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <div>
              <h2 className="text-base font-semibold">Select Access Portal</h2>
              <p className="text-xs text-muted-foreground">Choose your operational role to continue</p>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground bg-surface-2 px-2.5 py-1 rounded-md border border-border">
              RBAC v2.4
            </span>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {(
              [
                {
                  role: "dho",
                  title: "DHO Portal",
                  badge: "District Lead",
                  desc: "GIS Map & Van Dispatch",
                  icon: "🩺",
                },
                {
                  role: "pharmacy",
                  title: "Pharmacy",
                  badge: "Data Partner",
                  desc: "Daily OTC Sales Input",
                  icon: "💊",
                },
                {
                  role: "admin",
                  title: "Admin Portal",
                  badge: "Super Admin",
                  desc: "Full State Control",
                  icon: "🛡️",
                },
              ] as const
            ).map((item) => {
              const isSelected = selectedRole === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleRoleSelect(item.role)}
                  className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-md"
                      : "border-border bg-surface-2/60 hover:bg-surface-2 hover:border-border/80"
                  }`}
                >
                  <span className="text-xl mb-1.5">{item.icon}</span>
                  <p className="text-xs font-bold text-foreground">{item.title}</p>
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wider mt-0.5 px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Role Profile Box */}
          <div className="rounded-xl border border-border bg-surface-2/80 p-3.5 mb-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground uppercase font-mono text-[10px]">Authorized User</span>
              <span className="font-semibold text-foreground">{ROLE_PRESETS[selectedRole].name}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-muted-foreground uppercase font-mono text-[10px]">Jurisdiction</span>
              <span className="text-muted-foreground">{ROLE_PRESETS[selectedRole].jurisdiction}</span>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Official Government Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Security Passcode
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 rounded-xl bg-primary px-4 py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 shadow-lg shadow-primary/20"
            >
              Sign In to {ROLE_PRESETS[selectedRole].roleTitle.split("(")[0]}
            </button>
          </form>

          {/* 1-Click Fast Demonstration Login */}
          <div className="mt-5 pt-5 border-t border-border flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Demo preset:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  login("dho");
                  navigate({ to: "/" });
                }}
                className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
              >
                Instant DHO 🩺
              </button>
              <button
                type="button"
                onClick={() => {
                  login("pharmacy");
                  navigate({ to: "/pharmacy" });
                }}
                className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
              >
                Instant Pharmacy 💊
              </button>
              <button
                type="button"
                onClick={() => {
                  login("admin");
                  navigate({ to: "/admin" });
                }}
                className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
              >
                Instant Admin 🛡️
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Jan Swasthya Signal Grid · Tamil Nadu Directorate of Public Health · SIH 2026
        </p>
      </div>
    </div>
  );
}
