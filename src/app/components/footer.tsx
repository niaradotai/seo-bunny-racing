import Link from "next/link";

export default function Footer() {
    return (
        <div className="fixed flex flex-col bottom-0 left-0 right-0 text-center mt-8 py-2 text-white bg-black bg-opacity-50 z-40 text-sm">
            <div className="mb-1">
                <a
                    href="/leaderboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 font-bold"
                >
                    View Leaderboard 🏆
                </a>
            </div>
            <div>
                Created by{" "}
                <Link
                    href="https://niara.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 underline"
                >
                    Niara.ai
                </Link>
                . 🐰 Happy Easter!
            </div>
        </div>
    );
}
