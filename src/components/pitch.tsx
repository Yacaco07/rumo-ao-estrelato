import { getPosition, type Position } from "@/domain/athlete/positions";

export function Pitch({ position, decorative = false }: { position?: Position; decorative?: boolean }) {
  const point = position ? getPosition(position).pitch : null;
  return <div className="pitch" role={decorative ? undefined : "img"} aria-label={decorative ? undefined : `Posição em campo: ${position ? getPosition(position).label : "campo de futebol"}`} aria-hidden={decorative || undefined}>
    <svg viewBox="0 0 240 330" fill="none" aria-hidden="true">
      <rect x="10" y="10" width="220" height="310" rx="1" /><path d="M10 165h220" /><circle cx="120" cy="165" r="36" />
      <path d="M56 10v55h128V10M88 10v21h64V10M56 320v-55h128v55M88 320v-21h64v21" />
      <path d="M92 65a32 32 0 0 0 56 0M92 265a32 32 0 0 1 56 0M97 10V3h46v7M97 320v7h46v-7" />
      <circle cx="120" cy="165" r="2" fill="currentColor" /><circle cx="120" cy="48" r="1.5" fill="currentColor" /><circle cx="120" cy="282" r="1.5" fill="currentColor" />
    </svg>
    {point && <span className="pitch-position" style={{ left: `${point.x}%`, top: `${point.y}%` }}>{getPosition(position!).short}</span>}
  </div>;
}

export function Jersey({ number = 1, name = "SEU NOME" }: { number?: number; name?: string }) {
  return <svg className="jersey" viewBox="0 0 300 340" fill="none" aria-hidden="true">
    <defs><linearGradient id="jersey-fill" x1="50" y1="20" x2="240" y2="320" gradientUnits="userSpaceOnUse"><stop stopColor="#30382b" /><stop offset=".5" stopColor="#1a2117" /><stop offset="1" stopColor="#0c100a" /></linearGradient></defs>
    <path d="m103 24 15-8q32 25 64 0l15 8 72 43-30 65-35-15 8 195q-62 20-124 0l8-195-35 15-30-65Z" fill="url(#jersey-fill)" stroke="#5b674f" strokeWidth="1.3" />
    <path d="m118 16 5 21q27 18 54 0l5-21M96 117l7-93m94 0 7 93M62 128l-25-58m201 58 25-58" stroke="#c2f66b" strokeWidth="2" />
    <path d="M104 47v242m18-233v239m19-233v236m18-236v236m19-242v239m19-248v242" stroke="#bacb9f" strokeOpacity=".055" strokeWidth="7" />
    <text x="150" y="91" textAnchor="middle" fill="#c3c9bd" fontSize="10" letterSpacing="2" fontFamily="Arial, sans-serif">{name.slice(0, 20).toUpperCase()}</text>
    <text x="150" y="225" textAnchor="middle" fill="#c9f988" fontSize="123" fontWeight="800" letterSpacing="-6" fontFamily="Arial, sans-serif">{String(number).padStart(2, "0")}</text>
    <path d="M133 266h34m-25 8h16" stroke="#59664c" strokeWidth="2" />
  </svg>;
}
