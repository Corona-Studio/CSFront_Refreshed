import i18next from 'i18next';
import { ArrowRightIcon } from 'tdesign-icons-react';
import { Button, Col, Row, Statistic } from 'tdesign-react';

import LetterGlitch from '../../ReactBits/Backgrounds/LetterGlitch/LetterGlitch.tsx';
import BounceCards from '../../ReactBits/Components/BounceCards/BounceCards.tsx';
import InfiniteScroll from '../../ReactBits/Components/InfiniteScroll/InfiniteScroll.tsx';
import RollingGallery from '../../ReactBits/Components/RollingGallery/RollingGallery.tsx';
import RotatingText from '../../ReactBits/TextAnimations/RotatingText/RotatingText.tsx';
import BannerContainer from '../../components/BannerContainer.tsx';
import styles from './Index.module.css';

function Index() {
    const items = Array(11)
        .fill(1)
        .map((x, y) => x + y)
        .filter((x) => x % 2 !== 0)
        .map((x, i) => ({
            content: (
                <img
                    key={i}
                    src={
                        new URL(
                            `../../assets/lx/LauncherX_${x}.webp`,
                            import.meta.url
                        ).href
                    }
                    alt="LauncherX"
                />
            )
        }));

    const launcherImages = Array(13)
        .fill(1)
        .map((x, y) => x + y)
        .filter((x) => x % 2 !== 0)
        .map(
            (x) =>
                new URL(`../../assets/lx/LauncherX_${x}.webp`, import.meta.url)
                    .href
        );

    const usages = [
        i18next.t('modPackInstallation'),
        i18next.t('resourceDownload'),
        i18next.t('versionManagement'),
        i18next.t('serverManagement'),
        i18next.t('modPackManagement'),
        i18next.t('accountManagement')
    ];

    const thirdpartyLogo = [
        new URL('../../assets/thirdparty/CurseForge.jpg', import.meta.url).href,
        new URL('../../assets/thirdparty/Forge.jpg', import.meta.url).href,
        new URL('../../assets/thirdparty/Modrinth.png', import.meta.url).href
    ];

    const transformStyles = [
        'rotate(5deg) translate(-150px)',
        'rotate(0deg) translate(-70px)',
        'rotate(-5deg)',
        'rotate(5deg) translate(70px)',
        'rotate(-5deg) translate(150px)'
    ];

    return (
        <>
            <div className="bg-black">
                <BannerContainer innerDivClassName="overflow-clip">
                    <div className="z-0 w-full h-full">
                        <div className={styles.darkText}>
                            <div className="lg:pl-[30%]">
                                <InfiniteScroll
                                    items={items}
                                    isTilted={true}
                                    tiltDirection="right"
                                    autoplay={true}
                                    autoplaySpeed={0.1}
                                    autoplayDirection="down"
                                    pauseOnHover={true}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="z-10 absolute w-full h-full">
                        <div className={styles.maskRadial} />

                        <div className="flex absolute left-1/8 h-screen transition">
                            <div className="m-auto space-y-4">
                                <div className="text-white">
                                    <h1 className="font-bold text-white">
                                        Launcher
                                        <span className={styles.x}>X</span>
                                    </h1>
                                    <span>{i18next.t('lxSlogan')}</span>
                                </div>
                                <Button size="large" variant="base">
                                    <div className="flex items-center space-x-4">
                                        <span>{i18next.t('downloadNow')}</span>
                                        <ArrowRightIcon />
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </BannerContainer>

                <div className="w-full text-white">
                    <div className="p-[12.5%] w-full bg-gray-900">
                        <Row className="items-center" align="middle">
                            <Col xs={12} lg={6}>
                                <div className="text-white">
                                    <div className="m-auto space-y-4">
                                        <h2 className="font-bold">
                                            {i18next.t('powerfulFeatures')}
                                        </h2>
                                        <div className="flex items-center space-x-6">
                                            <h3>{i18next.t('notOnly')}</h3>
                                            <RotatingText
                                                texts={usages}
                                                mainClassName="text-xl px-2 sm:px-2 md:px-3 bg-amber-400 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 rounded-lg"
                                                staggerFrom={'last'}
                                                initial={{ y: '100%' }}
                                                animate={{ y: 0 }}
                                                exit={{ y: '-120%' }}
                                                staggerDuration={0.025}
                                                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                                                rotationInterval={2000}
                                            />
                                        </div>
                                        <div className="pt-4">
                                            {i18next.t(
                                                'powerfulFeaturesDescription'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} lg={6}>
                                <RollingGallery
                                    autoplay={true}
                                    pauseOnHover={true}
                                    images={launcherImages}
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="p-[12.5%] w-full bg-black">
                        <Row align="middle">
                            <Col xs={12} lg={6}>
                                <div className="text-white pr-24 pb-16">
                                    <div className="m-auto">
                                        <h2 className="font-bold">
                                            {i18next.t('aggressiveOptimizing')}
                                        </h2>
                                        <div className="pt-4">
                                            {i18next.t(
                                                'aggressiveOptimizingDescription'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} lg={6}>
                                <LetterGlitch
                                    glitchColors={[
                                        '#64ce65',
                                        '#4085de',
                                        '#66b2d3'
                                    ]}
                                    glitchSpeed={50}
                                    centerVignette={false}
                                    outerVignette={true}
                                    smooth={true}
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="p-[12.5%] w-full bg-gray-900">
                        <Row>
                            <Col xs={12} lg={6}>
                                <BounceCards
                                    images={thirdpartyLogo}
                                    containerWidth={500}
                                    containerHeight={200}
                                    animationDelay={1}
                                    animationStagger={0.08}
                                    easeType="elastic.out(1, 0.5)"
                                    transformStyles={transformStyles}
                                />
                            </Col>
                            <Col xs={12} lg={6}>
                                <div className="text-white pr-24">
                                    <div className="m-auto items-end">
                                        <h2 className="font-bold text-right">
                                            {i18next.t(
                                                'integratedWithThirdPartyResources'
                                            )}
                                        </h2>
                                        <div className="pt-4 text-right">
                                            {i18next.t(
                                                'integratedWithThirdPartyResourcesDescription'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <div className="p-[12.5%] w-full bg-black">
                        <Row>
                            <Col xs={12} lg={6}>
                                <div className="w-full flex pb-16 space-x-8">
                                    <Statistic
                                        style={{ color: 'white' }}
                                        title={i18next.t('bugFixRequiredTime')}
                                        value={99}
                                        unit="%"
                                        trend="decrease"
                                        color="green"
                                    />
                                    <Statistic
                                        style={{ color: 'white' }}
                                        title={i18next.t('updateFrequency')}
                                        value={82.76}
                                        unit="%"
                                        trend="increase"
                                        color="blue"
                                    />
                                    <Statistic
                                        style={{ color: 'white' }}
                                        title={i18next.t('featureDevelopment')}
                                        value={76}
                                        unit="%"
                                        trend="increase"
                                        color="red"
                                    />
                                    <Statistic
                                        style={{ color: 'white' }}
                                        title={i18next.t('feedbackResponse')}
                                        value={60}
                                        unit="%"
                                        trend="increase"
                                        color="orange"
                                    />
                                </div>
                            </Col>
                            <Col xs={12} lg={6}>
                                <div className="text-white pr-24">
                                    <div className="m-auto items-end">
                                        <h2 className="font-bold text-right">
                                            {i18next.t(
                                                'alwaysGetLatestUpdates'
                                            )}
                                        </h2>
                                        <div className="pt-4 text-right">
                                            {i18next.t(
                                                'alwaysGetLatestUpdatesDescription'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Index;
