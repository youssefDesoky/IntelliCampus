const LocationDotIcon = ({ size, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 640 640" 
    fill="currentColor" 
    width={size}
    height={size}
    {...props}
  >
    <path d="M128 252.6C128 148.4 214 64 320 64s192 84.4 192 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM320 320c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64" />
  </svg>
);
export default LocationDotIcon;