"use client";

import type { ComponentProps } from "react";

import { ConsoleLayout } from "@/components/layouts/ConsoleLayout";

interface ConsoleRouteLayoutProps {readonly children: ComponentProps<"div">["children"];}

const ConsoleRoutedBody = ({ children }: ConsoleRouteLayoutProps) => <div>{

  children}</div>;



/** Route-group entry for the authenticated Nivo console. */
const ConsoleRouteLayout = ({ children }: ConsoleRouteLayoutProps) =>
<ConsoleLayout body={ConsoleRoutedBody} bodyProps={{ children }} />;


export default ConsoleRouteLayout;