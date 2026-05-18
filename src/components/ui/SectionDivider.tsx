export default function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex items-center gap-3">
        <span className="block h-px w-10 bg-gradient-to-r from-transparent to-gold/25" />
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="text-gold/40"
        >
          <path
            d="M8 0C8 0 16 8 8 16C0 8 8 0 8 0Z"
            fill="currentColor"
            opacity="0.3"
          />
          <path
            d="M8 2C8 2 14 8 8 14C2 8 8 2 8 2Z"
            fill="currentColor"
            opacity="0.6"
          />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </svg>
        <span className="block h-px w-10 bg-gradient-to-l from-transparent to-gold/25" />
      </div>
    </div>
  )
}
