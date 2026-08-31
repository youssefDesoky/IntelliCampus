import { useState } from "react";

export default function NumberInput({
    label,
    name,
    value,
    onChange,
    placeholder = "",
    errorMessage = "",
    className = "",
    isDisabled = false,
    min,
    max,
    step,
    required = false,
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`${className}`}>
            {label && (
                <label htmlFor={name} className="block mb-2 font-bold text-sm text-text-primary-default-light dark:text-text-primary-default-dark">
                    {label}
                </label>
            )}
            <div className={`flex items-center border ${isFocused ? "border-border-primary-active-light dark:border-border-primary-active-dark" : "border-border-primary-default-light dark:border-border-primary-default-dark"} rounded-md`}>
                <input
                    id={name}
                    name={name}
                    type="number"
                    value={value}
                    onChange={onChange}
                    disabled={isDisabled}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    required={required}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full px-3 py-2 outline-none text-text-primary-active-light dark:text-text-primary-active-dark bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    dir="auto"
                    {...props}
                />
            </div>
            {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
        </div>
    );
}
