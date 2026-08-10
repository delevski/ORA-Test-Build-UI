export function PlantSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 600" className={className} aria-hidden preserveAspectRatio="xMidYMax slice">
      <g fill="#050506" opacity="0.92">
        <path d="M120 600 C 90 430, 30 380, 10 300 C 90 340, 130 420, 150 480 C 150 380, 120 300, 140 210 C 190 300, 185 420, 180 500 C 210 420, 260 380, 330 360 C 270 430, 230 500, 215 600 Z" />
        <path d="M700 600 C 720 470, 780 420, 795 330 C 730 380, 690 450, 675 520 C 665 430, 690 340, 660 260 C 620 350, 640 470, 655 545 C 620 480, 560 445, 500 430 C 560 495, 610 545, 630 600 Z" />
      </g>
    </svg>
  );
}

export function RailingSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1600 400" className={className} aria-hidden preserveAspectRatio="xMidYMax slice">
      <g fill="#050506" opacity="0.9">
        <rect x="0" y="330" width="1600" height="70" />
        <rect x="0" y="300" width="1600" height="10" />
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={i * 80 + 12} y="310" width="6" height="24" />
        ))}
      </g>
    </svg>
  );
}
