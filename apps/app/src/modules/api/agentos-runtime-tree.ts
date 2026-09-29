/**
 * The JSON value and the widget tree grammar the trusted module runtime boundary admits.
 *
 * Shared by the runtime projection and the module test contract, so neither owns the other's types.
 */
/** JSON value admitted by the trusted Module Studio runtime boundary. */
export type AgentosRuntimeValue = string | number | boolean | null | ReadonlyArray<AgentosRuntimeValue> | {
  readonly [key: string]: AgentosRuntimeValue;
};

/** Versioned trusted widget node returned by the backend registry. */
export type AgentosRuntimeWidgetNode = {
  readonly component: string;
  readonly version: string;
  readonly props: Readonly<Record<string, AgentosRuntimeValue>>;
  readonly children?: ReadonlyArray<AgentosRuntimeWidgetNode>;
};
