import { BillingPage } from "../../components/pages/BillingPage"

/**
 * The `/billing` route. It mounts the page and nothing else.
 *
 * Target: `apps/app/src/app/billing/page.tsx`.
 *
 * @returns The route.
 */
const BillingRoute = () => <BillingPage phase="populated" />

export default BillingRoute
