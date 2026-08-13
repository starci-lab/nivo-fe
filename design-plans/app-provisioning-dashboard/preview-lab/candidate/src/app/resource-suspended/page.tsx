import { ResourceDetailPage } from "../../components/pages/ResourceDetailPage"

/** Review route isolating one resource state. Not materialized; the app reaches these from a routed id. */
const Route = () => <ResourceDetailPage phase="suspended" />

export default Route
