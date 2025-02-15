// ...
const err = (logo: string, reason: string) =>
    console.error(`${logo}: ${reason}`);

const scroll = (id: string, shine = true, precise = false) => {
    const logo = '[utils.common.scroll]';
    // requiring class shine and transition.
    if (id != '.PAGETOP') {
        const to = document.getElementById(id.replace('#', '')) as HTMLElement;
        if (to == null) {
            err(logo, 'No such element in document.');
        }
        window.scrollTo({
            top: to.offsetTop - (precise ? -1 : 50),
            behavior: 'smooth'
        });
        if (shine) {
            to.classList.add('transition');
            setTimeout(() => {
                to.classList.add('shine');
            }, 810);
            setTimeout(() => {
                to.classList.remove('shine');
            }, 1145);
        }
        return;
    } else window.scrollTo({ top: 0, behavior: 'smooth' });
};

function handleScroll(bindContainer: HTMLElement, threshold: number, display: 'block' | 'fixed' | 'absolute' | 'relative' | 'inline-block', usingDocumentAsMeasurement = false) {

    let scrollDistance = usingDocumentAsMeasurement ? (window.pageYOffset ?? document.documentElement.scrollTop) : bindContainer.scrollTop;

    if (scrollDistance > threshold) bindContainer.style.display = display;
    else bindContainer.style.display = 'none';
    
}


const randomId = (marker = 'R') => {
    return `${marker}@${Math.ceil(Math.random() * 1000)}`;
};

export default { scroll, randomId, handleScroll };
