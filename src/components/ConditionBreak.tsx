
export default function ConditionBreak({ className = undefined }: { className?: string | undefined }) {
    return <span className={className ?? `md:hidden inline`}><br /></span>
}