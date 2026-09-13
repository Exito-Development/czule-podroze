"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, SessionExpiredError } from "@/lib/api/client";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Ponowne pobranie — po zapisie albo po akcji zmieniającej dane. */
  reload: () => void;
  /** Podmiana danych bez odpytywania API (np. po odpowiedzi z akcji). */
  setData: (data: T) => void;
}

/**
 * Pobranie danych z API wraz ze stanem ładowania i błędu.
 *
 * Wynik żądania, które już się zdezaktualizowało (zmieniono zakładkę, wyjazd),
 * jest odrzucany — inaczej wolniejsza, starsza odpowiedź nadpisałaby nowszą.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  dependencies: React.DependencyList = []
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, dependencies);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(null);

    run()
      .then((result) => {
        if (current) setData(result);
      })
      .catch((exception) => {
        if (!current) return;
        if (exception instanceof SessionExpiredError) {
          // Wylogowanie obsługuje AuthProvider — nie zaśmiecamy widoku błędem.
          return;
        }
        setError(
          exception instanceof ApiError
            ? exception.message
            : "Nie udało się pobrać danych. Sprawdź, czy API działa."
        );
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [run, nonce]);

  return {
    data,
    loading,
    error,
    reload: () => setNonce((value) => value + 1),
    setData,
  };
}
