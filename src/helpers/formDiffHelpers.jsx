import React from "react";

export function changed(curr, orig) {
  const c = (curr ?? "").toString().trim();
  const o = (orig ?? "").toString().trim();
  return c !== o;
}

export function Was({ value }) {
  if (value == null || value === "") return null;
  return (
    <p className="text-xs text-gray-500 mt-1">
      was: <em>{String(value)}</em>
    </p>
  );
}

export function ChangedPill({ on }) {
  if (!on) return null;
  return (
    <span className="ml-2 inline-block text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 align-middle">
      Changed
    </span>
  );
}