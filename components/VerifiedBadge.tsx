export default function VerifiedBadge({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-label="Verified"
      role="img"
    >
      {/* Scalloped seal shape */}
      <path
        d="M12 1.5l2.35 1.36 2.7-.3 1.36 2.35 2.35 1.36-.3 2.7 1.36 2.35-1.36 2.35.3 2.7-2.35 1.36-1.36 2.35-2.7-.3L12 22.5l-2.35-1.36-2.7.3-1.36-2.35-2.35-1.36.3-2.7L2.18 12l1.36-2.35-.3-2.7 2.35-1.36 1.36-2.35 2.7.3L12 1.5z"
        fill="#EF233C"
      />
      {/* Checkmark */}
      <path
        d="M8 12.3l2.6 2.6L16.2 9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
