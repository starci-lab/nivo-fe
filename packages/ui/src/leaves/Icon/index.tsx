import {
    ArrowPathIcon, ArrowLeftIcon, ArrowRightIcon, BellIcon, BookOpenIcon, ChevronDownIcon,
    ArrowTrendingUpIcon, ChatBubbleOvalLeftIcon, CheckCircleIcon, CheckIcon, DocumentDuplicateIcon,
    EyeIcon, EyeSlashIcon, InboxArrowDownIcon, Cog6ToothIcon, AcademicCapIcon,
    HeartIcon, ClockIcon, InformationCircleIcon, KeyIcon, MinusIcon, PencilSquareIcon,
    PaperAirplaneIcon, PlayCircleIcon, LinkIcon, PlusIcon, MapPinIcon, ReceiptPercentIcon,
    ShieldCheckIcon, SparklesIcon, Squares2X2Icon, FlagIcon, TrashIcon, ShareIcon as TreeIcon,
    TrophyIcon, ArrowUpTrayIcon, UserPlusIcon, UsersIcon, ExclamationTriangleIcon, XCircleIcon,
    XMarkIcon, UserIcon, CircleStackIcon,
} from "@heroicons/react/24/outline"
import {
    CheckCircleIcon as CheckCircleSolid, CheckIcon as CheckSolid, XMarkIcon as XSolid,
    ExclamationTriangleIcon as WarningSolid, InformationCircleIcon as InfoSolid,
    SparklesIcon as SparklesSolid, HeartIcon as HeartSolid, StarIcon as StarSolid,
} from "@heroicons/react/16/solid"
import type { ComponentType, SVGProps } from "react"
import type { LeafProps } from "../../contracts/props"

/**
 * LEAF - `Icon`: one glyph, named by MEANING.
 *
 * CALLERS NAME MEANINGS; ONLY THIS FILE NAMES VENDOR GLYPHS. `refresh` survives a change of icon
 * package; `ArrowClockwiseIcon` survives nothing - it is one vendor's word for a picture, and the
 * day that vendor is replaced every caller has to be edited. That is why the glyph package is
 * imported here and nowhere else.
 *
 * EACH ROLE KEEPS THE DIAMETER ITS DRAWING WAS AUTHORED FOR. A `chip` is not a `heading` scaled
 * down: shrinking a 24px outline drawing thins its stroke until it disappears beside text, so the
 * small role uses the 16px SOLID drawing that was drawn to be small. Two closed families, and no
 * third.
 */

/** Where the glyph sits, which decides both its diameter and which drawing is used. */
export type IconRole = "heading" | "leading" | "chip"

/** Every meaning this product can draw. A meaning not in this union is a compile error. */
export type IconName =
    | "refresh" | "back" | "forward" | "bell" | "course" | "expand"
    | "trend" | "comment" | "done-circle" | "done" | "copy"
    | "show" | "hide" | "save" | "send" | "settings" | "graduate"
    | "favourite" | "waiting" | "info" | "key" | "remove" | "edit"
    | "play" | "connected" | "add" | "pin" | "invoice"
    | "verified" | "spark" | "grid" | "target" | "delete" | "workflow"
    | "trophy" | "upload" | "invite" | "people" | "warning" | "error"
    | "close" | "person" | "storage"

type Glyph = ComponentType<SVGProps<SVGSVGElement>>

/** The 24px outline drawing, used by `heading` and `leading`. */
const OUTLINE: Record<IconName, Glyph> = {
    refresh: ArrowPathIcon, back: ArrowLeftIcon, forward: ArrowRightIcon, bell: BellIcon,
    course: BookOpenIcon, expand: ChevronDownIcon, trend: ArrowTrendingUpIcon,
    comment: ChatBubbleOvalLeftIcon, "done-circle": CheckCircleIcon, done: CheckIcon,
    copy: DocumentDuplicateIcon, show: EyeIcon, hide: EyeSlashIcon, save: InboxArrowDownIcon,
    send: PaperAirplaneIcon, settings: Cog6ToothIcon, graduate: AcademicCapIcon,
    favourite: HeartIcon, waiting: ClockIcon, info: InformationCircleIcon, key: KeyIcon,
    remove: MinusIcon, edit: PencilSquareIcon, play: PlayCircleIcon, connected: LinkIcon,
    add: PlusIcon, pin: MapPinIcon, invoice: ReceiptPercentIcon, verified: ShieldCheckIcon,
    spark: SparklesIcon, grid: Squares2X2Icon, target: FlagIcon, delete: TrashIcon,
    workflow: TreeIcon, trophy: TrophyIcon, upload: ArrowUpTrayIcon, invite: UserPlusIcon,
    people: UsersIcon, warning: ExclamationTriangleIcon, error: XCircleIcon, close: XMarkIcon,
    person: UserIcon, storage: CircleStackIcon,
}

/**
 * The 16px solid drawing, used by `chip`.
 *
 * Only the meanings that actually appear at chip size are listed; anything else falls back to its
 * outline drawing rather than inventing a solid one that was never authored.
 */
const SOLID: Partial<Record<IconName, Glyph>> = {
    "done-circle": CheckCircleSolid, done: CheckSolid, close: XSolid,
    warning: WarningSolid, info: InfoSolid, spark: SparklesSolid,
    favourite: HeartSolid, trophy: StarSolid,
}

/** Each role keeps the diameter its drawing was authored for. */
const ROLE_CLASSES: Record<IconRole, string> = {
    heading: "size-6 shrink-0",
    leading: "size-5 shrink-0",
    chip: "size-4 shrink-0",
}

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type IconData = {
    readonly name: IconName
    readonly role?: IconRole
}

/** Props for {@link Icon}. */
export type IconProps = LeafProps<IconData>

/**
 * Draw one glyph.
 *
 * The colour is always `currentColor`: an icon does not decide its own colour, the place it sits
 * does. That is what lets tone stay a property of the text beside it rather than a class on the row.
 *
 * @param input - {@link IconProps}
 */
export const Icon = ({ props, isLoading = false }: IconProps) => {
    const role = props.role ?? "chip"
    if (isLoading) {
        return (
            <span
                aria-hidden="true"
                data-tier="leaf"
                data-component="Icon"
                className={`${ROLE_CLASSES[role]} animate-pulse rounded-full bg-default`}
            />
        )
    }
    const Glyph = (role === "chip" ? SOLID[props.name] : undefined) ?? OUTLINE[props.name]
    return (
        <Glyph
            aria-hidden="true"
            data-tier="leaf"
            data-component="Icon"
            data-name={props.name}
            className={ROLE_CLASSES[role]}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
