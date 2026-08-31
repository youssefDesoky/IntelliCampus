import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../../components/ui/PageHeader";
import Section from "../../../components/ui/Section";
import Button from "../../../components/ui/Button";
import {
    ArrowUpIcon,
    ArrowDownIcon,
    PlusIcon,
    XIcon,
    FloppyDiskIcon,
    CheckIcon,
    OrderedListIcon,
    SearchIcon,
    StarIcon,
} from "../../../components/ui/icons";
import {
    checkEligibility,
    fetchMyPreferences,
    fetchDepartments,
    fetchSpecializations,
    savePreferences,
} from "../../../feature/student/services/specializationApi";
import { useError } from "../../../contexts/ErrorContext";
import { SpecializationPreferenceSkeleton } from "../../../feature/student/specializationPreference/SkeletonLoader";

function GripIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            <circle cx="4" cy="2.5" r="1.2" />
            <circle cx="10" cy="2.5" r="1.2" />
            <circle cx="4" cy="7" r="1.2" />
            <circle cx="10" cy="7" r="1.2" />
            <circle cx="4" cy="11.5" r="1.2" />
            <circle cx="10" cy="11.5" r="1.2" />
        </svg>
    );
}

function EligibilityCard({ eligibility }) {
    const [progressWidth, setProgressWidth] = useState(0);
    const progress = Math.min(100, (eligibility.passedHours / eligibility.minRequired) * 100);
    const eligible = eligibility.eligible;
    const remaining = Math.max(0, eligibility.minRequired - eligibility.passedHours);
    const targetLabel = eligibility.targetType === "Department" ? "departments" : "specializations";

    useEffect(() => {
        const timer = setTimeout(() => setProgressWidth(progress), 100);
        return () => clearTimeout(timer);
    }, [progress]);

    return (
        <div className="flex flex-1 items-center justify-center w-full h-full rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-8">
            <div className="flex flex-col items-center text-center max-w-lg w-full">
                <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${
                    eligible
                        ? "bg-bg-fill-success-muted-light text-text-success-default-light dark:bg-bg-fill-success-muted-dark dark:text-text-success-default-dark"
                        : "bg-bg-fill-warning-muted-light text-text-warning-default-light dark:bg-bg-fill-warning-muted-dark dark:text-text-warning-default-dark"
                }`}>
                    {eligible ? <CheckIcon size={32} /> : <OrderedListIcon size={32} />}
                </div>

                <h2 className="text-2xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                    {eligible ? "You're eligible to submit your preferences" : "Not eligible yet"}
                </h2>
                <p className="text-text-secondary-default-light dark:text-text-secondary-default-dark text-sm mb-8 max-w-sm">
                    {eligible
                        ? `You've met the credit hour requirement — rank your ${targetLabel} below.`
                        : `You'll need ${remaining} more credit hour${remaining === 1 ? "" : "s"} before you can submit.`}
                </p>

                <div className="w-full space-y-3">
                    <div className="relative h-4 w-full overflow-hidden rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                eligible
                                    ? "bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark"
                                    : "bg-bg-fill-warning-default-light dark:bg-bg-fill-warning-default-dark"
                            }`}
                            style={{ width: `${progressWidth}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        <span className="font-medium">{eligibility.passedHours} hrs completed</span>
                        <span className="font-medium">{eligibility.minRequired} hrs required</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SuccessBanner({ show, onDismiss }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onDismiss, 4000);
            return () => clearTimeout(timer);
        }
    }, [show, onDismiss]);

    if (!show) return null;

    return (
        <div className="animate-fade-in-down">
            <div className="flex items-center gap-3 rounded-xl border border-border-success-default-light dark:border-border-success-default-dark bg-bg-fill-success-muted-light dark:bg-bg-fill-success-muted-dark px-5 py-4 shadow-lg">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark text-white">
                    <CheckIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-success-default-light dark:text-text-success-default-dark">
                        Preferences saved successfully!
                    </p>
                    <p className="text-xs text-text-success-default-light/70 dark:text-text-success-default-dark/70">
                        Your ranked preferences have been submitted.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onDismiss}
                    className="shrink-0 rounded-lg p-1.5 text-text-success-default-light/60 dark:text-text-success-default-dark/60 transition-colors hover:bg-bg-fill-success-default-light/20 dark:hover:bg-bg-fill-success-default-dark/20 hover:text-text-success-default-light dark:hover:text-text-success-default-dark"
                >
                    <XIcon size={16} />
                </button>
            </div>
        </div>
    );
}

function SectionHeader({ icon, title, count, accent = false, onClearAll }) {
    return (
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    accent
                        ? "bg-bg-fill-accent-muted-light dark:bg-bg-fill-accent-muted-dark text-text-accent-default-light dark:text-text-accent-default-dark"
                        : "bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark"
                }`}>
                    {icon}
                </div>
                <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {title}
                </h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    accent
                        ? "bg-bg-fill-accent-muted-light dark:bg-bg-fill-accent-muted-dark text-text-accent-default-light dark:text-text-accent-default-dark"
                        : "bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark"
                }`}>
                    {count}
                </span>
            </div>
            {onClearAll && count > 0 && (
                <button
                    type="button"
                    onClick={onClearAll}
                    className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark transition-colors hover:text-icon-accent-default-light dark:hover:text-icon-accent-default-dark"
                >
                    Clear all
                </button>
            )}
        </div>
    );
}

function SearchInput({ value, onChange, placeholder }) {
    const inputRef = useRef(null);

    return (
        <div className="relative mb-4">
            <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-icon-secondary-default-light dark:text-icon-secondary-default-dark">
                <SearchIcon size={15} />
            </span>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark py-2.5 ps-10 pe-10 text-sm text-text-primary-default-light dark:text-text-primary-default-dark placeholder:text-text-secondary-default-light dark:placeholder:text-text-secondary-default-dark transition-shadow focus:outline-none focus:ring-2 focus:ring-border-accent-default-light dark:focus:ring-border-accent-default-dark focus:border-transparent"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute inset-y-0 end-3 flex items-center text-icon-secondary-default-light dark:text-icon-secondary-default-dark transition-colors hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark"
                >
                    <XIcon size={15} />
                </button>
            )}
        </div>
    );
}

export default function SpecializationPreference() {
    const { t } = useTranslation("student/aside");
    const { showError } = useError();
    const queryClient = useQueryClient();

    const [rankedItems, setRankedItems] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    const { data: eligibility, isLoading: eligibilityLoading } = useQuery({
        queryKey: ["specializationEligibility"],
        queryFn: checkEligibility,
        staleTime: 5 * 60 * 1000,
    });

    const targetType = eligibility?.targetType || "Specialization";

    const { data: departmentsData, isLoading: deptsLoading } = useQuery({
        queryKey: ["departments"],
        queryFn: fetchDepartments,
        staleTime: 10 * 60 * 1000,
        enabled: targetType === "Department" && !!eligibility?.eligible,
    });

    const { data: specializationsData, isLoading: specsLoading } = useQuery({
        queryKey: ["specializations"],
        queryFn: fetchSpecializations,
        staleTime: 10 * 60 * 1000,
        enabled: targetType === "Specialization" && !!eligibility?.eligible,
    });

    const { data: existingPreferences, isLoading: prefsLoading } = useQuery({
        queryKey: ["specializationPreferences"],
        queryFn: fetchMyPreferences,
        staleTime: 5 * 60 * 1000,
        enabled: !!eligibility?.eligible,
    });

    const isLoading =
        eligibilityLoading ||
        ((eligibility?.eligible && (targetType === "Department" ? deptsLoading : specsLoading)) || prefsLoading);

    const allItems = useMemo(() => {
        if (targetType === "Department") {
            const depts = departmentsData?.data || departmentsData || [];
            return Array.isArray(depts)
                ? depts.map((d) => ({
                      id: d.departmentId,
                      name: d.departmentName,
                      nameAr: d.departmentNameAr,
                  }))
                : [];
        }
        const specs = Array.isArray(specializationsData) ? specializationsData : [];
        return specs.map((s) => ({
            id: s.specializationId,
            name: s.name,
            nameAr: s.nameAr,
            departmentName: s.departmentName,
        }));
    }, [targetType, departmentsData, specializationsData]);

    const rankedIds = useMemo(() => new Set(rankedItems.map((i) => i.id)), [rankedItems]);

    const availableItems = useMemo(() => allItems.filter((i) => !rankedIds.has(i.id)), [allItems, rankedIds]);

    const filteredAvailableItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return availableItems;
        return availableItems.filter(
            (i) =>
                i.name?.toLowerCase().includes(q) ||
                i.nameAr?.toLowerCase().includes(q) ||
                i.departmentName?.toLowerCase().includes(q)
        );
    }, [availableItems, searchQuery]);

    const canSave = rankedItems.length > 0;

    useMemo(() => {
        if (!existingPreferences || !existingPreferences.items || existingPreferences.items.length === 0) return;
        if (rankedItems.length > 0) return;
        setRankedItems(
            existingPreferences.items
                .sort((a, b) => a.rank - b.rank)
                .map((item) => {
                    const match = allItems.find((ai) => ai.id === item.targetId);
                    return {
                        id: item.targetId,
                        name: item.name || match?.name || "",
                        nameAr: match?.nameAr || "",
                        departmentName: match?.departmentName || "",
                    };
                })
                .filter((item) => item.name)
        );
    }, [existingPreferences, allItems]);

    const saveMutation = useMutation({
        mutationFn: () =>
            savePreferences(
                targetType,
                rankedItems.map((item, idx) => ({
                    targetId: item.id,
                    rank: idx + 1,
                    name: item.name,
                }))
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["specializationPreferences"] });
            setShowSuccess(true);
        },
        onError: (err) => showError(err.message),
    });

    function addItem(item) {
        setRankedItems((prev) => [...prev, item]);
    }

    function removeItem(id) {
        setRankedItems((prev) => prev.filter((i) => i.id !== id));
    }

    function moveItemUp(id) {
        setRankedItems((prev) => {
            const idx = prev.findIndex((i) => i.id === id);
            if (idx <= 0) return prev;
            const next = [...prev];
            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            return next;
        });
    }

    function moveItemDown(id) {
        setRankedItems((prev) => {
            const idx = prev.findIndex((i) => i.id === id);
            if (idx === -1 || idx >= prev.length - 1) return prev;
            const next = [...prev];
            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
            return next;
        });
    }

    function clearAll() {
        setRankedItems([]);
    }

    const handleDragStart = useCallback((e, id) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(id));
        e.currentTarget.classList.add("opacity-50");
    }, []);

    const handleDragOver = useCallback((e, overId) => {
        e.preventDefault();
        if (draggedId === null || draggedId === overId) return;
        setDragOverId(overId);
        setRankedItems((prev) => {
            const fromIdx = prev.findIndex((i) => i.id === draggedId);
            const toIdx = prev.findIndex((i) => i.id === overId);
            if (fromIdx === -1 || toIdx === -1) return prev;
            const next = [...prev];
            const [moved] = next.splice(fromIdx, 1);
            next.splice(toIdx, 0, moved);
            return next;
        });
    }, [draggedId]);

    const handleDragEnd = useCallback(() => {
        setDraggedId(null);
        setDragOverId(null);
    }, []);

    const label = targetType === "Department" ? "Department" : "Specialization";
    const labelPlural = targetType === "Department" ? "Departments" : "Specializations";
    const labelLower = targetType === "Department" ? "departments" : "specializations";

    if (eligibilityLoading) {
        return (
            <>
                <PageHeader title={t("specializationPreference")} subtitle={`Rank and order your preferred ${labelLower}`} />
                <SpecializationPreferenceSkeleton />
            </>
        );
    }

    return (
        <div className="flex flex-col gap-4 lg:gap-6 lg:h-[calc(100vh-7rem)] lg:overflow-hidden">
            <PageHeader
                title={t("specializationPreference")}
                subtitle={`Rank and order your preferred ${labelLower}`}
            />

            <SuccessBanner show={showSuccess} onDismiss={() => setShowSuccess(false)} />

            {!eligibility?.eligible ? (
                <EligibilityCard eligibility={eligibility} />
            ) : isLoading ? (
                <SpecializationPreferenceSkeleton />
            ) : (
                <>
                    <div className="flex items-center justify-between gap-2 rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light/90 dark:bg-bg-surface-primary-default-dark/90 backdrop-blur-xl p-3 shadow-sm sm:gap-3 sm:p-5">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg ${
                                rankedItems.length > 0
                                    ? "bg-bg-fill-accent-muted-light dark:bg-bg-fill-accent-muted-dark text-text-accent-default-light dark:text-text-accent-default-dark"
                                    : "bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark"
                            }`}>
                                <OrderedListIcon size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                                    {rankedItems.length === 0
                                        ? "No preferences yet"
                                        : `${rankedItems.length} preference${rankedItems.length === 1 ? "" : "s"} ranked`}
                                </p>
                                <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                    {rankedItems.length === 0
                                        ? `Add at least one ${labelLower} to save.`
                                        : `Drag to reorder or use the arrow buttons.`}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            disabled={!canSave}
                            loading={saveMutation.isPending}
                            onClick={() => saveMutation.mutate()}
                            startIcon={<FloppyDiskIcon size={16} />}
                            className="shrink-0"
                        >
                            <span className="hidden sm:inline">Save Preferences</span>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                        <Section className="flex flex-col min-h-0">
                            <div className="flex h-full flex-col rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark p-4 lg:p-5 shadow-sm">
                                <SectionHeader
                                    icon={<SearchIcon size={16} />}
                                    title={`Available ${labelPlural}`}
                                    count={availableItems.length}
                                />

                                <SearchInput
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder={`Search ${labelLower}...`}
                                />

                                {filteredAvailableItems.length === 0 ? (
                                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-primary-default-light dark:border-border-primary-default-dark px-4 py-8 lg:px-6 lg:py-12 text-center">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-icon-secondary-default-light dark:text-icon-secondary-default-dark">
                                            <SearchIcon size={22} />
                                        </div>
                                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark mb-1">
                                            {searchQuery
                                                ? `No matches for "${searchQuery}"`
                                                : `All ${labelLower} have been added to your ranking`}
                                        </p>
                                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                            {searchQuery ? "Try a different search term." : "Add more items from the left panel."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="-me-1.5 -ms-1.5 flex-1 min-h-0 space-y-2 overflow-y-auto px-1.5 py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-primary-default-light/40 dark:[&::-webkit-scrollbar-thumb]:bg-border-primary-default-dark/40">
                                        {filteredAvailableItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border-primary-default-light/50 dark:border-border-primary-default-dark/50 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-3 lg:p-3.5 transition-all hover:border-border-accent-default-light/40 dark:hover:border-border-accent-default-dark/40 hover:shadow-md"
                                                onClick={() => addItem(item)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addItem(item); } }}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                                                        {item.name}
                                                    </p>
                                                    {(item.nameAr || item.departmentName) && (
                                                        <p className="mt-0.5 truncate text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                            {[item.nameAr, item.departmentName].filter(Boolean).join(" · ")}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-icon-secondary-default-light dark:text-icon-secondary-default-dark transition-all lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:bg-bg-fill-accent-muted-light dark:lg:group-hover:bg-bg-fill-accent-muted-dark lg:group-hover:text-text-accent-default-light lg:dark:group-hover:text-text-accent-default-dark lg:group-focus-visible:opacity-100">
                                                    <PlusIcon size={16} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Section>

                        <Section className="flex flex-col min-h-0">
                            <div className="flex h-full flex-col rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark p-4 lg:p-5 shadow-sm">
                                <SectionHeader
                                    icon={<StarIcon size={15} />}
                                    title="Your Ranking"
                                    count={rankedItems.length}
                                    accent
                                    onClearAll={clearAll}
                                />

                                {rankedItems.length === 0 ? (
                                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-accent-default-light/50 dark:border-border-accent-default-dark/50 px-4 py-8 lg:px-6 lg:py-12 text-center">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-fill-accent-muted-light dark:bg-bg-fill-accent-muted-dark text-text-accent-default-light dark:text-text-accent-default-dark">
                                            <OrderedListIcon size={22} />
                                        </div>
                                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark mb-1">
                                            No preferences ranked yet
                                        </p>
                                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                            Add {labelLower} from the left panel to start ranking.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="-me-1.5 -ms-1.5 flex-1 min-h-0 space-y-2 overflow-y-auto px-1.5 py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-primary-default-light/40 dark:[&::-webkit-scrollbar-thumb]:bg-border-primary-default-dark/40">
                                        {rankedItems.map((item, idx) => {
                                            const isDragging = draggedId === item.id;
                                            const isDragOver = dragOverId === item.id && draggedId !== item.id;
                                            return (
                                                <div
                                                    key={item.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, item.id)}
                                                    onDragOver={(e) => handleDragOver(e, item.id)}
                                                    onDragEnd={handleDragEnd}
                                                    onDrop={(e) => e.preventDefault()}
                                                    className={`flex items-center gap-3 rounded-xl border bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-3 lg:p-3.5 transition-all border-border-primary-default-light/50 dark:border-border-primary-default-dark/50 ${
                                                        isDragging ? "opacity-50 shadow-none" : "shadow-sm hover:shadow-md"
                                                    } ${
                                                        isDragOver ? "ring-2 ring-border-accent-default-light dark:ring-border-accent-default-dark" : ""
                                                    }`}
                                                >
                                                    <span className="shrink-0 cursor-grab text-icon-secondary-default-light dark:text-icon-secondary-default-dark active:cursor-grabbing hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark">
                                                        <GripIcon />
                                                    </span>
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                                                            {item.name}
                                                        </p>
                                                        {(item.nameAr || item.departmentName) && (
                                                            <p className="mt-0.5 truncate text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                                {[item.nameAr, item.departmentName].filter(Boolean).join(" · ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveItemUp(item.id)}
                                                            disabled={idx === 0}
                                                            title="Move up"
                                                            className="rounded-lg p-1.5 text-icon-secondary-default-light dark:text-icon-secondary-default-dark transition-colors hover:bg-bg-surface-primary-default-light dark:hover:bg-bg-surface-primary-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark disabled:cursor-not-allowed disabled:opacity-20"
                                                        >
                                                            <ArrowUpIcon size={15} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveItemDown(item.id)}
                                                            disabled={idx === rankedItems.length - 1}
                                                            title="Move down"
                                                            className="rounded-lg p-1.5 text-icon-secondary-default-light dark:text-icon-secondary-default-dark transition-colors hover:bg-bg-surface-primary-default-light dark:hover:bg-bg-surface-primary-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark disabled:cursor-not-allowed disabled:opacity-20"
                                                        >
                                                            <ArrowDownIcon size={15} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item.id)}
                                                            title="Remove"
                                                            className="rounded-lg p-1.5 text-icon-secondary-default-light dark:text-icon-secondary-default-dark transition-colors hover:bg-bg-surface-danger-default-light/10 dark:hover:bg-bg-surface-danger-default-dark/20 hover:text-icon-danger-default-light dark:hover:text-icon-danger-default-dark"
                                                        >
                                                            <XIcon size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </Section>
                    </div>
                </>
            )}
        </div>
    );
}