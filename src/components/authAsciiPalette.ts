// Sample the site's semantic tokens once per theme change, outside animation frames.
export function readAuthAsciiPalette() {
    const styles = getComputedStyle(document.documentElement);
    const token = (name: string) => styles.getPropertyValue(name).trim();
    const mix = (from: string, to: string, amount: number) => {
        const channels = (hex: string) => [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
        const start = channels(from);
        const end = channels(to);
        return `#${start
            .map((value, index) =>
                Math.round(value + (end[index] - value) * amount)
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")}`;
    };
    const ink = token("--primary-ink");
    const primary = token("--primary");
    const muted = token("--muted-foreground");
    const dark = document.documentElement.getAttribute("theme-mode") === "dark";
    // Use the site's teal chart tone for depth and reserve amber for the flower tips.
    // Muted highlights keep the characters matte rather than appearing reflective.
    const teal = mix(token("--chart-1"), muted, 0.3);
    const gold = dark ? mix(primary, muted, 0.3) : mix(primary, ink, 0.6);
    const highlight = mix(gold, muted, dark ? 0.65 : 0.45);
    // The broad fluid surface stays cool; amber is reserved for the account UI and seed tips.
    const slate = mix(token("--chart-3"), muted, 0.35);
    const stops = [mix(slate, muted, 0.3), slate, mix(slate, teal, 0.6), teal, mix(teal, muted, dark ? 0.55 : 0.3)];
    return {
        field: mix(muted, teal, 0.2),
        stem: teal,
        petal: gold,
        highlight,
        accent: mix(gold, ink, 0.25),
        ramp: Array.from({ length: 64 }, (_, index) => {
            const position = (index / 63) * (stops.length - 1);
            const left = Math.min(stops.length - 2, Math.floor(position));
            return mix(stops[left], stops[left + 1], position - left);
        })
    };
}

export function observeAuthAsciiTheme(update: () => void) {
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["theme-mode"] });
    return () => observer.disconnect();
}
