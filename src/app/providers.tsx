"use client";
import MotionProvider from "@/components/motion/provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18NLangKey } from "@/helpers/StorageHelper";
import { applyTheme, getTheme, useTheme } from "@/helpers/ThemeDetector";
import i18n, { resources } from "@/i18n";
import localForage from "@/lib/storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Toaster } from "sonner";

function Preferences() {
    const theme = useTheme();
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);
    useEffect(() => {
        void localForage.removeItem("AUTH_PASSWORD");
        applyTheme(getTheme());
        const saved = localStorage.getItem(I18NLangKey);
        if (saved && saved in resources) void i18n.changeLanguage(saved);
        const sync = () => {
            document.documentElement.lang = i18n.language === "enUS" ? "en" : "zh-CN";
        };
        sync();
        i18n.on("languageChanged", sync);
        return () => {
            i18n.off("languageChanged", sync);
        };
    }, []);
    return (
        <Toaster
            richColors
            closeButton
            position="top-right"
            theme={theme}
            toastOptions={{ className: "rounded-none" }}
        />
    );
}
export default function Providers({ children }: { children: ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } }
            })
    );
    return (
        <I18nextProvider i18n={i18n}>
            <QueryClientProvider client={client}>
                <MotionProvider>
                    <TooltipProvider>
                        <Preferences />
                        {children}
                    </TooltipProvider>
                </MotionProvider>
            </QueryClientProvider>
        </I18nextProvider>
    );
}
