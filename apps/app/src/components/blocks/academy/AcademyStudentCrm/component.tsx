import type { AcademyStudentCrmProps } from "../../../../modules/academy/student-crm"
import { AcademyStudentCrmCreateStudent } from "../AcademyStudentCrmCreateStudent"
import { AcademyStudentCrmDetail } from "../AcademyStudentCrmDetail"
import { AcademyStudentCrmRoster } from "../AcademyStudentCrmRoster"

export type {
    AcademyStudentCrmActions,
    AcademyStudentCrmData,
    AcademyStudentCrmLabels,
    AcademyStudentCrmProps,
    AcademyStudentCrmViewProps,
} from "../../../../modules/academy/student-crm"

type AcademyStudentCrmBaseProps = AcademyStudentCrmProps

/** Compose the pure roster, create form and selected student details. */
export const AcademyStudentCrmBase = (props: AcademyStudentCrmBaseProps) => {
    const { state, props: data, on } = props
    return (
        <>
            <AcademyStudentCrmRoster
                state={state}
                students={data.students}
                notice={data.notice}
                labels={data.labels}
                on={on}
            />
            <AcademyStudentCrmCreateStudent pendingAction={data.pendingAction} labels={data.labels} on={on} />
            <AcademyStudentCrmDetail
                detailState={data.detailState}
                detail={data.detail}
                detailNotice={data.detailNotice}
                pendingAction={data.pendingAction}
                actionMessage={data.actionMessage}
                labels={data.labels}
                on={on}
            />
        </>
    )
}
