"use client";

import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/auth-button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/" className="text-2xl font-bold">
          Mushi Templates
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/templates">Browse Templates</Link>
          </Button>
          <AuthButton />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold">My Templates</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                View and manage your saved templates
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/templates">View Templates</Link>
              </Button>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold">Settings</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage your account settings and preferences
              </p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href="/dashboard/settings">Open Settings</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 