function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function ChatUserSkeleton() {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <SkeletonBar className="w-9 h-9 rounded-full shrink-0" />
      <div className="min-w-0 flex-1">
        <SkeletonBar className="h-3.5 w-28" />
        <SkeletonBar className="h-3 w-14 mt-1.5" />
      </div>
      <SkeletonBar className="w-5 h-5 rounded-full shrink-0" />
    </div>
  );
}

export function ChatUsersSectionSkeleton() {
  return (
    <div className="flex flex-col gap-1 bg-[var(--surface-hover)] rounded-xl py-2">
      <div className="flex items-center gap-2 px-2 mb-1">
        <SkeletonBar className="w-4 h-4 rounded" />
        <SkeletonBar className="h-3 w-20" />
        <div className="ms-auto">
          <SkeletonBar className="w-3 h-3" />
        </div>
      </div>
      <div className="h-px bg-[var(--border-subtle)] mx-2" />
      <div className="flex flex-col gap-0.5">
        <ChatUserSkeleton />
        <ChatUserSkeleton />
        <ChatUserSkeleton />
      </div>
    </div>
  );
}

export function ChatUsersSkeleton() {
  return (
    <div className="col-span-1 sm:border-e sm:border-[var(--border-subtle)] sm:pe-4 flex flex-col min-h-0 h-full">
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex items-center justify-between">
          <SkeletonBar className="h-4 w-20" />
          <div className="flex items-center gap-1">
            <SkeletonBar className="w-8 h-8 rounded-lg" />
            <SkeletonBar className="w-8 h-8 rounded-lg" />
          </div>
        </div>
        <SkeletonBar className="h-10 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto min-h-0 no-scrollbar pt-1">
        <ChatUsersSectionSkeleton />
        <ChatUsersSectionSkeleton />
        <ChatUsersSectionSkeleton />
      </div>
    </div>
  );
}

export function DefaultChatPanelSkeleton() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md flex flex-col items-center gap-6">
        <SkeletonBar className="w-20 h-20 rounded-2xl" />
        <div className="flex flex-col items-center gap-2">
          <SkeletonBar className="h-7 w-64" />
          <SkeletonBar className="h-4 w-72" />
          <SkeletonBar className="h-4 w-48" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SkeletonBar className="h-11 w-32 rounded-xl" />
          <SkeletonBar className="h-11 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function AddFriendPanelSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 py-3 bg-white dark:bg-gray-800 shrink-0">
        <SkeletonBar className="w-10 h-10 rounded-lg" />
        <SkeletonBar className="w-7 h-7 rounded-lg" />
        <SkeletonBar className="h-5 w-24" />
      </div>
      <div className="flex flex-col gap-5 px-5 py-5 overflow-y-auto flex-1">
        <div className="flex flex-col gap-2">
          <SkeletonBar className="h-4 w-32" />
          <div className="flex gap-2">
            <SkeletonBar className="h-11 flex-1 rounded-xl" />
            <SkeletonBar className="h-11 w-20 rounded-xl" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
          <SkeletonBar className="h-4 w-28" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-14">
          <SkeletonBar className="w-16 h-16 rounded-2xl" />
          <div className="flex flex-col items-center gap-1">
            <SkeletonBar className="h-4 w-36" />
            <SkeletonBar className="h-3 w-52" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateGroupPanelSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 py-3 bg-white dark:bg-gray-800 shrink-0">
        <SkeletonBar className="w-10 h-10 rounded-lg" />
        <SkeletonBar className="w-7 h-7 rounded-lg" />
        <SkeletonBar className="h-5 w-28" />
      </div>
      <div className="flex flex-col gap-5 px-5 py-5 overflow-y-auto flex-1 no-scrollbar">
        <div className="flex flex-col items-center gap-2.5">
          <SkeletonBar className="w-20 h-20 rounded-2xl" />
          <SkeletonBar className="h-3 w-28" />
        </div>
        <div className="flex flex-col gap-1.5">
          <SkeletonBar className="h-4 w-24" />
          <SkeletonBar className="h-11 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-1.5">
          <SkeletonBar className="h-4 w-24" />
          <SkeletonBar className="h-20 w-full rounded-xl" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
          <SkeletonBar className="h-4 w-20" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        </div>
        <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <SkeletonBar className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <SkeletonBar className="h-4 w-28" />
                <SkeletonBar className="h-3 w-20 mt-1" />
              </div>
              <SkeletonBar className="w-5 h-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
        <SkeletonBar className="h-11 flex-1 rounded-xl" />
        <SkeletonBar className="h-11 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function MessageSkeleton({ isOwn = false }) {
  const isRtl = document.dir === 'rtl';
  return (
    <div className={`flex items-start gap-3 px-2 mt-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex flex-col min-w-0 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        <div className={`flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : ""}`}>
          <SkeletonBar className={`h-9 w-48 rounded-[18px] ${isOwn
            ? (isRtl ? "rounded-tl-md" : "rounded-tr-md")
            : (isRtl ? "rounded-tr-md" : "rounded-tl-md")
          }`} />
        </div>
      </div>
    </div>
  );
}

export function MessagingSkeleton() {
  return (
    <div className="col-span-2 flex flex-col h-full min-h-0 gap-0">
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800 shrink-0 px-6">
        <div className="flex items-center gap-2">
          <SkeletonBar className="w-10 h-10 rounded-xl shrink-0" />
          <div>
            <SkeletonBar className="h-4 w-32" />
            <SkeletonBar className="h-3 w-20 mt-1" />
          </div>
        </div>
        <SkeletonBar className="w-9 h-9 rounded-lg" />
      </div>
      <SkeletonBar className="h-9 mx-4 mt-2 rounded-lg" />
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar mt-2">
        <div className="flex justify-center mb-4">
          <SkeletonBar className="h-5 w-24 rounded-full" />
        </div>
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
        <div className="flex justify-center my-4">
          <SkeletonBar className="h-5 w-28 rounded-full" />
        </div>
        <MessageSkeleton isOwn />
        <MessageSkeleton isOwn />
        <MessageSkeleton />
      </div>
      <div className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-gray-700/80">
        <div className="flex items-center gap-1">
          <SkeletonBar className="w-6 h-6 rounded" />
          <SkeletonBar className="w-6 h-6 rounded" />
        </div>
        <SkeletonBar className="flex-1 h-10 rounded-xl" />
        <SkeletonBar className="w-10 h-10 rounded-xl" />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col w-full max-w-[750px] h-[600px] min-h-[600px]">
      <div className="flex items-center justify-end px-3 py-2 border-b border-gray-100 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-800">
        <SkeletonBar className="w-8 h-8 rounded-lg" />
      </div>
      <div className="flex-1 min-h-0 p-4 grid grid-cols-3 gap-4">
        <ChatUsersSkeleton />
        <DefaultChatPanelSkeleton />
      </div>
    </div>
  );
}
