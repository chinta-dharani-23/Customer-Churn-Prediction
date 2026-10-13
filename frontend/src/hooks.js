import { useEffect, useState } from "react";

// Tiny fetch-on-mount hook used by Dashboard and Models.
export function useApi(fn) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fn()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []); // eslint-disable-line

  return { data, error, loading };
}
