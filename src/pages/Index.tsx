import { CatIcon, RocketIcon, TreeSquareDotIcon } from 'tdesign-icons-react';
import { Col, Row } from 'tdesign-react';

import GridMotion from '../ReactBits/Backgrounds/GridMotion/GridMotion.tsx';
import Squares from '../ReactBits/Backgrounds/Squares/Squares.tsx';
import DecryptedText from '../ReactBits/TextAnimations/DecryptedText/DecryptedText.tsx';
import RotatingText from '../ReactBits/TextAnimations/RotatingText/RotatingText.tsx';
import BannerContainer from '../components/BannerContainer.tsx';
import ProjectCard from '../components/ProjectCard.tsx';
import i18next from '../i18n';

const t = i18next.t;

function Index() {
    const images = Array(23)
        .fill(1)
        .map((x, y) => x + y)
        .map(
            (x) =>
                new URL(`../assets/landscapes/${x}.webp`, import.meta.url).href
        );

    const projectsArray = [
        {
            icon: <RocketIcon />,
            title: 'LauncherX',
            description: t('lxDescription')
        },
        {
            icon: <CatIcon />,
            title: 'ProjBobcat',
            description: t('projbobcatDescription')
        },
        {
            icon: <TreeSquareDotIcon />,
            title: 'ConnectX',
            description: t('connectxDescription')
        }
    ];

    return (
        <>
            <BannerContainer innerDivClassName="dark:bg-black">
                <div className="z-0 w-full h-full shadow">
                    <Squares
                        direction="diagonal"
                        speed={0.1}
                        squareSize={120}
                        hoverFillColor="#ffb300"
                    />
                </div>

                <div
                    className="z-10 absolute w-full h-full"
                    style={{ pointerEvents: 'none' }}>
                    <div className="flex absolute left-1/8 h-screen transition">
                        <div className="m-auto space-y-4">
                            <h3>{t('welcomeAccess')}</h3>
                            <div>
                                <DecryptedText
                                    className="dark:text-white text-6xl font-bold"
                                    encryptedClassName="dark:text-white text-6xl font-bold"
                                    sequential={true}
                                    text="Corona Studio"
                                    useOriginalCharsOnly={true}
                                    animateOn="view"
                                    revealDirection="start"
                                />
                            </div>
                            <DecryptedText
                                className="dark:text-white text-6xl font-bold"
                                encryptedClassName="dark:text-white text-6xl font-bold"
                                sequential={true}
                                text={t('corona_studio')}
                                useOriginalCharsOnly={false}
                                animateOn="view"
                                revealDirection="start"
                            />
                            <div className="flex items-center space-x-4">
                                <span className="text-4xl align-middle inline-block">
                                    {t('weDevelop')}
                                </span>
                                <RotatingText
                                    texts={[
                                        'LauncherX',
                                        'ProjBobcat',
                                        'ConnectX',
                                        'P2P',
                                        'CMFS'
                                    ]}
                                    mainClassName="text-4xl px-2 sm:px-2 md:px-3 bg-amber-400 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 rounded-lg"
                                    staggerFrom={'last'}
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '-120%' }}
                                    staggerDuration={0.025}
                                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                                    rotationInterval={2000}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </BannerContainer>
            <div className="w-full shadow h-[.5px] -translate-y-[.5px]"></div>

            <div className="dark:bg-black w-full">
                <div className="p-[12.5%] w-full">
                    <div>
                        <h2 className="font-bold pb-4">
                            {t('whoWeAre')}
                        </h2>
                        <span>{t('whoWeAreDetail')}</span>
                    </div>
                </div>

                <div className="h-[30rem]">
                    <GridMotion items={images} />
                </div>

                <div className="p-[12.5%] w-full">
                    <div className="m-auto">
                        <h2 className="font-bold pb-8 float-end">
                            {t('ourProjects')}
                        </h2>
                        <Row gutter={[16, 16]} className="w-full">
                            {projectsArray.map((project, i) => (
                                <Col sm={12} md={6} lg={4} xl={4} key={i}>
                                    <ProjectCard
                                        icon={project.icon}
                                        title={project.title}
                                        description={project.description}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Index;
