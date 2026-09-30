import { SurfaceCard, Text } from "@starci/grammar/common"
import { APPS_DASHBOARD_REFUSED_CLASS_NAME } from "./classNames"

/** Props for {@link AppsDashboardRefusedSection}. */
type AppsDashboardRefusedSectionProps = { readonly label: string; readonly note: string }

/** State plainly when an owned or catalogue read was refused. */
export const AppsDashboardRefusedSection = (props: AppsDashboardRefusedSectionProps) => {
    const { label, note }: AppsDashboardRefusedSectionProps = props
    return (
        <SurfaceCard label={label}>
            <div className={APPS_DASHBOARD_REFUSED_CLASS_NAME}>
                <Text size="sm" tone="muted">
                    {note}
                </Text>
            </div>
        </SurfaceCard>
    )
}
