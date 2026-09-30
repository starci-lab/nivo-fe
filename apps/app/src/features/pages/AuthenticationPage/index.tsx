import { AuthenticationPage as AuthenticationPageBlock } from "@/components/blocks/auth/AuthenticationPage"

/** Empty route input; authentication resolves from the current session and address. */
export type AuthenticationPageProps = Record<string, never>

/** Compose the interactive authentication flow below the server route. */
export const AuthenticationPage = (props: AuthenticationPageProps) => {
    void props
    return <AuthenticationPageBlock />
}

export default AuthenticationPage