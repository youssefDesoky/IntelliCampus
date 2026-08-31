import { createPortal } from "react-dom";

export default function DropdownMenu({children, className = '', direction = 'bottom', position = 'start', portal = false, style = {}, ...props}) {
    const directionMap = {
        top: '-top-2 -translate-y-full mb-2.5',
        bottom: 'top-full mt-2.5',
        left: 'top-0 -start-2 -translate-x-full',
        right: 'top-0 start-full ms-2'
    };

    const positionMap = {
        start: 'start-0',
        middle: 'start-1/2 -translate-x-1/2',
        end: 'end-0'
    };

    const arrowPositionMap = {
        start: 'after:start-2',
        middle: 'after:start-1/2 after:-translate-x-1/2',
        end: 'after:end-2'
    };

    const arrowDirectionMap = {
        top: 'after:top-full after:border-t-border-primary-hover-light dark:after:border-t-border-primary-hover-dark after:border-s-transparent after:border-e-transparent after:border-b-transparent',
        bottom: 'after:bottom-full after:border-b-border-primary-hover-light dark:after:border-b-border-primary-hover-dark after:border-s-transparent after:border-e-transparent after:border-t-transparent',
        left: 'after:start-full after:top-2 after:border-s-border-primary-hover-light dark:after:border-s-border-primary-hover-dark after:border-t-transparent after:border-e-transparent after:border-b-transparent',
        right: 'after:end-full after:top-2 after:border-e-border-primary-hover-light dark:after:border-e-border-primary-hover-dark after:border-s-transparent after:border-t-transparent after:border-b-transparent'
    };

    const directionClass = portal ? '' : (directionMap[direction] || directionMap['bottom']);
    const positionClass = portal ? '' : (positionMap[position] || positionMap['start']);
    const arrowDirectionClass = portal ? '' : (arrowDirectionMap[direction] || arrowDirectionMap['bottom']);
    const arrowPositionClass = portal ? '' : ((direction === 'top' || direction === 'bottom') ? (arrowPositionMap[position] || arrowPositionMap['start']) : '');
    const arrowContent = portal ? '' : "after:content-[''] after:border-8 after:absolute";

    const positionType = portal ? 'fixed' : 'absolute';

    const menu = (
        <menu 
            className={`${positionType} ${arrowContent} bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-hover-light dark:border-border-primary-hover-dark rounded-lg shadow-lg p-3 flex flex-col gap-2 min-w-50 z-[9999] ${directionClass} ${positionClass} ${arrowDirectionClass} ${arrowPositionClass} ${className}`}
            style={style}
            {...props}
        >
            {children}
        </menu>
    );

    if (portal) {
        return createPortal(menu, document.body);
    }

    return menu;
}