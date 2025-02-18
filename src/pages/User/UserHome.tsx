import { MoneyIcon, SecuredIcon } from "tdesign-icons-react";
import { Alert, Avatar, Card, Col, Divider, Row } from "tdesign-react";
import { TElement } from "tdesign-react/lib/common";

import i18next from "../../i18n.ts";

const t = i18next.t;

interface TipModel {
    icon: TElement;
    theme?: "success" | "info" | "warning" | "error";
    title: string;
    description: string;
}

function UserHome() {
    const userInfo = [
        {
            title: "用户名",
            value: "laolarou"
        },
        {
            title: "邮箱",
            value: "thisisatestemail@corona.srudio"
        },
        {
            title: "当前体验通道",
            value: "Stable"
        }
    ];

    const tips: TipModel[] = [
        {
            icon: <SecuredIcon />,
            theme: "success",
            title: t("userHomeTip1Title"),
            description: t("userHomeTip1Description")
        },
        {
            icon: <MoneyIcon />,
            theme: "info",
            title: t("userHomeTip2Title"),
            description: t("userHomeTip2Description")
        }
    ];

    return (
        <>
            <div>
                <Row align="middle" gutter={12}>
                    <Col>
                        <Avatar image="https://tdesign.gtimg.com/site/avatar.jpg" shape="round" size="120px" />
                    </Col>
                    <Col>
                        <Col>
                            <h5>laolarou</h5>
                        </Col>
                        <Col>
                            <span>thisisatestemail@corona.srudio</span>
                        </Col>
                    </Col>
                </Row>

                <Divider align="center" layout="horizontal" />

                <Row gutter={40}>
                    <Col sm={12} md={8}>
                        {userInfo.map((userInfo, i) => (
                            <div key={i} className="mb-4">
                                <Card title={userInfo.title} subtitle={userInfo.value} bordered headerBordered />
                            </div>
                        ))}
                    </Col>
                    <Col sm={12} md={4}>
                        {tips.map((tip, i) => (
                            <div key={i} className="mb-4">
                                <Alert
                                    close
                                    icon={tip.icon}
                                    theme={tip.theme}
                                    message={
                                        <article>
                                            <p className="font-bold text-lg">{tip.title}</p>
                                            <p>{tip.description}</p>
                                        </article>
                                    }
                                />
                            </div>
                        ))}
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default UserHome;
