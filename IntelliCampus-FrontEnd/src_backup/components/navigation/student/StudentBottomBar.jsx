import { useTranslation } from 'react-i18next';
import { getNavigationLinks } from '../../../data/student/navigationLinks';

import BottomBar from '../base/BottomBar';
import { BookIcon, ClipboardCheckIcon, FilePenIcon, ChartBarIcon, FileLinesIcon } from '../../ui/icons';


export default function StudentBottomBar({ visible, floatingAction }) {
    const { t } = useTranslation('student/aside');
    const allLinks = getNavigationLinks(t);

    const links = [
        ...allLinks,
        { to: '/courses', icon: BookIcon, label: t('allCourses') },
        { to: '/courses/registration', icon: FilePenIcon, label: t('courseRegistration') },
        { to: '/courses/prerequisites', icon: ClipboardCheckIcon, label: t('coursePrerequisites') },
        { to: '/courses/academic-progress', icon: ChartBarIcon, label: t('academicProgress') },
        { to: '/courses/transcript', icon: FileLinesIcon, label: t('transcript') },
    ];

    return (
        <BottomBar links={links} visible={visible} floatingAction={floatingAction} />
    );
}