import { useEffect, useRef } from "react";
import type { Zone } from "@/lib/grid-data";
import { useTheme } from "@/lib/theme";
import "leaflet/dist/leaflet.css";

interface DistrictMapProps {
  zones: Zone[];
  phcs: { name: string; km: number; status: "available" | "partial" | "occupied"; lat?: number; lng?: number; assignedZone?: string | null }[];
  selectedId: string | null;
  onSelectZone: (id: string) => void;
}

export function DistrictMap({ zones, phcs, selectedId, onSelectZone }: DistrictMapProps) {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const tileLayerRef = useRef<import("leaflet").TileLayer | null>(null);
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

      // Tile layer based on active theme
      const tileUrl = theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: "abcd",
      }).addTo(map);
      tileLayerRef.current = tileLayer;

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

  // Update tile layer when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      if (tileLayerRef.current && mapInstanceRef.current) {
        tileLayerRef.current.remove();
      }
      const tileUrl = theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      if (mapInstanceRef.current) {
        tileLayerRef.current = L.tileLayer(tileUrl, {
          maxZoom: 18,
          subdomains: "abcd",
        }).addTo(mapInstanceRef.current);
      }
    });
  }, [theme]);

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
    <div className="relative h-[520px] w-full overflow-hidden rounded-lg border border-border shadow-xs bg-slate-100">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {/* Map Overlay Badge */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex items-center gap-2.5 rounded-md border border-border bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur">
        <span className="size-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] font-semibold text-foreground tracking-tight">
          Thanjavur District Health GIS · Live Surveillance Map
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

    // Risk colors (Clean healthcare palette)
    const strokeColor = isHigh ? "#dc2626" : isWatch ? "#d97706" : "#16a34a";
    const haloColor = isHigh ? "rgba(220, 38, 38, 0.18)" : isWatch ? "rgba(217, 119, 6, 0.15)" : "rgba(22, 163, 74, 0.1)";

    // Add disease cluster coverage radius circle for flagged areas
    if (isHigh || isWatch) {
      L.circle([zone.lat, zone.lng], {
        radius: isHigh ? 3800 : 2500,
        color: strokeColor,
        fillColor: haloColor,
        fillOpacity: isHigh ? 0.35 : 0.2,
        weight: isHigh ? 2 : 1.5,
        dashArray: isHigh ? undefined : "4, 4",
      })
        .on("click", () => onSelectZone(zone.id))
        .addTo(layer);
    }

    // HTML custom marker icon - Clean Government Badge
    const bgClass = isHigh ? "bg-red-600 border-red-700 text-white" : isWatch ? "bg-amber-500 border-amber-600 text-white" : "bg-emerald-600 border-emerald-700 text-white";
    const ringClass = isSelected ? "ring-3 ring-primary ring-offset-2 scale-105" : "hover:scale-105 shadow-sm";

    const html = `
      <div class="relative cursor-pointer transition-transform duration-150 select-none">
        ${isHigh ? `<span class="absolute -inset-1.5 rounded-lg bg-red-400/40 animate-ping"></span>` : ""}
        <div class="relative flex items-center gap-1.5 rounded-md border ${bgClass} ${ringClass} px-2.5 py-1 text-left shadow-md">
          <span class="size-2 rounded-full bg-white flex-shrink-0"></span>
          <div class="leading-none">
            <div class="text-[11px] font-bold tracking-tight text-white">${zone.name}</div>
            <div class="text-[10px] text-white/90 font-medium mt-0.5">${zone.disease} (${zone.score})</div>
          </div>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      className: "custom-map-zone-marker",
      html,
      iconSize: [115, 34],
      iconAnchor: [57, 17],
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
    const statusColor = isAvailable ? "#16a34a" : phc.status === "partial" ? "#d97706" : "#dc2626";

    const html = `
      <div class="group relative cursor-pointer select-none">
        <div class="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2 py-1 shadow-sm text-slate-800 hover:border-primary">
          <span class="text-[11px] font-bold text-blue-700">🏥</span>
          <span class="text-[11px] font-bold text-slate-900">${phc.name.replace("PHC ", "")}</span>
          <span class="size-2 rounded-full ml-0.5" style="background-color: ${statusColor}"></span>
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
