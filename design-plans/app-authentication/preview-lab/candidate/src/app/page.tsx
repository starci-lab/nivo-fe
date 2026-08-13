import { AuthenticationPage } from "../components/pages/AuthenticationPage"

/**
 * The candidate's front door, which is the route's own resting state.
 *
 * @returns The route.
 */
const CandidateIndexRoute = () => <AuthenticationPage mode="signIn" phase="details" />

export default CandidateIndexRoute
