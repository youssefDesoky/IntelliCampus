export default function Section({ children, className = "", ...props }) {
    return (
        <section className={`${className} mb-4`} {...props}>
            {children}
        </section>
    );
}