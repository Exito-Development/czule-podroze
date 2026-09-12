/**
 * Lokalny „pęk kluczy" do rezerwacji.
 *
 * Zakup nie wymaga konta, więc token dostępu do rezerwacji (API pokazuje go
 * tylko raz, przy składaniu zamówienia) zapisujemy w przeglądarce. Dzięki temu
 * klientka wraca do swojej rezerwacji jednym kliknięciem, a nie szukaniem maila.
 */
export interface SavedReservation {
  orderNumber: string;
  accessToken: string;
  title: string;
  savedAt: string;
}

const STORAGE_KEY = "czula-podroz-rezerwacje";

export function listSavedReservations(): SavedReservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedReservation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReservation(reservation: SavedReservation): void {
  try {
    const existing = listSavedReservations().filter(
      (entry) => entry.orderNumber !== reservation.orderNumber
    );
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([reservation, ...existing].slice(0, 20))
    );
  } catch {
    /* tryb prywatny — zostaje link z maila */
  }
}

export function findSavedToken(orderNumber: string): string | null {
  return (
    listSavedReservations().find((entry) => entry.orderNumber === orderNumber)
      ?.accessToken ?? null
  );
}
