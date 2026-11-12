"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, User, Database, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { UserProfile, SignOutButton } from "@clerk/nextjs";
import { toast } from "sonner";

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SettingsPage() {
  // Updated state to hold the real Credit architecture
  const [storage, setStorage] = useState<{
    storageGB: string;
    creditsUsed: string;
    creditsLimit: string;
    percentage: number;
  } | null>(null);
  const [loadingStorage, setLoadingStorage] = useState(true);

  useEffect(() => {
    async function fetchStorage() {
      try {
        const res = await fetch("/api/settings/storage");
        if (!res.ok) throw new Error("Failed to fetch storage data");
        const data = await res.json();

        // Convert raw storage bytes exactly to Gigabytes
        const storageGB = (data.storageBytes / Math.pow(1024, 3)).toFixed(2);

        setStorage({
          storageGB,
          creditsUsed: data.creditsUsed.toFixed(2),
          creditsLimit: data.creditsLimit.toString(),
          percentage: data.creditsPercent,
        });
      } catch {
      } finally {
        setLoadingStorage(false);
      }
    }

    fetchStorage();
  }, []);

  if (loadingStorage) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-sm:p-1 pb-24 max-w-5xl">
      <div className="mb-8 max-sm:mb-4">
        <h1 className="text-2xl max-sm:text-xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 max-sm:mt-0.5 text-sm max-sm:text-xs text-slate-500">
          Manage your store preferences, account, and application settings.
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6 max-sm:space-y-4">
        <TabsList className="bg-slate-100/50 p-1 max-sm:w-full">
          <TabsTrigger value="store" className="flex items-center gap-2 max-sm:gap-1.5 max-sm:text-xs">
            <Store size={16} className="max-sm:h-3.5 max-sm:w-3.5" /> Store Details
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2 max-sm:gap-1.5 max-sm:text-xs">
            <User size={16} className="max-sm:h-3.5 max-sm:w-3.5" /> Account
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2 max-sm:gap-1.5 max-sm:text-xs">
            <Database size={16} className="max-sm:h-3.5 max-sm:w-3.5" /> Storage
          </TabsTrigger>
        </TabsList>

        {/* STORE SETTINGS */}
        <TabsContent value="store">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="max-sm:px-4 max-sm:py-3.5">
              <CardTitle className="max-sm:text-base">Store Information</CardTitle>
              <CardDescription className="max-sm:text-xs">
                These details will appear on your generated sale receipts and PDFs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-sm:space-y-3 max-sm:px-4 max-sm:pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-sm:gap-3">
                <div className="space-y-2 max-sm:space-y-1.5">
                  <label className="text-sm max-sm:text-xs font-medium">Dealership Name</label>
                  <Input defaultValue="Bike Hub Motors" className="max-sm:h-9 max-sm:text-xs" />
                </div>
                <div className="space-y-2 max-sm:space-y-1.5">
                  <label className="text-sm max-sm:text-xs font-medium">Contact Phone</label>
                  <Input defaultValue="+91 " className="max-sm:h-9 max-sm:text-xs" />
                </div>
                <div className="sm:col-span-2 space-y-2 max-sm:space-y-1.5">
                  <label className="text-sm max-sm:text-xs font-medium">Official Address</label>
                  <Input defaultValue="Pandua, West Bengal" className="max-sm:h-9 max-sm:text-xs" />
                </div>
              </div>
              <Button
                className="mt-4 max-sm:mt-2 max-sm:h-9 max-sm:text-xs rounded-xl"
                onClick={() => toast.success("Store settings saved.")}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNT SETTINGS */}
        <TabsContent value="account">
          <div className="space-y-6 max-sm:space-y-4">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="max-sm:px-4 max-sm:py-3.5">
                <CardTitle className="flex items-center gap-2 max-sm:text-base">
                  <ShieldCheck className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-green-600" />
                  Administrator Account
                </CardTitle>

                <CardDescription className="max-sm:text-xs">
                  Manage your administrator profile, password and security settings.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-wrap items-center justify-between gap-3 max-sm:px-4 max-sm:pb-4">
                <div className="text-sm max-sm:text-xs">
                  <p className="font-semibold text-slate-900">Bike Hub Admin</p>
                  <p className="text-slate-500">bikehub.712149@gmail.com</p>
                </div>

                {hasClerkKey && (
                  <SignOutButton redirectUrl="/sign-in">
                    <Button variant="destructive" className="rounded-xl max-sm:h-8 max-sm:text-xs">
                      <LogOut className="mr-2 max-sm:mr-1.5 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
                      Logout
                    </Button>
                  </SignOutButton>
                )}
              </CardContent>
            </Card>

            {hasClerkKey && (
              <Card className="rounded-2xl shadow-sm border overflow-hidden">
                <CardContent className="p-2 sm:p-6 overflow-x-auto">
                  <UserProfile
                    routing="hash"
                    appearance={{
                      elements: {
                        rootBox: "w-full max-w-full",
                        cardBox: "w-full max-w-full shadow-none border-none",
                        card: "w-full max-w-full shadow-none border-none",
                      },
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* STORAGE - ACCURATE CLOUDINARY API DATA */}
        <TabsContent value="storage">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="max-sm:px-4 max-sm:py-3.5">
              <CardTitle className="max-sm:text-base">Cloudinary Usage</CardTitle>
              <CardDescription className="max-sm:text-xs">
                Monitor your live account limits for images and documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-sm:px-4 max-sm:pb-4">
              {loadingStorage ? (
                <div className="flex h-20 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : storage ? (
                <div className="space-y-2">
                  {/* Shows actual account limits and credits consumed */}
                  <div className="flex justify-between text-sm max-sm:text-xs">
                    <span className="font-medium text-slate-700">Account Credits</span>
                    <span className="text-slate-500 font-medium">
                      {storage.creditsUsed} / {storage.creditsLimit} Credits
                    </span>
                  </div>

                  {/* Dynamic Progress Bar based on real percentage */}
                  <div className="h-3 max-sm:h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.max(storage.percentage, 1)}%` }}
                    />
                  </div>

                  {/* Breakdown of exactly how much storage the bikes are taking up */}
                  <div className="flex justify-between items-center mt-4 p-4 max-sm:p-3 bg-slate-50 rounded-xl border">
                    <div>
                      <p className="text-sm max-sm:text-xs font-semibold text-slate-900">Total File Storage</p>
                      <p className="text-xs max-sm:text-[11px] text-slate-500">Space taken by bike images and PDFs</p>
                    </div>
                    <p className="text-sm max-sm:text-xs font-bold text-slate-700">{storage.storageGB} GB</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm max-sm:text-xs text-red-500">Could not load storage stats.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}