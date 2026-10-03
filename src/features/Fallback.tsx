"use client";
import styles from "./Fallback.module.css";

interface FallbackProps {
    pathname?: string;
    embedded?: boolean;
}

function Bars({ count = 3 }: { count?: number }) {
    return (
        <div className={styles["page-skeleton-bars"]}>
            {Array.from({ length: count }, (_, index) => (
                <span key={index} />
            ))}
        </div>
    );
}

function Fallback({ pathname = "/", embedded = false }: FallbackProps) {
    const isAuth = pathname.startsWith("/auth/");
    const isManagement = /^\/(admin|user)(\/|$)/.test(pathname);
    const isTable =
        /^\/admin\/(builds|users|notifications|contributions)(\/|$)/.test(pathname) || pathname === "/user/device";
    const isDetail = /^\/admin\/contributions\//.test(pathname);
    const isSponsor = /\/sponsor$/.test(pathname);
    const isDownload = pathname.includes("/download");
    const isLanding = pathname === "/" || pathname === "/lx" || pathname === "/cmfs";
    const type = isDetail
        ? "detail"
        : isTable
          ? "table"
          : isSponsor
            ? "cards"
            : isManagement
              ? "dashboard"
              : isAuth
                ? "auth"
                : isDownload
                  ? "download"
                  : isLanding
                    ? "landing"
                    : "article";

    return (
        <div
            className={`${styles["page-skeleton"]} ${type === "auth" ? styles["page-skeleton--auth"] : ""} ${embedded ? styles["page-skeleton--embedded"] : ""}`}
            aria-busy="true"
            aria-label="页面加载中">
            {type === "auth" ? (
                <div className={styles["page-skeleton-auth-card"]}>
                    <div className={styles["page-skeleton-line"] + " " + styles["page-skeleton-line--title"]} />
                    <Bars count={4} />
                    <div className={styles["page-skeleton-line"] + " " + styles["page-skeleton-line--button"]} />
                </div>
            ) : type === "landing" ? (
                <>
                    <div className={styles["page-skeleton-hero"]}>
                        <div className={styles["page-skeleton-line"] + " " + styles["page-skeleton-line--title"]} />
                        <Bars count={2} />
                        <div className={styles["page-skeleton-line"] + " " + styles["page-skeleton-line--button"]} />
                    </div>
                    <div className={styles["page-skeleton-grid"]}>
                        {[0, 1, 2].map((item) => (
                            <div className={styles["page-skeleton-card"]} key={item}>
                                <div className={styles["page-skeleton-media"]} />
                                <Bars count={2} />
                            </div>
                        ))}
                    </div>
                </>
            ) : type === "table" ? (
                <>
                    <div className={styles["page-skeleton-toolbar"]}>
                        <div className={styles["page-skeleton-line"] + " " + styles["page-skeleton-line--wide"]} />
                        <div className={styles["page-skeleton-line"] + " " + styles["page-skeleton-line--button"]} />
                    </div>
                    <div className={styles["page-skeleton-table"]}>
                        <div className={styles["page-skeleton-table-head"]} />
                        {Array.from({ length: 6 }, (_, index) => (
                            <div className={styles["page-skeleton-table-row"]} key={index}>
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>
                        ))}
                    </div>
                </>
            ) : type === "dashboard" || type === "cards" ? (
                <>
                    <div className={styles["page-skeleton-grid"] + " " + styles["page-skeleton-grid--four"]}>
                        {[0, 1, 2, 3].map((item) => (
                            <div className={styles["page-skeleton-card"]} key={item}>
                                <div
                                    className={styles["page-skeleton-line"] + " " + styles["page-skeleton-line--short"]}
                                />
                                <Bars count={2} />
                            </div>
                        ))}
                    </div>
                    <div className={styles["page-skeleton-card"] + " " + styles["page-skeleton-card--large"]}>
                        <Bars count={4} />
                    </div>
                </>
            ) : (
                <>
                    <div className={styles["page-skeleton-card"] + " " + styles["page-skeleton-card--large"]}>
                        <div className={styles["page-skeleton-line"] + " " + styles["page-skeleton-line--title"]} />
                        <Bars count={type === "detail" ? 5 : 3} />
                        {type === "download" && (
                            <div
                                className={styles["page-skeleton-line"] + " " + styles["page-skeleton-line--button"]}
                            />
                        )}
                    </div>
                    {type === "detail" && (
                        <div className={styles["page-skeleton-card"]}>
                            <Bars count={3} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Fallback;
