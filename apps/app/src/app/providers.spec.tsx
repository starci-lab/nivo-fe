import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
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
vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: ProviderProbeProps) => <>{children}</>
}));
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: ProviderProbeProps) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useTheme: () => ({ resolvedTheme: themeState.resolvedTheme })
}));
vi.mock("@starci/grammar/core", () => ({
  CoreGrammarRoot: ({
    children,
    theme
  }: GrammarRootProbeProps) => (
    <div data-testid="grammar-root" data-grammar-theme={theme}>{children}</div>
  )
}));
vi.mock("@/modules/auth/session", () => ({
  SessionProvider: ({ children }: ProviderProbeProps) => <>{children}</>
}));

import { AppProviders } from "./providers";

const renderProviders = () => render(
  <AppProviders locale="en" messages={{}} timeZone="UTC">
    <main>workspace</main>
  </AppProviders>
);

describe("AppProviders", () => {
  it.each([
    ["dark", "dark"],
    ["light", "light"],
    ["system", "system"],
    [undefined, "system"]
  ] as const)("forwards resolved theme %s to the Core Grammar root", (resolvedTheme, expectedTheme) => {
    themeState.resolvedTheme = resolvedTheme;

    renderProviders();

    const grammarRoot = screen.getByTestId("grammar-root");
    expect(grammarRoot).toHaveAttribute("data-grammar-theme", expectedTheme);
    expect(screen.getByTestId("theme-provider")).toContainElement(grammarRoot);
    expect(screen.getByText("workspace")).toBeInTheDocument();
  });
});
