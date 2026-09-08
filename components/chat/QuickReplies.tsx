export default function QuickReplies({
  options,
  onSelect,
}: {
  options: string[];
  onSelect: (option: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 pl-9 animate-msg-in">
      {options.map((option, i) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border active:scale-95 transition ${
            i === 0
              ? "bg-brand-red text-white border-brand-red"
              : "bg-white text-brand-red border-brand-red"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
