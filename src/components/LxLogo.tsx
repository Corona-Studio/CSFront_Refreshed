import styles from "./LxLogo.module.css";

function LxLogo() {
    return (
        <>
            <h1 className="font-bold text-gray-900 dark:text-white">
                Launcher
                <span className={styles.x}>X</span>
            </h1>
        </>
    );
}

export default LxLogo;
