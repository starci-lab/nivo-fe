import Image from "next/image"
import {
    FIGURE_CLASS_NAME,
    FIGURE_IMAGE_CLASS_NAME,
    FIGURE_PLACEHOLDER_CLASS_NAME,
} from "./classNames"

type AcademySectionFigureProps = {
    readonly src?: string
    readonly alt: string
    readonly ratio?: string
    readonly failedImageSources: ReadonlySet<string>
    readonly failImage: (src: string) => void
}

/** Draw one authored image while retaining a stable frame when the image is absent or broken. */
export const AcademySectionFigure = (props: AcademySectionFigureProps) => {
    const ratio = props.ratio ?? "4/3"
    const usable = props.src !== undefined && props.src !== "" && !props.failedImageSources.has(props.src)
    return (
        <figure className={FIGURE_CLASS_NAME} style={{ aspectRatio: ratio }}>
            {usable ? (
                <Image
                    src={props.src}
                    alt={props.alt}
                    fill
                    sizes="(min-width: 48rem) 50vw, 100vw"
                    unoptimized
                    referrerPolicy="no-referrer"
                    onError={() => props.src !== undefined && props.failImage(props.src)}
                    className={FIGURE_IMAGE_CLASS_NAME}
                />
            ) : (
                <svg viewBox="-64 -64 192 192" className={FIGURE_PLACEHOLDER_CLASS_NAME} aria-hidden="true">
                    <circle cx="32" cy="22" r="12" fill="currentColor" />
                    <path d="M8 62c0-13 11-22 24-22s24 9 24 22z" fill="currentColor" />
                </svg>
            )}
        </figure>
    )
}
