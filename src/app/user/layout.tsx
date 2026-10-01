import ConsoleShell from "@/components/marathon/console-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <ConsoleShell>{children}</ConsoleShell>;
}
