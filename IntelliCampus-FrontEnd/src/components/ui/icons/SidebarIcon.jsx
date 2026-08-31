const SidebarIcon = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    strokeLinejoin="round"
    strokeLinecap="round"
    stroke="currentColor"
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    strokeWidth={2}
    {...props}
  >
    <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
    <path d="M9 3v18" />
  </svg>
);
export default SidebarIcon;
