"use client";

import { Search, Plus, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddBikeDialog from "@/components/dialogs/add-bike-dialog";
import SoldBikeDialog from "@/components/dialogs/sold-bike-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import Image from "next/image";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // 2. Initialize router

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );

        const data = await res.json();
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="sticky top-0 z-40 flex h-26 items-center gap-16 border-b bg-white px-8">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-4 top-6 z-10 -translate-y-1/2 text-slate-400"
        />

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bike, seller, buyer..."
          className="h-12 rounded-xl pl-11"
        />

        {(results.length > 0 || loading) && (
          <div className="absolute mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-xl">
            <Command>
              <CommandList>
                {loading && (
                  <CommandEmpty>Searching...</CommandEmpty>
                )}

                {!loading && results.length === 0 && (
                  <CommandEmpty>No Result</CommandEmpty>
                )}

                {/* 3. Removed asChild from CommandGroup */}
                <CommandGroup>
                  {results.map((item) => (
                    <CommandItem
                      key={item.bikeId}
                      value={item.bikeId} // Good practice to include a unique value for cmdk filtering
                      onSelect={() => {
                        // 4. Handle routing and state clearing here instead of using <Link>
                        setQuery("");
                        setResults([]);
                        router.push(`/inventory/${item.bikeId}`);
                      }}
                      className="flex cursor-pointer items-center gap-4 py-3"
                    >
                      <img
                        src={item.image}
                        alt=""
                        width={60}
                        height={40}
                        className="rounded-lg object-cover"
                      />

                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {item.number}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {item.model}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          Seller: {item.seller?.name}
                        </span>

                        {item.buyer && (
                          <span className="text-xs text-muted-foreground">
                            Buyer: {item.buyer.name}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-5">
        <AddBikeDialog />
        <SoldBikeDialog />
      </div>
    </header>
  );
}