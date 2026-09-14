"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";

/** Docelowa głośność tła — ma być tłem, nie ścieżką dźwiękową. */
const TARGET_VOLUME = 0.3;
const FADE_SECONDS = 1.2;
const STORAGE_KEY = "czula-podroz-dzwiek";

interface AmbientSoundValue {
  /** Czy plik z dźwiękiem w ogóle się wczytał (bez niego chowamy przełącznik). */
  available: boolean;
  playing: boolean;
  toggle: () => void;
}

const AmbientSoundContext = createContext<AmbientSoundValue | null>(null);

/**
 * Dźwięk w tle strony (szum morza).
 *
 * Trzy rzeczy, na których zależy nam bardziej niż na samym odtwarzaniu:
 *
 *  - **Nigdy nie zaskakujemy dźwiękiem.** Przeglądarki i tak blokują autoplay
 *    z dźwiękiem, ale nawet gdyby nie blokowały — start zawsze wymaga gestu.
 *    Wybór zapamiętujemy, więc przy kolejnej wizycie wznawiamy go dopiero przy
 *    pierwszej interakcji ze stroną.
 *  - **Zawsze da się wyciszyć.** Przełącznik jest przypięty do okna, a nie do
 *    hero, więc działa też na dole strony (WCAG 1.4.2).
 *  - **Brak pliku nie psuje UI.** Gdy `/media/ambience.*` nie istnieje,
 *    `available` zostaje `false` i przełącznik w ogóle się nie pokazuje.
 *
 * Ścieżka żyje ponad routingiem (w `AppProviders`), więc gra nieprzerwanie
 * przy przechodzeniu między stronami.
 */
export function AmbientSoundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);

  /** Rozpoczyna odtwarzanie z łagodnym wejściem głośności. */
  const fadeIn = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    audio.volume = 0;
    try {
      await audio.play();
    } catch {
      // Przeglądarka odmówiła (brak gestu użytkowniczki) — zostajemy cicho.
      return false;
    }
    gsap.to(audio, { volume: TARGET_VOLUME, duration: FADE_SECONDS, ease: "power1.out" });
    return true;
  }, []);

  const fadeOut = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    gsap.to(audio, {
      volume: 0,
      duration: 0.5,
      ease: "power1.in",
      onComplete: () => audio.pause(),
    });
  }, []);

  const toggle = useCallback(() => {
    setPlaying((wasPlaying) => {
      if (wasPlaying) {
        fadeOut();
        try {
          localStorage.setItem(STORAGE_KEY, "off");
        } catch {
          /* tryb prywatny */
        }
        return false;
      }
      void fadeIn();
      try {
        localStorage.setItem(STORAGE_KEY, "on");
      } catch {
        /* tryb prywatny */
      }
      return true;
    });
  }, [fadeIn, fadeOut]);

  // Czy plik z dźwiękiem istnieje? Bez tego nie pokazujemy przełącznika.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onReady = () => setAvailable(true);
    // Błędy z <source> nie bąbelkują — łapiemy je w fazie przechwytywania.
    const onError = () => setAvailable(false);

    // Plik bywa gotowy, zanim efekt zdąży podpiąć nasłuchy (cache, localhost),
    // więc najpierw sprawdzamy stan, jaki element ma teraz.
    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      setAvailable(true);
    } else if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      setAvailable(false);
    }

    audio.addEventListener("loadedmetadata", onReady);
    audio.addEventListener("canplay", onReady);
    audio.addEventListener("error", onError, true);

    return () => {
      audio.removeEventListener("loadedmetadata", onReady);
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("error", onError, true);
    };
  }, []);

  // Wznowienie po powrocie na stronę: dopiero przy pierwszym geście, bo
  // wcześniej przeglądarka i tak nie pozwoli zagrać.
  useEffect(() => {
    if (!available) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (stored !== "on") return;

    const resume = async () => {
      if (await fadeIn()) setPlaying(true);
      detach();
    };
    const detach = () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };

    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return detach;
  }, [available, fadeIn]);

  // Karta w tle — nie zagłuszamy tego, co użytkowniczka robi gdzie indziej.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onVisibilityChange = () => {
      if (document.hidden) audio.pause();
      else if (playing) void audio.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [playing]);

  const value = useMemo<AmbientSoundValue>(
    () => ({ available, playing, toggle }),
    [available, playing, toggle]
  );

  return (
    <AmbientSoundContext.Provider value={value}>
      {children}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} loop preload="metadata" aria-hidden>
        <source src="/media/ambience.webm" type="audio/webm" />
        <source src="/media/ambience.mp3" type="audio/mpeg" />
      </audio>
    </AmbientSoundContext.Provider>
  );
}

export function useAmbientSound(): AmbientSoundValue {
  const ctx = useContext(AmbientSoundContext);
  if (!ctx) {
    throw new Error(
      "useAmbientSound musi być użyte wewnątrz <AmbientSoundProvider>"
    );
  }
  return ctx;
}
