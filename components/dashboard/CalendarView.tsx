"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";

interface CalendarViewProps {
  scheduledPosts: any[];
}

export function CalendarView({ scheduledPosts }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-serif italic">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-ivory/60" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-ivory/60" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10 flex-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-obsidian/80 p-4 text-center text-xs font-mono uppercase tracking-widest text-ivory/40"
          >
            {day}
          </div>
        ))}

        {/* Fill empty days at start of month */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-obsidian/40 min-h-[120px]" />
        ))}

        {daysInMonth.map((day) => {
          const dayPosts = scheduledPosts.filter((post) =>
            isSameDay(new Date(post.scheduled_for), day),
          );
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`bg-obsidian/80 min-h-[120px] p-2 border-t border-white/5 transition-colors hover:bg-white/5 ${!isSameMonth(day, currentDate) ? "opacity-50" : ""}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full ${isToday ? "bg-champagne text-obsidian" : "text-ivory/60"}`}
                >
                  {format(day, "d")}
                </span>
                {dayPosts.length > 0 && (
                  <span className="text-xs font-mono bg-champagne/20 text-champagne px-2 py-0.5 rounded-full">
                    {dayPosts.length}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {dayPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs p-2 rounded-lg bg-white/5 border border-white/10 truncate cursor-pointer hover:border-champagne/50 transition-colors flex items-center gap-2"
                  >
                    <div className="w-4 h-4 rounded bg-slate/50 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-2 h-2 text-ivory/40" />
                    </div>
                    <span className="truncate text-ivory/80">
                      {post.posts?.caption || "Untitled Post"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
