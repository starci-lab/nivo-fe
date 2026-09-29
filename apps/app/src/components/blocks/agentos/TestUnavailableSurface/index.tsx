import { ChoiceTabs } from "@nivo/ui"
import { SurfaceCard, Text } from "@starci/grammar/common"
import { ModuleCockpitRailBlock } from "../ModuleCockpitRailBlock"
import type { ModulePageCopyProps } from "../../../../modules/agentos/module-page-copy"

type TestUnavailableSurfaceProps = ModulePageCopyProps

/** Closed test state shown when an installation has no test contract. */
export const TestUnavailableSurface = (props: TestUnavailableSurfaceProps) => {
    const { copy } = props
    return (
        <div>
            <div>
                <ChoiceTabs
                    props={{
                        label: copy.pageTest.unavailableView,
                        selectedKey: "conversation",
                        tabs: [
                            {
                                id: "conversation",
                                label: copy.pageTest.unavailable,
                            },
                        ],
                    }}
                />
            </div>
            <div>
                <ModuleCockpitRailBlock
                    label={copy.pageTest.suite}
                    fact={copy.pageTest.unavailable}
                    items={[]}
                    selectedId=""
                    onSelect={() => undefined}
                />
            </div>
            <div>
                <SurfaceCard label={copy.pageTest.contractUnavailable}>
                    <div>
                        {
                            <div>
                                {[
                                    <div key="item-0">
                                        {<Text size="sm">{copy.pageTest.state}</Text>}
                                        {<Text size="sm">{copy.pageTest.noContract}</Text>}
                                    </div>,
                                ]}
                            </div>
                        }
                    </div>
                </SurfaceCard>
            </div>
            <div>
                <SurfaceCard label={copy.pageTest.trust} fact={copy.pageTest.unavailable}>
                    <div>
                        {
                            <div>
                                {[
                                    <div key="item-0">
                                        {<Text size="sm">{copy.pageTest.safety}</Text>}
                                        {<Text size="sm">{copy.pageTest.closed}</Text>}
                                    </div>,
                                ]}
                            </div>
                        }
                    </div>
                </SurfaceCard>
            </div>
        </div>
    )
}
