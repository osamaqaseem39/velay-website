"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const HEADLINE = "CHAL VELAY TAYAR REH";
const CHAL_PREFIX = "CHAL ";
const VELAY_WORD = "VELAY";

const GOOGLE_MAPS_SRC = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&v=weekly`;

function svgPin(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54">
      <defs>
        <filter id="g" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge>
            <feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#g)">
        <path d="M27 52c10-12 15-21 15-29A15 15 0 0 0 12 23c0 8 5 17 15 29z" fill="${color}" fill-opacity="0.95"/>
        <circle cx="27" cy="23" r="10.5" fill="rgba(10,10,14,0.85)" stroke="rgba(255,255,255,0.16)" stroke-width="1"/>
      </g>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
export default function Page() {
  const mapRef = useRef(null);
  const didInit = useRef(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (didInit.current) return;
    if (!mapRef.current) return;
    if (typeof window === "undefined") return;
    if (!googleReady) return;
    if (!window.google?.maps) return;

    didInit.current = true;

    const start = { lat: 31.5204, lng: 74.3587, zoom: 12 };

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: start.lat, lng: start.lng },
      zoom: start.zoom,
      disableDefaultUI: true,
      keyboardShortcuts: false,
      clickableIcons: false,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
      backgroundColor: "#0b0b0f",
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1b1b1f" }] },
        { elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a31" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f1016" }] }
      ]
    });

    // Category markers (1-2 each): futsal, padel, cricket
    const kindColor = (kind) =>
      kind === "futsal" ? "#ff2fd6" : kind === "padel" ? "#8a4dff" : "#ffffff";

    const places = [
      // Increased offsets so icons aren't clustered
      { kind: "futsal", name: "Futsal Arena", dLat: 0.055, dLng: -0.06 },
      { kind: "futsal", name: "Futsal Ground", dLat: -0.05, dLng: 0.075 },
      { kind: "padel", name: "Padel Court", dLat: 0.06, dLng: 0.07 },
      { kind: "padel", name: "Padel Club", dLat: -0.065, dLng: -0.04 },
      { kind: "cricket", name: "Cricket Nets", dLat: 0.085, dLng: 0.0 },
      { kind: "cricket", name: "Cricket Ground", dLat: -0.085, dLng: 0.04 },

      // Extra locations (3-4 more)
      { kind: "futsal", name: "Futsal Spot", dLat: 0.02, dLng: 0.105 },
      { kind: "padel", name: "Padel Spot", dLat: -0.02, dLng: -0.11 },
      { kind: "cricket", name: "Cricket Spot", dLat: 0.115, dLng: -0.02 },
      { kind: "cricket", name: "Cricket Spot 2", dLat: -0.115, dLng: -0.005 }
    ];

    const markers = places.map((p) => {
      const iconUrl = svgPin(kindColor(p.kind));
      return new window.google.maps.Marker({
        map,
        position: { lat: start.lat + p.dLat, lng: start.lng + p.dLng },
        clickable: false,
        optimized: true,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(44, 44),
          anchor: new window.google.maps.Point(22, 42)
        }
      });
    });

    return () => {
      markers.forEach((m) => m.setMap(null));
      didInit.current = false;
    };
  }, [googleReady]);

  useEffect(() => {
    // Reliable typewriter: render characters directly (no width clipping)
    setTyped("");
    setTypingDone(false);
    let i = 0;
    const speedMs = 34;
    const timer = window.setInterval(() => {
      i += 1;
      setTyped(HEADLINE.slice(0, i));
      if (i >= HEADLINE.length) {
        window.clearInterval(timer);
        setTypingDone(true);
      }
    }, speedMs);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <Script
        src={GOOGLE_MAPS_SRC}
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />

      <div className="app">
        <div ref={mapRef} className="map" aria-label="Interactive map background" />
        <div className="mapOverlay neonGrid" aria-hidden="true" />

        <div className="center">
          <h1 className="headline">
            <span className={typingDone ? "typing typingDone" : "typing"} aria-label={HEADLINE}>
              {(() => {
                const chalLen = CHAL_PREFIX.length;
                const velayStart = chalLen;
                const velayEnd = chalLen + VELAY_WORD.length;

                const typedChal = typed.slice(0, chalLen);
                const typedVelay = typed.slice(velayStart, velayEnd);
                const typedRest = typed.slice(velayEnd);

                return (
                  <>
                    <span className="chalWord">{typedChal}</span>
                    <span className="velayWord">{typedVelay}</span>
                    <span className="headlineRest">{typedRest}</span>
                  </>
                );
              })()}
            </span>
          </h1>
        </div>

        
      </div>
    </>
  );
}