import { Link } from "@tanstack/react-router";

export function AppNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-high-soft text-high pulse-alert">
            <span className="size-2.5 rounded-full bg-high" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-tight">Jan Swasthya Signal Grid</p>
            <p className="text-[11px] text-muted-foreground">
              Predictive disease cluster detection · Thanjavur district
            </p>
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-1 rounded-full border border-border bg-surface p-1">
          {[
            { to: "/", label: "DHO dashboard" },
            { to: "/pharmacy", label: "Pharmacy portal" },
            { to: "/how-it-works", label: "How it works" },
          ].map((item) => (
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
      </div>
    </header>
  );
}
