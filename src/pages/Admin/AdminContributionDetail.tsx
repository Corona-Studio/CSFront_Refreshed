import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { DeleteIcon, LinkIcon, RollbackIcon, StarIcon, TranslateIcon, UserBlockedIcon } from "tdesign-icons-react";
import {
    Alert,
    Button,
    Card,
    Dialog,
    Input,
    NotificationPlugin,
    PrimaryTable,
    type PrimaryTableCol,
    Space,
    Tag,
    Textarea
} from "tdesign-react";

import Constants from "../../helpers/Constants.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import {
    type ThirdPartyInfoRatingRecord,
    type UserContributedLink,
    type UserContributedTag,
    type UserContributedTranslation,
    type UserContributionBase,
    acceptContributionAsync,
    banContributionUserAsync,
    deleteContributionItemAsync,
    getPendingContributionDetailAsync
} from "../../requests/AdminRequests.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import styles from "./AdminContributions.module.css";

type ContributionType = "translation" | "link" | "tag";

type PendingAction =
    | { kind: "delete"; contributionType: ContributionType; contributionId: string }
    | { kind: "ban"; userId: string; userName: string }
    | { kind: "accept" }
    | undefined;

interface ValidationErrors {
    translatedName?: string;
    link?: string;
    tags?: string;
}

async function getAdminTokenAsync() {
    return (await getStorageItemAsync(StoredAuthToken)) ?? "";
}

async function showSuccessAsync(title: string, content: string) {
    await NotificationPlugin.success({
        title,
        content,
        placement: "top-right",
        duration: 3000,
        offset: Constants.NotificationOffset,
        closeBtn: true,
        attach: () => document
    });
}

async function showErrorAsync(title: string, content: string) {
    await NotificationPlugin.error({
        title,
        content,
        placement: "top-right",
        duration: 4000,
        offset: Constants.NotificationOffset,
        closeBtn: true,
        attach: () => document
    });
}

function AdminContributionDetail() {
    const { resourceId = "" } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const initializedResourceId = useRef<string | undefined>(undefined);
    const [translatedName, setTranslatedName] = useState("");
    const [link, setLink] = useState("");
    const [tags, setTags] = useState("");
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [pendingAction, setPendingAction] = useState<PendingAction>();
    const [isMutating, setIsMutating] = useState(false);

    const detailQuery = useQuery({
        queryKey: ["adminContribution", resourceId],
        enabled: resourceId.length > 0,
        retry: false,
        queryFn: async () => {
            const response = await getPendingContributionDetailAsync(await getAdminTokenAsync(), resourceId);

            if (response?.status === 404) throw new Error(t("contributionNotFound"));
            if (!response || response.status !== 200 || !response.response)
                throw new Error(t("contributionDetailLoadFailedDescription"));

            return response.response;
        }
    });

    useEffect(() => {
        const detail = detailQuery.data;
        if (!detail || initializedResourceId.current === detail.resourceId) return;

        initializedResourceId.current = detail.resourceId;
        setTranslatedName(detail.translatedName ?? detail.translations[0]?.translatedName ?? "");
        setLink(detail.links.find((item) => item.link)?.link ?? "");
        setTags(
            [
                ...new Set(detail.tags.map((item) => item.value?.trim()).filter((value): value is string => !!value))
            ].join(", ")
        );
    }, [detailQuery.data]);

    function validateAcceptForm() {
        const errors: ValidationErrors = {};

        if (!translatedName.trim()) errors.translatedName = t("translatedNameRequired");
        if (!link.trim()) {
            errors.link = t("resourceLinkRequired");
        } else {
            try {
                const parsed = new URL(link.trim());
                if (parsed.protocol !== "http:" && parsed.protocol !== "https:") errors.link = t("resourceLinkInvalid");
            } catch {
                errors.link = t("resourceLinkInvalid");
            }
        }
        if (!tags.split(",").some((tag) => tag.trim().length > 0)) errors.tags = t("resourceTagsRequired");

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function refreshQueriesAsync() {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["adminContribution", resourceId] }),
            queryClient.invalidateQueries({ queryKey: ["adminContributions"] })
        ]);
    }

    async function runPendingActionAsync() {
        if (!pendingAction) return;

        const action = pendingAction;
        setIsMutating(true);

        try {
            const token = await getAdminTokenAsync();

            if (action.kind === "delete") {
                const response = await deleteContributionItemAsync(
                    token,
                    action.contributionType,
                    action.contributionId
                );
                if (!response || response.status !== 200) throw new Error(t("deleteContributionFailedDescription"));

                await refreshQueriesAsync();
                await showSuccessAsync(t("deleteContributionSucceeded"), t("deleteContributionSucceededDescription"));
            } else if (action.kind === "ban") {
                const response = await banContributionUserAsync(token, action.userId);
                if (response?.status === 400) throw new Error(t("userAlreadyBanned"));
                if (!response || response.status !== 200) throw new Error(t("banUserFailedDescription"));

                await showSuccessAsync(
                    t("banUserSucceeded"),
                    t("banUserSucceededDescription", { user: action.userName })
                );
            } else {
                const response = await acceptContributionAsync(token, resourceId, {
                    translatedName: translatedName.trim(),
                    link: link.trim(),
                    tags: [
                        ...new Set(
                            tags
                                .split(",")
                                .map((tag) => tag.trim())
                                .filter(Boolean)
                        )
                    ]
                });
                if (!response || response.status !== 200) throw new Error(t("acceptContributionFailedDescription"));

                await queryClient.invalidateQueries({ queryKey: ["adminContributions"] });
                await showSuccessAsync(t("acceptContributionSucceeded"), t("acceptContributionSucceededDescription"));
                navigate("/admin/contributions");
            }
        } catch (error) {
            const title =
                action.kind === "delete"
                    ? t("deleteContributionFailed")
                    : action.kind === "ban"
                      ? t("banUserFailed")
                      : t("acceptContributionFailed");
            await showErrorAsync(title, (error as Error).message);
        } finally {
            setIsMutating(false);
            setPendingAction(undefined);
        }
    }

    function contributionActions(row: UserContributionBase, type: ContributionType) {
        return (
            <div className={styles.actionGroup}>
                <Button
                    size="small"
                    variant="outline"
                    theme="danger"
                    icon={<DeleteIcon />}
                    onClick={() =>
                        setPendingAction({ kind: "delete", contributionType: type, contributionId: row.id })
                    }>
                    {t("delete")}
                </Button>
                <Button
                    size="small"
                    variant="outline"
                    theme="danger"
                    icon={<UserBlockedIcon />}
                    onClick={() => setPendingAction({ kind: "ban", userId: row.userId, userName: row.userName })}>
                    {t("banUser")}
                </Button>
            </div>
        );
    }

    const translationColumns = useMemo<PrimaryTableCol<UserContributedTranslation>[]>(
        () => [
            { colKey: "userName", title: t("contributor"), width: 180 },
            { colKey: "userId", title: t("userId"), width: 280 },
            { colKey: "translatedName", title: t("suggestedTranslation"), width: 220 },
            {
                colKey: "actions",
                title: t("actions"),
                width: 230,
                fixed: "right",
                cell: ({ row }) => contributionActions(row, "translation")
            }
        ],
        []
    );

    const linkColumns = useMemo<PrimaryTableCol<UserContributedLink>[]>(
        () => [
            { colKey: "userName", title: t("contributor"), width: 180 },
            { colKey: "userId", title: t("userId"), width: 280 },
            {
                colKey: "link",
                title: t("contributedLink"),
                width: 320,
                cell: ({ row }) =>
                    row.link ? (
                        <a href={row.link} target="_blank" rel="noopener noreferrer">
                            {row.link}
                        </a>
                    ) : (
                        "-"
                    )
            },
            {
                colKey: "actions",
                title: t("actions"),
                width: 230,
                fixed: "right",
                cell: ({ row }) => contributionActions(row, "link")
            }
        ],
        []
    );

    const tagColumns = useMemo<PrimaryTableCol<UserContributedTag>[]>(
        () => [
            { colKey: "userName", title: t("contributor"), width: 180 },
            { colKey: "userId", title: t("userId"), width: 280 },
            { colKey: "value", title: t("contributedTag"), width: 220 },
            {
                colKey: "actions",
                title: t("actions"),
                width: 230,
                fixed: "right",
                cell: ({ row }) => contributionActions(row, "tag")
            }
        ],
        []
    );

    const ratingColumns = useMemo<PrimaryTableCol<ThirdPartyInfoRatingRecord>[]>(
        () => [
            { colKey: "userName", title: t("contributor"), width: 180 },
            { colKey: "userId", title: t("userId"), width: 280 },
            {
                colKey: "rate",
                title: t("userRating"),
                width: 120,
                cell: ({ row }) => (
                    <Space size="small">
                        <StarIcon />
                        <span>{row.rate}</span>
                    </Space>
                )
            },
            {
                colKey: "actions",
                title: t("actions"),
                width: 150,
                fixed: "right",
                cell: ({ row }) => (
                    <Button
                        size="small"
                        variant="outline"
                        theme="danger"
                        icon={<UserBlockedIcon />}
                        onClick={() => setPendingAction({ kind: "ban", userId: row.userId, userName: row.userName })}>
                        {t("banUser")}
                    </Button>
                )
            }
        ],
        []
    );

    const actionDialog = useMemo(() => {
        if (!pendingAction) return { title: "", body: "", theme: "warning" as const };
        if (pendingAction.kind === "delete")
            return {
                title: t("confirmDeleteContribution"),
                body: t("confirmDeleteContributionDescription", { id: pendingAction.contributionId }),
                theme: "danger" as const
            };
        if (pendingAction.kind === "ban")
            return {
                title: t("confirmBanUser"),
                body: t("confirmBanUserDescription", { user: pendingAction.userName || pendingAction.userId }),
                theme: "danger" as const
            };
        return {
            title: t("confirmAcceptContribution"),
            body: t("confirmAcceptContributionDescription"),
            theme: "warning" as const
        };
    }, [pendingAction]);

    if (detailQuery.error) {
        return (
            <Space direction="vertical" size="large" className={styles.page}>
                <Button icon={<RollbackIcon />} variant="outline" onClick={() => navigate("/admin/contributions")}>
                    {t("backToContributionList")}
                </Button>
                <Alert
                    theme="error"
                    title={t("contributionDetailLoadFailed")}
                    message={(detailQuery.error as Error).message}
                    operation={<Button onClick={() => detailQuery.refetch()}>{t("retry")}</Button>}
                />
            </Space>
        );
    }

    const detail = detailQuery.data;

    return (
        <Space direction="vertical" size="large" className={styles.page}>
            <div className={styles.detailHeader}>
                <div>
                    <h2 className={styles.detailTitle}>{detail?.originalName ?? t("contributionDetail")}</h2>
                    <p className={styles.muted}>{detail?.translatedName || t("notTranslated")}</p>
                </div>
                <Button icon={<RollbackIcon />} variant="outline" onClick={() => navigate("/admin/contributions")}>
                    {t("backToContributionList")}
                </Button>
            </div>

            {detailQuery.isLoading && <Card loading />}

            {detail && (
                <>
                    <div className={styles.metadata}>
                        <div className={styles.metadataItem}>
                            <span>{t("resourceId")}</span>
                            <strong className={styles.ellipsis}>{detail.resourceId}</strong>
                        </div>
                        <div className={styles.metadataItem}>
                            <span>{t("userRating")}</span>
                            <strong>{detail.rating >= 0 ? detail.rating.toFixed(1) : t("noRating")}</strong>
                        </div>
                        <div className={styles.metadataItem}>
                            <span>{t("totalSubmissions")}</span>
                            <strong>
                                {detail.translations.length +
                                    detail.links.length +
                                    detail.tags.length +
                                    detail.ratings.length}
                            </strong>
                        </div>
                    </div>

                    <Card>
                        <div className={styles.sectionTitle}>
                            <h3>
                                <TranslateIcon /> {t("translationContributions")}
                            </h3>
                            <p>{t("translationContributionDescription")}</p>
                        </div>
                        <PrimaryTable<UserContributedTranslation>
                            rowKey="id"
                            hover
                            data={detail.translations}
                            columns={translationColumns}
                            empty={t("noTranslationContributions")}
                        />
                    </Card>

                    <Card>
                        <div className={styles.sectionTitle}>
                            <h3>
                                <LinkIcon /> {t("linkContributions")}
                            </h3>
                        </div>
                        <PrimaryTable<UserContributedLink>
                            rowKey="id"
                            hover
                            data={detail.links}
                            columns={linkColumns}
                            empty={t("noLinkContributions")}
                        />
                    </Card>

                    <Card>
                        <div className={styles.sectionTitle}>
                            <h3>{t("tagContributions")}</h3>
                        </div>
                        <PrimaryTable<UserContributedTag>
                            rowKey="id"
                            hover
                            data={detail.tags}
                            columns={tagColumns}
                            empty={t("noTagContributions")}
                        />
                    </Card>

                    <Card>
                        <div className={styles.sectionTitle}>
                            <h3>
                                <StarIcon /> {t("ratingContributions")}
                            </h3>
                        </div>
                        <PrimaryTable<ThirdPartyInfoRatingRecord>
                            rowKey="id"
                            hover
                            data={detail.ratings}
                            columns={ratingColumns}
                            empty={t("noRatingContributions")}
                        />
                    </Card>

                    <Card>
                        <div className={styles.sectionTitle}>
                            <h3>{t("finalResourceInformation")}</h3>
                            <p>{t("finalResourceInformationDescription")}</p>
                        </div>
                        <div className={styles.acceptGrid}>
                            <label>
                                <span className={styles.fieldLabel}>{t("finalTranslatedName")}</span>
                                <Input
                                    value={translatedName}
                                    status={validationErrors.translatedName ? "error" : "default"}
                                    onChange={(value) => setTranslatedName(String(value))}
                                />
                                {validationErrors.translatedName && (
                                    <div className={styles.fieldError}>{validationErrors.translatedName}</div>
                                )}
                            </label>
                            <label>
                                <span className={styles.fieldLabel}>{t("finalResourceLink")}</span>
                                <Input
                                    value={link}
                                    status={validationErrors.link ? "error" : "default"}
                                    onChange={(value) => setLink(String(value))}
                                />
                                {validationErrors.link && (
                                    <div className={styles.fieldError}>{validationErrors.link}</div>
                                )}
                            </label>
                            <label className={styles.fieldFull}>
                                <span className={styles.fieldLabel}>{t("finalResourceTags")}</span>
                                <Textarea
                                    value={tags}
                                    status={validationErrors.tags ? "error" : "default"}
                                    placeholder={t("resourceTagsPlaceholder")}
                                    autosize={{ minRows: 2, maxRows: 5 }}
                                    onChange={(value) => setTags(String(value))}
                                />
                                {validationErrors.tags && (
                                    <div className={styles.fieldError}>{validationErrors.tags}</div>
                                )}
                            </label>
                        </div>
                        <div className={styles.submitRow}>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTranslatedName("");
                                    setLink("");
                                    setTags("");
                                    setValidationErrors({});
                                }}>
                                {t("clear")}
                            </Button>
                            <Button
                                theme="primary"
                                onClick={() => {
                                    if (validateAcceptForm()) setPendingAction({ kind: "accept" });
                                }}>
                                {t("acceptAsOfficialResource")}
                            </Button>
                        </div>
                    </Card>
                </>
            )}

            <Dialog
                visible={!!pendingAction}
                header={actionDialog.title}
                theme={actionDialog.theme}
                confirmLoading={isMutating}
                closeOnOverlayClick={!isMutating}
                closeOnEscKeydown={!isMutating}
                onConfirm={runPendingActionAsync}
                onClose={() => {
                    if (!isMutating) setPendingAction(undefined);
                }}>
                <p>{actionDialog.body}</p>
                {pendingAction?.kind === "accept" && (
                    <Space breakLine>
                        <Tag>{translatedName}</Tag>
                        <Tag>{link}</Tag>
                        <Tag>{tags}</Tag>
                    </Space>
                )}
            </Dialog>
        </Space>
    );
}

export const Component = () => AdminContributionDetail();
