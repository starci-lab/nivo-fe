import {
    GROUP_CHAT_MEMBER_CHIP_CHEVRON_CLASS_NAME,
    GROUP_CHAT_MEMBER_CHIP_CLASS_NAME,
    GROUP_CHAT_MEMBER_CHIP_ICON_CLASS_NAME,
} from "./classNames"

type MemberRailToggleProps = {
    readonly expanded: boolean
    readonly label: string
    readonly onClick: () => void
}

/** Render the compact control that opens or closes the member rail. */
export const MemberRailToggle = (props: MemberRailToggleProps) => {
    const { expanded, label, onClick } = props
    return (
        <button
            type="button"
            className={GROUP_CHAT_MEMBER_CHIP_CLASS_NAME}
            data-grammar-member-chip="true"
            aria-expanded={expanded}
            onClick={onClick}
        >
            <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={GROUP_CHAT_MEMBER_CHIP_ICON_CLASS_NAME}
                aria-hidden="true"
            >
                <circle cx="6" cy="5" r="2.25" stroke="currentColor" strokeWidth={1.4} />
                <path
                    d="M2.5 13c.5-2 1.9-3 3.5-3s3 1 3.5 3"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                />
                <path
                    d="M10.2 3.4a2.25 2.25 0 1 1 .1 4.1M11.5 10.2c1 .4 1.7 1.3 2 2.8"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                />
            </svg>
            {label}
            <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={GROUP_CHAT_MEMBER_CHIP_CHEVRON_CLASS_NAME}
                aria-hidden="true"
            >
                <path
                    d="M6 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    )
}
