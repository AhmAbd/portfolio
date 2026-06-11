import {
  siDocker,
  siDotnet,
  siEspressif,
  siExpo,
  siFastapi,
  siFfmpeg,
  siFirebase,
  siGooglechrome,
  siGooglecloud,
  siMediapipe,
  siNextdotjs,
  siOnnx,
  siOpencv,
  siPython,
  siPytorch,
  siRailway,
  siReact,
  siSocketdotio,
  siSqlite,
  siTypescript,
  siUltralytics,
  siUnity,
  siWebrtc,
} from "simple-icons";

export interface StackIcon {
  title: string;
  path: string;
}

/**
 * Maps the exact tech strings used in data.ts to brand SVG paths.
 * Entries without a clean brand icon (OpenAI — removed from simple-icons,
 * NavMesh/URP — Unity features, scikit-fuzzy) fall back to text-only chips.
 */
export const STACK_ICONS: Record<string, StackIcon | undefined> = {
  "Next.js": siNextdotjs,
  Firebase: siFirebase,
  FFmpeg: siFfmpeg,
  "GCP TTS/STT": siGooglecloud,
  ONNX: siOnnx,
  PyTorch: siPytorch,
  OpenCV: siOpencv,
  "ESP32-S3": siEspressif,
  FastAPI: siFastapi,
  YOLOv8: siUltralytics,
  "React Native": siReact,
  Docker: siDocker,
  TypeScript: siTypescript,
  MediaPipe: siMediapipe,
  "Chrome MV3": siGooglechrome,
  Expo: siExpo,
  SQLite: siSqlite,
  Python: siPython,
  "Socket.IO": siSocketdotio,
  WebRTC: siWebrtc,
  Railway: siRailway,
  Unity: siUnity,
  "C#": siDotnet,
};
