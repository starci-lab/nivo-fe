import { CanonicalPage } from "@/features/pages/LandingPage"
type ContactRouteProps = { readonly searchParams: Promise<{ intent?: string | ReadonlyArray<string> }> }
/** Relationship-routing route adapter that hands the query to the contact owner. */
const ContactRoute = async (props: ContactRouteProps) => { const query = await props.searchParams; return <CanonicalPage route="contact" selectedIntent={query.intent} /> }
export default ContactRoute