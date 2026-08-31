import { useTranslation } from "react-i18next";
import { getNavigationLinks } from "../../../data/instructor/navigationLinks";

import BottomBar from "../base/BottomBar";

export default function InstructorBottomBar({ visible, floatingAction }) {
    const { t } = useTranslation('instructor/aside');
    
    return (
        <BottomBar links={getNavigationLinks(t)} visible={visible} floatingAction={floatingAction} />
    );
}