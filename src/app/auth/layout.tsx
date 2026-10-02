import AuthAsciiScene from "@/components/AuthAsciiScene";
import styles from "@/components/AuthAsciiScene.module.css";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="m-auth">
            <AuthAsciiScene />
            <div className={`m-auth-main ${styles.main}`}>{children}</div>
        </div>
    );
}
