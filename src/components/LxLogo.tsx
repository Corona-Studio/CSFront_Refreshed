import styles from "./LxLogo.module.css";

function LxLogo() {
    return (
        <>
            <h1 className="font-bold text-white">
                Launcher
                <span className={styles.x}>X</span>
            </h1>
        </>
    );
}

export default LxLogo;
