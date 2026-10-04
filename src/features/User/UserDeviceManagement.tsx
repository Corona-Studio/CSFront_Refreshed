"use client";
import { useQuery } from "@tanstack/react-query";
import { Copy, Monitor, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Alert, Button, Dialog, Empty, Loading, notify } from "../../components/marathon/index.tsx";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { isSuccessfulResponse } from "../../requests/ApiConstants.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import { UserDeviceInfo, getUserAllDevicesAsync, removeDeviceAsync } from "../../requests/LxUserRequests.ts";
import Constants from "./../../helpers/Constants.ts";
import styles from "./UserDeviceManagement.module.css";

function UserDeviceManagement() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<UserDeviceInfo | null>(null);

    async function getUserAllDevicesImplAsync() {
        const authToken = await getStorageItemAsync(StoredAuthToken);
        return await getUserAllDevicesAsync(authToken ?? "");
    }

    const devices = useQuery({
        queryKey: ["userDeviceList"],
        queryFn: () =>
            getUserAllDevicesImplAsync().then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (r.status === 404) throw new Error(t("userDeviceFetchFailedDescription"));
                if (!r.response) throw new Error(t("backendServerError"));

                return r.response;
            })
    });

    async function copyValueAsync(value: string, label: string) {
        try {
            await navigator.clipboard.writeText(value);
            await notify.success({ title: t("copied"), content: label });
        } catch {
            await notify.error({ title: t("deviceCopyFailed"), content: t("deviceCopyFailedDescription") });
        }
    }

    async function deleteDeviceAsync(device: UserDeviceInfo) {
        const authToken = await getStorageItemAsync(StoredAuthToken);

        if (!authToken || isLoading) return;

        setIsLoading(true);
        await removeDeviceAsync(device, authToken)
            .then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (r.status === 404) throw new Error(t("deviceRemoveFailedDescription"));
                if (!isSuccessfulResponse(r)) throw new Error(t("backendServerError"));

                await notify.success({
                    title: t("deviceRemoved"),
                    content: `${t("deviceRemoved")} - ${device.computerName}`,
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });

                setSelectedDevice(null);
                await devices.refetch();
            })
            .catch(async (error) => {
                await notify.error({
                    title: t("deviceRemoveFailed"),
                    content: (error as Error).message,
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
            })
            .finally(() => setIsLoading(false));
    }

    return (
        <section className={styles.page} aria-label={t("deviceManage")}>
            <div className={styles.toolbar}>
                <div>
                    <div className={styles.summary}>
                        <h2>{t("registeredDevices")}</h2>
                        {devices.data && <span className={styles.count}>{devices.data.length}</span>}
                    </div>
                    <p className={styles.description}>{t("deviceManageDescription")}</p>
                </div>
                <Button
                    theme="default"
                    variant="outline"
                    icon={<RefreshCw />}
                    loading={devices.isFetching}
                    disabled={isLoading}
                    onClick={() => void devices.refetch()}>
                    {t("refreshDevices")}
                </Button>
            </div>
            {devices.error && (
                <Alert
                    theme="error"
                    message={(devices.error as Error).message}
                    operation={
                        <Button variant="outline" onClick={() => void devices.refetch()}>
                            {t("retry")}
                        </Button>
                    }
                />
            )}
            {devices.isPending ? (
                <div className={styles.state}>
                    <Loading />
                </div>
            ) : devices.data && devices.data.length > 0 ? (
                <div className={styles.grid}>
                    {devices.data.map((device) => (
                        <article key={device.id} className={styles.card}>
                            <header className={styles.cardHeader}>
                                <span className={styles.deviceIcon}>
                                    <Monitor aria-hidden="true" />
                                </span>
                                <div className={styles.deviceHeading}>
                                    <p className={styles.eyebrow}>{t("registeredDevice")}</p>
                                    <h3>{device.computerName}</h3>
                                </div>
                            </header>
                            <dl className={styles.details}>
                                {[
                                    [t("deviceId"), device.id],
                                    [t("serialNumber"), device.mac]
                                ].map(([label, value]) => (
                                    <div key={label} className={styles.field}>
                                        <dt>{label}</dt>
                                        <dd>
                                            <code>{value}</code>
                                            <Button
                                                theme="default"
                                                variant="text"
                                                shape="square"
                                                className={styles.copyButton}
                                                icon={<Copy />}
                                                aria-label={`${t("copy")} ${label}: ${device.computerName}`}
                                                title={`${t("copy")} ${label}`}
                                                onClick={() => void copyValueAsync(value, label)}
                                            />
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                            <footer className={styles.cardFooter}>
                                <Button
                                    variant="text"
                                    size="small"
                                    className={styles.removeButton}
                                    disabled={isLoading}
                                    icon={<Trash2 />}
                                    aria-label={`${t("removeDevice")}: ${device.computerName}`}
                                    onClick={() => setSelectedDevice(device)}>
                                    {t("removeDevice")}
                                </Button>
                            </footer>
                        </article>
                    ))}
                </div>
            ) : !devices.isError ? (
                <div className={styles.state}>
                    <Empty description={t("noRegisteredDevices")} />
                </div>
            ) : null}
            <Dialog
                visible={selectedDevice !== null}
                header={t("confirmRemoveDevice")}
                theme="danger"
                confirmBtn={t("removeDevice")}
                confirmLoading={isLoading}
                onClose={() => setSelectedDevice(null)}
                onConfirm={() => (selectedDevice ? deleteDeviceAsync(selectedDevice) : undefined)}>
                <p className={styles.confirmName}>{selectedDevice?.computerName}</p>
                <p>{t("confirmRemoveDeviceDescription")}</p>
            </Dialog>
        </section>
    );
}

export const Component = () => UserDeviceManagement();
