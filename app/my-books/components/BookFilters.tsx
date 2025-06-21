import { FilterType } from "../utils/bookUtils";

interface BookFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  filterCounts: {
    all: number;
    reading: number;
    want_to_read: number;
    finished: number;
    favorites: number;
  };
}

export function BookFilters({ activeFilter, onFilterChange, filterCounts }: BookFiltersProps) {
  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "All", count: filterCounts.all },
    { key: "reading", label: "Reading", count: filterCounts.reading },
    { key: "want_to_read", label: "Want to Read", count: filterCounts.want_to_read },
    { key: "finished", label: "Finished", count: filterCounts.finished },
    { key: "favorites", label: "❤️ Favorites", count: filterCounts.favorites },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === filter.key
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          {filter.label} ({filter.count})
        </button>
      ))}
    </div>
  );
}