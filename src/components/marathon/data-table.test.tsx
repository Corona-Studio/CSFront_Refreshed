// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { DataTable, type DataTableColumn } from "./data-table";

afterEach(cleanup);
const rows = [
    { id: "c", name: "Charlie" },
    { id: "a", name: "Alpha" },
    { id: "b", name: "Bravo" }
];
const columns: DataTableColumn<(typeof rows)[number]>[] = [
    { colKey: "name", title: "Name", sorter: (a, b) => a.name.localeCompare(b.name) }
];
function LocalTable() {
    const [page, setPage] = useState({ current: 1, pageSize: 2 });
    return (
        <DataTable data={rows} rowKey="id" columns={columns} pagination={{ ...page, total: 3, onChange: setPage }} />
    );
}
describe("Marathon tables", () => {
    it("paginates local rows and preserves sorting across pages", async () => {
        const user = userEvent.setup();
        render(<LocalTable />);
        expect(screen.queryByText("Bravo")).toBeNull();
        await user.click(screen.getByRole("button", { name: "Name" }));
        expect(screen.queryByText("Charlie")).toBeNull();
        expect(screen.getByText("Alpha")).toBeTruthy();
        await user.click(screen.getByRole("button", { name: "下一页" }));
        expect(screen.getByText("Charlie")).toBeTruthy();
        expect(screen.queryByText("Alpha")).toBeNull();
        expect(screen.getByRole("columnheader").getAttribute("aria-sort")).toBe("ascending");
    });
    it("does not slice an already paginated API response on later pages", () => {
        render(
            <DataTable
                data={[{ id: "40", name: "Page three" }]}
                rowKey="id"
                columns={columns}
                pagination={{ current: 3, pageSize: 20, total: 41, onChange: () => {} }}
            />
        );
        expect(screen.getByText("Page three")).toBeTruthy();
    });
    it("announces an empty result and disables pagination while loading", () => {
        const { rerender } = render(<DataTable data={[]} rowKey="id" columns={columns} empty="No matching records" />);
        expect(screen.getByText("No matching records")).toBeTruthy();
        rerender(
            <DataTable
                data={[]}
                rowKey="id"
                columns={columns}
                loading
                pagination={{ current: 1, pageSize: 20, total: 41, onChange: () => {} }}
            />
        );
        expect(screen.getByRole("button", { name: "下一页" })).toHaveProperty("disabled", true);
    });
});
