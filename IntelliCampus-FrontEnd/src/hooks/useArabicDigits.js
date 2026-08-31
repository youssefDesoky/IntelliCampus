import { useTranslation } from "react-i18next";

export default function useArabicDigits() {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const convert = (value) => {
        if (!isRTL) return String(value);
        return String(value).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
    };
    const localizeTime = (timeStr) => {
        if (!isRTL || !timeStr) return timeStr;
        const ar = convert;
        return timeStr
            .replace(/(\d+):(\d+)\s*(AM|PM)/gi, (_, h, m, p) => {
                const marker = p.toUpperCase() === 'AM' ? 'ص' : 'م';
                return `${ar(h)}:${ar(m)} ${marker}`;
            })
            .replace(/(\d+):(\d+)/g, (_, h, m) => `${ar(h)}:${ar(m)}`);
    };
    return { convert, isRTL, localizeTime };
}
