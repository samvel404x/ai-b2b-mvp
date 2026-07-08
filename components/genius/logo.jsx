export function GeniusLogo({ className }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="genius-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0F62FE" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <polygon 
        points="50,5 11.03,27.5 11.03,72.5 50,95 88.97,72.5 88.97,45 45,45 45,65 67.32,65 50,75 28.35,62.5 28.35,37.5 50,25 71.65,37.5" 
        fill="url(#genius-grad)" 
        stroke="url(#genius-grad)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
