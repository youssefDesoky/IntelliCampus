const FileSlashIcon = ({size, ...props}) => (
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
                    strokeWidth={96}
                    strokeLinecap="round"
                    d="m96 48 448 544"
                />
            </mask>
        </defs>
        <path
            mask="url(#a)"
            d="M192 64c-35.3 0-64 28.7-64 64v384c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V234.5c0-17-6.7-33.3-18.7-45.3L386.7 82.7c-12-12-28.2-18.7-45.2-18.7zm261.5 176H360c-13.3 0-24-10.7-24-24v-93.5z"
        />
        <path
            stroke="currentColor"
            strokeWidth={48}
            strokeLinecap="round"
            d="m96 48 448 544"
        />
    </svg>
);
export default FileSlashIcon;