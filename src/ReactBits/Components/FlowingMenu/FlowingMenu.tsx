/*
	jsrepo 1.36.0
	Installed from https://reactbits.dev/ts/tailwind/
	2025-2-16
*/
import { gsap } from "gsap";
import React from "react";

import "./FlowingMenu.css";

interface MenuItemProps {
    link: string;
    text: string;
    image: string;
}

interface FlowingMenuProps {
    items?: MenuItemProps[];
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({ items = [] }) => {
    return (
        <div className="menu-wrap">
            <nav className="menu">
                {items.map((item, idx) => (
                    <MenuItem key={idx} {...item} />
                ))}
            </nav>
        </div>
    );
};

const MenuItem: React.FC<MenuItemProps> = ({ link, text, image }) => {
    const itemRef = React.useRef<HTMLDivElement>(null);
    const marqueeRef = React.useRef<HTMLDivElement>(null);
    const marqueeInnerRef = React.useRef<HTMLDivElement>(null);

    const animationDefaults = { duration: 0.6, ease: "expo" };

    const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number): "top" | "bottom" => {
        const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
        const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
        return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
    };

    const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

        const tl = gsap.timeline({ defaults: animationDefaults });
        tl.set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" })
            .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" })
            .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" });
    };

    const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

        const tl = gsap.timeline({ defaults: animationDefaults }) as TimelineMax;
        tl.to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }).to(marqueeInnerRef.current, {
            y: edge === "top" ? "101%" : "-101%"
        });
    };

    const repeatedMarqueeContent = React.useMemo(() => {
        return Array.from({ length: 4 }).map((_, idx) => (
            <React.Fragment key={idx}>
                <span className="text-[#060606] uppercase font-normal text-[4vh] leading-[1.2] p-[1vh_1vw_0]">
                    {text}
                </span>
                <div
                    className="w-[200px] h-[7vh] my-[2em] mx-[2vw] p-[1em_0] rounded-[50px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${image})` }}
                />
            </React.Fragment>
        ));
    }, [text, image]);

    return (
        <div className="menu__item" ref={itemRef}>
            <a className="menu__item-link" href={link} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {text}
            </a>
            <div className="marquee" ref={marqueeRef}>
                <div className="marquee__inner-wrap" ref={marqueeInnerRef}>
                    <div className="marquee__inner">{repeatedMarqueeContent}</div>
                </div>
            </div>
        </div>
    );
};

export default FlowingMenu;

// Note: this is also needed
// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       translate: {
//         '101': '101%',
//       },
//       keyframes: {
//         marquee: {
//           'from': { transform: 'translateX(0%)' },
//           'to': { transform: 'translateX(-50%)' }
//         }
//       },
//       animation: {
//         marquee: 'marquee 15s linear infinite'
//       }
//     }
//   },
//   plugins: [],
// };
