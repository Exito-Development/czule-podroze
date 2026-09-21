/**
 * Zgoda na pliki cookie.
 *
 * Przechowujemy nie samo „tak/nie", lecz też wersję treści i moment wyboru.
 * Wersja pozwala zapytać ponownie, gdy zmieni się zakres przetwarzania —
 * zgoda udzielona na inny zakres przestaje być zgodą. Data jest potrzebna,
 * bo trzeba umieć wykazać, kiedy i na co użytkowniczka się zgodziła.
 */

const KLUCZ = "czula-podroz-cookies";

/** Podnieś, gdy zmieni się zakres — wcześniejsze zgody przestaną obowiązywać. */
export const WERSJA_ZGODY = 2;

export type KategoriaCookies = "niezbedne" | "analityczne";

export interface Zgoda {
  wersja: number;
  udzielonaO: string;
  kategorie: Record<KategoriaCookies, boolean>;
}

/** Niezbędne są zawsze włączone — bez nich koszyk i rezerwacja nie działają. */
export const TYLKO_NIEZBEDNE: Zgoda["kategorie"] = {
  niezbedne: true,
  analityczne: false,
};

export const WSZYSTKIE: Zgoda["kategorie"] = {
  niezbedne: true,
  analityczne: true,
};

export function wczytajZgode(): Zgoda | null {
  if (typeof window === "undefined") return null;
  try {
    const zapisane = window.localStorage.getItem(KLUCZ);
    if (!zapisane) return null;
    const zgoda = JSON.parse(zapisane) as Zgoda;
    // Zgoda na starszą wersję treści nie obowiązuje — pytamy jeszcze raz.
    if (zgoda.wersja !== WERSJA_ZGODY) return null;
    return zgoda;
  } catch {
    // Zablokowany localStorage (tryb prywatny, ustawienia przeglądarki) —
    // traktujemy jak brak zgody, czyli najostrożniej.
    return null;
  }
}

export function zapiszZgode(kategorie: Zgoda["kategorie"]): Zgoda {
  const zgoda: Zgoda = {
    wersja: WERSJA_ZGODY,
    udzielonaO: new Date().toISOString(),
    kategorie,
  };
  try {
    window.localStorage.setItem(KLUCZ, JSON.stringify(zgoda));
  } catch {
    // Brak zapisu oznacza tylko tyle, że zapytamy ponownie przy kolejnej
    // wizycie. Nic się nie psuje.
  }
  window.dispatchEvent(new CustomEvent("czula:zgoda", { detail: zgoda }));
  return zgoda;
}

/**
 * Czy wolno uruchomić coś z danej kategorii.
 *
 * Skrypty analityczne i marketingowe MUSZĄ o to pytać przed uruchomieniem —
 * zgoda ma poprzedzać przetwarzanie, nie następować po nim.
 */
export function wolno(kategoria: KategoriaCookies): boolean {
  if (kategoria === "niezbedne") return true;
  return wczytajZgode()?.kategorie[kategoria] === true;
}

/** Otwiera baner ponownie — podpięte pod „Ustawienia cookies" w stopce. */
export function otworzUstawieniaCookies(): void {
  window.dispatchEvent(new CustomEvent("czula:otworz-cookies"));
}
