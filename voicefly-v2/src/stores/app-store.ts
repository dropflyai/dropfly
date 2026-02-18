import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
}

interface CommandPaletteState {
  open: boolean;
}

interface AppState {
  sidebar: SidebarState;
  commandPalette: CommandPaletteState;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;

  // Command palette actions
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebar: {
        collapsed: false,
        mobileOpen: false,
      },
      commandPalette: {
        open: false,
      },

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => ({
          sidebar: { ...state.sidebar, collapsed: !state.sidebar.collapsed },
        })),

      setSidebarCollapsed: (collapsed) =>
        set((state) => ({
          sidebar: { ...state.sidebar, collapsed },
        })),

      setMobileSidebarOpen: (open) =>
        set((state) => ({
          sidebar: { ...state.sidebar, mobileOpen: open },
        })),

      // Command palette actions
      openCommandPalette: () =>
        set((state) => ({
          commandPalette: { ...state.commandPalette, open: true },
        })),

      closeCommandPalette: () =>
        set((state) => ({
          commandPalette: { ...state.commandPalette, open: false },
        })),

      toggleCommandPalette: () =>
        set((state) => ({
          commandPalette: { ...state.commandPalette, open: !state.commandPalette.open },
        })),
    }),
    {
      name: "voicefly-app-store",
      partialize: (state) => ({
        sidebar: { collapsed: state.sidebar.collapsed },
      }),
    }
  )
);

export default useAppStore;
