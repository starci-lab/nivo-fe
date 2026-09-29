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
export const AppsDashboardBase = ({ props, on }: AppsDashboardProps) => {
    const supportedOffer = supportedTemplateOffer(props.catalogue)
    const headingAction =
        supportedOffer === undefined || props.buildAppLabel === undefined ? null : (
            <Button size="lg" variant="primary" onPress={() => on.onBuildTemplate(supportedOffer.templateKey)}>
                {props.buildAppLabel}
            </Button>
        )
    return (
        <div>
            <div>
                <Heading level={1} scale="display">
                    {props.title}
                </Heading>
                {headingAction}
            </div>
            <Text size="md" tone="muted">
                {props.lede}
            </Text>
            <div>
                <div>
                    <AppsDashboardOwnedSection
                        owned={props.owned}
                        catalogue={props.catalogue}
                        buildAppLabel={props.buildAppLabel}
                        attentionGroupLabel={props.attentionGroupLabel}
                        steadyGroupLabel={props.steadyGroupLabel}
                        onBuildTemplate={on.onBuildTemplate}
                        onOpenOwnedApp={on.onOpenOwnedApp}
                    />
                </div>
                <div>
                    <AppsDashboardCatalogueSection catalogue={props.catalogue} onBuildTemplate={on.onBuildTemplate} />
                </div>
            </div>
        </div>
    )
}
