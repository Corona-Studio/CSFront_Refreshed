// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import InfiniteScroll from "./InfiniteScroll";

vi.mock("gsap", () => ({ gsap: { registerPlugin: vi.fn(), utils: { toArray: () => [] } } }));
vi.mock("gsap/Observer", () => ({ Observer: {} }));
afterEach(cleanup);

it("keeps dimensions local when multiple scroll instances are mounted", () => {
    const { container } = render(
        <>
            <InfiniteScroll
                width="20rem"
                maxHeight="300px"
                itemMinHeight={120}
                negativeMargin="-4px"
                items={[{ content: "First" }]}
            />
            <InfiniteScroll
                width="40rem"
                maxHeight="600px"
                itemMinHeight={240}
                negativeMargin="-8px"
                items={[{ content: "Second" }]}
            />
        </>
    );
    const [first, second] = Array.from(container.children) as HTMLElement[];
    expect(first.style.maxHeight).toBe("300px");
    expect(second.style.maxHeight).toBe("600px");
    const firstList = first.firstElementChild as HTMLElement;
    const secondList = second.firstElementChild as HTMLElement;
    expect(firstList.style.width).toBe("20rem");
    expect(secondList.style.width).toBe("40rem");
    expect((firstList.firstElementChild as HTMLElement).style.height).toBe("120px");
    expect((secondList.firstElementChild as HTMLElement).style.marginTop).toBe("-8px");
    expect(container.querySelector("style")).toBeNull();
});
