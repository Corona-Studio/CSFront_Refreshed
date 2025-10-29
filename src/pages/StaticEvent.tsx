import { useEffect } from "react";
import { useParams } from "react-router"

export default function StaticEvent() {
    const { path } = useParams();
    useEffect(
        () => {
            console.log("fetching event page at: /events-static/" + path + ".html");
        }, [] // eslint-disable-line
    )
    return <div style={{ paddingTop: 56, background: 'white' }}>
        <iframe className="w-full h-screen" src={`/events-static/${path}.html`}>    </iframe>
        <div className="fixed bg-zinc-800/70 backdrop-blur-xl p-3 py-1.5 rounded-xl z-10">EVENT</div>
    </div>
}