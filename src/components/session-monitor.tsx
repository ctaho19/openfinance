"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { signOut } from "next-auth/react";

const IDLE_WARNING_MS = 25 * 60 * 1000; // 25 minutes
const LOGOUT_COUNTDOWN_MS = 5 * 60 * 1000; // 5 minutes

export function SessionMonitor() {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 min in seconds

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  }, []);

  const handleLogout = useCallback(() => {
    clearAllTimers();
    signOut({ callbackUrl: "/login" });
  }, [clearAllTimers]);

  const startLogoutCountdown = useCallback(() => {
    setShowWarning(true);
    setCountdown(300);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, LOGOUT_COUNTDOWN_MS);
  }, [handleLogout]);

  const resetIdleTimer = useCallback(() => {
    if (showWarning) return;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = setTimeout(() => {
      startLogoutCountdown();
    }, IDLE_WARNING_MS);
  }, [showWarning, startLogoutCountdown]);

  const handleStayLoggedIn = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setCountdown(300);
    resetIdleTimer();
  }, [clearAllTimers, resetIdleTimer]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    const handleActivity = () => {
      if (!showWarning) {
        resetIdleTimer();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetIdleTimer();

    return () => {
      clearAllTimers();
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetIdleTimer, clearAllTimers, showWarning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <svg
              className="h-6 w-6 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Session Timeout Warning</h2>
        </div>

        <p className="mb-2 text-gray-300">
          Your session is about to expire due to inactivity.
        </p>

        <p className="mb-6 text-gray-400">
          You will be automatically logged out in{" "}
          <span className="font-mono text-lg font-bold text-amber-500">
            {formatTime(countdown)}
          </span>
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Stay Logged In
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 font-medium text-gray-300 transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
