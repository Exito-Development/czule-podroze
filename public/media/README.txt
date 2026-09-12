Materiały multimedialne strony
==============================

hero.mp4        — film w tle sekcji hero (plaża + fale). Odtwarzany BEZ dźwięku,
                  jest tylko dekoracją. Opcjonalnie hero.webm dla lepszej kompresji.
                  Do czasu wgrania pliku pokazujemy poster i materiał poglądowy z CDN.

ambience.mp3    — dźwięk w tle całej strony (szum morza). Plik OPCJONALNY:
(lub .webm)       gdy go nie ma, przełącznik dźwięku w ogóle się nie pokazuje.


Jak przygotować ambience.mp3 z własnego nagrania
------------------------------------------------
Poniżej: dźwięk od 13. sekundy nagrania, 30-sekundowa pętla, z płynnym
wejściem i wyjściem (żeby zapętlenie nie „klikało"):

  ffmpeg -ss 13 -t 30 -i "Screen Recording.mov" -vn \
         -af "afade=t=in:st=0:d=2,afade=t=out:st=28:d=2,loudnorm" \
         -c:a libmp3lame -b:a 128k -ar 44100 \
         public/media/ambience.mp3

  -ss 13     start od 13. sekundy
  -t 30      długość pętli (pomiń, żeby wziąć wszystko do końca)
  -vn        pomijamy obraz
  afade      2 s wyciszenia na początku i końcu — szew pętli staje się niesłyszalny
  loudnorm   wyrównanie głośności

Mniejszy plik (ok. 2× lżejszy, obsługiwany przez Chrome/Firefox/Edge):

  ffmpeg -ss 13 -t 30 -i "Screen Recording.mov" -vn \
         -af "afade=t=in:st=0:d=2,afade=t=out:st=28:d=2,loudnorm" \
         -c:a libopus -b:a 64k public/media/ambience.webm

Można wgrać oba — przeglądarka wybierze pierwszy obsługiwany format.
Nie ma ffmpeg? `brew install ffmpeg`.


Jak to działa na stronie
------------------------
- Dźwięk NIGDY nie startuje sam — przeglądarki blokują autoplay z dźwiękiem,
  a my i tak nie chcemy zaskakiwać. Włącza go przycisk w lewym dolnym rogu.
- Wybór jest zapamiętywany: przy kolejnej wizycie dźwięk wraca przy pierwszym
  kliknięciu gdziekolwiek na stronie.
- Ścieżka gra nieprzerwanie przy przechodzeniu między podstronami i cichnie,
  gdy karta przeglądarki przestaje być aktywna.
- Głośność: 30% (stała TARGET_VOLUME w
  src/components/providers/AmbientSoundContext.tsx).
