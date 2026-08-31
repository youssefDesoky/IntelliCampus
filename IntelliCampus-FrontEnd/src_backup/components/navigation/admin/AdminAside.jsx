import { useMemo } from "react";
import { useRouteLoaderData } from "react-router-dom";
import Aside from "../base/Aside";
import { useTranslation } from "react-i18next";
import { getNavigationLinks } from "../../../data/admin/navigationLinks";

export default function AdminAside({ height }) {
    const { t } = useTranslation('admin/aside');
    const user = useRouteLoaderData("root");
    const userRoles = useMemo(() => (user?.roles || []).map(r => r.toLowerCase()), [user]);

    const links = useMemo(() =>
        getNavigationLinks(t).filter(link =>
            link.roles.some(r => userRoles.includes(r))
        ),
        [t, userRoles]
    );

    return (
        <Aside links={links} height={height} />
    );
}
