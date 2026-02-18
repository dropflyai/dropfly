"use client";

import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";
import { useAppStore } from "@/stores/app-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const {
    sidebar,
    toggleSidebar,
    setMobileSidebarOpen,
    commandPalette,
    openCommandPalette,
    closeCommandPalette,
  } = useAppStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openCommandPalette();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openCommandPalette]);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
      <div className="flex h-screen bg-[var(--color-bg-base)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar collapsed={sidebar.collapsed} onToggle={toggleSidebar} />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={sidebar.mobileOpen}
          onOpenChange={setMobileSidebarOpen}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            onMenuClick={() => setMobileSidebarOpen(true)}
            onCommandPaletteOpen={openCommandPalette}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>

        {/* Command Palette */}
        <CommandPalette
          open={commandPalette.open}
          onOpenChange={(open) => (open ? openCommandPalette() : closeCommandPalette())}
        />
      </div>
    </ThemeProvider>
  );
}
