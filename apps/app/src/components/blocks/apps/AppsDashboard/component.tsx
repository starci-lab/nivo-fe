import { Button, Heading, Text } from "@starci/grammar/common"
import { AppsDashboardCatalogueSection } from "../AppsDashboardCatalogueSection"
import { AppsDashboardOwnedSection } from "../AppsDashboardOwnedSection"
import {
    supportedTemplateOffer,
    type AppsDashboardActions,
    type AppsDashboardData,
} from "../../../../modules/apps/apps-dashboard"

export type {
    AppsDashboardActions,
    AppsDashboardData,
    CatalogueSectionView,
    OwnedAppRow,
    OwnedSectionView,
    TemplateOfferRowView,
} from "../../../../modules/apps/apps-dashboard"

type AppsDashboardProps = { readonly props: AppsDashboardData; readonly on: AppsDashboardActions }

/** Draw the app set, its catalogue, and the one supported build action. */
export const AppsDashboardBase = (props: AppsDashboardProps) => {
    const { props: data, on }: AppsDashboardProps = props
    const supportedOffer = supportedTemplateOffer(data.catalogue)
    const headingAction =
        supportedOffer === undefined || data.buildAppLabel === undefined ? null : (
            <Button size="lg" variant="primary" onPress={() => on.onBuildTemplate(supportedOffer.templateKey)}>
                {data.buildAppLabel}
            </Button>
        )
    return (
        <div>
            <div>
                <Heading level={1} scale="display">
                    {data.title}
                </Heading>
                {headingAction}
            </div>
            <Text size="md" tone="muted">
                {data.lede}
            </Text>
            <div>
                <div>
                    <AppsDashboardOwnedSection
                        owned={data.owned}
                        catalogue={data.catalogue}
                        buildAppLabel={data.buildAppLabel}
                        attentionGroupLabel={data.attentionGroupLabel}
                        steadyGroupLabel={data.steadyGroupLabel}
                        onBuildTemplate={on.onBuildTemplate}
                        onOpenOwnedApp={on.onOpenOwnedApp}
                    />
                </div>
                <div>
                    <AppsDashboardCatalogueSection catalogue={data.catalogue} onBuildTemplate={on.onBuildTemplate} />
                </div>
            </div>
        </div>
    )
}
