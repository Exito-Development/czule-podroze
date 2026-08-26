/**
 * Faliste przejście między sekcjami — nadaje stronie „wakacyjny" rytm
 * i sprawia, że sekcje przestają zlewać się ze sobą.
 * `fill` — kolor sekcji POD falą (następnej), `bg` — kolor sekcji NAD falą.
 * Przykład: <WaveDivider bg="var(--color-ivory)" fill="var(--color-cream)" />
 */
export default function WaveDivider({
  fill,
  bg,
  flip = false,
}: {
  fill: string;
  bg: string;
  flip?: boolean;
}) {
  return (
    <div
      aria-hidden
      className="-mb-px w-full overflow-hidden leading-none"
      style={{ background: bg, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <svg
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        className="block h-[42px] w-full md:h-[70px]"
      >
        <path
          d="M0,40 C240,80 480,0 720,25 C960,50 1200,15 1440,45 L1440,70 L0,70 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
