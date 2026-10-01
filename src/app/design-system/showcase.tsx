"use client";
import {
    Alert,
    Button,
    Card,
    Checkbox,
    DataTable,
    type DataTableColumn,
    Dialog,
    Form,
    FormItem,
    Input,
    SectionHeading,
    Select,
    Tag,
    notify
} from "@/components/marathon";
import PromoCard from "@/components/marathon/promo-card";
import { ArrowUpRight, Rocket } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import ChartPreview from "./charts";

const rows = [
    { id: "LX—001", name: "LauncherX", state: "Stable" },
    { id: "CX—002", name: "ConnectX", state: "Open source" },
    { id: "PB—003", name: "ProjBobcat", state: "Open source" }
];
const columns: DataTableColumn<(typeof rows)[number]>[] = [
    { colKey: "id", title: "SYSTEM ID" },
    { colKey: "name", title: "NAME", sorter: (a, b) => a.name.localeCompare(b.name) },
    { colKey: "state", title: "CHANNEL", cell: ({ row }) => <Tag>{row.state}</Tag> }
];
export default function Showcase() {
    const { t } = useTranslation();
    const [role, setRole] = useState<string | number>(0);
    const [dialog, setDialog] = useState(false);
    const [page, setPage] = useState({ current: 1, pageSize: 2 });
    return (
        <div className="m-container py-16">
            <SectionHeading
                code="CS—UI / DESIGN SYSTEM"
                title="MARATHON/"
                description="基于 shadcn/ui 与 Radix 的 Corona Studio 组件系统。硬边框、工业编号、明确的操作状态，覆盖官网与控制台。"
            />
            <div className="grid md:grid-cols-2 gap-6">
                <Card title="01 / ACTIONS" subtitle="按钮、状态与消息">
                    <div className="flex flex-wrap gap-3">
                        <Button icon={<Rocket className="size-4" />}>主操作</Button>
                        <Button variant="outline">次级操作</Button>
                        <Button theme="danger" onClick={() => setDialog(true)}>
                            确认操作
                        </Button>
                        <Button disabled>不可用</Button>
                        <Button loading>处理中</Button>
                        <Button
                            variant="text"
                            onClick={() => void notify.success({ title: "已完成", content: "Marathon 通知组件" })}>
                            显示通知
                            <ArrowUpRight className="size-4" />
                        </Button>
                    </div>
                    <div className="flex gap-2 mt-6">
                        <Tag theme="success">ACTIVE</Tag>
                        <Tag>STABLE</Tag>
                        <Tag theme="danger">ERROR</Tag>
                    </div>
                </Card>
                <Card title="02 / FORMS" subtitle="可访问的字段标签、异步校验与错误反馈">
                    <Form
                        onSubmit={(event) => {
                            if (event.validateResult === true) void notify.success({ title: "校验通过" });
                        }}>
                        <FormItem
                            name="email"
                            rules={[
                                { required: true, message: "请填写邮箱" },
                                { email: true, message: "请输入有效邮箱" }
                            ]}>
                            <Input placeholder="邮箱" type="email" />
                        </FormItem>
                        <div className="mb-6 space-y-2">
                            <p id="role-demo-label" className="text-sm font-medium">
                                身份选择（展示用）
                            </p>
                            <Select
                                ariaLabel="身份选择（展示用）"
                                value={role}
                                onChange={setRole}
                                options={[
                                    { value: 0, label: "普通用户" },
                                    { value: 1, label: "赞助用户" },
                                    { value: 2, label: "管理员" }
                                ]}
                            />
                        </div>
                        <FormItem name="agreement">
                            <Checkbox>订阅开发动态（展示用）</Checkbox>
                        </FormItem>
                        <Button type="submit">验证表单</Button>
                    </Form>
                </Card>
                <Card title="03 / DATA" subtitle="排序、本地分页和空状态">
                    <DataTable
                        data={rows}
                        columns={columns}
                        rowKey="id"
                        pagination={{
                            ...page,
                            total: rows.length,
                            pageSizeOptions: [2, 3],
                            showPageSize: true,
                            onChange: setPage
                        }}
                    />
                </Card>
                <Card title="04 / FEEDBACK" subtitle="明确信息层级">
                    <div className="space-y-4">
                        <Alert title="系统已就绪" message="所有系统使用统一的语义设计变量。" />
                        <Alert theme="error" title="操作失败" message="保留输入后重试。" />
                        <div className="m-rule m-kicker">
                            <span>TYPOGRAPHY / DISPLAY</span>
                            <span>CS</span>
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter">BUILD WHAT’S NEXT.</h3>
                    </div>
                </Card>
            </div>
            <section className="mt-16">
                <SectionHeading
                    code="05 / DATA VISUALIZATION"
                    title="CHARTS/"
                    description="主题自适应图表：青绿、暖铜、灰蓝。以下使用模拟数据展示，与生产统计无关。"
                />
                <ChartPreview />
            </section>
            <section className="mt-16">
                <SectionHeading
                    code="06 / COMMUNITY"
                    title="SUPPORT/"
                    description="图片、说明与操作整合在同一张卡片内。"
                />
                <div className="grid md:grid-cols-2 gap-6">
                    <PromoCard
                        image="/assets/lx/LauncherX_Poster.webp"
                        title={t("afdCardTitle")}
                        description={t("afdCardDescription")}
                        href="https://afdian.com/a/launcherx"
                        actionLabel={t("goto")}
                    />
                    <PromoCard
                        image="/assets/lx/LauncherX_Poster_Main.webp"
                        title={t("minebbsCardTitle")}
                        description={t("minebbsCardDescription")}
                        href="https://www.minebbs.com/resources/launcherx.7182/"
                        actionLabel={t("goto")}
                    />
                </div>
            </section>
            <Dialog
                visible={dialog}
                header="确认演示操作"
                onClose={() => setDialog(false)}
                onConfirm={() => {
                    setDialog(false);
                    void notify.success({ title: "演示已确认" });
                }}>
                <p>该演示只显示反馈，不调用业务接口。</p>
            </Dialog>
        </div>
    );
}
