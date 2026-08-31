export default function SpanRounded({children, bgColorLight="bg-bg-fill-primary-active-light", bgColorDark="bg-bg-fill-primary-active-dark", textColor="text-white"}) {
    return (
        <span className={`px-2 py-1 font-semibold text-xs ${bgColorLight} dark:${bgColorDark} ${textColor} rounded-lg`}>
            {children}
        </span>
    );
}
