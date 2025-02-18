import { Alert, Button, Card, Col, Comment, Divider, Form, Input, Row } from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import { AfdOrderNumberPattern } from "../../helpers/ValidationRules.ts";
import i18next from "../../i18n.ts";

const t = i18next.t;

function UserSponsor() {
    const posters = [
        {
            imgLink: new URL(`../../assets/lx/LauncherX_Poster.webp`, import.meta.url).href,
            link: "https://afdian.com/a/launcherx",
            title: t("afdCardTitle"),
            description: t("afdCardDescription")
        },
        {
            imgLink: new URL(`../../assets/lx/LauncherX_Poster_Main.webp`, import.meta.url).href,
            link: "https://www.minebbs.com/resources/launcherx.7182/",
            title: t("minebbsCardTitle"),
            description: t("minebbsCardDescription")
        }
    ];

    return (
        <>
            <div>
                <Alert theme="info" message="如何查看赞助时的订单号？" operation={<span>查看这里</span>} close />
                <div className="pt-12">
                    <Form className="max-w-[50vh]" statusIcon={true} colon={true} labelWidth={0}>
                        <FormItem
                            label={t("afdOrderNumber")}
                            name="name"
                            rules={[
                                { required: true, message: t("passwordRequired"), type: "error" },
                                {
                                    pattern: AfdOrderNumberPattern,
                                    message: t("afdOrderNumberRuleDescription"),
                                    type: "error"
                                }
                            ]}>
                            <Input />
                        </FormItem>
                        <FormItem>
                            <Button theme="primary" type="submit" block>
                                {t("login")}
                            </Button>
                        </FormItem>
                    </Form>
                </div>

                <Divider align="center" layout="horizontal" />

                <div>
                    <Row gutter={[16, 16]}>
                        {posters.map((post, i) => (
                            <Col sm={12} md={6} lg={4} key={i}>
                                <Card
                                    bordered
                                    theme="poster2"
                                    cover={post.imgLink}
                                    actions={
                                        <Button theme="primary" variant="base" href={post.link} target="_blank">
                                            {t("goto")}
                                        </Button>
                                    }
                                    footer={<Comment author={post.title} content={post.description}></Comment>}></Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => UserSponsor();
