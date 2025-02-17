// ...
const err = (logo: string, reason: string) =>
    console.error(`${logo}: ${reason}`);


export function scroll (id: string, shine = true, precise = false){
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
}

export function handleScroll (bindContainer: HTMLElement, threshold: number, display: 'block' | 'fixed' | 'absolute' | 'relative' | 'inline-block', usingDocumentAsMeasurement = false){

    let scrollDistance = usingDocumentAsMeasurement ? (window.pageYOffset ?? document.documentElement.scrollTop) : bindContainer.scrollTop;

    if (scrollDistance > threshold) bindContainer.style.display = display;
    else bindContainer.style.display = 'none';
    
}

export function checkPasswd (pass: string){
    const regex = /^(?![A-z0-9]+$)(?=.[^%&',;=?$\x22])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,20}$/g;

    return regex.test(pass);
}

export function randomId (marker = 'R'){
    return `${marker}@${Math.ceil(Math.random() * 1000)}`;
}

