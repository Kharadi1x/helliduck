import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Helliduck";
  const subtitle = searchParams.get("subtitle") || "The internet's most opinionated duck.";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial",
          padding: "40px",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🦆</div>
        <div
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "#FFC107",
            textAlign: "center",
            marginBottom: 16,
            maxWidth: "80%",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#888",
            textAlign: "center",
            maxWidth: "70%",
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 20,
            color: "#555",
          }}
        >
          helliduck.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
