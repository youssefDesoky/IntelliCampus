export default function ProgressBox({progress, backgroundColor="bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark", children, height="h-2.5"}) {
    return (
        <div className="w-full">
            <div className="flex justify-between mb-1 text-sm lg:text-md font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                {children}
            </div>
            <div className={`w-full bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark rounded-full ${height}`}>
                <div className={`rounded-full ${height} ${backgroundColor}`} style={{width: `${progress}%`}}></div>
            </div>
        </div>
    );
}