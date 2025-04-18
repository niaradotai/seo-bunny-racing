import { ImageResponse } from "@vercel/og";
import Image from "next/image";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Get race data from params
        const winner = searchParams.get("winner") || "Unknown Website";
        const score = searchParams.get("score") || "0";
        const urlsCount = searchParams.get("count") || "1";
        // Get ID from params (not used directly)
        searchParams.get("id");

        return new ImageResponse(
            (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex", // Ensure main container has flex display
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                            "linear-gradient(to bottom, #111827, #1F2937)",
                        padding: "40px",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "0px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: "0px",
                                marginTop: "40px",
                            }}
                        >
                            <img
                                src={`${process.env.NEXT_PUBLIC_BASE_URL}/assets/logo.png`}
                                width={200}
                                alt="Bunny Racer"
                                className="block"
                            />
                        </div>
                    </div>

                    {/* Trophy and Winner */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0, 0, 0, 0.4)",
                            borderRadius: "16px",
                            padding: "32px",
                            marginBottom: "12px",
                            border: "2px solid #EAB308",
                            width: "80%",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 70,
                                marginBottom: "8px",
                                display: "flex",
                            }}
                        >
                            🏆
                        </div>
                        <h2
                            style={{
                                fontSize: 32,
                                color: "#FCD34D",
                                fontWeight: "bold",
                                marginBottom: "8px",
                            }}
                        >
                            WINNER
                        </h2>
                        <h3
                            style={{
                                fontSize: 48,
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                                marginBottom: "16px",
                            }}
                        >
                            {winner}
                        </h3>
                        <div
                            style={{
                                display: "flex", // Added display: flex here for this container
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: "8px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 24,
                                    color: "#9CA3AF",
                                    marginRight: "16px",
                                    display: "flex",
                                }}
                            >
                                PageSpeed Score:
                            </div>
                            <div
                                style={{
                                    fontSize: 40,
                                    color: "#4ADE80",
                                    fontWeight: "bold",
                                    display: "flex",
                                }}
                            >
                                {score}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: "flex", // Added display: flex here for the footer
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex", // Ensure flex display for this container
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(0, 0, 0, 0.3)",
                                borderRadius: "8px",
                                padding: "12px 20px",
                                marginBottom: "12px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 24,
                                    color: "#9CA3AF",
                                    marginRight: "8px",
                                    display: "flex",
                                }}
                            >
                                Raced {urlsCount} websites
                            </div>
                            <div style={{ fontSize: 28, display: "flex" }}>
                                🏁
                            </div>
                        </div>

                        <div
                            style={{
                                fontSize: 20,
                                color: "#9CA3AF",
                                display: "flex",
                            }}
                        >
                            Created by Niara.ai
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: unknown) {
        console.error(
            `Error generating image: ${
                e instanceof Error ? e.message : "Unknown error"
            }`
        );
        return new Response(`Failed to generate image`, {
            status: 500,
        });
    }
}
