/*
    Installed from https://reactbits.dev/ts/tailwind/
*/
import { PanInfo, motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import React, { useEffect, useState } from "react";

interface RollingGalleryProps {
    autoplay?: boolean;
    pauseOnHover?: boolean;
    images?: string[];
}

const RollingGallery: React.FC<RollingGalleryProps> = ({ autoplay = false, pauseOnHover = false, images = [] }) => {
    // Use default images if none are provided
    const galleryImages = images;

    const [isScreenSizeSm, setIsScreenSizeSm] = useState<boolean>(window.innerWidth <= 640);
    useEffect(() => {
        const handleResize = () => setIsScreenSizeSm(window.innerWidth <= 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 3D geometry calculations
    const cylinderWidth: number = isScreenSizeSm ? 1100 : 1800;
    const faceCount: number = galleryImages.length;
    const faceWidth: number = (cylinderWidth / faceCount) * 1.5;
    const radius: number = cylinderWidth / (2 * Math.PI);

    // Framer Motion values and controls
    const dragFactor: number = 0.05;
    const rotation = useMotionValue(0);
    const controls = useAnimation();

    // Create a 3D transform based on the rotation motion value
    const transform = useTransform(rotation, (val: number) => `rotate3d(0,1,0,${val}deg)`);

    const startInfiniteSpin = (startAngle: number) => {
        controls.start({
            rotateY: [startAngle, startAngle - 360],
            transition: {
                duration: 20,
                ease: "linear",
                repeat: Infinity
            }
        });
    };

    useEffect(() => {
        if (autoplay) {
            const currentAngle = rotation.get();
            startInfiniteSpin(currentAngle);
        } else {
            controls.stop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoplay]);

    const handleUpdate = (latest: any) => {
        if (typeof latest.rotateY === "number") {
            rotation.set(latest.rotateY);
        }
    };

    const handleDrag = (_: any, info: PanInfo): void => {
        controls.stop();
        rotation.set(rotation.get() + info.offset.x * dragFactor);
    };

    const handleDragEnd = (_: any, info: PanInfo): void => {
        const finalAngle = rotation.get() + info.velocity.x * dragFactor;
        rotation.set(finalAngle);
        if (autoplay) {
            startInfiniteSpin(finalAngle);
        }
    };

    const handleMouseEnter = (): void => {
        if (autoplay && pauseOnHover) {
            controls.stop();
        }
    };

    const handleMouseLeave = (): void => {
        if (autoplay && pauseOnHover) {
            const currentAngle = rotation.get();
            startInfiniteSpin(currentAngle);
        }
    };

    return (
        <div className="relative w-full overflow-hidden">
            <div className="flex h-full items-center justify-center [perspective:1000px] [transform-style:preserve-3d]">
                <motion.div
                    drag="x"
                    dragElastic={0}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    animate={controls}
                    onUpdate={handleUpdate}
                    style={{
                        transform: transform,
                        rotateY: rotation,
                        width: cylinderWidth,
                        transformStyle: "preserve-3d"
                    }}
                    className="flex min-h-[200px] cursor-grab items-center justify-center [transform-style:preserve-3d]">
                    {galleryImages.map((url, i) => (
                        <div
                            key={i}
                            className={` group absolute flex h-fit items-center justify-center p-[8%] [backface-visibility:hidden] md:p-[6%]`}
                            style={{
                                width: `${faceWidth}px`,
                                transform: `rotateY(${(360 / faceCount) * i}deg) ${isScreenSizeSm ? `translateZ(calc(${radius}px + 5vw))` : `translateZ(calc(${radius}px))`}`
                            }}>
                            <img
                                src={url}
                                alt="gallery"
                                className="pointer-events-none h-[120px] w-[220px] rounded-[15px] object-cover transition-transform duration-300 ease-out group-hover:scale-105 sm:h-[132px] sm:w-[220px]"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default RollingGallery;
