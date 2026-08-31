import {useState} from "react";
import Section from "../ui/Section";


export default function RecentActivity() {
    const activities = [
        { 
            id: 1,
            description: "Submitted Assignment 3 for Math 101",
            time: "2 hours ago",
            icon: 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-4 h-4 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    <path d="M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z" />
                </svg>
        },
        { 
            id: 2,
            description: "Attended Physics 201 lecture", 
            time: "5 hours ago",
            icon:
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-4 h-4 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    <path d="M96 64C78.3 64 64 78.3 64 96V416C64 433.7 78.3 448 96 448H544C561.7 448 576 433.7 576 416V96C576 78.3 561.7 64 544 64H96zM512 384H128V128H512V384zM320 160C297.9 160 280 177.9 280 200C280 222.1 297.9 240 320 240C342.1 240 360 222.1 360 200C360 177.9 342.1 160 320 160z" />
                </svg>
        },
        { 
            id: 3,
            description: "Received grade for History 150 quiz",
            time: "1 day ago",
            icon:
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-4 h-4 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    <path d="M96 64C78.3 64 64 78.3 64 96V416C64 433.7 78.3 448 96 448H544C561.7 448 576 433.7 576 416V96C576 78.3 561.7 64 544 64H96zM512 384H128V128H512V384zM320 160C297.9 160 280 177.9 280 200C280 222.1 297.9 240 320 240C342.1 240 360 222.1 360 200C360 177.9 342.1 160 320 160z" />
                </svg>
        },
    ];

    const [open, setOpen] = useState(true);

    const arrowIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4">
            <path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/>
        </svg>
    );

    const colorClasses = [
        "bg-bg-surface-success-disabled-light dark:bg-bg-surface-success-disabled-dark text-text-success-default-light dark:text-text-success-default-dark",
        "bg-bg-surface-info-disabled-light dark:bg-bg-surface-info-disabled-dark text-text-info-default-light dark:text-text-info-default-dark",
        "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-accent-light dark:text-text-purple-accent-dark",
        "bg-bg-surface-warning-disabled-light dark:bg-bg-surface-warning-disabled-dark text-text-warning-default-light dark:text-text-warning-default-dark",
    ];

    return (
        <Section className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between" onClick={() => setOpen(!open)}>
                <h2 className="text-lg font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">Recent Activity</h2>
                <button
                    className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-bg-surface-primary-hover-light dark:bg-bg-surface-primary-hover-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-surface-primary-active-light dark:hover:bg-bg-surface-primary-active-dark transition-transform"
                    title={open ? "Hide recent activity" : "Show recent activity"}
                >
                    <span className={`transform transition-transform duration-200 ${open ? "rotate-0" : "rotate-180"}`}>
                        {arrowIcon}
                    </span>
                </button>
            </div>

            {open && (
                activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className="w-12 h-12 mb-4 opacity-40">
                            <path d="M73 39.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6-.1 34l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-87.5-87.5c17.2-2.4 30.5-17.3 30.5-35.2 0-8.1-2.7-15.9-7.8-22.2l-9.8-12.2c-29.9-37.6-46.3-84.3-46.3-132.4V256c0-77.4-55-142-128-156.8V96c0-17.7-14.3-32-32-32s-32 14.3-32 32v3.2c-38.6 7.8-72.2 29.6-95.2 59.7z" />
                        </svg>
                        <p className="text-sm">No recent activity to display.</p>
                    </div>
                ) : (
                    <ul className="space-y-3 mt-4">
                        {activities.map((activity, idx) => (
                            <li key={activity.id} className="flex items-start gap-3 py-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses[idx % colorClasses.length]}`}>
                                    {activity.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
                                        {activity.description}
                                    </div>
                                    <div className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-1">
                                        {activity.time}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )
            )}
        </Section>
    );
}