import styles from "./product.module.css"

/** App-owned composition classes for the canonical product and commercial pages. */
export const PRODUCT_CLASS_NAMES = {
    page: styles.page,
    hero: styles.hero,
    heroInner: styles.heroInner,
    heroCopy: styles.heroCopy,
    heroVisual: styles.heroVisual,
    heroCanvas: styles.heroCanvas,
    heroOrbit: styles.heroOrbit,
    heroCore: styles.heroCore,
    heroNodes: styles.heroNodes,
    heroNode: styles.heroNode,
    heroArtwork: styles.heroArtwork,
    heroResponsibility: styles.heroResponsibility,
    heroSteps: styles.heroSteps,
    heroGallery: styles.heroGallery,
    heroGalleryCard: styles.heroGalleryCard,
    heroSignal: styles.heroSignal,
    heroSignalLabel: styles.heroSignalLabel,
    heroSignalValue: styles.heroSignalValue,
    heroSignalNote: styles.heroSignalNote,
    actionRow: styles.actionRow,
    actionNote: styles.actionNote,
    section: styles.section,
    sectionSoft: `${styles.section} ${styles.sectionSoft}`,
    sectionDark: `${styles.section} ${styles.sectionDark}`,
    sectionCrimson: `${styles.section} ${styles.sectionCrimson}`,
    sectionBody: styles.sectionBody,
    gridTwo: styles.gridTwo,
    gridThree: styles.gridThree,
    gridFour: styles.gridFour,
    concept: styles.concept,
    conceptStrong: `${styles.concept} ${styles.conceptStrong}`,
    conceptIcon: styles.conceptIcon,
    truthLine: styles.truthLine,
    flow: styles.flow,
    flowStep: styles.flowStep,
    flowNode: styles.flowNode,
    flowCopy: styles.flowCopy,
    flowArrow: styles.flowArrow,
    comparison: styles.comparison,
    tableFrame: styles.tableFrame,
    table: styles.table,
    semanticList: styles.semanticList,
    pathGrid: styles.pathGrid,
    path: styles.path,
    pathIndex: styles.pathIndex,
    offerGrid: styles.offerGrid,
    offer: styles.offer,
    offerFeatured: `${styles.offer} ${styles.offerFeatured}`,
    price: styles.price,
    priceQualifier: styles.priceQualifier,
    choice: styles.choice,
    choiceArrow: styles.choiceArrow,
    branch: styles.branch,
    faq: styles.faq,
    faqItem: styles.faqItem,
    selector: styles.selector,
    selectorLink: styles.selectorLink,
    screenReaderOnly: styles.screenReaderOnly,
} as const

/** Resolve the canonical section surface without leaking class composition into JSX. */
export const productSectionClassName = (tone: string): string => {
    if (tone === "soft") return PRODUCT_CLASS_NAMES.sectionSoft
    if (tone === "dark") return PRODUCT_CLASS_NAMES.sectionDark
    if (tone === "crimson") return PRODUCT_CLASS_NAMES.sectionCrimson
    return PRODUCT_CLASS_NAMES.section
}

/** Resolve the bounded concept grid selected by canonical content. */
export const productGridClassName = (columns: number): string => {
    if (columns === 4) return PRODUCT_CLASS_NAMES.gridFour
    if (columns === 3) return PRODUCT_CLASS_NAMES.gridThree
    return PRODUCT_CLASS_NAMES.gridTwo
}

/** Resolve a commercial offer surface while preserving one featured offer. */
export const productOfferClassName = (featured: boolean): string => (
    featured ? PRODUCT_CLASS_NAMES.offerFeatured : PRODUCT_CLASS_NAMES.offer
)
