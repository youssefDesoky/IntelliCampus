const UndoIcon = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    xmlSpace="preserve"
    fill="none"
    width={size}
    height={size}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={2}
      strokeMiterlimit={10}
      d="M5.4 14H21c3.3 0 6 2.7 6 6v7"
    />
    <path
      stroke="currentColor"
      strokeWidth={2}
      strokeMiterlimit={10}
      d="m13.5 6-8 8 8 8"
    />
  </svg>
);
export default UndoIcon;
