"use client"

import { endPrincipalSessions } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/**
 * Own the scoped administrator session ending.
 *
 * ONE SHAPE ANSWERS ALL THREE OUTCOMES, so the whole answer travels and the caller reads `kind` and
 * nothing else: an applied scope, the one generic refusal, or undecided for an authority that did not
 * answer - never a count, a place, or whether the named principal existed. Unwrapping it here would
 * leave every caller to guess which of the three it received.
 *
 * THE REQUESTER IS NOT NAMED HERE. The transport takes the requester from the verified access grant,
 * so this hook carries only one logical request's identity, the selected roster member and the
 * authority context the caller acts under.
 */
export const useMutateEndPrincipalSessionsSwr = () => useAuthMutation("end-principal-sessions", endPrincipalSessions)
