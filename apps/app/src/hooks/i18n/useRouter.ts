"use client"

import { navigation } from "@/modules/i18n"

/**
 * The locale-aware router, bound once beside {@link navigation}. A component reaches it as
 * `useRouter` from `@/hooks` - the declaration lives under the hooks root because a custom hook
 * has no other home.
 */
export const useRouter = navigation.useRouter
