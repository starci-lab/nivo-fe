import { render, within } from "@testing-library/react";
import { act, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const themeState = vi.hoisted(() => ({
  resolvedTheme: undefined as string | undefined
}));

type ProviderProbeProps = {
  readonly children: ReactNode;
};

type GrammarRootProbeProps = ProviderProbeProps & {
  readonly theme: "system" | "light" | "dark";
};

vi.mock("@heroui/react", () => ({
  I18nProvider: ({ children }: ProviderProbeProps) => <>{children}</>
}));
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: ProviderProbeProps) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useTheme: () => ({ resolvedTheme: themeState.resolvedTheme })
}));
vi.mock("@nivo/ui", () => ({
  NivoGrammarRoot: ({
    children,
    theme
  }: GrammarRootProbeProps) => (
    <div data-testid="grammar-root" data-grammar-family="nivo" data-grammar-theme={theme}>{children}</div>
  )
}));
vi.mock("@/modules/auth/session", () => ({
  SessionProvider: ({ children }: ProviderProbeProps) => <>{children}</>
}));

import { NivoGrammarTheme } from "../NivoGrammarTheme";
import { ConsoleLocaleLayoutBase } from "./component";

const providersTree = () => (
  <ConsoleLocaleLayoutBase props={{ locale: "en", messages: {}, timeZone: "UTC" }}>
    <main>workspace</main>
  </ConsoleLocaleLayoutBase>
);
const themeBridgeTree = () => (
  <NivoGrammarTheme>
    <main>workspace</main>
  </NivoGrammarTheme>
);
const renderProviders = () => render(providersTree());

describe("ConsoleLocaleLayoutBase", () => {
  it.each([
    ["dark", "dark"],
    ["light", "light"],
    ["system", "system"],
    [undefined, "system"]
  ] as const)("forwards resolved theme %s to the nivo Grammar root", (resolvedTheme, expectedTheme) => {
    themeState.resolvedTheme = resolvedTheme;

    const bridge = render(themeBridgeTree());
    const stacked = renderProviders();

    const grammarRoot = within(bridge.container).getByTestId("grammar-root");
    expect(grammarRoot).toHaveAttribute("data-grammar-family", "nivo");
    expect(grammarRoot).toHaveAttribute("data-grammar-theme", expectedTheme);
    const stackedProviders = within(stacked.container);
    expect(stackedProviders.getByTestId("theme-provider"))
      .toContainElement(stackedProviders.getByTestId("grammar-root"));
    expect(within(bridge.container).getByText("workspace")).toBeInTheDocument();
  });

  it("keeps the server theme through hydration before activating the resolved client theme", async () => {
    themeState.resolvedTheme = "light";
    const serverHtml = renderToString(themeBridgeTree());
    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    let root: ReturnType<typeof hydrateRoot> | undefined;

    expect(serverHtml).toContain('data-grammar-family="nivo"');
    expect(serverHtml).toContain('data-grammar-theme="system"');

    try {
      await act(async () => {
        root = hydrateRoot(container, themeBridgeTree());
      });

      const hydrated = container.querySelector('[data-testid="grammar-root"]');
      expect(hydrated).toHaveAttribute("data-grammar-family", "nivo");
      expect(hydrated).toHaveAttribute("data-grammar-theme", "light");
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      await act(async () => root?.unmount());
      consoleError.mockRestore();
    }
  });
});
