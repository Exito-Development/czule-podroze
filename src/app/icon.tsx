import { ImageResponse } from "next/og";

/** Ikona w karcie przeglądarki i w wynikach wyszukiwania na telefonie. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3a342c",
          color: "#f3d6d7",
          fontSize: 22,
          borderRadius: 8,
        }}
      >
        C
      </div>
    ),
    size,
  );
}
