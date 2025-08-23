import React, { useState } from "react";
import { fn } from "../firebase";

export default function CatchButton({
  cotmId,
  disabled,
}: {
  cotmId: string;
  disabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function doCatch() {
    setBusy(true);
    setMsg(null);
    try {
      await fn.catchCreature({ cotmId });
      setMsg("You caught it!");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="catch">
      <button disabled={busy || disabled} onClick={doCatch}>
        Cast line
      </button>
      {msg && <div className="hint">{msg}</div>}
    </div>
  );
}
