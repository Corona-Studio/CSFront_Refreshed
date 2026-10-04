"use client";
import { FC, ReactElement, memo } from "react";

import styles from "./Board.module.css";

interface BoardProps {
    title?: string;
    count?: string;
    Icon?: ReactElement;
    desc?: string;
    border?: boolean;
}

const Board: FC<BoardProps> = ({ title, count, desc, Icon, border = false }) => (
    <article className={styles.board} data-bordered={border || undefined}>
        <div className={styles.boardHeader}>
            <h2 className={styles.boardTitle}>{title}</h2>
            {Icon && <span className={styles.boardIcon}>{Icon}</span>}
        </div>
        <p className={styles.boardCount}>{count}</p>
        {desc && <p className={styles.boardDescription}>{desc}</p>}
    </article>
);

export default memo(Board);
