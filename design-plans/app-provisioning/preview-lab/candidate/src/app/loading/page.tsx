import { ProvisioningPage } from "../../components/pages/ProvisioningPage"

/** Review route isolating the `loading` state. Not materialized; the app route owns all four. */
const LoadingRoute = () => <ProvisioningPage phase="loading" />

export default LoadingRoute
