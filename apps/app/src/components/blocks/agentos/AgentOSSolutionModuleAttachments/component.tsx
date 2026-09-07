import type { ComponentProps } from "react";
import { AgentOSModuleAttachmentsBase } from "@/components/blocks/agentos/AgentOSModuleAttachments/component";

/** Pure attachment lifecycle props supplied by the connected built-in module boundary. */
export type AgentOSSolutionModuleAttachmentsProps = ComponentProps<typeof AgentOSModuleAttachmentsBase>;

/** Draw built-in installation evidence using the shared attachment lifecycle surface. */
export const AgentOSSolutionModuleAttachmentsBase = (props: AgentOSSolutionModuleAttachmentsProps) => <AgentOSModuleAttachmentsBase {...props} />;
