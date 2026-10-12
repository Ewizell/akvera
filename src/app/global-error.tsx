"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          color: "#28313d",
          background: "#fff",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>Сайт временно недоступен</h1>
        <p style={{ margin: 0, maxWidth: 420, color: "#767d83" }}>
          Мы уже знаем о проблеме. Попробуйте обновить страницу через минуту.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            height: 44,
            padding: "0 24px",
            border: 0,
            borderRadius: 12,
            background: "#116b36",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Попробовать снова
        </button>
      </body>
    </html>
  );
}