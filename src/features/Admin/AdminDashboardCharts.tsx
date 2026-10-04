"use client";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scalePoint } from "@visx/scale";
import { Bar, LinePath, Pie } from "@visx/shape";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip.tsx";
import { Card } from "../../components/marathon/index.tsx";
import type { AdminDashboardOverview, DashboardDistribution, DashboardLoginDay } from "../../requests/AdminRequests.ts";
import styles from "./AdminHome.module.css";

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const accountColors = [colors[0], colors[2]];
const labelColor = "var(--muted-foreground)";

function ChartTooltip({ children, content }: { children: ReactElement; content: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent sideOffset={8}>{content}</TooltipContent>
        </Tooltip>
    );
}

function LoginTrend({
    data,
    width,
    title,
    single = false,
    hourly = false
}: {
    data: DashboardLoginDay[];
    width: number;
    title?: string;
    single?: boolean;
    hourly?: boolean;
}) {
    const { t } = useTranslation();
    const succeededLabel = single ? t("dashboardAcceptedContributions") : t("dashboardSucceeded");
    const keys = single ? (["succeeded"] as const) : (["succeeded", "failed"] as const);
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
            <svg width={width} height={250} role="img" aria-label={title ?? t("dashboardLoginTrend")}>
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
                    tickFormat={(value) => (hourly ? String(value) : String(value).slice(5))}
                    tickLabelProps={() => ({ fill: labelColor, fontSize: 11, textAnchor: "middle" })}
                />
                {keys.map((key, i) => (
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
                            <ChartTooltip
                                key={d.date}
                                content={`${d.date} · ${succeededLabel}: ${d.succeeded}${single ? "" : ` · ${t("dashboardFailed")}: ${d.failed}`}`}>
                                <circle
                                    cx={x(d.date)}
                                    cy={y(d[key])}
                                    r={data.length > 30 ? 3 : 4}
                                    fill={colors[i]}
                                    stroke="var(--card)"
                                    strokeWidth={1.5}
                                    tabIndex={0}
                                    aria-label={`${d.date} ${i === 0 ? succeededLabel : t("dashboardFailed")}: ${d[key]}`}
                                />
                            </ChartTooltip>
                        ))}
                    </g>
                ))}
            </svg>
            <div className={styles.chartReadout} aria-live="polite">
                <span>
                    {succeededLabel} <i style={{ background: colors[0] }} />
                    {!single && (
                        <>
                            {" "}
                            &nbsp; {t("dashboardFailed")} <i style={{ background: colors[1] }} />
                        </>
                    )}
                </span>
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
                    <ChartTooltip content={`${d.key}: ${d.count.toLocaleString()}`}>
                        <g tabIndex={0} aria-label={`${d.key}: ${d.count}`}>
                            <Bar
                                x={labelWidth}
                                y={y(d.key)}
                                width={x(d.count)}
                                height={y.bandwidth()}
                                rx={0}
                                fill={colors[i % colors.length]}
                            />
                        </g>
                    </ChartTooltip>
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
    const metrics = Object.fromEntries(data.metrics.map((d) => [d.key, d.count]));
    const verified = metrics.qqVerified ?? 0;
    const published = metrics.publishedBuilds ?? 0;
    const totalBuilds = runtimes.reduce((sum, d) => sum + d.count, 0);
    const verification = [
        { key: t("dashboardQqVerified"), count: verified },
        { key: t("dashboardUnverified"), count: Math.max(0, (metrics.users ?? 0) - verified) }
    ];
    const publication = [
        { key: t("dashboardPublishedBuilds"), count: published },
        { key: t("dashboardUnpublished"), count: Math.max(0, totalBuilds - published) }
    ];
    const total = accounts.reduce((sum, d) => sum + d.count, 0);
    const attempts = data.loginTrend.reduce((sum, d) => sum + d.succeeded + d.failed, 0);
    const succeeded = data.loginTrend.reduce((sum, d) => sum + d.succeeded, 0);
    return (
        <div className={styles.chartsGrid}>
            <Card bordered={false} title={t("dashboardLoginTrend")} subtitle={t("dashboardLoginNote")}>
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
                                            <ChartTooltip
                                                key={arc.data.key}
                                                content={`${arc.data.key}: ${arc.data.count.toLocaleString()} (${((arc.data.count / total) * 100).toFixed(1)}%)`}>
                                                <path
                                                    tabIndex={0}
                                                    aria-label={`${arc.data.key}: ${arc.data.count}`}
                                                    d={pie.path(arc) ?? ""}
                                                    fill={accountColors[i % accountColors.length]}
                                                />
                                            </ChartTooltip>
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
                { title: t("dashboardPending"), note: t("dashboardPendingNote"), values: pending },
                { title: t("dashboardVerification"), note: t("dashboardAllTime"), values: verification },
                { title: t("dashboardPublication"), note: t("dashboardBuildNote"), values: publication }
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
            {[
                ...(data.loginHours
                    ? [
                          {
                              title: t("dashboardLoginHours"),
                              note: t("dashboardLoginHoursNote"),
                              hourly: true,
                              single: false,
                              values: data.loginHours.map((d) => ({
                                  date: `${String(d.hour).padStart(2, "0")}:00`,
                                  succeeded: d.succeeded,
                                  failed: d.failed
                              }))
                          }
                      ]
                    : []),
                ...(data.acceptedContributionTrend
                    ? [
                          {
                              title: t("dashboardContributionTrend"),
                              note: t("dashboardContributionTrendNote"),
                              hourly: false,
                              single: true,
                              values: data.acceptedContributionTrend.map((d) => ({
                                  date: d.date,
                                  succeeded: d.count,
                                  failed: 0
                              }))
                          }
                      ]
                    : [])
            ].map((chart) => (
                <Card key={chart.title} bordered={false} title={chart.title} subtitle={chart.note}>
                    <div className={styles.trendCanvas}>
                        <ParentSize>
                            {({ width }) =>
                                width > 0 && (
                                    <LoginTrend
                                        data={chart.values}
                                        width={width}
                                        title={chart.title}
                                        single={chart.single}
                                        hourly={chart.hourly}
                                    />
                                )
                            }
                        </ParentSize>
                    </div>
                    <details className={styles.chartDetails}>
                        <summary>{t("dashboardViewData")}</summary>
                        <div className={styles.tableScroll}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t(chart.hourly ? "dashboardHour" : "dashboardDate")}</th>
                                        <th>
                                            {t(chart.single ? "dashboardAcceptedContributions" : "dashboardSucceeded")}
                                        </th>
                                        {!chart.single && <th>{t("dashboardFailed")}</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {chart.values.map((d) => (
                                        <tr key={d.date}>
                                            <td>{d.date}</td>
                                            <td>{d.succeeded}</td>
                                            {!chart.single && <td>{d.failed}</td>}
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
