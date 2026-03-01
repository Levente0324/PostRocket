"use client";

import { createContext, useContext, useRef, ReactNode } from "react";
import { PostSchedulerRef } from "./PostScheduler";

interface PostDashboardContextType {
  openWizardToday: () => void;
  schedulerRef: React.RefObject<PostSchedulerRef | null>;
}

const PostDashboardContext = createContext<PostDashboardContextType | null>(
  null,
);

export function PostDashboardProvider({ children }: { children: ReactNode }) {
  const schedulerRef = useRef<PostSchedulerRef>(null);

  const openWizardToday = () => {
    schedulerRef.current?.openWizardToday();
  };

  return (
    <PostDashboardContext.Provider value={{ openWizardToday, schedulerRef }}>
      {children}
    </PostDashboardContext.Provider>
  );
}

export function usePostDashboard() {
  const context = useContext(PostDashboardContext);
  if (!context) {
    throw new Error(
      "usePostDashboard must be used within a PostDashboardProvider",
    );
  }
  return context;
}
