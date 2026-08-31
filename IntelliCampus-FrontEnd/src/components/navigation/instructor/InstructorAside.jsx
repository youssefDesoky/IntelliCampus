import Aside from "../base/Aside";
import { useTranslation } from "react-i18next";
import { getNavigationLinks } from "../../../data/instructor/navigationLinks";


export default function InstructorAside({ height }) {
    const { t } = useTranslation('instructor');
    
    return (
        <Aside height={height} links={getNavigationLinks(t)} >

        </Aside>
    );
}