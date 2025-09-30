import { useState } from "react";
import { client } from "../../api/client.js";

export default function HealthBadge() {
  const [status, setStatus] = useState("idle");

  async function probe() {
    setStatus("loading");
    try {
      const res = await client(
        import.meta.env.VITE_HEALTH_PATH || "/api/health"
      );
      const s = (res?.status || "").toLowerCase();
      setStatus(s === "ok" ? "ok" : "fail");
    } catch {
      setStatus("fail");
    }
  }

  const label =
    status === "ok"
      ? "Network ON"
      : status === "fail"
      ? "Network OFF"
      : status === "loading"
      ? "Comprobando…"
      : "Test Network";

  return (
    <button
      onClick={probe}
      className={`px-3 py-2 border rounded ${
        status === "ok" ? "bg-green-500" : status === "fail" ? "bg-red-500" : ""
      }`}
    >
      {label}
    </button>
  );
}
