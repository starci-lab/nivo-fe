import { DomainsPage } from "../../components/pages/DomainsPage"

/**
 * The `/domains` route. It mounts the page and nothing else.
 *
 * Target: `apps/app/src/app/domains/page.tsx`.
 *
 * @returns The route.
 */
const DomainsRoute = () => <DomainsPage phase="populated" />

export default DomainsRoute
