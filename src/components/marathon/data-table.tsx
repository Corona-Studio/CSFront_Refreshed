"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button, Select } from "./controls";
import { Loading } from "./layout";

export interface DataTableColumn<T> {
    colKey: string;
    title?: ReactNode;
    width?: number | string;
    fixed?: string;
    align?: "left" | "center" | "right";
    cell?: ((context: { row: T; rowIndex: number }) => ReactNode) | string;
    ellipsis?: boolean;
    sorter?: (left: T, right: T) => number;
}
export interface Pagination {
    current: number;
    pageSize: number;
    total: number;
    pageSizeOptions?: number[];
    showPageSize?: boolean;
    showJumper?: boolean;
    onChange: (page: { current: number; pageSize: number }) => void;
}
export interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    rowKey: keyof T | string;
    loading?: boolean;
    empty?: ReactNode;
    pagination?: Pagination;
    className?: string;
    tableLayout?: "fixed" | "auto";
    hover?: boolean;
    stripe?: boolean;
    bordered?: boolean;
}
export function DataTable<T>({
    data,
    columns,
    rowKey,
    loading,
    empty,
    pagination,
    className,
    tableLayout
}: DataTableProps<T>) {
    const [sort, setSort] = useState<{ key: string; direction: 1 | -1 }>();
    const sorter = columns.find((col) => col.colKey === sort?.key)?.sorter;
    const sorted = sorter && sort ? [...data].sort((a, b) => sort.direction * sorter(a, b)) : data;
    const pages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;
    const current = pagination ? Math.min(pagination.current, pages) : 1;
    // Local lists are sliced here; API-paginated lists are already one page.
    const rows =
        pagination && data.length === pagination.total
            ? sorted.slice((current - 1) * pagination.pageSize, current * pagination.pageSize)
            : sorted;
    return (
        <div className={cn("min-w-0", className)} aria-busy={loading}>
            <Table className="m-table" style={{ tableLayout }}>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead
                                key={col.colKey}
                                style={{ width: col.width, textAlign: col.align }}
                                aria-sort={
                                    col.sorter
                                        ? sort?.key === col.colKey
                                            ? sort.direction === 1
                                                ? "ascending"
                                                : "descending"
                                            : "none"
                                        : undefined
                                }>
                                {col.sorter ? (
                                    <button
                                        className="flex gap-2"
                                        onClick={() =>
                                            setSort({
                                                key: col.colKey,
                                                direction: sort?.key === col.colKey && sort.direction === 1 ? -1 : 1
                                            })
                                        }>
                                        {col.title}
                                        <span aria-hidden="true">↕</span>
                                    </button>
                                ) : (
                                    col.title
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length}>
                                <Loading />
                            </TableCell>
                        </TableRow>
                    ) : rows.length ? (
                        rows.map((row, index) => (
                            <TableRow key={String((row as Record<string, unknown>)[String(rowKey)] ?? index)}>
                                {columns.map((col) => (
                                    <TableCell key={col.colKey} style={{ textAlign: col.align }}>
                                        {typeof col.cell === "function"
                                            ? col.cell({ row, rowIndex: index })
                                            : String(
                                                  (row as Record<string, unknown>)[
                                                      typeof col.cell === "string" ? col.cell : col.colKey
                                                  ] ?? ""
                                              )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                                {empty ?? "暂无数据 / NO DATA"}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {pagination && (
                <nav className="m-pagination" aria-label="分页">
                    <span className="m-kicker">
                        {pagination.total} ITEMS · {current} / {pages}
                    </span>
                    {pagination.showPageSize && (
                        <Select
                            className="w-28 font-mono text-xs"
                            size="small"
                            ariaLabel="每页条数"
                            value={pagination.pageSize}
                            disabled={loading}
                            onChange={(value) => pagination.onChange({ current: 1, pageSize: Number(value) })}
                            options={(pagination.pageSizeOptions ?? [10, 20, 50]).map((size) => ({
                                value: size,
                                label: `${size} / PAGE`
                            }))}
                        />
                    )}
                    <Button
                        variant="outline"
                        theme="default"
                        size="small"
                        aria-label="上一页"
                        disabled={current <= 1 || loading}
                        onClick={() => pagination.onChange({ current: current - 1, pageSize: pagination.pageSize })}>
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        theme="default"
                        size="small"
                        aria-label="下一页"
                        disabled={current >= pages || loading}
                        onClick={() => pagination.onChange({ current: current + 1, pageSize: pagination.pageSize })}>
                        <ChevronRight className="size-4" />
                    </Button>
                </nav>
            )}
        </div>
    );
}
