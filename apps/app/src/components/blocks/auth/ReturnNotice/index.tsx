"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/hooks"
import { ReturnNoticeBase } from "./component"

/** The landing notice resolves everything it draws, so it takes no props of its own. */
export type ReturnNoticeProps = {
    readonly [key: string]: never
}

/** The marker the sign-in surface leaves when a requested destination could not be honoured. */
const RETURN_NOTICE_PARAM = "returnNotice"
const UNAVAILABLE_VALUE = "unavailable"

/**
 * Connected owner of the landing's unavailable-return notice.
 *
 * WHY THE ANSWER TRAVELS ON THE ADDRESS. The session resolved a destination it could not honour, and
 * that answer has nowhere else to go: the sign-in surface is being left and its state with it. The
 * address is the one thing that survives that navigation - it is how the console already carries an
 * interrupted route - and the landing is where the answer belongs, because the person is signed in
 * and stays signed in.
 *
 * THE MARKER IS SPENT IN THE TURN IT IS READ, AND THE NOTICE OUTLIVES IT. The address is put back
 * without the marker, so a reload, a bookmark or a pasted link cannot repeat a notice about a
 * destination nobody is heading to any more - while the sentence stays on the landing it was handed
 * to, which is the only place it can still be true. What is read once is the address, not the
 * person's attention: leaving this landing and coming back is ordinary navigation.
 *
 * THE READ IS LIVE, ITS VALUE IS HELD. `useSearchParams` answers the query of the address actually
 * being rendered rather than sampling it once, so a marker that arrives after mount - a console
 * navigation into the landing rather than a first load - is still seen; the landing it arrived on is
 * held in state, so the value this very effect strips from the address cannot take the notice away
 * with it.
 *
 * @param props - {@link ReturnNoticeProps}
 * @returns The landing's notice, or nothing when no destination was refused.
 */
export const ReturnNotice = (props: ReturnNoticeProps) => {
    void props
    const t = useTranslations("authentication")
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const search = searchParams.toString()
    const isMarked = new URLSearchParams(search).get(RETURN_NOTICE_PARAM) === UNAVAILABLE_VALUE
    const [landedOn, setLandedOn] = useState<string | null>(isMarked ? pathname : null)
    useEffect(() => {
        if (!isMarked) {
            return
        }
        setLandedOn(pathname)
        const rest = new URLSearchParams(search)
        rest.delete(RETURN_NOTICE_PARAM)
        const query = rest.toString()
        router.replace(query.length === 0 ? pathname : `${pathname}?${query}`)
    }, [isMarked, pathname, router, search])
    return (
        <ReturnNoticeBase
            props={{
                message: landedOn === pathname ? t("unavailableReturnNotice") : null,
            }}
        />
    )
}
