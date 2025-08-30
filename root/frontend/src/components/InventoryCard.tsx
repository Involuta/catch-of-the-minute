import React from "react";
import { InventoryItem } from "../types";

function toDateSafe(v: any): Date | null {
  if (!v) return null;

  // Firestore Timestamp (client SDK)
  if (typeof v.toDate === "function") return v.toDate();

  // Callable/serialized Timestamp variants (as of 8/29/25, this is the current system)
  const s = v.seconds ?? v._seconds;
  const ns = v.nanoseconds ?? v._nanoseconds ?? 0;
  if (typeof s === "number") return new Date(s * 1000 + Math.floor(ns / 1e6));

  // Milliseconds number
  if (typeof v === "number") return new Date(v);

  // ISO string
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export default function InventoryCard({ item }: { item: InventoryItem }) {
  const caughtDate = toDateSafe(item.caughtAt);
  return (
    <div className={"card " + (item.alive ? "" : "dead")}>
      <h3>
        {item.name} <small>#{item.number}</small>
      </h3>
      <div>Power: {item.power}</div>
      <div>Status: {item.alive ? "Alive" : "Devoured"}</div>
      <div>Caught: {caughtDate ? caughtDate.toLocaleString() : "—"}</div>
    </div>
  );
}
