import { Delete1Icon } from "tdesign-icons-react";
import { Button, Card, Col, Row } from "tdesign-react";

import i18next from "../../i18n.ts";

const t = i18next.t;

function UserDeviceManagement() {
    const devices = [
        {
            name: "laolarou-VMware20-1",
            id: "bb05584f-7789-4c4c-b7c6-643333e9e62f",
            serialNumber: "1189C99F159034538D3F935B102041BA93DE7C7845570972A6DB9AFD88653780"
        }
    ];

    return (
        <>
            <div>
                <Row gutter={[8, 8]}>
                    {devices.map((device, i) => (
                        <Col key={i} sm={12} md={6} lg={4}>
                            <Card
                                title={device.name}
                                actions={<Button theme="danger" shape="square" variant="base" icon={<Delete1Icon />} />}
                                bordered
                                headerBordered>
                                <article className="truncate">
                                    <p>
                                        {t("deviceId")} - {device.id}
                                    </p>
                                    <p>
                                        {t("serialNumber")} - {device.serialNumber}
                                    </p>
                                </article>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => UserDeviceManagement();
