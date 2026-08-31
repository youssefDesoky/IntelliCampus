import { useState } from "react";
import SearchIcon from "./icons/SearchIcon";

export default function SearchBar({placeholder, className="", value, onChange}) {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
        <div className={`flex items-center border rounded-md px-3 py-2 w-full max-w-md transition-colors ${
            isFocused 
                ? 'border-border-primary-focus-light dark:border-border-primary-focus-dark' 
                : 'border-border-primary-default-light dark:border-border-primary-default-dark'
        } ${className}`}>
            <SearchIcon className="w-5 h-5 text-icon-secondary-default-light dark:text-icon-secondary-default-dark me-2" />
    
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full outline-none placeholder:text-text-primary-default-light dark:placeholder:text-text-primary-default-dark bg-transparent"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </div>
    );
}