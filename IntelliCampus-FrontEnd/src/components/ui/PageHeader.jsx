import Section from "./Section";

export default function PageHeader({title, subtitle, headerDir="row", className = "", children}) {
    return (
        <Section className={`flex ${headerDir === "col" ? "flex-col" : "flex-row items-center"} justify-between gap-4 ${className}`}>
            <div className="space-y-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark truncate">{title}</h1>
                <div className="text-text-secondary-active-light dark:text-text-secondary-active-dark font-normal text-xs md:text-sm truncate">{subtitle}</div>
            </div>

            {children}
        </Section>
    );
}