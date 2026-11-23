import { useCallback, useEffect, useState } from "react";

export function useResource(loader, dependencies = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setData(await loader()); }
    catch (cause) { setError(cause.message || "Could not load data."); }
    finally { setLoading(false); }
  // Keep the callback stable when callers pass a fresh dependency array with the same values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, setData, loading, error, setError, refresh };
}
