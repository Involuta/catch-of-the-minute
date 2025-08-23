import React, { useEffect, useState } from "react";
import { fn } from "../firebase";
import CatchButton from "./CatchButton";

export default function COTMBanner() {
  const [cotm, setCotm] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const res: any = await fn.getCurrentCOTM({});
    setCotm(res.data.exists ? { id: res.data.id, ...res.data.data } : null);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <div className="card">Loading COTM…</div>;
  if (!cotm)
    return (
      <div className="card">No COTM yet. Waiting for the minute to tick…</div>
    );

  const start = cotm.minuteStart.toDate
    ? cotm.minuteStart.toDate()
    : new Date();
  const end = cotm.minuteEnd.toDate ? cotm.minuteEnd.toDate() : new Date();

  return (
    <div className="card">
      <h2>Catch of the Minute</h2>
      <div className="row">
        <div>
          <div className="species">{cotm.species.name}</div>
          <div>
            Number remaining: <b>{cotm.currentNumber}</b> / {cotm.maxNumber}
          </div>
          <div>
            Window: {start.toLocaleTimeString()} - {end.toLocaleTimeString()}
          </div>
        </div>
        <CatchButton cotmId={cotm.id} disabled={cotm.currentNumber <= 0} />
      </div>
    </div>
  );
}
