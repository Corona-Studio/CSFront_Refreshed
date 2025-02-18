import { Card, Col, Comment, Row } from "tdesign-react";

function UserSponsor() {
    return (
        <>
            <div>
                <Row>
                    <Col span={12}>
                        <Card
                            bordered
                            theme="poster2"
                            cover={new URL(`../../assets/lx/LauncherX_Poster.png`, import.meta.url).href}
                            footer={
                                <Comment
                                    author="标题"
                                    content="卡片内容"
                                    avatar="https://tdesign.gtimg.com/site/avatar-boy.jpg"></Comment>
                            }></Card>
                    </Col>
                    <Col span={12}>
                        <Card
                            bordered
                            theme="poster2"
                            cover={new URL(`../../assets/lx/LauncherX_Poster.png`, import.meta.url).href}
                            footer={
                                <Comment
                                    author="标题"
                                    content="卡片内容"
                                    avatar="https://tdesign.gtimg.com/site/avatar-boy.jpg"></Comment>
                            }></Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => UserSponsor();
