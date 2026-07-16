"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Loader2, X, User, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import AddBikeDialog from "@/components/dialogs/add-bike-dialog";
import SoldBikeDialog from "@/components/dialogs/sold-bike-dialog";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Handle Search API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-26 items-center gap-16 border-b bg-white px-8">

      {/* Search Bar */}
      <div className="relative flex-1 max-w-2xl" ref={searchRef}>
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setIsOpen(true)}
            placeholder="Search by bike model, number, seller, or buyer..."
            className="h-12 w-full rounded-xl pl-11 pr-10 bg-muted/20 border-border/60 transition-all focus-visible:ring-primary/20 focus-visible:border-primary shadow-sm"
          />
          
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
                    <div className="rounded-full bg-muted/30 p-3 mb-3">
                      <Search className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We couldn't find anything matching "{query}"
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
                        onSelect={() => {
                          clearSearch();
                          router.push(`/inventory/${item.bikeId}`);
                        }}
                        className="flex cursor-pointer items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50 aria-selected:bg-muted/50 mb-1"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted/30 border border-border/50">
                          <Image
                            fill
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
      <div className="flex gap-4 ml-auto">
        <AddBikeDialog />
        <SoldBikeDialog />
      </div>
    </header>
  );
}