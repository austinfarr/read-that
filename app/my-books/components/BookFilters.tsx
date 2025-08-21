import { FilterType } from "../utils/bookUtils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Heart,
  Library,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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

export function BookFilters({
  activeFilter,
  onFilterChange,
  filterCounts,
}: BookFiltersProps) {
  const filters: {
    key: FilterType;
    label: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      key: "all",
      label: "All Books",
      count: filterCounts.all,
      icon: <Library className="h-4 w-4" />,
    },
    {
      key: "reading",
      label: "Currently Reading",
      count: filterCounts.reading,
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      key: "want_to_read",
      label: "Want to Read",
      count: filterCounts.want_to_read,
      icon: <Clock className="h-4 w-4" />,
    },
    {
      key: "finished",
      label: "Finished",
      count: filterCounts.finished,
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      key: "favorites",
      label: "Favorites",
      count: filterCounts.favorites,
      icon: <Heart className="h-4 w-4" />,
    },
  ];

  const activeFilterConfig = filters.find((f) => f.key === activeFilter);

  return (
    <>
      {/* Mobile Dropdown (visible on small screens) */}
      <div className="sm:hidden w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                {activeFilterConfig?.icon}
                <span className="font-medium">{activeFilterConfig?.label}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)]"
          >
            {filters.map((filter) => (
              <DropdownMenuItem
                key={filter.key}
                onClick={() => onFilterChange(filter.key)}
                className={activeFilter === filter.key ? "bg-muted" : ""}
              >
                <span className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-2">
                    {filter.icon}
                    <span>{filter.label}</span>
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Tabs (hidden on small screens) */}
      <div className="hidden sm:flex items-center justify-center w-full">
        <Tabs
          value={activeFilter}
          onValueChange={(value) => onFilterChange(value as FilterType)}
          className="w-auto"
        >
          <TabsList className="h-auto p-2 rounded-full bg-muted/50 backdrop-blur-sm">
            {filters.map((filter) => (
              <TabsTrigger
                key={filter.key}
                value={filter.key}
                className="relative gap-2 px-4 py-2 rounded-full border border-transparent data-[state=active]:bg-background 
                data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  {filter.icon}
                  <span className="font-medium">{filter.label}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </>
  );
}
