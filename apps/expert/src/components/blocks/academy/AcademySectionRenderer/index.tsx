import type { AcademySection, AcademySectionRenderState } from "../../../../modules/academy/academy-sections"
import { AcademyCustomSection } from "../AcademyCustomSection"
import { AcademyLeadBand } from "../AcademyLeadBand"
import { AcademyRichSection } from "../AcademyRichSection"
import { AcademySimpleSection } from "../AcademySimpleSection"

type AcademySectionRendererProps = {
    readonly section: AcademySection
    readonly state: AcademySectionRenderState
}

/** Route one settled section to the pure renderer for its content shape. */
export const AcademySectionRenderer = (props: AcademySectionRendererProps) => {
    const { section, state } = props
    switch (section.kind) {
        case "custom":
            return <AcademyCustomSection section={section} imageState={state} />
        case "lead":
            return <AcademyLeadBand section={section} status={state.leadStatus} submit={state.submitLead} />
        case "instructor":
        case "stats":
        case "testimonials":
        case "gallery":
        case "courses":
            return <AcademyRichSection section={section} imageState={state} />
        case "hero":
        case "problems":
        case "outcomes":
        case "roadmap":
        case "community":
        case "offer":
        case "faq":
        case "magnet":
            return <AcademySimpleSection section={section} />
    }
}
