"use client";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scalePoint } from "@visx/scale";
import { Bar, LinePath, Pie } from "@visx/shape";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Card } from "../../components/marathon/index.tsx";
import type { AdminDashboardOverview, DashboardDistribution, DashboardLoginDay } from "../../requests/AdminRequests.ts";
import styles from "./AdminHome.module.css";

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const accountColors = [colors[0], colors[2]];
const labelColor = "var(--muted-foreground)";

function LoginTrend({ data, width }: { data: DashboardLoginDay[]; width: number }) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<DashboardLoginDay>();
    const left = 44;
    const right = Math.max(left + 1, width - 18);
    const bottom = 214;
    const x = scalePoint({ domain: data.map((d) => d.date), range: [left, right] });
    const y = scaleLinear({
        domain: [0, Math.max(1, ...data.flatMap((d) => [d.succeeded, d.failed]))],
        range: [bottom, 16],
        nice: true
    });
    const ticks = data
        .filter((_, i) => i % Math.max(1, Math.ceil(data.length / (width < 450 ? 3 : 6))) === 0)
        .map((d) => d.date);
    return (
        <>
            <svg width={width} height={250} role="img" aria-label={t("dashboardLoginTrend")}>
                {y.ticks(4).map((value) => (
                    <line
                        key={value}
                        x1={left}
                        x2={right}
                        y1={y(value)}
                        y2={y(value)}
                        stroke="var(--chart-grid)"
                        strokeDasharray="3 4"
                    />
                ))}
                <AxisLeft
                    scale={y}
                    left={left}
                    numTicks={4}
                    hideAxisLine
                    hideTicks
                    tickFormat={(value) => (Number.isInteger(Number(value)) ? String(value) : "")}
                    tickLabelProps={() => ({ fill: labelColor, fontSize: 11, textAnchor: "end", dy: "0.3em" })}
                />
                <AxisBottom
                    scale={x}
                    top={bottom}
                    tickValues={ticks}
                    hideAxisLine
                    hideTicks
                    tickFormat={(value) => String(value).slice(5)}
                    tickLabelProps={() => ({ fill: labelColor, fontSize: 11, textAnchor: "middle" })}
                />
                {(["succeeded", "failed"] as const).map((key, i) => (
                    <g key={key}>
                        <LinePath
                            data={data}
                            x={(d) => x(d.date) ?? left}
                            y={(d) => y(d[key])}
                            stroke={colors[i]}
                            strokeWidth={2.5}
                            strokeDasharray={key === "failed" ? "6 4" : undefined}
                        />
                        {data.map((d) => (
                            <circle
                                key={d.date}
                                cx={x(d.date)}
                                cy={y(d[key])}
                                r={data.length > 30 ? 3 : 4}
                                fill={colors[i]}
                                stroke="var(--card)"
                                strokeWidth={1.5}
                                tabIndex={0}
                                aria-label={`${d.date} ${t(i === 0 ? "dashboardSucceeded" : "dashboardFailed")}: ${d[key]}`}
                                onMouseEnter={() => setSelected(d)}
                                onFocus={() => setSelected(d)}
                                onMouseLeave={() => setSelected(undefined)}
                                onBlur={() => setSelected(undefined)}>
                                <title>{`${d.date}: ${d[key]}`}</title>
                            </circle>
                        ))}
                    </g>
                ))}
            </svg>
            <div className={styles.chartReadout} aria-live="polite">
                {selected ? (
                    `${selected.date} · ${t("dashboardSucceeded")} ${selected.succeeded} · ${t("dashboardFailed")} ${selected.failed}`
                ) : (
                    <span>
                        {t("dashboardSucceeded")} <i style={{ background: colors[0] }} /> &nbsp; {t("dashboardFailed")}{" "}
                        <i style={{ background: colors[1] }} />
                    </span>
                )}
            </div>
        </>
    );
}

function DistributionBars({ data, width, title }: { data: DashboardDistribution[]; width: number; title: string }) {
    const { t } = useTranslation();
    const height = Math.max(150, data.length * 38 + 20);
    const labelWidth = Math.min(125, width * 0.36);
    const x = scaleLinear({
        domain: [0, Math.max(1, ...data.map((d) => d.count))],
        range: [0, Math.max(1, width - labelWidth - 45)]
    });
    const y = scaleBand({ domain: data.map((d) => d.key), range: [10, height - 10], padding: 0.4 });
    if (!data.some((d) => d.count)) return <div className={styles.emptyChart}>{t("dashboardNoData")}</div>;
    return (
        <svg width={width} height={height} role="img" aria-label={title}>
            {data.map((d, i) => (
                <g key={d.key}>
                    <text
                        x={labelWidth - 10}
                        y={(y(d.key) ?? 0) + y.bandwidth() / 2}
                        fill={labelColor}
                        fontSize={12}
                        textAnchor="end"
                        dominantBaseline="middle">
                        {d.key.length > 16 ? `${d.key.slice(0, 15)}…` : d.key}
                        <title>{d.key}</title>
                    </text>
                    <Bar
                        x={labelWidth}
                        y={y(d.key)}
                        width={x(d.count)}
                        height={y.bandwidth()}
                        rx={0}
                        fill={colors[i % colors.length]}>
                        <title>{`${d.key}: ${d.count}`}</title>
                    </Bar>
                    <text
                        x={labelWidth + x(d.count) + 8}
                        y={(y(d.key) ?? 0) + y.bandwidth() / 2}
                        fill={labelColor}
                        fontSize={12}
                        dominantBaseline="middle">
                        {d.count.toLocaleString()}
                    </text>
                </g>
            ))}
        </svg>
    );
}

export default function AdminDashboardCharts({ data }: { data: AdminDashboardOverview }) {
    const { t } = useTranslation();
    const accounts = data.accountDistribution.map((d) => ({
        ...d,
        key: t(d.key === "sponsors" ? "dashboardSponsors" : "dashboardRegularUsers")
    }));
    const pending = data.pendingContributions.map((d) => ({
        ...d,
        key: t(
            (
                { translations: "dashboardTranslations", links: "dashboardLinks", tags: "dashboardTags" } as Record<
                    string,
                    string
                >
            )[d.key] ?? d.key
        )
    }));
    const runtimes = data.buildRuntimes.map((d) => ({ ...d, key: d.key || t("dashboardUnknown") }));
    const total = accounts.reduce((sum, d) => sum + d.count, 0);
    const attempts = data.loginTrend.reduce((sum, d) => sum + d.succeeded + d.failed, 0);
    const succeeded = data.loginTrend.reduce((sum, d) => sum + d.succeeded, 0);
    return (
        <div className={styles.chartsGrid}>
            <Card
                bordered={false}
                className={styles.trendCard}
                title={t("dashboardLoginTrend")}
                subtitle={t("dashboardLoginNote")}>
                <div className={styles.rate}>
                    {t("dashboardSuccessRate")}:{" "}
                    <strong>{attempts ? `${((succeeded / attempts) * 100).toFixed(1)}%` : "—"}</strong>
                </div>
                <div className={styles.trendCanvas}>
                    <ParentSize>
                        {({ width }) => width > 0 && <LoginTrend data={data.loginTrend} width={width} />}
                    </ParentSize>
                </div>
                <details className={styles.chartDetails}>
                    <summary>{t("dashboardViewData")}</summary>
                    <div className={styles.tableScroll}>
                        <table>
                            <thead>
                                <tr>
                                    <th>{t("dashboardDate")}</th>
                                    <th>{t("dashboardSucceeded")}</th>
                                    <th>{t("dashboardFailed")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.loginTrend.map((d) => (
                                    <tr key={d.date}>
                                        <td>{d.date}</td>
                                        <td>{d.succeeded}</td>
                                        <td>{d.failed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </details>
            </Card>
            <Card bordered={false} title={t("dashboardAccounts")} subtitle={t("dashboardAllTime")}>
                {total ? (
                    <div className={styles.donutWrap}>
                        <svg viewBox="0 0 220 220" role="img" aria-label={t("dashboardAccounts")}>
                            <g transform="translate(110,110)">
                                <Pie
                                    data={accounts}
                                    pieValue={(d) => d.count}
                                    outerRadius={95}
                                    innerRadius={72}
                                    padAngle={0.025}>
                                    {(pie) =>
                                        pie.arcs.map((arc, i) => (
                                            <path key={arc.data.key} d={pie.path(arc) ?? ""} fill={accountColors[i % accountColors.length]}>
                                                <title>{`${arc.data.key}: ${arc.data.count} (${((arc.data.count / total) * 100).toFixed(1)}%)`}</title>
                                            </path>
                                        ))
                                    }
                                </Pie>
                                <text textAnchor="middle" fill="var(--foreground)" fontSize={26} fontWeight={600}>
                                    {total.toLocaleString()}
                                </text>
                                <text y={24} textAnchor="middle" fill={labelColor} fontSize={12}>
                                    {t("dashboardUsers")}
                                </text>
                            </g>
                        </svg>
                    </div>
                ) : (
                    <div className={styles.emptyChart}>{t("dashboardNoData")}</div>
                )}
                <div className={styles.legend}>
                    {accounts.map((d, i) => (
                        <span key={d.key}>
                            <i style={{ background: accountColors[i % accountColors.length] }} />
                            {d.key}
                            <strong>
                                {d.count.toLocaleString()} · {total ? ((d.count / total) * 100).toFixed(1) : "0.0"}%
                            </strong>
                        </span>
                    ))}
                </div>
            </Card>
            {[
                { title: t("dashboardBuilds"), note: t("dashboardBuildNote"), values: runtimes },
                { title: t("dashboardPending"), note: t("dashboardPendingNote"), values: pending }
            ].map((chart) => (
                <Card key={chart.title} bordered={false} title={chart.title} subtitle={chart.note}>
                    <div style={{ height: Math.max(150, chart.values.length * 38 + 20) }}>
                        <ParentSize>
                            {({ width }) =>
                                width > 0 && <DistributionBars data={chart.values} width={width} title={chart.title} />
                            }
                        </ParentSize>
                    </div>
                    <details className={styles.chartDetails}>
                        <summary>{t("dashboardViewData")}</summary>
                        <div className={styles.tableScroll}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>{chart.title}</th>
                                        <th>{t("dashboardCount")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chart.values.map((d) => (
                                        <tr key={d.key}>
                                            <td>{d.key}</td>
                                            <td>{d.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                </Card>
            ))}
        </div>
    );
}
