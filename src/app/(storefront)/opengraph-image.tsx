import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "AKVERA — промышленное оборудование";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  let font: Buffer | undefined;

  try {
    font = await readFile(
      join(process.cwd(), "public/fonts/Montserrat-SemiBold.ttf")
    );
  } catch {
    // Если шрифт отсутствует, используем системный шрифт.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #28313d 0%, #3d5570 100%)",
          color: "#ffffff",
          fontFamily: font ? "Montserrat" : "Arial",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: 4,
            color: "#179146",
          }}
        >
          AKVERA
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 68,
              lineHeight: 1.1,
              fontWeight: 600,
            }}
          >
            Промышленное оборудование
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 32,
              color: "rgba(255, 255, 255, 0.68)",
            }}
          >
            Подбор, наличие и коммерческое предложение
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      ...(font
        ? {
            fonts: [
              {
                name: "Montserrat",
                data: font,
                weight: 600,
                style: "normal",
              },
            ],
          }
        : {}),
    }
  );
}