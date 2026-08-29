import { DropdownBranch, Icon } from "@nivo/ui";
import type { Locale } from "@/i18n/config";

/** One resolved locale choice. */
export type LanguageMenuProps = LanguageMenuViewProps;
/** Public API role for LanguageMenuOption. */
export type LanguageMenuOption = {
  readonly id: Locale;
  readonly label: string;
};

/** Resolved locale state accepted by the pure block half. */
export type LanguageMenuViewProps = {
  readonly props: {
    readonly label: string;
    readonly selectedLocale: Locale;
    readonly options: ReadonlyArray<LanguageMenuOption>;
  };
  readonly on?: {
    readonly select?: (locale: Locale) => void;
  };
};
const languageTrigger = <Icon props={{
  name: "locale",
  role: "leading"
}} />;

/** Pure single-select locale menu over the shared dropdown mechanics owner. */
export const LanguageMenuBase = (props: LanguageMenuProps) => <DropdownBranch props={{
  label: props.props.label,
  selectionMode: "single",
  selectedId: props.props.selectedLocale,
  sections: [{
    items: props.props.options.map(option => ({
      ...option,
      showsIndicator: true
    }))
  }]
}} on={{
  action: next => props.on?.select?.(next)
}} trigger={languageTrigger} />;

