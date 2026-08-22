import { DropdownBranch, Icon, defineLeafComponent } from "@nivo/ui"
import type { Locale } from "@/i18n/config"

/** One resolved locale choice. */
export type LanguageMenuOption = {
    readonly id: Locale
    readonly label: string
}

/** Resolved locale state accepted by the pure block half. */
export type LanguageMenuViewProps = {
    readonly props: {
        readonly label: string
        readonly selectedLocale: Locale
        readonly options: ReadonlyArray<LanguageMenuOption>
    }
    readonly on?: {
        readonly select?: (locale: Locale) => void
    }
}

/** Pure single-select locale menu over the shared dropdown mechanics owner. */
export const LanguageMenuBase = (input: LanguageMenuViewProps) => (
    <DropdownBranch
        props={{
            label: input.props.label,
            selectionMode: "single",
            selectedId: input.props.selectedLocale,
            sections: [{
                items: input.props.options.map((option) => ({ ...option, showsIndicator: true })),
            }],
        }}
        on={{ action: (next) => input.on?.select?.(next) }}
        trigger={defineLeafComponent("icon", {}, () => (
            <Icon props={{ name: "locale", role: "leading" }} />
        ))}
    />
)

/** Source-level tier marker for the pure locale block half. */
export const meta = { shape: "block", world: "pure", domain: "locale" } as const
