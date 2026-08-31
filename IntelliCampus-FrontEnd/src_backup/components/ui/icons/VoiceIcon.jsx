const VoiceIcon = ({size, ...props}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    fill="none"
    width={size}
    height={size}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      d="M26 26H6c-2.2 0-4-1.8-4-4V10c0-2.2 1.8-4 4-4h20c2.2 0 4 1.8 4 4v12c0 2.2-1.8 4-4 4"
    />
    <circle stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} cx={10} cy={16} r={3} />
    <circle stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} cx={22} cy={16} r={3} />
    <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} d="M10 19h12" />
  </svg>
);
export default VoiceIcon;