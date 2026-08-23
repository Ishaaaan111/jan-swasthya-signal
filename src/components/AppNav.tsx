import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Bell, Check, Search, Keyboard, HelpCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function AppNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  // Global Keyboard Shortcuts (Cmd+K, G D, G A, ?)
  useEffect(() => {
    let lastKey = "";
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        if (searchInput) searchInput.focus();
        return;
      }

      if (e.key === "?" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setShowShortcutsModal(true);
        return;
      }

      if (document.activeElement?.tagName === "INPUT") return;

      const key = e.key.toLowerCase();
      if (lastKey === "g") {
        if (key === "d") {
          e.preventDefault();
          navigate({ to: "/" });
        } else if (key === "a") {
          e.preventDefault();
          navigate({ to: "/admin" });
        } else if (key === "p") {
          e.preventDefault();
          navigate({ to: "/pharmacy" });
        }
        lastKey = "";
      } else if (key === "g") {
        lastKey = "g";
        setTimeout(() => {
          lastKey = "";
        }, 1200);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

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

  const currentPathLabel =
    location.pathname === "/"
      ? "DHO Dashboard"
      : location.pathname === "/admin"
        ? "State Admin Console"
        : location.pathname === "/pharmacy"
          ? "Pharmacy Portal"
          : "How It Works";

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border shadow-xs">
      {/* Top National / State Administrative Bar */}
      <div className="bg-primary text-primary-foreground px-5 py-1 text-[11px] font-medium tracking-wide">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold uppercase tracking-wider">
              Government of Tamil Nadu
            </span>
            <span className="opacity-40">|</span>
            <span className="opacity-90 font-medium">
              Department of Public Health &amp; Preventive Medicine
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 opacity-90">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-400 dark:bg-emerald-700 animate-pulse" />
              Integrated Disease Surveillance Programme (IDSP)
            </span>
            <span className="font-semibold">SIH 2026 Portal</span>
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

        {/* Center: Global Search Bar */}
        <div className="w-full sm:w-auto sm:flex-1 max-w-md mx-2">
          <GlobalSearchBar />
        </div>

        {/* Right Navigation & Designation Profile */}
        <div className="flex flex-wrap items-center gap-2.5">
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

          {/* User Session Controls & Notifications */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Notification Activity Bell */}
              <NotificationBell />

              {/* Keyboard Shortcuts Trigger Button */}
              <button
                onClick={() => setShowShortcutsModal(true)}
                title="Keyboard Shortcuts (?)"
                className="rounded-md border border-border bg-surface p-2 text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-all cursor-pointer shadow-xs"
              >
                <HelpCircle className="size-4" />
              </button>

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

      {/* Sub-header Breadcrumb + Consistent Last Synced Tag */}
      <div className="bg-surface-2/60 border-t border-border px-5 py-1 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium text-[11px]">
            <Link to="/" className="hover:text-foreground">District Grid</Link>
            <span>/</span>
            <span>Thanjavur District</span>
            <span>/</span>
            <span className="font-semibold text-foreground">{currentPathLabel}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Last synced 2m ago
            </span>
            <span className="text-muted-foreground/40">|</span>
            <span className="text-muted-foreground font-medium">Surveillance Week 34</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Cheat-sheet Modal */}
      {showShortcutsModal && (
        <Dialog open={showShortcutsModal} onOpenChange={setShowShortcutsModal}>
          <DialogContent className="sm:max-w-md bg-surface border-border text-foreground">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Keyboard className="size-5 text-primary" />
                <DialogTitle className="font-display text-lg font-bold text-foreground">
                  Keyboard Shortcuts Cheat-sheet
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Power-user shortcuts to quickly navigate the surveillance grid.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5 py-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-surface-2 border border-border">
                <span className="font-semibold text-foreground">Focus Global Search Bar</span>
                <kbd className="px-2 py-0.5 rounded bg-surface border border-border font-mono text-[11px] font-bold text-primary">
                  Cmd / Ctrl + K
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-2 border border-border">
                <span className="font-semibold text-foreground">Go to DHO Dashboard</span>
                <kbd className="px-2 py-0.5 rounded bg-surface border border-border font-mono text-[11px] font-bold text-foreground">
                  G then D
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-2 border border-border">
                <span className="font-semibold text-foreground">Go to State Admin Console</span>
                <kbd className="px-2 py-0.5 rounded bg-surface border border-border font-mono text-[11px] font-bold text-foreground">
                  G then A
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-2 border border-border">
                <span className="font-semibold text-foreground">Go to Pharmacy Portal</span>
                <kbd className="px-2 py-0.5 rounded bg-surface border border-border font-mono text-[11px] font-bold text-foreground">
                  G then P
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-2 border border-border">
                <span className="font-semibold text-foreground">Open Shortcuts Cheat-sheet</span>
                <kbd className="px-2 py-0.5 rounded bg-surface border border-border font-mono text-[11px] font-bold text-foreground">
                  ?
                </kbd>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
}

const initialNotifications = [
  {
    id: 1,
    title: "Pattukkottai crossed High Risk",
    desc: "OTC Cough syrup sales surge +80% and ASHA fever logs triggered early outbreak threshold.",
    time: "2h ago",
    type: "high",
    read: false,
  },
  {
    id: 2,
    title: "Mobile Camp Confirmed",
    desc: "Sethubavachatram mobile camp tested 40 pregnant women; 23 confirmed cases of Anemia.",
    time: "4h ago",
    type: "watch",
    read: false,
  },
  {
    id: 3,
    title: "Pharmacy Telemetry Auto-Synced",
    desc: "Sri Sai Medical Store submitted 18 POS category summaries for Week 34.",
    time: "5h ago",
    type: "info",
    read: false,
  },
  {
    id: 4,
    title: "Model Accuracy Retrained",
    desc: "Weekly retrain completed on 412 verified diagnoses. Prediction accuracy: 89.4%.",
    time: "6h ago",
    type: "info",
    read: true,
  },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((i) => !i.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Surveillance Notifications"
        className="relative rounded-md border border-border bg-surface p-2 text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-all cursor-pointer shadow-xs flex items-center justify-center"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse border border-background">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-border bg-surface p-3 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xs font-bold text-foreground">District Activity Stream</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                {unreadCount} unread
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="size-3" /> Mark all read
              </button>
            )}
          </div>

          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {items.map((n) => (
              <li
                key={n.id}
                className={`p-2.5 rounded-md border text-xs transition-all ${
                  n.read
                    ? "bg-surface-2/40 border-border/60 text-muted-foreground"
                    : "bg-surface border-border font-medium text-foreground shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span
                      className={`size-2 rounded-full ${
                        n.type === "high"
                          ? "bg-red-500"
                          : n.type === "watch"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }`}
                    />
                    {n.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">{n.time}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{n.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const searchIndex = [
  { category: "Zones & Pincodes", title: "Pattukkottai (614 601)", desc: "High Risk • Tuberculosis • 62,400 pop", route: "/" },
  { category: "Zones & Pincodes", title: "Madukkur (614 903)", desc: "High Risk • Diabetes • 38,100 pop", route: "/" },
  { category: "Zones & Pincodes", title: "Sethubavachatram (614 713)", desc: "High Risk • Anemia • 27,800 pop", route: "/" },
  { category: "Zones & Pincodes", title: "Adirampattinam (614 701)", desc: "Watch Zone • Anemia • 44,200 pop", route: "/" },
  { category: "Zones & Pincodes", title: "Peravurani (614 804)", desc: "Watch Zone • Diabetes • 31,500 pop", route: "/" },
  { category: "Zones & Pincodes", title: "Papanasam (614 205)", desc: "Normal Zone • Stable baseline", route: "/" },
  { category: "Primary Health Centres", title: "PHC Orathanadu", desc: "12 km from HQ • Status: Available", route: "/" },
  { category: "Primary Health Centres", title: "PHC Papanasam", desc: "18 km from HQ • Status: Available", route: "/" },
  { category: "Primary Health Centres", title: "PHC Budalur", desc: "24 km from HQ • Status: Partial", route: "/" },
  { category: "Primary Health Centres", title: "PHC Thiruvaiyaru", desc: "31 km from HQ • Status: Occupied", route: "/" },
  { category: "Disease Conditions", title: "Tuberculosis Outbreak Cluster", desc: "Pattukkottai • High Risk Score 91", route: "/" },
  { category: "Disease Conditions", title: "Diabetes Cluster", desc: "Madukkur & Peravurani • High Risk", route: "/" },
  { category: "Disease Conditions", title: "Anemia Sentinel", desc: "Sethubavachatram & Adirampattinam", route: "/" },
];

function GlobalSearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = query.trim()
    ? searchIndex.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.desc.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: (typeof searchIndex)[number]) => {
    setOpen(false);
    setQuery("");
    navigate({ to: item.route as any });
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
        <input
          id="global-search-input"
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Search pincode, PHC, or disease... (⌘K)"
          className="w-full rounded-md border border-border bg-surface-2/60 pl-8 pr-12 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs transition-all"
        />
        <kbd className="absolute right-2 hidden sm:inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 rounded-lg border border-border bg-surface p-2 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <p className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground">
            Surveillance Grid Search Results ({results.length})
          </p>
          <ul className="space-y-1 max-h-64 overflow-y-auto mt-1">
            {results.map((item) => (
              <li
                key={item.title}
                onClick={() => handleSelect(item)}
                className="p-2 rounded-md hover:bg-surface-2 cursor-pointer transition-all border border-transparent hover:border-border text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{item.title}</span>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-primary/10 text-primary uppercase">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
