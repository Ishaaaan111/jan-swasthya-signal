import { useEffect, useRef } from "react";
import type { Zone } from "@/lib/grid-data";
import "leaflet/dist/leaflet.css";

interface DistrictMapProps {
  zones: Zone[];
  phcs: { name: string; km: number; status: "available" | "partial" | "occupied"; lat?: number; lng?: number; assignedZone?: string | null }[];
  selectedId: string | null;
  onSelectZone: (id: string) => void;
}

export function DistrictMap({ zones, phcs, selectedId, onSelectZone }: DistrictMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersLayerRef = useRef<import("leaflet").LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if existing
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center on Thanjavur District, Tamil Nadu
      const map = L.map(mapContainerRef.current, {
        center: [10.65, 79.28],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      // Add zoom control in top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Add CartoDB Dark Matter tiles (matches the dark surveillance theme)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
        subdomains: "abcd",
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Initial render of markers
      renderMarkers(L, map, markersLayer, zones, phcs, selectedId, onSelectZone);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when zones, phcs, or selectedId change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      markersLayerRef.current.clearLayers();
      renderMarkers(L, mapInstanceRef.current, markersLayerRef.current, zones, phcs, selectedId, onSelectZone);
    });
  }, [zones, phcs, selectedId, onSelectZone]);

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-border">
      <div ref={mapContainerRef} className="h-full w-full bg-background/90" />
      
      {/* Map Overlay Badge */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex items-center gap-2 rounded-lg border border-border/80 bg-background/90 px-3 py-1.5 backdrop-blur">
        <span className="size-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] font-medium text-foreground">
          Thanjavur District GIS · Live Early Warning Grid
        </span>
      </div>
    </div>
  );
}

function renderMarkers(
  L: typeof import("leaflet"),
  map: import("leaflet").Map,
  layer: import("leaflet").LayerGroup,
  zones: Zone[],
  phcs: DistrictMapProps["phcs"],
  selectedId: string | null,
  onSelectZone: (id: string) => void,
) {
  // 1. Render Disease Surveillance Zones
  zones.forEach((zone) => {
    if (!zone.lat || !zone.lng) return;

    const isSelected = selectedId === zone.id;
    const isHigh = zone.risk === "high";
    const isWatch = zone.risk === "watch";

    // Risk colors
    const primaryColor = isHigh ? "oklch(0.65 0.24 25)" : isWatch ? "oklch(0.75 0.18 55)" : "oklch(0.72 0.19 145)";
    const haloColor = isHigh ? "rgba(239, 68, 68, 0.25)" : isWatch ? "rgba(245, 158, 11, 0.2)" : "rgba(34, 197, 94, 0.15)";

    // Add disease cluster coverage radius circle for flagged areas
    if (isHigh || isWatch) {
      L.circle([zone.lat, zone.lng], {
        radius: isHigh ? 3800 : 2500,
        color: primaryColor,
        fillColor: haloColor,
        fillOpacity: isHigh ? 0.35 : 0.2,
        weight: isHigh ? 1.5 : 1,
        dashArray: isHigh ? undefined : "4, 4",
      })
        .on("click", () => onSelectZone(zone.id))
        .addTo(layer);
    }

    // HTML custom marker icon
    const html = `
      <div class="relative cursor-pointer transition-transform duration-200 hover:scale-110 select-none">
        ${isHigh ? `<span class="absolute -inset-2 rounded-full bg-red-500/40 animate-ping"></span>` : ""}
        <div class="relative flex items-center gap-1.5 rounded-xl border ${
          isSelected ? "ring-2 ring-white border-white scale-105" : "border-border/80"
        } px-2.5 py-1.5 shadow-lg backdrop-blur" style="background-color: ${
      isHigh ? "rgba(220, 38, 38, 0.88)" : isWatch ? "rgba(217, 119, 6, 0.88)" : "rgba(22, 101, 52, 0.85)"
    };">
          <span class="size-2 rounded-full bg-white"></span>
          <div class="text-left leading-none">
            <div class="text-[12px] font-bold text-white tracking-tight">${zone.name}</div>
            <div class="text-[10px] text-white/85 font-medium mt-0.5">${zone.disease} (${zone.score})</div>
          </div>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      className: "custom-map-zone-marker",
      html,
      iconSize: [110, 36],
      iconAnchor: [55, 18],
    });

    const marker = L.marker([zone.lat, zone.lng], { icon }).addTo(layer);
    marker.on("click", () => {
      onSelectZone(zone.id);
    });
  });

  // 2. Render PHC Facilities
  phcs.forEach((phc) => {
    if (!phc.lat || !phc.lng) return;

    const isAvailable = phc.status === "available";
    const statusColor = isAvailable ? "#22c55e" : phc.status === "partial" ? "#f59e0b" : "#ef4444";

    const html = `
      <div class="group relative cursor-pointer select-none">
        <div class="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 px-2 py-1 shadow-md text-slate-200">
          <span class="text-[10px] font-mono font-bold text-blue-400">🏥</span>
          <span class="text-[11px] font-medium">${phc.name.replace("PHC ", "")}</span>
          <span class="size-1.5 rounded-full ml-0.5" style="background-color: ${statusColor}"></span>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      className: "custom-map-phc-marker",
      html,
      iconSize: [95, 26],
      iconAnchor: [47, 13],
    });

    L.marker([phc.lat, phc.lng], { icon }).addTo(layer);
  });
}
