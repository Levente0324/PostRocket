"use client";

import { usePostDashboard } from "./PostDashboardContext";

export function HeaderNewPostButton() {
  const { openWizardToday } = usePostDashboard();

  return (
    <button
      onClick={openWizardToday}
      className="bg-light-primary hover:bg-light-primary-hover text-white px-6 py-2.5 rounded text-sm font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer"
    >
      <span className="material-symbols-outlined text-lg">add</span>
      ÚJ PROJEKT
    </button>
  );
}
