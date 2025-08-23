import React, { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { fn } from "../firebase";
import { InventoryItem } from "../types";
import InventoryCard from "./InventoryCard";

export default function Profile({ user }: { user: User | null }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    (async () => {
      const res: any = await fn.getProfile({});
      setItems(res.data.inventory);
      setLoading(false);
    })();
  }, [user]);

  if (!user) return <div className="card">Sign in to view your profile.</div>;
  if (loading) return <div className="card">Loading your creatures…</div>;

  return (
    <div className="grid">
      {items.map((i) => (
        <InventoryCard key={i.id} item={i} />
      ))}
      {items.length === 0 && (
        <div className="card">No creatures yet — go catch the COTM!</div>
      )}
    </div>
  );
}
