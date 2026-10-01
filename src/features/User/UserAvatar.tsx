"use client";
import { type ChangeEvent, type PointerEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Alert, Button, Loading, notify } from "../../components/marathon/index.tsx";
import { type CropPosition, exportAvatar, getAvatarCrop } from "../../helpers/AvatarCropHelper.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { useNavigate } from "../../lib/navigation.ts";
import { isSuccessfulResponse } from "../../requests/ApiConstants.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import { uploadUserAvatarAsync } from "../../requests/LxUserRequests.ts";
import styles from "./UserAvatar.module.css";

function UserAvatar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const input = useRef<HTMLInputElement>(null);
    const image = useRef<HTMLImageElement>(null);
    const selection = useRef(0);
    const drag = useRef<{ x: number; y: number; position: CropPosition } | null>(null);
    const [source, setSource] = useState("");
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [position, setPosition] = useState<CropPosition>({ x: 0.5, y: 0.5 });
    const [zoom, setZoom] = useState(1);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [decoding, setDecoding] = useState(false);
    const ready = dimensions.width > 0;
    const crop = ready ? getAvatarCrop(dimensions.width, dimensions.height, zoom, position) : null;

    useEffect(
        () => () => {
            if (source) URL.revokeObjectURL(source);
        },
        [source]
    );
    useEffect(
        () => () => {
            selection.current++;
        },
        []
    );

    async function selectFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        const request = ++selection.current;
        setError("");
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
            setError(t("avatarInvalidFile"));
            return;
        }
        setDecoding(true);
        const url = URL.createObjectURL(file);
        const candidate = new Image();
        candidate.src = url;
        try {
            await candidate.decode();
            if (request !== selection.current) {
                URL.revokeObjectURL(url);
                return;
            }
            image.current = candidate;
            setSource(url);
            setDimensions({ width: candidate.naturalWidth, height: candidate.naturalHeight });
            setPosition({ x: 0.5, y: 0.5 });
            setZoom(1);
        } catch {
            URL.revokeObjectURL(url);
            if (request === selection.current) setError(t("avatarInvalidFile"));
        } finally {
            if (request === selection.current) setDecoding(false);
        }
    }

    function move(event: PointerEvent<HTMLDivElement>) {
        if (!drag.current || !crop || saving) return;
        const width = event.currentTarget.getBoundingClientRect().width;
        const next = getAvatarCrop(dimensions.width, dimensions.height, zoom, {
            x: drag.current.position.x - ((event.clientX - drag.current.x) * crop.size) / width / dimensions.width,
            y: drag.current.position.y - ((event.clientY - drag.current.y) * crop.size) / width / dimensions.height
        });
        setPosition(next.center);
    }

    async function save() {
        if (!image.current || !ready || saving || decoding) return;
        setSaving(true);
        setError("");
        try {
            const token = await getStorageItemAsync(StoredAuthToken);
            if (!token) {
                navigate("/auth/login?redirect=/user/avatar");
                return;
            }
            const blob = await exportAvatar(image.current, zoom, position);
            const response = await uploadUserAvatarAsync(blob, token);
            if (response.status === 401) {
                navigate("/auth/login?redirect=/user/avatar");
                return;
            }
            if (!isSuccessfulResponse(response)) {
                throw new Error(t("avatarUploadFailed"));
            }
            void notify.success({ title: t("avatarUpdated"), duration: 3000, placement: "top-right" });
            navigate("/user", { replace: true });
        } catch {
            setError(t("avatarUploadFailed"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className={styles.page}>
            <h2>{t("changeAvatar")}</h2>
            <p className={styles.description}>{t("avatarCropDescription")}</p>
            <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={selectFile} />
            <Button variant="outline" disabled={saving || decoding} onClick={() => input.current?.click()}>
                {source ? t("avatarReselect") : t("avatarSelect")}
            </Button>
            <p className={styles.description}>{t("avatarFileHint")}</p>
            {error && <Alert theme="error" message={error} />}
            {decoding && <Loading />}
            {crop && (
                <div className={styles.editor}>
                    <div className={styles.controls}>
                        <div
                            className={styles.crop}
                            tabIndex={0}
                            role="group"
                            aria-label={t("avatarCropArea")}
                            onPointerDown={(event) => {
                                if (saving) return;
                                event.currentTarget.setPointerCapture(event.pointerId);
                                drag.current = { x: event.clientX, y: event.clientY, position: crop.center };
                            }}
                            onPointerMove={move}
                            onPointerUp={() => {
                                drag.current = null;
                            }}
                            onPointerCancel={() => {
                                drag.current = null;
                            }}
                            onKeyDown={(event) => {
                                const shifts: Record<string, [number, number]> = {
                                    ArrowLeft: [-1, 0],
                                    ArrowRight: [1, 0],
                                    ArrowUp: [0, -1],
                                    ArrowDown: [0, 1]
                                };
                                const shift = shifts[event.key];
                                if (!shift || saving) return;
                                event.preventDefault();
                                setPosition(
                                    getAvatarCrop(dimensions.width, dimensions.height, zoom, {
                                        x: crop.center.x + (shift[0] * crop.size * 0.05) / dimensions.width,
                                        y: crop.center.y + (shift[1] * crop.size * 0.05) / dimensions.height
                                    }).center
                                );
                            }}>
                            <img
                                src={source}
                                alt={t("avatarCropArea")}
                                draggable={false}
                                style={{
                                    width: `${(dimensions.width / crop.size) * 100}%`,
                                    height: `${(dimensions.height / crop.size) * 100}%`,
                                    left: `${(-crop.x / crop.size) * 100}%`,
                                    top: `${(-crop.y / crop.size) * 100}%`
                                }}
                            />
                            <span className={styles.grid} aria-hidden="true" />
                        </div>
                        <label className={styles.zoom}>
                            <span>{t("avatarZoom")}</span>
                            <input
                                type="range"
                                min="1"
                                max="4"
                                step="0.01"
                                value={zoom}
                                disabled={saving || decoding}
                                onChange={(event) => {
                                    setPosition(crop.center);
                                    setZoom(Number(event.target.value));
                                }}
                            />
                        </label>
                        <Button
                            variant="text"
                            disabled={saving || decoding}
                            onClick={() => {
                                setPosition({ x: 0.5, y: 0.5 });
                                setZoom(1);
                            }}>
                            {t("avatarReset")}
                        </Button>
                    </div>
                    <div className={styles.previewPanel}>
                        <h3>{t("avatarPreview")}</h3>
                        <div className={styles.preview}>
                            <img
                                src={source}
                                alt={t("avatarPreview")}
                                style={{
                                    width: `${(dimensions.width / crop.size) * 100}%`,
                                    height: `${(dimensions.height / crop.size) * 100}%`,
                                    left: `${(-crop.x / crop.size) * 100}%`,
                                    top: `${(-crop.y / crop.size) * 100}%`
                                }}
                            />
                        </div>
                        <p className={styles.description}>{t("avatarOutputHint")}</p>
                    </div>
                </div>
            )}
            <div className={styles.actions}>
                <Button variant="outline" disabled={saving} onClick={() => navigate("/user")}>
                    {t("avatarCancel")}
                </Button>
                <Button theme="primary" loading={saving} disabled={!ready || decoding} onClick={save}>
                    {t("avatarSave")}
                </Button>
            </div>
        </section>
    );
}

export const Component = UserAvatar;
