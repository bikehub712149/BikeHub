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
import { Store, User, Database, Palette, Loader2 } from "lucide-react";
import { UserProfile, SignOutButton } from "@clerk/nextjs";
import { LogOut, ShieldCheck } from "lucide-react";

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
      } catch (error) {
        console.error(error);
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
    <div className="flex-1 p-4 pb-24 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your store preferences, account, and application settings.
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store size={16} /> Store Details
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User size={16} /> Account
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Database size={16} /> Storage
          </TabsTrigger>
        </TabsList>

        {/* STORE SETTINGS */}
        <TabsContent value="store">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                These details will appear on your generated sale receipts and PDFs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dealership Name</label>
                  <Input defaultValue="Bike Hub Motors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Phone</label>
                  <Input defaultValue="+91 " />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Official Address</label>
                  <Input defaultValue="Pandua, West Bengal" />
                </div>
              </div>
              <Button className="mt-4 rounded-xl">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNT SETTINGS */}
        <TabsContent value="account">
  <div className="space-y-6">

    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          Administrator Account
        </CardTitle>

        <CardDescription>
          Manage your administrator profile, password and security settings.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-3">

        <SignOutButton redirectUrl="/sign-in">
          <Button
            variant="destructive"
            className="rounded-xl"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </SignOutButton>

      </CardContent>
    </Card>

    <Card className="rounded-2xl shadow-sm border">
      <CardContent className="p-6">
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-none",
            },
          }}
        />
      </CardContent>
    </Card>

  </div>
</TabsContent>


        {/* STORAGE - ACCURATE CLOUDINARY API DATA */}
        <TabsContent value="storage">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Cloudinary Usage</CardTitle>
              <CardDescription>
                Monitor your live account limits for images and documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStorage ? (
                <div className="flex h-20 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : storage ? (
                <div className="space-y-2">
                  
                  {/* Shows actual account limits and credits consumed */}
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Account Credits</span>
                    <span className="text-slate-500 font-medium">
                      {storage.creditsUsed} / {storage.creditsLimit} Credits
                    </span>
                  </div>
                  
                  {/* Dynamic Progress Bar based on real percentage */}
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.max(storage.percentage, 1)}%` }} 
                    />
                  </div>
                  
                  {/* Breakdown of exactly how much storage the bikes are taking up */}
                  <div className="flex justify-between items-center mt-4 p-4 bg-slate-50 rounded-xl border">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Total File Storage</p>
                      <p className="text-xs text-slate-500">Space taken by bike images and PDFs</p>
                    </div>
                    <p className="text-sm font-bold text-slate-700">{storage.storageGB} GB</p>
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    1 Credit equals 1 GB of storage, 1 GB of bandwidth, or 1,000 image transformations.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-500">Failed to load storage data.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}