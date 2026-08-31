import { useState } from "react";
import CoursePrerequisitesHeader from "../../../feature/student/courses/coursePrerequisites/CoursePrerequisitesHeader";
import CoursePrerequisitesBody from "../../../feature/student/courses/coursePrerequisites/CoursePrerequisitesBody";
import useDeviceType from "../../../hooks/useDeviceType";

export default function CoursePrerequisites() {
    const { isMobile } = useDeviceType();
    const [search, setSearch] = useState("");

    return (
        <>
            <CoursePrerequisitesHeader isMobile={isMobile} search={search} onSearchChange={setSearch} />
            <CoursePrerequisitesBody search={search} />
        </>
    );
}
