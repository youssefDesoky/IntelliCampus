import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import StudyGroupPost from "../../../components/ui/StudyGroupPost";
import { ArrowRightIcon } from "../../../components/ui/icons";
import { fetchCommunities } from "../services/profileApi";

export default function DashboardStudyGroup({className}){
    const { t } = useTranslation('student');
    const [communities, setCommunities] = useState([]);

    useEffect(() => {
        let ignore = false;

        async function loadCommunities() {
            try {
                const data = await fetchCommunities();
                if (!ignore) setCommunities(Array.isArray(data) ? data : []);
            } catch {
                if (!ignore) setCommunities([]);
            }
        }

        loadCommunities();
        return () => {
            ignore = true;
        };
    }, []);

    return (
        <div className={`p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg ${className}`}>
            <div id="today-reminders-header" className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{t("dashboard.studyGroupUpdates")}</h2>

                <NavLink to="/community" className="text-text-accent-default-light dark:text-text-accent-default-dark hover:underline flex items-center gap-2 justify-center font-medium">
                    {t("studyGroup.myGroups")}
                    <ArrowRightIcon className="w-4 h-4 rtl:scale-x-[-1]" />
                </NavLink>
            </div>

            <menu className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" aria-labelledby="smart-notes-header">
                {communities.length === 0 ? (
                    <div className="mb-4 md:col-span-2 h-full border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
                        <div className="flex flex-col items-center justify-center h-full p-6 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            <ArrowRightIcon className="w-12 h-12 mb-4 rtl:scale-x-[-1]" />
                            <p className="text-center">{t("dashboard.noStudyGroupUpdates")}</p>
                        </div>
                    </div>
                ) : (
                    communities.slice(0,4).map((sg, index) => (
                        <StudyGroupPost 
                            key={index}
                            postData={sg.posts[0]} 
                            courseTitle={sg.department} 
                        />)
                    )
                )}
            </menu>
        </div>
    );   
}
