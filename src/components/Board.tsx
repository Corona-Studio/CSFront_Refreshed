import React from "react";
import { Card } from "tdesign-react";

import styles from "./Board.module.css";

interface BoardProps {
    title?: string;
    count?: string;
    Icon?: React.ReactElement;
    desc?: string;
    border?: boolean;
}

const Board: React.FC<BoardProps> = ({ title, count, desc, Icon, border = false }) => (
    <>
        <Card
            title={<span className={styles.boardTitle}>{title}</span>}
            bordered={border}
            footer={
                <div className={styles.boardItemBottom}>
                    <div className={styles.boardItemDesc}>{desc}</div>
                </div>
            }>
            <div className={styles.boardItem}>
                <div className={styles.boardItemLeft}>{count}</div>
                <div className={styles.boardItemRight}>{Icon}</div>
            </div>
        </Card>
    </>
);

export default Board;
