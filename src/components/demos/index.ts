import type { ComponentType } from "react";

export type DemoLoader = () => Promise<{ default: ComponentType }>;

/** Detection.id → lazy demo loader. Entries land one per task. */
export const demoLoaders: Record<string, DemoLoader | undefined> = {
  recycling: () => import("./WasteGameDemo"),
  palmprint: () => import("./PalmScanDemo"),
  gestureflow: () => import("./GestureDemo"),
  triage: () => import("./TriageDemo"),
  aivently: () => import("./AiventlyDemo"),
  workout: () => import("./WorkoutDemo"),
  watchtogether: () => import("./SyncRoomDemo"),
};
