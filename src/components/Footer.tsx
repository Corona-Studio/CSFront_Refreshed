export default function Footer() {
    const currentYear = new Date().getFullYear();
    const linkClassName = "opacity-75 transition-opacity hover:opacity-100 focus-visible:opacity-100";

    return (
        <footer
            className="mt-auto border-t border-zinc-200 bg-zinc-100 px-4 py-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 sm:px-6"
            id="footer">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <p>2016 - {currentYear} © Corona Studio | 日冕工作室保留对其提供的一切内容的解释权.</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <a className={linkClassName} href="#">
                            蜀ICP备 -号
                        </a>
                        <a className={linkClassName} href="#">
                            蜀公网安备 -号
                        </a>
                        <a
                            className={linkClassName}
                            href="https://www.12377.cn"
                            target="_blank"
                            rel="noopener noreferrer">
                            违法和不良信息举报(中国)
                        </a>
                    </div>
                </div>
                <a
                    className={`${linkClassName} shrink-0 underline underline-offset-4`}
                    href="https://csss.vot.moe"
                    target="_blank"
                    rel="noopener noreferrer">
                    Service Status
                </a>
            </div>
        </footer>
    );
}
