import { ChatWorkspace, EmptyNotice, Input, PageContainer, SectionHeader, SurfaceCard, Text } from "@starci/grammar/common";
import { GROUP_CHAT_COMPOSER_CLASS_NAME, GROUP_CHAT_HOST_CLASS_NAME, GROUP_LIST_CLASS_NAME } from "./classNames";

/** User-facing copy for the safe pre-contract group-chat surface. */
export type GroupChatPageActions = { readonly changeRailOpen: (isOpen: boolean) => void };
/** Settled state and copy rendered by the pure Group Chat page. */
export type GroupChatPageProps = {
  readonly isRailOpen: boolean;
  readonly on: GroupChatPageActions;
  readonly labels: {
    readonly title: string;
    readonly description: string;
    readonly groups: string;
    readonly groupsEmpty: string;
    readonly conversation: string;
    readonly unavailable: string;
    readonly unavailableHint: string;
    readonly composer: string;
    readonly composerPlaceholder: string;
    readonly members: string;
    readonly membersEmpty: string;
    readonly openMembers: string;
    readonly closeMembers: string;
  };
};

/** Implement the approved Grammar anatomy while unsupported collaboration actions fail closed. */
export const GroupChatPageBase = (props: GroupChatPageProps) => {
  const { isRailOpen, labels, on } = props;
  const groups = <section className={GROUP_LIST_CLASS_NAME} aria-label={labels.groups}>
    <Text size="sm" weight="semibold">{labels.groups}</Text>
    <EmptyNotice message={labels.groupsEmpty} />
  </section>;
  const members = <SurfaceCard label={labels.members} composition="joined">
    <EmptyNotice message={labels.membersEmpty} />
  </SurfaceCard>;
  const composer = <div className={GROUP_CHAT_COMPOSER_CLASS_NAME}>
    <Input
      id="group-chat-message"
      name="message"
      label={labels.composer}
      placeholder={labels.composerPlaceholder}
      isDisabled
    />
  </div>;
  return <PageContainer measure="full">
    <SectionHeader level={1} title={labels.title} description={labels.description} />
    <div className={GROUP_CHAT_HOST_CLASS_NAME}>
      {groups}
      <ChatWorkspace
        label={labels.title}
        conversationLabel={labels.conversation}
        conversation={<EmptyNotice message={labels.unavailable} description={labels.unavailableHint} />}
        composer={composer}
        rail={members}
        railLabel={labels.members}
        railOpenLabel={labels.openMembers}
        railCloseLabel={labels.closeMembers}
        isRailOpen={isRailOpen}
        onRailOpenChange={on.changeRailOpen}
        railWidth="standard"
      />
    </div>
  </PageContainer>;
};
