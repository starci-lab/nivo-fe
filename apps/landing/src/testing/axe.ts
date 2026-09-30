import { axe } from "jest-axe"

/**
 * One accessibility assertion per connected screen. jest-axe runs axe-core's default rules with
 * the color rules disabled, because jsdom cannot compute layout or paint. A violation throws with
 * every rule id so the failing screen names what to fix.
 */
export const expectNoA11yViolations = async (container: Element): Promise<void> => {
    const { violations } = await axe(container)
    if (violations.length > 0) {
        throw new Error(`Accessibility violations: ${violations.map((violation) => violation.id).join(", ")}`)
    }
}
