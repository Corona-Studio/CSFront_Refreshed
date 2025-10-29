import { CSSProperties, useEffect } from "react";

export default function Footer() {
    const sty1: CSSProperties = {
        fontSize: "small",
        fontStyle: "italic",
        fontWeight: 390
    },
        sty2: CSSProperties = {
            textDecoration: "underline",
            fontSize: "small",
            color: "var(--mud-palette-text-primary)"
        };

    useEffect(() => {
        (document.querySelector("#wrapper") as HTMLElement).style.marginBottom =
            `${(document.querySelector("#footer") as HTMLElement).offsetHeight + 15}px`;
        // 不是本来有个跟随窗口resize刷新吗
    });

    return (
        <>
            <div className="p-3 w-screen fixed -z-10 left-0 right-0 bottom-0 text-black dark:text-white " id="footer">
                <div className="grow">
                    <p className="">
                        2016 - 2025 © Corona Studio |
                        <span style={sty1}>
                            日冕工作室保留对其提供的一切内容的解释权.
                        </span>
                    </p>
                    <i >
                        <a className=" opacity-75 hover:opacity-80 active:opacity-95" href="#">
                            <span >蜀ICP备 -号</span>
                        </a>
                    </i>
                    <span className="mx-1">
                        |
                    </span>
                    <i >
                        <a className=" opacity-75 hover:opacity-80 active:opacity-95" href="#">
                            <span >蜀公网安备 -号</span>
                        </a>
                    </i>
                    <br />
                    <a

                        className=" opacity-75 hover:opacity-80 active:opacity-95"
                        href="https://www.12377.cn"
                        target="_blank">
                        <i style={sty2}>
                            违法和不良信息举报(中国)
                        </i>
                    </a>
                </div>
                <div className="h-full relative">
                    <div className="p-3 pb-0 pl-0 bottom-0 right-1 absolute">
                        <a

                            className=" opacity-75 hover:opacity-80 active:opacity-95 underline lg:text-base text-sm"
                            href="https://csss.vot.moe"
                            target="_blank">
                            Service Status
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
