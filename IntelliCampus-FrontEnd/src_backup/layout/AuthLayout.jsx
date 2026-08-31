import { useState } from "react";
import { useTranslation } from 'react-i18next';
import ToggleTheme from "../components/ui/ToggleTheme";

export default function AuthLayout({ title, subtitle, bgImageName = "LoginBG", children }) {
    const { t } = useTranslation('auth');
    const [currTheme, setCurrTheme] = useState(localStorage.getItem('theme') || 'light');

    const bgStyle = {
        backgroundImage: `url('/images/${bgImageName}-${currTheme}.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-r/shorter from-bg-surface-primary-default-light dark:from-bg-surface-primary-default-dark to-blue-50 dark:to-blue-950 px-4">

            {/* Mobile background */}
            <div className="absolute inset-0 lg:hidden" style={bgStyle} />

            <div className="relative grid grid-cols-100
                            bg-transparent lg:bg-bg-surface-primary-default-light dark:lg:bg-bg-surface-primary-default-dark
                            rounded-2xl lg:shadow-2xl
                            w-full lg:w-3/4 lg:h-[80vh]">

                {/* Left panel */}
                <div
                    className="hidden lg:flex p-5 flex-col items-start justify-start space-y-5 rounded-s-2xl col-span-45"
                    style={bgStyle}
                >
                    <div className="flex flex-row items-center gap-x-2">
                        <img
                            src="/images/IntelliCampusLogo.png"
                            alt={t('errorPage.logoAlt')}
                            className="h-24 w-24 object-contain"
                        />
                        <div className="text-start flex flex-col space-y-1">
                            <h2 className="text-4xl font-['Playfair_Display'] text-text-primary-active-light dark:text-text-primary-active-dark">
                                IntelliCampus
                            </h2>
                            <p className="font-['Source_Sans_3'] text-text-secondary-active-light dark:text-text-secondary-active-dark">
                                {t('tagline')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right panel */}
                {/* CHANGED: Reduced p-6 to p-0 on mobile, kicking in p-4 on sm, and p-8 on lg */}
                <div className="flex flex-col justify-center
                                bg-transparent lg:bg-bg-surface-primary-default-light dark:lg:bg-bg-surface-primary-default-dark
                                col-span-100 p-0 sm:p-4 rounded-2xl lg:rounded-bl-none lg:col-span-55 lg:p-8">
                    
                    {/* CHANGED: Toned down mobile padding from p-6 to p-5, kept p-6 for sm, and p-12 for lg */}
                    <div className="relative w-full mx-auto
                                    bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark
                                    border border-border-primary-default-light dark:border-border-primary-default-dark
                                    p-5 sm:p-6 lg:p-12 rounded-2xl shadow-2xl min-h-125 max-w-125
                                    flex flex-col justify-center">
                        
                        {/* CHANGED: Adjusted to top-3 end-3 so it stays snug in the corner with the new padding */}
                        <ToggleTheme className="absolute top-3 end-3 sm:top-4 sm:end-4" onChange={setCurrTheme} />

                        <div className="mb-6 space-y-2 md:space-y-3 pt-2">
                            <h2 className="text-2xl lg:text-3xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark">
                                {title}
                            </h2>
                            <p className="text-text-secondary-active-light dark:text-text-secondary-active-dark text-xs md:text-sm">
                                {subtitle}
                            </p>
                        </div>
                        <div>{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}