export const NewspaperSlashIcon = ({size, ...props}) => (
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
            d="M64 480V184c0-13.3 10.7-24 24-24s24 10.7 24 24v288c0 13.3 10.7 24 24 24s24-10.7 24-24V160c0-35.3 28.7-64 64-64h288c35.3 0 64 28.7 64 64v320c0 35.3-28.7 64-64 64H128c-35.3 0-64-28.7-64-64m160-288v64c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32v-64c0-17.7-14.3-32-32-32h-64c-17.7 0-32 14.3-32 32m24 240c-13.3 0-24 10.7-24 24s10.7 24 24 24h240c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-24-72c0 13.3 10.7 24 24 24h240c13.3 0 24-10.7 24-24s-10.7-24-24-24H248c-13.3 0-24 10.7-24 24m200-120c-13.3 0-24 10.7-24 24s10.7 24 24 24h64c13.3 0 24-10.7 24-24s-10.7-24-24-24z"
        />
        <path
            stroke="currentColor"
            strokeWidth={48}
            strokeLinecap="round"
            d="m48 48 544 544"
        />
  </svg>
);
export default NewspaperSlashIcon