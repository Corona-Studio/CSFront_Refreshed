import ConsoleShell from "@/components/marathon/console-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <ConsoleShell admin>{children}</ConsoleShell>;
}
