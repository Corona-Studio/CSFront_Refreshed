import 'Icon.css';

export default function Icon({ code }: { code: string }) {
    return <span className="use-icons">&#x{code};</span>;
}
