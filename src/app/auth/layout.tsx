import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="m-auth">
            <aside className="m-auth-aside">
                <p className="m-kicker text-current">CS—02 / ACCOUNT ACCESS</p>
                <div className="m-display">
                    YOUR NEXT
                    <br />
                    ADVENTURE
                    <br />
                    STARTS HERE.
                </div>
                <p className="font-mono text-xs">CORONA STUDIO® · PLAY / BUILD / CONNECT</p>
            </aside>
            <div className="m-auth-main">{children}</div>
        </div>
    );
}
