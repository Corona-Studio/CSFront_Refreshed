import AuthAsciiScene from "@/components/AuthAsciiScene";
import styles from "@/components/AuthAsciiScene.module.css";
import type { ReactNode } from "react";
import { noIndex } from "@/lib/seo";

import layout from "./layout.module.css";
export const metadata = noIndex;

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className={layout.auth}>
            <AuthAsciiScene />
            <div className={`${layout.authMain} ${styles.main}`}>{children}</div>
        </div>
    );
}
