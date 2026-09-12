"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Który wyjazd jest „w centrum uwagi".
 *
 * Dwa poziomy intencji:
 *  - `pinnedSlug`  — wyjazd wybrany świadomie (klik w przełącznik osi czasu),
 *  - `previewSlug` — wyjazd tylko wskazany kursorem / klawiaturą (hover, focus).
 *
 * Oś czasu pokazuje `focusedSlug` = preview ?? pinned, dzięki czemu samo
 * najechanie na kafelek wyjazdu natychmiast „przerysowuje" jego linię czasu,
 * a po zjechaniu kursorem wracamy do wyjazdu przypiętego.
 */
interface TripFocusValue {
  pinnedSlug: string;
  previewSlug: string | null;
  focusedSlug: string;
  pin: (slug: string) => void;
  preview: (slug: string | null) => void;
}

const TripFocusContext = createContext<TripFocusValue | null>(null);

export function TripFocusProvider({
  initialSlug,
  children,
}: {
  initialSlug: string;
  children: React.ReactNode;
}) {
  const [pinnedSlug, setPinnedSlug] = useState(initialSlug);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const pin = useCallback((slug: string) => {
    setPinnedSlug(slug);
    setPreviewSlug(null);
  }, []);

  const preview = useCallback((slug: string | null) => {
    setPreviewSlug(slug);
  }, []);

  const value = useMemo<TripFocusValue>(
    () => ({
      pinnedSlug,
      previewSlug,
      focusedSlug: previewSlug ?? pinnedSlug,
      pin,
      preview,
    }),
    [pinnedSlug, previewSlug, pin, preview]
  );

  return (
    <TripFocusContext.Provider value={value}>
      {children}
    </TripFocusContext.Provider>
  );
}

export function useTripFocus(): TripFocusValue {
  const ctx = useContext(TripFocusContext);
  if (!ctx) {
    throw new Error("useTripFocus musi być użyte wewnątrz <TripFocusProvider>");
  }
  return ctx;
}
