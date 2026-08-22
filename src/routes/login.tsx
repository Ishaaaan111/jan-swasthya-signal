import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, type UserRole, ROLE_PRESETS } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Official Login · Jan Swasthya Signal Grid" },
      {
        name: "description",
        content: "Role-based authentication portal for District Health Officers, Pharmacy Partners, and State Surveillance Admins.",
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
    <div className="min-h-screen bg-background flex flex-col">
      <AppNav />

      <main className="flex-1 relative flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-xl">
        {/* Header Branding */}
        <div className="text-center mb-6">
          {/* Government Emblem */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center size-28 sm:size-32 rounded-2xl bg-white border border-border p-3 shadow-sm">
              <img
                src="/logo.png"
                alt="Government Emblem — Public Health Directorate"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 mb-2.5">
            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wide text-primary uppercase">
              Integrated Disease Surveillance Gateway
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            Jan Swasthya Signal Grid
          </h1>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto font-medium">
            Government of Tamil Nadu • Department of Public Health &amp; Preventive Medicine
          </p>
        </div>

        {/* Auth Card */}
        <div className="panel p-6 sm:p-7 bg-surface border-border shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3.5 mb-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Select Access Portal</h2>
              <p className="text-[11px] text-muted-foreground">Select your operational authorization level</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-muted-foreground bg-surface-2 px-2.5 py-1 rounded border border-border">
              RBAC v2.4
            </span>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
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
                  className={`relative flex flex-col items-start p-3 rounded-md border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs"
                      : "border-border bg-surface-2/60 hover:bg-surface-2 hover:border-border"
                  }`}
                >
                  <span className="text-lg mb-1">{item.icon}</span>
                  <p className="text-xs font-bold text-foreground">{item.title}</p>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground border border-border"
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Role Profile Box */}
          <div className="rounded-md border border-border bg-surface-2/60 p-3 mb-5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground uppercase font-bold text-[10px]">Authorized Officer</span>
              <span className="font-semibold text-foreground">{ROLE_PRESETS[selectedRole].name}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground uppercase font-bold text-[10px]">Jurisdiction</span>
              <span className="text-muted-foreground">{ROLE_PRESETS[selectedRole].jurisdiction}</span>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Official Government Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Security Passcode / Token
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 rounded-md bg-primary px-4 py-2.5 font-display text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
            >
              Sign In to {ROLE_PRESETS[selectedRole].roleTitle.split("(")[0]}
            </button>
          </form>

          {/* 1-Click Fast Demonstration Login */}
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Demo Preset Access:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  login("dho");
                  navigate({ to: "/" });
                }}
                className="rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent shadow-xs"
              >
                Instant DHO 🩺
              </button>
              <button
                type="button"
                onClick={() => {
                  login("pharmacy");
                  navigate({ to: "/pharmacy" });
                }}
                className="rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent shadow-xs"
              >
                Instant Pharmacy 💊
              </button>
              <button
                type="button"
                onClick={() => {
                  login("admin");
                  navigate({ to: "/admin" });
                }}
                className="rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent shadow-xs"
              >
                Instant Admin 🛡️
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground font-medium">
          Jan Swasthya Signal Grid • Tamil Nadu Directorate of Public Health • SIH 2026
        </p>
      </div>
      </main>
    </div>
  );
}
