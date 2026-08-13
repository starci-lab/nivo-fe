import { ResourcesPage } from "../components/pages/ResourcesPage"

/**
 * The console home. It mounts the resource list and nothing else.
 *
 * Target: `apps/app/src/app/provisioning/page.tsx` - the route the shipped page already owns.
 *
 * @returns The route.
 */
const ResourcesRoute = () => <ResourcesPage phase="populated" />

export default ResourcesRoute
