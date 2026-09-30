import { ProductHeroBase } from "./component"
import type {
    ProductActionRenderer,
    ProductHref,
    ProductPageId,
    ProductPageStructure,
    ProductTranslate,
} from "../../../../modules/product/types"
import type { ProductHeroCopy } from "./copy"

type ProductHeroProps = {
    readonly page: ProductPageId
    readonly structure: ProductPageStructure
    readonly t: ProductTranslate
    readonly href: ProductHref
    readonly renderAction: ProductActionRenderer
}

/** Resolve the hero's sentences and the action slots owned by the product page. */
export const ProductHero = (props: ProductHeroProps) => {
    const { page, structure, t, href, renderAction } = props
    const operating = (key: string) => (page === "nivoOs" ? t(`nivoOs.hero.visual.${key}`) : "")
    const assurance = (key: string) =>
        page === "systemOfResponsibility" ? t(`systemOfResponsibility.hero.visual.${key}`) : ""
    const gallery = (key: string) => (page === "applications" ? t(`applications.hero.visual.gallery.${key}`) : "")
    const copy: ProductHeroCopy = {
        eyebrow: t(`${page}.hero.eyebrow`),
        title: t(`${page}.hero.title`),
        descriptor: structure.hero.descriptor ? t(`${page}.hero.descriptor`) : null,
        supporting: t(`${page}.hero.supporting`),
        philosophy: structure.hero.philosophy ? t(`${page}.hero.philosophy`) : null,
        signalLabel: t(`${page}.hero.signalLabel`),
        signalValue: t(`${page}.hero.signalValue`),
        signalNote: t(`${page}.hero.signalNote`),
        coreName: operating("coreName"),
        coreLabel: operating("coreLabel"),
        nodesLabel: operating("nodesLabel"),
        nodes: {
            businessIntent: operating("nodes.businessIntent"),
            humanLeads: operating("nodes.humanLeads"),
            aiOperates: operating("nodes.aiOperates"),
            outcomeVerified: operating("nodes.outcomeVerified"),
        },
        owner: assurance("owner"),
        responsibility: assurance("responsibility"),
        stepsLabel: assurance("stepsLabel"),
        steps: {
            context: assurance("steps.context"),
            boundary: assurance("steps.boundary"),
            evidence: assurance("steps.evidence"),
        },
        gallery: {
            growth: gallery("growth"),
            operate: gallery("operate"),
            money: gallery("money"),
            create: gallery("create"),
        },
    }
    return (
        <ProductHeroBase
            props={{ page, copy }}
            state={{
                actions: structure.hero.actions.map((action) =>
                    renderAction(action, t(`${page}.hero.actions.${action.key}`), href),
                ),
            }}
        />
    )
}
