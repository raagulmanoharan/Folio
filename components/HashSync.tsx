"use client";

import { useEffect } from "react";

export function HashSync() {
  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      const match = hash.match(/^work\/(.+)$/);
      if (!match) return;
      const el = document.getElementById(`work-${match[1]}`);
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView({ block: "start" });
      }
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    const listeners: Array<() => void> = [];
    document.querySelectorAll<HTMLDetailsElement>("details[id^=work-]").forEach((el) => {
      const onToggle = () => {
        const slug = el.id.replace(/^work-/, "");
        const target = `work/${slug}`;
        if (el.open) {
          if (window.location.hash.replace(/^#/, "") !== target) {
            history.replaceState(null, "", `#${target}`);
          }
        } else if (window.location.hash.replace(/^#/, "") === target) {
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      };
      el.addEventListener("toggle", onToggle);
      listeners.push(() => el.removeEventListener("toggle", onToggle));
    });

    return () => {
      window.removeEventListener("hashchange", openFromHash);
      listeners.forEach((off) => off());
    };
  }, []);

  return null;
}
