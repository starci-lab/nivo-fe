"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { readSessionEndingArrival, type SessionEndingArrival } from "@/modules/auth/authentication"
import { SessionEndingQueryView } from "./component"

type SessionEndingQueryProps = {
    readonly onParam: (arrival: SessionEndingArrival) => void
}

/** Read each live query value and report a hand-off without drawing a surface. */
export const SessionEndingQuery = (props: SessionEndingQueryProps) => {
    const { onParam } = props
    const search = useSearchParams().toString()

    useEffect(() => {
        const arrival = readSessionEndingArrival(search)
        if (arrival.handedOff) onParam(arrival)
    }, [onParam, search])

    return <SessionEndingQueryView />
}
