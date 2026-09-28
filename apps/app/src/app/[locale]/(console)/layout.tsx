"use client";

import type { ComponentProps } from "react";

import { ConsoleLayout } from "@/components/product-shells/ConsoleLayout";

type ConsoleRouteLayoutProps = {readonly children?: ComponentProps<"div">["children"];};

const ConsoleRoutedBody = ({ children }: ConsoleRouteLayoutProps) => <div>{

  children}</div>;



/** Route-group entry for the authenticated Nivo console. */
const Layout = ({ children }: ConsoleRouteLayoutProps) =>
<ConsoleLayout body={ConsoleRoutedBody} bodyProps={{ children }} />;


export default Layout;
