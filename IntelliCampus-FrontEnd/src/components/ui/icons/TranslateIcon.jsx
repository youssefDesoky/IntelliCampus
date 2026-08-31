const TranslateIcon = ({ size, ...props }) => (
  <svg 
    viewBox="0 0 36 36" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor" 
    width={size} 
    height={size} 
    {...props}
  >
    <path
      d="M30 3H14v5h2V5h14c.6 0 1 .4 1 1v11c0 .6-.4 1-1 1H17v7h-5.3L8 27.9V25H5c-.6 0-1-.4-1-1V13c0-.6.4-1 1-1h13v-2H5c-1.7 0-3 1.3-3 3v11c0 1.7 1.3 3 3 3h1v5.1l6.3-5.1H19v-7h11c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3"
      className="clr-i-outline clr-i-outline-path-1"
    />
    <path
      d="M6.2 22.9h2.4l.6-1.6h3.1l.6 1.6h2.4L11.9 14H9.5zm4.5-6.4 1 3.1h-2z"
      className="clr-i-outline clr-i-outline-path-2"
    />
    <path
      d="M21 6h7v2h-5v2h4v2h-4v2h5v2h-7Z"
      className="clr-i-outline clr-i-outline-path-3"
    />
    <path fill="none" d="M0 0h36v36H0z" />
  </svg>
);
export default TranslateIcon;