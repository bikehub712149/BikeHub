"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Bike } from "@/types/bike";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type BikeSelectorProps = {
  bikes: Bike[];
  value?: Bike;
  onChange: (bike: Bike) => void;
};

export default function BikeSelector({
  bikes,
  value,
  onChange,
}: BikeSelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full justify-between rounded-xl"
          >
            {value
              ? `${value.number} • ${value.model}`
              : "Search & Select Bike"}

            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        }
      />

      <PopoverContent className="w-[420px] p-0">
        <Command>
          <CommandInput placeholder="Search registration..." />

          <CommandList>
            <CommandEmpty>No bike found.</CommandEmpty>

            <CommandGroup heading="Available Bikes">
              {bikes
                .filter((bike) => bike.status === "Available")
                .map((bike) => (
                  <CommandItem
                    key={bike.id}
                    value={`${bike.number} ${bike.model}`}
                    onSelect={() => {
                      onChange(bike);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === bike.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />

                    <div>
                      <p className="font-medium">{bike.number}</p>

                      <p className="text-xs text-muted-foreground">
                        {bike.model}
                      </p>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}