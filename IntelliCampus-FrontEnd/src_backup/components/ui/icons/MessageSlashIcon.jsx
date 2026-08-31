const MessageSlashIcon = ({ size, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 640 640" 
    fill="currentColor"
    height={size}
    width={size}
    {...props}
  >
    <defs>
      <mask id="a">
        <rect width="100%" height="100%" fill="#fff" />
        <path
          stroke="#000"
          strokeWidth={72}
          strokeLinecap="round"
          d="m48 48 544 544"
        />
      </mask>
    </defs>
    <path
      mask="url(#a)"
      d="M112 128c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156a48 48 0 0 0 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48zM64 260v188c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V260L377.6 408.8c-34.1 25.6-81.1 25.6-115.2 0z"
    />
    <path
      stroke="currentColor"
      strokeWidth={48}
      strokeLinecap="round"
      d="m48 48 544 544"
    />
  </svg>
);
export default MessageSlashIcon;
