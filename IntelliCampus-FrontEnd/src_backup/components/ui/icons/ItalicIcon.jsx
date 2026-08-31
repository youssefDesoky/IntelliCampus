const ItalicIcon = ({ size, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 640 640" 
    fill="currentColor" 
    width={size} 
    height={size} 
    {...props}
  >
    <path d="M256 128c0-17.7 14.3-32 32-32h192c17.7 0 32 14.3 32 32s-14.3 32-32 32h-58.7L288 480h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H160c-17.7 0-32-14.3-32-32s14.3-32 32-32h58.7L352 160h-64c-17.7 0-32-14.3-32-32" />
  </svg>
);
export default ItalicIcon;
