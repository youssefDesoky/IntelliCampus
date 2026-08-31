import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AngleDownIcon } from "../ui/icons"

export default function SelectBox({
    options,
    selectedOption,
    label,
    name,
    className,
    labelDirection = "flex-row",
    yPadding = 'py-2',
    onChange,
    compact = false,
    showLabel = true,
    disabled = false
}) {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';
    const [isOpen, setIsOpen] = useState(false);
    const [minWidth, setMinWidth] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const measureRef = useRef(null);
    const rowRef = useRef(null);
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);

    const toggleOpen = () => {
        if (disabled) return;
        if (!isOpen) updatePosition();
        setIsOpen(!isOpen);
    };

    const selected = selectedOption 
        ? options.find(opt => opt.value === selectedOption.value) || selectedOption
        : null;

    useEffect(() => {
        if (measureRef.current) {
            setMinWidth(measureRef.current.offsetWidth);
        }
    }, [options, label, labelDirection, yPadding, selected]);

    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom,
                left: rect.left,
                width: rect.width,
            });
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current && !containerRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (option) => {
        setIsOpen(false);
        if (onChange) {
            onChange(option);
        }
    };

    // Compact styling adjustments
    const compactClasses = compact ? "text-xs py-1.5 px-2" : "";
    const compactIconSize = compact ? "w-4 h-4" : "w-5 h-5";
    const isFull = className?.includes('w-full');

    // When w-full, skip minWidth so button stretches to fill parent
    const buttonStyle = isFull
        ? {}
        : (!compact && minWidth > 0 ? { minWidth: `${Math.min(minWidth, 320)}px` } : {});

    return (
        <div ref={containerRef} dir={isRTL ? 'rtl' : 'ltr'} className={`relative block text-start max-w-full ${className} ${compact ? 'text-xs' : 'text-xs md:text-sm'}`} data-cursor="clickable">
            {/* Hidden input so FormData captures the selected value */}
            {name && <input type="hidden" name={name} value={selected?.value ?? ""} />}
            {/* Hidden element to measure longest option */}
            {!compact && options && options.length > 0 && (
                <div ref={measureRef} className="absolute invisible whitespace-nowrap px-3 py-2">
                    {options.reduce((longest, opt) => {
                        const label = opt?.label || '';
                        return (label && label.length > longest.length) ? label : longest;
                    }, "")}
                    <AngleDownIcon className="w-5 h-5 ms-2 inline" />
                </div>
            )}

            <div
                ref={rowRef}
                className={`flex ${labelDirection} ${labelDirection === "flex-row" ? "items-center" : "items-start"} justify-between gap-2`}
            >
                {showLabel && label && (
                    <label
                        className={`block font-semibold text-text-primary-active-light dark:text-text-primary-active-dark ${compact ? 'text-xs' : 'text-sm'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={toggleOpen}
                    >
                        {label}
                    </label>
                )}
                <button
                    type="button"
                    disabled={disabled}
                    className={`${isFull ? 'w-full' : 'flex-1'} min-w-0 max-w-full inline-flex items-center justify-between rounded-md border border-border-primary-default-light dark:border-border-primary-default-dark shadow-sm px-3 ${yPadding} ${compactClasses} bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark font-medium text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark focus:outline-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={buttonStyle}
                    onClick={toggleOpen}
                >
                    <span className="truncate">{selected?.label || t('select')}</span>
                    <AngleDownIcon className={`${compactIconSize} ms-2 -me-1 text-icon-secondary-default-light dark:text-icon-secondary-default-dark ${isOpen ? 'transform rotate-180' : ''} transition-transform duration-200`} />
                </button>
            </div>

            {isOpen && createPortal(
                <div 
                    ref={dropdownRef}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className="rounded-md shadow-lg bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark ring-1 ring-black ring-opacity-5 z-[9999] max-h-60 overflow-y-auto overflow-x-hidden no-scrollbar"
                    style={{
                        position: 'fixed',
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        ...(isFull ? { width: `${coords.width}px` } : { minWidth: `${Math.min(minWidth || coords.width, 320)}px` }),
                    }}
                >
                    <div className="py-1">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`block px-3 py-2 ${compact ? 'text-xs' : 'text-sm'} text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark truncate ${
                                    selected?.value === option.value 
                                        ? 'bg-bg-surface-secondary-hover-light dark:bg-bg-surface-secondary-hover-dark font-medium text-text-accent-default-light dark:text-text-accent-default-dark' 
                                        : ''
                                }`}
                                data-cursor="clickable"
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}