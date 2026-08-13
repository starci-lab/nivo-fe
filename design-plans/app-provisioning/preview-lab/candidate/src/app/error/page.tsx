import { ProvisioningPage } from "../../components/pages/ProvisioningPage"

/** Review route isolating the `error` state. Not materialized; the app route owns all four. */
const ErrorRoute = () => <ProvisioningPage phase="error" />

export default ErrorRoute
