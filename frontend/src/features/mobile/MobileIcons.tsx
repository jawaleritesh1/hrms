

export function FingerprintIcon({ className = "w-5 h-5", size = 20, color = "currentColor" }: { className?: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
      <path d="M2 16h.01" />
      <path d="M21.8 16c.2-2 .131-5.354 0-6" />
      <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
      <path d="M5.58 10a8.01 8.01 0 0 1 15.42 2" />
      <path d="M8.2 16.5c-.2 1.5-.7 3.5-.7 5.5" />
      <path d="M12 2a10 10 0 0 0-9.45 6.66" />
    </svg>
  );
}

export function PlantArtIllustration({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <div className={`plant-art-container ${className}`} style={{
      width: "88px",
      height: "88px",
      borderRadius: "16px",
      background: "linear-gradient(145deg, #f7f3ec 0%, #ede6d8 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.04)",
      overflow: "hidden",
      position: "relative"
    }}>
      <svg width="76" height="76" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M45 92C45 92 48 55 70 35C74 31 82 25 82 25C82 25 78 35 72 41C54 60 48 92 48 92" fill="#587A5B" opacity="0.85" />
        <path d="M47 92C47 92 44 60 25 45C20 41 12 36 12 36C12 36 18 43 25 50C40 65 45 92 45 92" fill="#7A9A7C" opacity="0.85" />
        <path d="M46 95C46 70 47 40 52 15C53 10 56 6 56 6C56 6 53 12 50 18C44 38 43 72 44 95" fill="#436046" />
        <path d="M48 68C48 68 56 52 75 50C80 49 88 50 88 50C88 50 81 55 74 57C58 63 50 72 48 72" fill="#8FA887" opacity="0.9" />
        <path d="M45 75C45 75 35 62 18 65C13 66 6 70 6 70C6 70 12 68 19 66C32 63 43 77 43 77" fill="#6B8D69" opacity="0.9" />
      </svg>
    </div>
  );
}

export function SGSLogoMark({ height = 28 }: { height?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <img
        src="/assets/images/Logo.png?v=2"
        alt="SGS Logo"
        style={{ height: `${height}px`, objectFit: "contain" }}
        onError={(e) => {
          // Fallback if image asset fails to load
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
