"use client"

import { useCallback } from "react"
import { submitLead, type LeadSubmission } from "@/modules/api/academy"

/** Own the public lead mutation so the interactive section receives a product command. */
export const useSubmitAcademyLead = () => useCallback(
    async (input: LeadSubmission) => (await submitLead(input)).ok,
    [],
)
