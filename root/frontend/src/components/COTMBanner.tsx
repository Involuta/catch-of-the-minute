import React, { useEffect, useState } from "react";
import { fn } from "../firebase";
import CatchButton from "./CatchButton";

export default function COTMBanner() {
  const [cotm, setCotm] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh(isInitialLoad = false) {
    if (isInitialLoad) {
      setLoading(true);
    } else if (cotm) {
      // If we already have data, set refreshing state instead of loading
      setRefreshing(true);
    }

    const res: any = await fn.getCurrentCOTM({});
    console.log("COTM response:", res.data);
    if (res.data.exists) {
      console.log("minuteStart:", res.data.data.minuteStart);
      console.log("minuteEnd:", res.data.data.minuteEnd);
      console.log("minuteStart type:", typeof res.data.data.minuteStart);
      console.log("minuteEnd type:", typeof res.data.data.minuteEnd);
    }
    setCotm(res.data.exists ? { id: res.data.id, ...res.data.data } : null);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    // Initial load
    refresh(true);

    // Set up interval for background refreshes
    const t = setInterval(() => refresh(false), 3000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <div className="card">Loading COTM…</div>;
  if (!cotm)
    return (
      <div className="card">No COTM yet. Waiting for the minute to tick…</div>
    );

  // Convert Firestore Timestamps to Date objects for display
  const start =
    cotm.minuteStart && cotm.minuteStart._seconds
      ? new Date(cotm.minuteStart._seconds * 1000)
      : new Date();
  const end =
    cotm.minuteEnd && cotm.minuteEnd._seconds
      ? new Date(cotm.minuteEnd._seconds * 1000)
      : new Date();

  // Debug: log what we're working with
  console.log("Converted start:", start, "type:", typeof start);
  console.log("Converted end:", end, "type:", typeof end);

  return (
    <div className="card">
      <div className="creature">{cotm.creature.name}</div>
      {refreshing && (
        <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}>
          Refreshing...
        </div>
      )}
      <div className="row">
        <div>
          <div className="species">{cotm.creature.species}</div>
          <div>
            Number remaining: <b>{cotm.currentNumber}</b> / {cotm.maxNumber}
          </div>
          <div>
            Window:{" "}
            {start instanceof Date ? start.toLocaleTimeString() : "Loading..."}{" "}
            - {end instanceof Date ? end.toLocaleTimeString() : "Loading..."}
          </div>
        </div>
        <CatchButton cotmId={cotm.id} disabled={cotm.currentNumber <= 0} />
      </div>
    </div>
  );
}
