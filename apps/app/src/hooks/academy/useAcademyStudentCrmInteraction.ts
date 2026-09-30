import { useReducer } from "react"

type AcademyStudentCrmInteractionState = {
    readonly selectedMemberId: string | undefined
    readonly pendingAction: string | undefined
    readonly actionMessage: string | undefined
    readonly name: string
    readonly email: string
    readonly password: string
    readonly courseSlug: string
}

type AcademyStudentCrmInteractionAction =
    | { readonly type: "openStudent"; readonly memberId: string }
    | { readonly type: "changeName"; readonly value: string }
    | { readonly type: "changeEmail"; readonly value: string }
    | { readonly type: "changePassword"; readonly value: string }
    | { readonly type: "changeCourseSlug"; readonly value: string }
    | { readonly type: "startAction"; readonly kind: string }
    | { readonly type: "finishAction"; readonly message: string }

const INITIAL_ACADEMY_STUDENT_CRM_INTERACTION_STATE: AcademyStudentCrmInteractionState = {
    selectedMemberId: undefined,
    pendingAction: undefined,
    actionMessage: undefined,
    name: "",
    email: "",
    password: "",
    courseSlug: "",
}

const academyStudentCrmInteractionReducer = (
    state: AcademyStudentCrmInteractionState,
    action: AcademyStudentCrmInteractionAction,
): AcademyStudentCrmInteractionState => {
    switch (action.type) {
        case "openStudent":
            return { ...state, selectedMemberId: action.memberId }
        case "changeName":
            return { ...state, name: action.value }
        case "changeEmail":
            return { ...state, email: action.value }
        case "changePassword":
            return { ...state, password: action.value }
        case "changeCourseSlug":
            return { ...state, courseSlug: action.value }
        case "startAction":
            return { ...state, pendingAction: action.kind, actionMessage: undefined }
        case "finishAction":
            return { ...state, pendingAction: undefined, actionMessage: action.message }
    }
}

/** Keep the Academy student CRM's form, selection, and operation state together. */
export const useAcademyStudentCrmInteraction = () => {
    const [state, dispatch] = useReducer(
        academyStudentCrmInteractionReducer,
        INITIAL_ACADEMY_STUDENT_CRM_INTERACTION_STATE,
    )

    return {
        state,
        openStudent: (memberId: string) => dispatch({ type: "openStudent", memberId }),
        changeName: (value: string) => dispatch({ type: "changeName", value }),
        changeEmail: (value: string) => dispatch({ type: "changeEmail", value }),
        changePassword: (value: string) => dispatch({ type: "changePassword", value }),
        changeCourseSlug: (value: string) => dispatch({ type: "changeCourseSlug", value }),
        startAction: (kind: string) => dispatch({ type: "startAction", kind }),
        finishAction: (message: string) => dispatch({ type: "finishAction", message }),
    }
}
