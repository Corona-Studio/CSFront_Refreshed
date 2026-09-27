/* eslint-disable react-refresh/only-export-components */
import { useEffect } from "react";
import styles from "./TopLoadingBar.module.css";

export const hideLoadingBar = () =>
    document.getElementById("loading-bar-top")!.style.display = "none";

export const showLoadingBar = () =>
    document.getElementById("loading-bar-top")!.style.display = "block";



export default function TopLoadingBar({ hide = false, autoStop = false }: { hide?: boolean, autoStop?: boolean }) {
    useEffect(() => {
        localStorage.setItem("loading-autoStop", `${autoStop}`); // when ssr - export autoStop value as module 
    }, [autoStop]);

    return <div id="loading-bar-top" className={`${hide ? "hidden" : ""}  need-fade-in min-w-screen news-0 will-change-contents bottom-auto! fixed bg-zinc-200/30 shadow transition z-1001`} >
        <div className={` transition-all w-[20vw] bg-yellow-500/80 dark:bg-yellow-400 rounded-lg h-1  ${styles.seedInTopLoadingBar}`}></div>
    </div>
}



// usage: at bottom of page add <Loading /> will stop the loading bar