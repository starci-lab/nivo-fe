import { useCallback } from "react"
import { submitLead } from "@/modules/api/academy"
import type { SubmitLeadInput } from "@/modules/api/__generated__/graphql"

/** Own the public lead mutation so the interactive section receives a product command. */
export const useSubmitAcademyLead = () =>
    useCallback(async (input: SubmitLeadInput) => (await submitLead(input)).ok, [])
