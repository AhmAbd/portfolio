import type { ComponentType } from "react";

export type DemoLoader = () => Promise<{ default: ComponentType }>;

/** Detection.id → lazy demo loader. Entries land one per task. */
export const demoLoaders: Record<string, DemoLoader | undefined> = {
  recycling: () => import("./WasteGameDemo"),
};
