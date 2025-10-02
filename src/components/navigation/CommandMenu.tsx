import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  DollarSign,
  Users,
  Briefcase,
  FolderKanban,
  Search,
  Settings,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    keywords: ["home", "overview", "metrics"],
  },
  {
    title: "Business Plan",
    url: "/business-plan",
    icon: FileText,
    keywords: ["plan", "strategy", "pitch", "deck"],
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
    keywords: ["todo", "projects", "roadmap"],
  },
  {
    title: "Financial",
    url: "/financial",
    icon: DollarSign,
    keywords: ["money", "forecast", "revenue", "cash flow"],
  },
  {
    title: "Investors",
    url: "/investors",
    icon: Briefcase,
    keywords: ["funding", "pitch", "vc", "angel"],
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
    keywords: ["hiring", "candidates", "freelancers"],
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: FolderKanban,
    keywords: ["companies", "ventures", "equity"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    keywords: ["preferences", "account", "profile"],
  },
];

export const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search platform...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search platform sections..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.url}
                value={`${item.title} ${item.keywords.join(" ")}`}
                onSelect={() => handleSelect(item.url)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
