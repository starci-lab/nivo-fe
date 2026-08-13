import { ProvisioningPage } from "../../components/pages/ProvisioningPage"

/** Review route isolating the `empty` state. Not materialized; the app route owns all four. */
const EmptyRoute = () => <ProvisioningPage phase="empty" />

export default EmptyRoute
