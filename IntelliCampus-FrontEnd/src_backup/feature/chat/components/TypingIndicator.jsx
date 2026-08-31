export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-2 mt-1">
      <div className="relative px-4 py-3 rounded-[18px] rounded-tl-md text-sm leading-relaxed bg-white/6 border border-white/8 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0s]" />
        <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0.2s]" />
        <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  );
}
