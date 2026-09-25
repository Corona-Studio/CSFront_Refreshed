import { FC, ReactNode, useEffect, useState } from "react";

interface AsyncVisibilityContainerProps {
    children?: ReactNode;
    visible?: () => Promise<boolean>;
}

const visibleByDefault = () => Promise.resolve(true);

const AsyncVisibilityContainer: FC<AsyncVisibilityContainerProps> = ({
    children = null,
    visible = visibleByDefault
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let active = true;
        visible().then((result) => active && setIsVisible(result));
        return () => {
            active = false;
        };
    }, [visible]);

    return isVisible && <>{children}</>;
};

export default AsyncVisibilityContainer;
