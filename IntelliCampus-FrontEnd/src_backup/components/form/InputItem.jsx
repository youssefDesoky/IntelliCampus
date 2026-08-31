import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "../ui/icons";

export default function InputItem({ 
    label,
    type = "text", 
    name,
    errorMessage = "",
    placeholder = "", 
    className = "", 
    children, 
    value, 
    isDisabled = false, 
    onChange,
    ...props 
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const inputType = type === "password" && showPassword ? "text" : type;

    const handleChange = (e) => {
        setHasValue(e.target.value.length > 0);
        onChange?.(e);
    };

    return (
        <div className={`input-item ${className}`}>
            <label htmlFor={name} className="block mb-2 font-bold text-sm text-text-primary-default-light dark:text-text-primary-default-dark">
                {label}
            </label>

            <div className={`flex items-center border ${isInputFocused ? "border-border-primary-active-light dark:border-border-primary-active-dark" : "border-border-primary-default-light dark:border-border-primary-default-dark"} rounded-md px-3`}>
                {children}

                <input
                    id={name}
                    name={name}
                    value={value}
                    type={inputType}
                    autoComplete="off"
                    disabled={isDisabled}
                    placeholder={placeholder}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onChange={handleChange}
                    className="w-full px-3 py-2 outline-none text-text-primary-active-light dark:text-text-primary-active-dark placeholder:text-text-tertiary-default-light dark:placeholder:text-text-tertiary-default-dark"
                    {...props}
                />

                {type === "password" && hasValue && 
                (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? 
                            <EyeIcon 
                                className="w-5 h-5 text-icon-secondary-default-light dark:text-icon-secondary-default-dark" 
                            /> :
                            <EyeSlashIcon 
                                className="w-5 h-5 text-icon-secondary-default-light dark:text-icon-secondary-default-dark" 
                            />
                        }
                    </button>
                )}
            </div>
            {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
        </div>
    );
}
