import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-card">
            <div className="m-container py-10">
                <div className="flex flex-wrap justify-between gap-8">
                    <Link href="/" className="font-black text-3xl tracking-tighter">
                        CORONA STUDIO®
                    </Link>
                    <div className="flex flex-wrap gap-6 text-xs font-mono">
                        <a href="https://github.com/Corona-Studio" target="_blank" rel="noopener noreferrer">
                            GITHUB ↗
                        </a>
                        <a href="https://kb.corona.studio/" target="_blank" rel="noopener noreferrer">
                            KNOWLEDGE ↗
                        </a>
                        <a href="https://csss.vot.moe" target="_blank" rel="noopener noreferrer">
                            SERVICE STATUS ↗
                        </a>
                    </div>
                </div>
                <div className="m-rule m-kicker mt-8 mb-0">
                    <span>2016—{new Date().getFullYear()} © CORONA STUDIO</span>
                    <a href="https://www.12377.cn" target="_blank" rel="noopener noreferrer">
                        违法和不良信息举报
                    </a>
                </div>
            </div>
        </footer>
    );
}
