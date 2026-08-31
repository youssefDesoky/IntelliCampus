const UnderlineIcon = ({ size, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 640 640" 
    fill="currentColor" 
    width={size} 
    height={size} 
    {...props}
  >
    <path d="M128 96c0-17.7 14.3-32 32-32h64c17.7 0 32 14.3 32 32s-14.3 32-32 32v160c0 53 43 96 96 96s96-43 96-96V128c-17.7 0-32-14.3-32-32s14.3-32 32-32h64c17.7 0 32 14.3 32 32s-14.3 32-32 32v160c0 88.4-71.6 160-160 160s-160-71.6-160-160V128c-17.7 0-32-14.3-32-32m0 448c0-17.7 14.3-32 32-32h320c17.7 0 32 14.3 32 32s-14.3 32-32 32H160c-17.7 0-32-14.3-32-32" />
  </svg>
);
export default UnderlineIcon;