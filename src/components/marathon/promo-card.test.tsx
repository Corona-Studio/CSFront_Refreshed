// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import PromoCard from "./promo-card";

const props = { title: "Promotion", description: "Details", href: "https://example.com", actionLabel: "Visit" };

describe("promotion images", () => {
    it("keeps configurable external sponsor images working without an image-host allowlist", () => {
        const html = renderToStaticMarkup(<PromoCard {...props} image="https://sponsor.example/banner.webp" />);
        expect(html).toContain('src="https://sponsor.example/banner.webp"');
        expect(html).not.toContain("/_next/image");
    });

    it("optimizes local promotion assets with responsive image sizes", () => {
        const html = renderToStaticMarkup(<PromoCard {...props} image="/assets/lx/LauncherX_Poster.webp" />);
        expect(html).toContain("/_next/image?");
        expect(html).toContain('sizes="(min-width: 1024px) 50vw, 100vw"');
    });
});
