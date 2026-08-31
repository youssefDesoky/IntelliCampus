import { useState } from "react";
import { MoonIcon, SunIcon } from "./icons";

export default function ToggleTheme({ onChange, ...props }) {
    const [currTheme, setCurrTheme] = useState(localStorage.getItem('theme') || 'light');
    const buttonStyle = "p-2 rounded-md relative text-text-secondary-active-light hover:text-text-primary-active-light hover:bg-bg-fill-primary-hover-light dark:text-text-secondary-active-dark dark:hover:text-text-primary-active-dark dark:hover:bg-bg-fill-primary-hover-dark";

    return (
        <div { ...props } >
            <button
                id="dark-mode-btn"
                className={`${currTheme === 'dark' ? 'hidden' : ''} ${buttonStyle}`}
                onClick={() => { 
                    document.documentElement.setAttribute("data-theme", "dark");
                    localStorage.setItem("theme", "dark");
                    setCurrTheme('dark');
                    onChange?.('dark');
                }}
            >
                <MoonIcon className='w-5 h-5 md:w-6 md:h-6' />
            </button>

            <button
                id="light-mode-btn"
                className={`${currTheme === 'light' ? 'hidden' : ''} ${buttonStyle}`}
                onClick={() => { 
                    document.documentElement.setAttribute("data-theme", "light");
                    localStorage.setItem("theme", "light");
                    setCurrTheme('light');
                    onChange?.('light');
                }}
            >
                <SunIcon className='w-5 h-5 md:w-6 md:h-6' />
            </button>
        </div>
    );
}