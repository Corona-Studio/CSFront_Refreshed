


export default function Footer(){
    return <>
        <div className="p-3 w-screen fixed -z-10 left-0 right-0 bottom-0">
            <a href={`#${Math.ceil(Math.random() *  300)}`}>Random Hash</a>
        </div>
    
    </>
}