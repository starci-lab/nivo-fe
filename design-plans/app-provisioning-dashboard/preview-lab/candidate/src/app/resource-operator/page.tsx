import { ResourceDetailPage } from "../../components/pages/ResourceDetailPage"

/** Review route isolating one resource state as an OPERATOR sees it. Not materialized; the app reaches these from a routed id. */
const Route = () => <ResourceDetailPage phase="running" isOperator />

export default Route
