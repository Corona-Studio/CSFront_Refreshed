import { FC, ReactNode, useEffect, useState } from "react";

interface AsyncVisibilityContainerProps {
    children?: ReactNode;
    visible?: () => Promise<boolean>;
}

const AsyncVisibilityContainer: FC<AsyncVisibilityContainerProps> = ({
    children = null,
    visible = () => Promise.resolve(true)
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        async function setIsVisibleAsync() {
            if (!visible) return;

            setIsVisible(await visible());
        }

        setIsVisibleAsync().then();
    }, []);

    return isVisible && <>{children}</>;
};

export default AsyncVisibilityContainer;
