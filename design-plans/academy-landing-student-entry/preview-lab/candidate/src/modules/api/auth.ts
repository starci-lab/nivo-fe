/** The identity providers this academy accepts, named as the API names them. */
export enum KeycloakIdentityProvider {
    Google = "google",
    Github = "github",
}

/**
 * The academy's entry lanes, and only the two it has.
 *
 * `signUp`, password reset and two-factor are NOT here because the academy API does not expose
 * them - they exist on the control plane. Both lanes below create the member themselves, so the
 * absence of a sign-up call is the design rather than a gap.
 */

/** Where the academy API answers. */
const ENDPOINT = process.env.NEXT_PUBLIC_ACADEMY_API_URL ?? "http://localhost:3069/graphql"

/** What a caller gets back: nothing useful on success, or the reason there is none. */
export type EntryResult =
    | { readonly ok: true }
    | { readonly ok: false, readonly reason: string }

/**
 * Sign in with an email and a password.
 *
 * A REFUSAL MAY NOT SAY WHETHER THE EMAIL EXISTS. The backend refuses without setting a cookie or
 * upserting a member, and this returns its message unchanged rather than interpreting it into
 * something more specific.
 *
 * @param email - The address entered.
 * @param password - The secret entered.
 * @returns Whether a session was established.
 */
export const signIn = async (email: string, password: string): Promise<EntryResult> => {
    let response: Response
    try {
        response = await fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                query: `mutation SignIn($input: SignInInput!) {
                    signIn(input: $input) { success message error }
                }`,
                variables: { input: { email, password } },
            }),
        })
    } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : "network error" }
    }
    if (!response.ok) {
        return { ok: false, reason: `HTTP ${response.status}` }
    }
    const body = await response.json() as {
        data?: { signIn?: { success: boolean, message: string, error?: string | null } }
        errors?: ReadonlyArray<{ message: string }>
    }
    if (body.errors?.length) {
        return { ok: false, reason: body.errors[0].message }
    }
    const envelope = body.data?.signIn
    if (!envelope) {
        return { ok: false, reason: "empty response" }
    }
    return envelope.success ? { ok: true } : { ok: false, reason: envelope.error || envelope.message }
}

/**
 * Register a new member of THIS academy.
 *
 * THE MUTATION DOES NOT EXIST YET. An academy member account belongs to the expert's own users and
 * has nothing to do with nivo, so an academy that cannot register its own users is missing a
 * capability rather than exercising a choice - the owner settled that on 2026-08-13, and
 * `plan-record.json`'s `academy-sign-up` enabler is what makes it real.
 *
 * The call is written the way it will be rather than stubbed, so the day the resolver lands this
 * function needs no edit. Until then the API answers "Cannot query field", and that is mapped to
 * the one honest sentence the panel can show: use a provider instead.
 *
 * @param email - The address being registered.
 * @param password - The chosen secret.
 * @returns Whether an account now exists.
 */
export const signUp = async (email: string, password: string): Promise<EntryResult> => {
    let response: Response
    try {
        response = await fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                query: `mutation SignUp($input: SignUpInput!) {
                    signUp(input: $input) { success message error }
                }`,
                variables: { input: { email, password } },
            }),
        })
    } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : "network error" }
    }
    const body = await response.json() as {
        data?: { signUp?: { success: boolean, message: string, error?: string | null } }
        errors?: ReadonlyArray<{ message: string }>
    }
    if (body.errors?.length) {
        // The schema has no such field yet. Reported as the missing capability rather than as a
        // network fault, because those are two different things to a reader and to whoever is on
        // call.
        return { ok: false, reason: "SIGN_UP_UNAVAILABLE" }
    }
    const envelope = body.data?.signUp
    if (!envelope) {
        return { ok: false, reason: "SIGN_UP_UNAVAILABLE" }
    }
    return envelope.success ? { ok: true } : { ok: false, reason: envelope.error || envelope.message }
}
