import { FC, ReactNode, memo } from "react";

import SpotlightCard from "../ReactBits/Components/SpotlightCard/SpotlightCard.tsx";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
    icon?: ReactNode;
    title?: string;
    description?: string;
    spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

const ProjectCard: FC<ProjectCardProps> = ({
    icon = null,
    title = "",
    description = "",
    spotlightColor = "rgba(255, 165, 0, 0.2)"
}) => {
    return (
        <>
            <SpotlightCard spotlightColor={spotlightColor}>
                <div className={styles.projIcon}>{icon}</div>
                <article className="text-pretty pt-4">
                    <h4 className="font-bold">{title}</h4>
                    <p>{description}</p>
                </article>
            </SpotlightCard>
        </>
    );
};

export default memo(ProjectCard);
