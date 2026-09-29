import { Button, Input, SurfaceCard } from "@starci/grammar/common"
import type { AcademyStudentCrmActions, AcademyStudentCrmLabels } from "../../../../modules/academy/student-crm"
import { ACADEMY_STUDENT_CRM_CREATE_CLASS_NAME } from "./classNames"

type AcademyStudentCrmCreateStudentProps = {
    readonly pendingAction?: string
    readonly labels: AcademyStudentCrmLabels
    readonly on: AcademyStudentCrmActions
}

/** Render the controls for creating a student. */
export const AcademyStudentCrmCreateStudent = (props: AcademyStudentCrmCreateStudentProps) => {
    const { pendingAction, labels, on } = props
    return (
        <SurfaceCard label={labels.create}>
            <div className={ACADEMY_STUDENT_CRM_CREATE_CLASS_NAME}>
                <Input
                    id="academy-student-name"
                    name="name"
                    label={labels.name}
                    isDisabled={pendingAction === "create"}
                    variant="secondary"
                    onValueChange={on.changeName}
                />
                <Input
                    id="academy-student-email"
                    name="email"
                    kind="email"
                    label={labels.email}
                    isDisabled={pendingAction === "create"}
                    variant="secondary"
                    onValueChange={on.changeEmail}
                />
                <Input
                    id="academy-student-password"
                    name="password"
                    kind="newPassword"
                    label={labels.password}
                    isDisabled={pendingAction === "create"}
                    variant="secondary"
                    onValueChange={on.changePassword}
                />
                <Button variant="primary" isPending={pendingAction === "create"} onPress={on.createStudent}>
                    {labels.saveStudent}
                </Button>
            </div>
        </SurfaceCard>
    )
}
