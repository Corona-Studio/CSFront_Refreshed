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
            `${(document.querySelector("#footer") as HTMLElement).offsetHeight + 10}px`;
    });

    return (
        <>
            <div
                className="p-3 w-screen fixed -z-10 left-0 right-0 bottom-0 text-black dark:text-white"
                id="footer">
                <div data-v-5b7f1ebd="" className="grow">
                    <p data-v-5b7f1ebd="" className="">
                        2016 - 2025 © Corona Studio |
                        <span data-v-5b7f1ebd="" style={sty1}>
                            日冕工作室保留对其提供的一切内容的解释权.
                        </span>
                    </p>
                    <i data-v-5b7f1ebd="">
                        <a
                            data-v-5b7f1ebd=""
                            className=" opacity-75 hover:opacity-80 active:opacity-95"
                            href="#">
                            <span data-v-5b7f1ebd="">蜀ICP备 -号</span>
                        </a>
                    </i>
                    <span data-v-5b7f1ebd="" className="mx-1">
                        |
                    </span>
                    <i data-v-5b7f1ebd="">
                        <a
                            data-v-5b7f1ebd=""
                            className=" opacity-75 hover:opacity-80 active:opacity-95"
                            href="#">
                            <span data-v-5b7f1ebd="">蜀公网安备 -号</span>
                        </a>
                    </i>
                    <br />
                    <a
                        data-v-5b7f1ebd=""
                        className=" opacity-75 hover:opacity-80 active:opacity-95"
                        href="https://www.12377.cn"
                        target="_blank">
                        <i data-v-5b7f1ebd="" style={sty2}>
                            违法和不良信息举报(中国)
                        </i>
                    </a>
                </div>
            </div>
        </>
    );
}
