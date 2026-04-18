import { studioIdentity } from "@/config/studio";

/**
 * Branded abstract panel — SVH wordmark on geometry. Not a portrait or stock photo.
 * Decorative only (parent is aria-hidden); SVG has no <title> to avoid React 19
 * treating nested <title> like document metadata and flagging multi-child strings.
 */
export function StudioIdentityVisual() {
  const op = studioIdentity.operator;
  return (
    <div
      className="editorial-grid relative flex h-[min(600px,70vh)] w-full items-center justify-center overflow-hidden bg-[#131313]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#cafd00]/[0.07] via-transparent to-transparent" />
      <svg
        viewBox="0 0 400 400"
        className="relative z-[1] h-[min(60vw,280px)] w-[min(60vw,280px)] md:h-72 md:w-72"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect
          x="12"
          y="12"
          width="376"
          height="376"
          stroke="#cafd00"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
        <text
          x="200"
          y="238"
          textAnchor="middle"
          fill="#cafd00"
          fontSize="120"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.06em"
          opacity="0.92"
        >
          {op}
        </text>
      </svg>
    </div>
  );
}
