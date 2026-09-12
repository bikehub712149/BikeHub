"use client";

import { useEffect, useState, useRef } from "react";
import { Bike, Loader2, Search, ShoppingBag, User, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "@/components/ui/image";

import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import AddBikeDialog from "@/components/dialogs/add-bike-dialog";
import SoldBikeDialog from "@/components/dialogs/sold-bike-dialog";

type SearchResult = {
  bikeId: string;
  image: string;
  model: string;
  number: string;
  seller?: { name?: string };
  buyer?: { name?: string };
};

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);
  const navigationToast = useRef<string | number | null>(null);
  const navigationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleBikeDetailsReady = () => {
      if (!navigationToast.current) return;

      toast.dismiss(navigationToast.current);
      navigationToast.current = null;
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
        navigationTimeout.current = null;
      }
      setNavigating(false);
    };

    window.addEventListener("bike-details-ready", handleBikeDetailsReady);
    return () => window.removeEventListener("bike-details-ready", handleBikeDetailsReady);
  }, []);

  // Handle Search API
  useEffect(() => {
    const searchQuery = query.trim();

    if (!searchQuery) return;

    // Debounce typing and abort older requests so stale results cannot replace newer ones.
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error("Search request failed");

        const data = (await res.json()) as SearchResult[];
        if (!controller.signal.aborted) setResults(data);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setLoading(false);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setIsOpen(true);
    setLoading(true);
  };

  const handleBikeSelect = (bikeId: string) => {
    if (navigating) return;

    const destination = `/inventory/${bikeId}`;
    if (pathname === destination) {
      clearSearch();
      return;
    }

    setNavigating(true);
    setIsOpen(false);
    setResults([]);
    setQuery("");
    // The destination dismisses this toast after its client content mounts.
    navigationToast.current = toast.custom(
      () => (
        <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span className="flex items-center">
            Loading bike details
            <span className="ml-1 inline-flex w-5" aria-hidden="true">
              <span className="animate-bounce [animation-delay:-0.3s]">.</span>
              <span className="animate-bounce [animation-delay:-0.15s]">.</span>
              <span className="animate-bounce">.</span>
            </span>
          </span>
        </div>
      ),
      { duration: 15000 },
    );
    // Keep navigation from locking the search bar if the destination never reports ready.
    navigationTimeout.current = setTimeout(() => {
      if (!navigationToast.current) return;

      toast.dismiss(navigationToast.current);
      navigationToast.current = null;
      navigationTimeout.current = null;
      setNavigating(false);
    }, 15000);
    router.push(destination);
  };

  return (
    <header className="sticky top-0 z-40 flex h-22 items-center gap-10 border-b bg-white px-6">

      {/* Search Bar */}
      <div className="relative flex-1 max-w-2xl" ref={searchRef}>
        <div className="relative group">
          {loading ? (
            <Loader2
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin text-primary"
            />
          ) : (
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
            />
          )}
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => query.trim() && setIsOpen(true)}
            placeholder="Search bikes by model, number, seller, or buyer"
            aria-label="Search bikes"
            className="h-11 w-full rounded-xl border-border/60 bg-muted/20 pl-10 pr-10 shadow-sm transition-all focus-visible:border-primary focus-visible:ring-primary/20"
          />
          
          {query && (
            <button
              onClick={clearSearch}
              type="button"
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* 
              shouldFilter={false} is REQUIRED when fetching from an API. 
              Otherwise, cmdk tries to filter your already-filtered API results.
            */}
            <Command shouldFilter={false} className="max-h-[400px] bg-transparent">
              <CommandList className="max-h-[400px] overflow-y-auto p-2">
                
                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                    Searching inventory...
                  </div>
                )}

                {/* Not Found State */}
                {!loading && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-3 rounded-full bg-muted/30 p-3">
                      <Bike className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We couldn&apos;t find anything matching &quot;{query}&quot;
                    </p>
                  </div>
                )}

                {/* Results List */}
                {!loading && results.length > 0 && (
                  <CommandGroup heading="Matching Bikes">
                    {results.map((item) => (
                      <CommandItem
                        key={item.bikeId}
                        value={item.bikeId}
                        onSelect={() => handleBikeSelect(item.bikeId)}
                        className="mb-1 flex cursor-pointer items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50 aria-selected:bg-muted/50"
                        aria-disabled={navigating}
                      >
                        {/* Thumbnail */}
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted/30 border border-border/50">
                          <Image
                            fill
                            sizes="80px"
                            src={item.image}
                            alt={item.model}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex flex-col flex-1 gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold uppercase tracking-tight text-foreground">
                              {item.number}
                            </span>
                          </div>
                          
                          <span className="text-sm font-medium text-muted-foreground line-clamp-1">
                            {item.model}
                          </span>

                          {/* Seller / Buyer Tags */}
                          <div className="flex items-center gap-3 mt-0.5">
                            {item.seller?.name && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <User size={12} className="text-blue-500" />
                                {item.seller.name}
                              </span>
                            )}
                            {item.buyer?.name && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <ShoppingBag size={12} className="text-green-500" />
                                {item.buyer.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="ml-auto flex gap-3">
        <AddBikeDialog />
        <SoldBikeDialog />
      </div>
    </header>
  );
}