import { useTranslation } from "react-i18next";
import PageHeader from "../../../../components/ui/PageHeader";
import Section from "../../../../components/ui/Section";
import BoxData from "../../../../components/ui/BoxData";
import SelectBox from "../../../../components/ui/SelectBox";
import Table from "../../../../components/ui/Table";
import DateInput from "../../../../components/form/DateInput";

const students = [
    { id: "2021-CS-001", name: "Alice Johnson", email: "alice.johnson@example.com", status: "Present", present: 23, absent: 2, image: "/images/alice.jpg" },
    { id: "2021-CS-002", name: "Bob Smith", email: "bob.smith@example.com", status: "Absent", present: 20, absent: 5, image: "/images/bob.jpg" },
    { id: "2021-CS-003", name: "Charlie Brown", email: "charlie.brown@example.com", status: "Present", present: 22, absent: 3, image: "/images/charlie.jpg" },
    { id: "2021-CS-004", name: "Diana Prince", email: "diana.prince@example.com", status: "Present", present: 25, absent: 0, image: "/images/diana.jpg" },
    { id: "2021-CS-005", name: "Ethan Hunt", email: "ethan.hunt@example.com", status: "Absent", present: 18, absent: 7, image: "/images/ethan.jpg" },
];
const totalAttendanceDays = 25;


function getBoxesData(t) {
    return [
    { 
        title: t('attendance.totalStudentsStat'),
        value: 124, 
        icon: 
            (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6 fill-text-accent-default-light dark:fill-text-accent-default-dark">
                    <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z"/>
                </svg>
            ), 
        className: "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark" 
    },
    {
        title: t('attendance.presentToday'),
        value: 98,
        icon:
            (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6 fill-text-success-default-light dark:fill-text-success-default-dark">
                    <path d="M286 368C384.5 368 464.3 447.8 464.3 546.3C464.3 562.7 451 576 434.6 576L78 576C61.6 576 48.3 562.7 48.3 546.3C48.3 447.8 128.1 368 226.6 368L286 368zM585.7 169.9C593.5 159.2 608.5 156.8 619.2 164.6C629.9 172.4 632.3 187.4 624.5 198.1L522.1 338.9C517.9 344.6 511.4 348.3 504.4 348.7C497.4 349.1 490.4 346.5 485.5 341.4L439.1 293.4C429.9 283.9 430.1 268.7 439.7 259.5C449.2 250.3 464.4 250.6 473.6 260.1L500.1 287.5L585.7 169.8zM256.3 312C190 312 136.3 258.3 136.3 192C136.3 125.7 190 72 256.3 72C322.6 72 376.3 125.7 376.3 192C376.3 258.3 322.6 312 256.3 312z"/>
                </svg>
            ),
        className: "bg-bg-surface-green-default-light dark:bg-bg-surface-green-default-dark"
    },
    {
        title: t('attendance.absentToday'),
        value: 26,
        icon:
            (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6 fill-text-danger-default-light dark:fill-text-danger-default-dark">
                    <path d="M136.4 192C136.4 125.7 190.1 72 256.4 72C322.7 72 376.4 125.7 376.4 192C376.4 258.3 322.7 312 256.4 312C190.1 312 136.4 258.3 136.4 192zM48.4 546.3C48.4 447.8 128.2 368 226.7 368L286.1 368C384.6 368 464.4 447.8 464.4 546.3C464.4 562.7 451.1 576 434.7 576L78.1 576C61.7 576 48.4 562.7 48.4 546.3zM612.3 188.1C621.7 197.5 621.7 212.7 612.3 222L578.4 255.9L612.3 289.8C621.7 299.2 621.7 314.4 612.3 323.7C602.9 333 587.7 333.1 578.4 323.7L544.5 289.8L510.6 323.7C501.2 333.1 486 333.1 476.7 323.7C467.4 314.3 467.3 299.1 476.7 289.8L510.6 255.9L476.7 222C467.3 212.6 467.3 197.4 476.7 188.1C486.1 178.8 501.3 178.7 510.6 188.1L544.5 222L578.4 188.1C587.8 178.7 603 178.7 612.3 188.1z"/>
                </svg>
            ),
        className: "bg-bg-surface-red-default-light dark:bg-bg-surface-red-default-dark"
    },
    {
        title: t('attendance.below75'),
        value: 18,
        icon:
            (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 fill-text-warning-default-light dark:fill-text-warning-default-dark">
                    <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
                </svg>
            ),
        className: "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark"
    }
]; }

export default function Attendance() {
    const { t } = useTranslation('instructor');
    const boxesData = getBoxesData(t);
    return (
        <Section className="w-screen bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
            <PageHeader title={t('attendance.managementTitle')} subtitle={t('attendance.managementSubtitle')}/>

            <Section className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-6 rounded-lg shadow-sm mb-6 flex items-end gap-4">
                <div className="flex-1">
                    <label htmlFor="course" className="block text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark mb-2">{t('attendance.selectCourse')}</label>
                    <SelectBox
                        id="course"
                        options={[
                            { value: 'cse101', label: 'CSE 101 - Introduction to Programming' },
                            { value: 'cse102', label: 'CSE 102 - Data Structures' },
                            { value: 'cse103', label: 'CSE 103 - Algorithms' },
                        ]} 
                        selectedOption="cse101"
                    />
                </div>
                <div className="flex-1">
                    <DateInput label={t('attendance.selectDate')} name="date" defaultValue="2024-01-15" />
                </div>
                <button className="bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark hover:bg-bg-surface-accent-hover-light dark:hover:bg-bg-surface-accent-hover-dark text-text-accent-active-light dark:text-text-accent-active-dark px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-4 h-4 fill-icon-accent-active-light dark:fill-icon-accent-active-dark">
                        <path d="M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z"/>
                    </svg>
                    {t('attendance.filter')}
                </button>
            </Section>

            <Section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {boxesData.map((box, index) => (
                    <BoxData title={box.title} key={index} value={box.value} icon={box.icon} className={box.className} />
                ))}
            </Section>

            <Table headers={[t('attendance.tableHeaderStudent'), t('attendance.tableHeaderId'), t('attendance.tableHeaderEmail'), t('attendance.tableHeaderStatus'), t('attendance.tableHeaderDaysPresent'), t('attendance.tableHeaderDaysAbsent')]} data={students.map(student => ({
                student: (
                    <div className="flex items-center justify-center gap-3">
                        <img
                            src={student.image}
                            alt={t('attendance.studentAvatar')}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex flex-col text-start">
                            <p>{student.name}</p>
                        </div>
                    </div>
                ),
                studentId: student.id,
                email: student.email,
                status: (
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${student.status === "Present" ? "bg-bg-surface-success-default-light dark:bg-bg-surface-success-default-dark text-text-success-active-light dark:text-text-success-active-dark" : "bg-bg-surface-danger-default-light dark:bg-bg-surface-danger-default-dark text-text-danger-active-light dark:text-text-danger-active-dark"}`}>
                        {student.status}
                    </span>
                ),
                daysPresent: `${student.present} / ${totalAttendanceDays}`,
                daysAbsent: `${student.absent} / ${totalAttendanceDays}`,
            }))} /> 
        </Section>
    );
}