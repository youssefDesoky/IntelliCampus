const DoorOpenIcon = ({size, ...props}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512" 
    fill="currentColor"
    width={size}
    height={size}
    {...props}
    >
    <g transform="scale(0.8)">
        <path d="M384 128h64v416c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V128c0-35.3-28.7-64-64-64H192c-35.3 0-64 28.7-64 64v384c-17.7 0-32 14.3-32 32s14.3 32 32 32h224c17.7 0 32-14.3 32-32zM256 320c0-17.7 14.3-32 32-32s32 14.3 32 32-14.3 32-32 32-32-14.3-32-32" />
    </g>
  </svg>
);
export default DoorOpenIcon;
