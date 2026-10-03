import { cn } from "@/lib/utils";

import styles from "./progressive-blur.module.css";

/** Static, masked backdrop layers. No scroll handlers or per-frame filter animation. */
export default function ProgressiveBlur({
    direction = "top",
    className
}: {
    direction?: "top" | "bottom";
    className?: string;
}) {
    return (
        <div aria-hidden="true" className={cn(styles.surface, direction === "bottom" && styles.bottom, className)}>
            {[1, 2, 3, 4].map((layer) => (
                <span key={layer} />
            ))}
        </div>
    );
}
