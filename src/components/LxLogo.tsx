import { FC } from "react";

import styles from "./LxLogo.module.css";

interface LxLogoProps {
    textClassName?: string;
}

const LxLogo: FC<LxLogoProps> = ({ textClassName = "font-bold text-white text-5xl! md:text-6xl" }) => {
    return (
        <>
            <h1 className={textClassName}>
                Launcher
                <span className={styles.x}>X</span>
            </h1>
        </>
    );
};

export default LxLogo;
