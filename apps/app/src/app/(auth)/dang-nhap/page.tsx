"use client"

import { useState } from "react"
import { Tree, defineContractComponent } from "@nivo/ui"
import { SignInPanel, type SignInProvider, type SignInState } from "@/components/blocks/auth/SignInPanel/component"

/**
 * PAGE - sign in.
 *
 * The page owns the reading order of the route and nothing else: the panel owns what is asked, and
 * the registry owns how the surface sits on the screen. There are no layout classes here, which is
 * the point - a route that styles its own children becomes a second owner of the screen.
 *
 * THE DATA LAYER IS NOT WIRED YET. The mutations exist on the backend, but this app has no GraphQL
 * client, so the state below is local and drives the approved state matrix rather than a session.
 * It is labelled here rather than hidden, because a page that looks connected and is not is the
 * kind of thing that gets believed.
 */

/** Already-resolved Vietnamese copy. A block never translates; the page hands it finished text. */
const COPY = {
    title: "Đăng nhập",
    subtitle: "Quản lý các hệ thống bạn đang chạy trên nivo.",
    emailLabel: "Email",
    emailPlaceholder: "ban@congty.vn",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "Mật khẩu của bạn",
    revealLabel: "Hiện mật khẩu",
    hideLabel: "Ẩn mật khẩu",
    submitLabel: "Đăng nhập",
    orLabel: "hoặc",
    googleLabel: "Tiếp tục với Google",
    githubLabel: "Tiếp tục với GitHub",
    forgotPasswordLabel: "Quên mật khẩu?",
    useCredentialsLabel: "Dùng email và mật khẩu",
    signUpLabel: "Tạo tài khoản",
} as const

/**
 * The refusal sentence.
 *
 * It names neither the email nor which half was wrong. The backend refuses to disclose whether an
 * address has an account, and a friendlier message here would hand back exactly what the API is
 * withholding.
 */
const REFUSED = "Email hoặc mật khẩu không đúng."

/** What an account holding a second factor is told, since this build cannot complete one. */
const TWO_FACTOR = "Tài khoản này bật xác minh hai lớp. nivo chưa hỗ trợ bước đó trên bản này — "
    + "hãy tạm tắt xác minh hai lớp, hoặc dùng một tài khoản khác."

/** What a reset request says, worded so it reveals nothing either way. */
const RESET_SENT = "Nếu có tài khoản dùng email này, chúng tôi đã gửi liên kết đặt lại mật khẩu."

/** What a refused code exchange says. */
const EXCHANGE_FAILED = "Không hoàn tất được đăng nhập. Liên kết có thể đã hết hạn."

/**
 * The sign-in route.
 *
 * @returns The page.
 */
const SignInPage = () => {
    const [state, setState] = useState<SignInState>("entry")
    const [isCredentialsOpen, setIsCredentialsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [isError, setIsError] = useState(false)

    const frame = { title: COPY.title, subtitle: COPY.subtitle, statusMessage, isError, isPending }

    /**
     * Hand off to a provider.
     *
     * @param provider - Which identity provider was chosen.
     */
    const chooseProvider = (provider: SignInProvider) => {
        setStatusMessage(`Đang chuyển tới ${provider === "google" ? "Google" : "GitHub"}…`)
        setIsError(false)
        setState("handingOff")
    }

    const panel = state === "entry"
        ? (
            <SignInPanel
                state="entry"
                props={{ ...frame, ...COPY, isCredentialsOpen }}
                on={{
                    chooseProvider,
                    openCredentials: () => setIsCredentialsOpen(true),
                    submitCredentials: () => {
                        setIsPending(true)
                        setStatusMessage("")
                        setIsError(true)
                        setIsPending(false)
                        setStatusMessage(REFUSED)
                    },
                    forgotPassword: () => {
                        setStatusMessage(RESET_SENT)
                        setIsError(false)
                        setState("resetLinkSent")
                    },
                }}
            />
        )
        : state === "handingOff" || state === "exchanging"
            ? <SignInPanel state={state} props={frame} />
            : (
                <SignInPanel
                    state={state}
                    props={{
                        ...frame,
                        statusMessage: state === "twoFactorUnsupported"
                            ? TWO_FACTOR
                            : state === "resetLinkSent" ? RESET_SENT : EXCHANGE_FAILED,
                        onwardLabel: state === "exchangeFailed" ? "Thử lại" : "Quay lại đăng nhập",
                    }}
                    on={{
                        startOver: () => {
                            setState("entry")
                            setStatusMessage("")
                            setIsError(false)
                        },
                    }}
                />
            )

    return (
        <Tree
            contract="centred-authentication-page"
            render={defineContractComponent("centred-authentication-page", {
                surface: defineContractComponent("authentication-panel-card", {
                    panel: { kind: "projection", meta: { shape: "contract", contract: "centred-page-column" }, project: () => panel },
                }),
            })}
        />
    )
}

export default SignInPage
