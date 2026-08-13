import { ProvisioningPage } from "../components/pages/ProvisioningPage"

/**
 * The provisioning route. It mounts the page and nothing else.
 *
 * Target: `apps/app/src/app/provisioning/page.tsx`, where the import becomes the `@/` alias.
 *
 * @returns The route.
 */
const ProvisioningRoute = () => <ProvisioningPage phase="populated" />

export default ProvisioningRoute
