import React from "react";

export default function RadioToggle({ name, options = [], value, onChange, className = "" }) {
    return (
        <div className={`inline-flex bg-transparent rounded-md gap-4 ${className}`} role="radiogroup">
            {options.map((opt) => {
                const selected = String(opt.value) === String(value);
                return (
                    <label
                        key={opt.value}
                        htmlFor={`${name}-${opt.value}`}
                        className={`option flex-1 flex items-center gap-3 select-none rounded-md transition-all border ${selected ? 'border-border-primary-default-light bg-bg-surface-secondary-default-light text-text-primary-default-light dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-default-dark' : 'border-border-primary-default-light bg-transparent text-text-secondary-default-light dark:text-text-secondary-default-dark'}`}
                        style={{ padding: '0.5rem 0.75rem' }}
                    >
                        <input
                            id={`${name}-${opt.value}`}
                            name={name}
                            type="radio"
                            value={opt.value}
                            checked={selected}
                            onChange={(e) => onChange?.(e.target.value)}
                            className="hidden"
                        />

                        <div className={`dot h-4 w-4 rounded-full flex items-center justify-center border ${selected ? 'bg-bg-surface-primary-default-light border-border-primary-default-light dark:bg-bg-surface-primary-default-dark dark:border-border-primary-default-dark' : 'bg-bg-surface-secondary-default-light border-border-primary-default-light dark:bg-bg-surface-secondary-default-dark dark:border-border-primary-default-dark'}`}>
                            {selected ? <div className="inner h-2 w-2 rounded-full bg-text-primary-default-light dark:bg-text-primary-default-dark" /> : null}
                        </div>

                        <span className="text-sm">{opt.label}</span>
                    </label>
                );
            })}
        </div>
    );
}
