import { skeletonVariants } from "@heroui/react"
import type { LeafProps } from "../../contracts/props"

/** Data owned by the Nivo dashboard mascot artwork. */
export type NivoUnicornArtworkData = { readonly tone?: "brand" }

/** Props for {@link NivoUnicornArtwork}. */
export type NivoUnicornArtworkProps = LeafProps<NivoUnicornArtworkData>

const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base()

/** Draw the single decorative Nivo unicorn band used above the account signals. */
export const NivoUnicornArtwork = ({ props, isLoading = false }: NivoUnicornArtworkProps) => {
    const tone = props.tone ?? "brand"
    return (
        <span
            data-tier="leaf"
            data-component="NivoUnicornArtwork"
            data-tone={tone}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden="true"
            className={[
                "flex h-24 w-full items-center justify-end overflow-hidden rounded-3xl bg-accent-soft px-4",
                isLoading ? RESTING_CLASSES : "",
            ].join(" ")}
        >
            {isLoading ? null : (
                <img
                    src="/images/nivo-unicorn-overview.png"
                    alt=""
                    width="180"
                    height="120"
                    className="h-28 w-auto object-contain object-right"
                />
            )}
        </span>
    )
}

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
