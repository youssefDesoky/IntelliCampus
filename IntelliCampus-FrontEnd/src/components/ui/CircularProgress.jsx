import useArabicDigits from "../../hooks/useArabicDigits";

export default function CircularProgress({ 
    size = 192, 
    progress = 0, 
    strokeWidth = 10, 
    circleColor = "text-bg-fill-secondary-default-light dark:text-bg-fill-secondary-default-dark",
    progressColor = "text-text-accent-default-light dark:text-text-accent-default-dark",
    textColor = "text-text-primary-default-light dark:text-text-primary-default-dark",
    children
}) 
{    
    const { convert: ar } = useArabicDigits();
    const center = 50;
    const radius = 50 - (strokeWidth / 2);
    const circumference = 2 * Math.PI * radius;
    
    const normalizedProgress = Math.min(100, Math.max(0, progress));
    const offset = circumference - (normalizedProgress / 100) * circumference;

    return (
        <div 
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            <svg 
                className="w-full h-full -rotate-90 transform transition-all duration-300"
                viewBox="0 0 100 100"
            >
                {/* Background Track Circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className={circleColor}
                />

                {/* Progress Circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${progressColor} transition-all duration-500 ease-out`}
                />
            </svg>

            <div className={`absolute inset-0 flex items-center justify-center ${textColor}`}>
                {children ? (
                    children
                ) : (
                    <span 
                        className="font-bold" 
                        style={{ fontSize: size * 0.25 }}
                    >
                        {ar(Math.round(normalizedProgress))}%
                    </span>
                )}
            </div>
        </div>
    );
};