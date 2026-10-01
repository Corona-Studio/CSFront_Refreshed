"use client";
import { useTranslation } from "react-i18next";

export default function AllowedChars() {
    const { t } = useTranslation();

    return (
        <div className=" p-1.5">
            <p className=" ">{t("onlyAllowedChars")}</p>
            <div className="w-full flex flex-wrap gap-1 select-none my-0.5">
                <div>
                    <code>#</code>
                </div>
                <div>
                    <code>?</code>
                </div>
                <div>
                    <code>!</code>
                </div>
                <div>
                    <code>@</code>
                </div>
                <div>
                    <code>$</code>
                </div>
                <div>
                    <code>%</code>
                </div>
                <div>
                    <code>^</code>
                </div>
                <div>
                    <code>&</code>
                </div>
                <div>
                    <code>*</code>
                </div>
                <div>
                    <code>-</code>
                </div>
                <div>
                    <code>_</code>
                </div>
            </div>
        </div>
    );
}
