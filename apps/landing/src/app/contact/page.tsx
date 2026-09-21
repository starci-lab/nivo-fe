import { CanonicalPage } from "@/components/pages/LandingPage"
type ContactRouteProps = { readonly searchParams: Promise<{ intent?: string | readonly string[] }> }
/** Relationship-routing route adapter that validates query intent before rendering. */
const ContactRoute = async ({ searchParams }: ContactRouteProps) => { const query = await searchParams; const value = Array.isArray(query.intent) ? query.intent[0] : query.intent; return <CanonicalPage route="contact" selectedIntent={value} /> }
export default ContactRoute
