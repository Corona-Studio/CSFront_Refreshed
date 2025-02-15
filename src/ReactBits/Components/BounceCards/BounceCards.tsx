/*
	jsrepo 1.36.0
	Installed from https://reactbits.dev/ts/tailwind/
	2-14-2025
*/
import { gsap } from 'gsap';
import { useEffect } from 'react';

interface BounceCardsProps {
    className?: string;
    images?: string[];
    containerWidth?: number;
    containerHeight?: number;
    animationDelay?: number;
    animationStagger?: number;
    easeType?: string;
    transformStyles?: string[];
}

export default function BounceCards({
    className = '',
    images = [],
    containerWidth = 400,
    containerHeight = 400,
    animationDelay = 0.5,
    animationStagger = 0.06,
    easeType = 'elastic.out(1, 0.8)',
    transformStyles = [
        'rotate(10deg) translate(-170px)',
        'rotate(5deg) translate(-85px)',
        'rotate(-3deg)',
        'rotate(-10deg) translate(85px)',
        'rotate(2deg) translate(170px)'
    ]
}: BounceCardsProps) {
    useEffect(() => {
        gsap.fromTo(
            '.card',
            { scale: 0 },
            {
                scale: 1,
                stagger: animationStagger,
                ease: easeType,
                delay: animationDelay
            }
        );
    }, [animationStagger, easeType, animationDelay]);

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{
                width: containerWidth,
                height: containerHeight
            }}>
            {images.map((src, idx) => (
                <div
                    key={idx}
                    className="card absolute w-[200px] aspect-square border-8 border-white rounded-[30px] overflow-hidden"
                    style={{
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        transform:
                            transformStyles[idx] !== undefined
                                ? transformStyles[idx]
                                : 'none'
                    }}>
                    <img
                        className="w-full h-full object-cover"
                        src={src}
                        alt={`card-${idx}`}
                    />
                </div>
            ))}
        </div>
    );
}
