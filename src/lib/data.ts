/** All site content lives here — future i18n is a data swap, not a rewrite. */

export interface Detection {
  id: string;
  /** mono overlay label, e.g. "aivently_platform" */
  label: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  tech: string[];
  /** headline stat rendered as the detection score */
  metric: { value: string; caption: string };
  confidence: number;
  /** inline runnable demo — label = panel header tag, caption = dry one-liner */
  demo?: { label: string; caption: string };
}

export interface SkillClass {
  id: string;
  label: string;
  title: string;
  items: string[];
}

export const identity = {
  name: "Ahmad Abdullatif",
  role: "Computer Engineer",
  heroLine:
    "Builds AI that sees, apps that ship, and hardware that talks to both.",
  location: "Istanbul (UTC+3)",
  email: "mbabdullatif@gmail.com",
  github: "https://github.com/AhmAbd",
  githubUser: "AhmAbd",
  linkedin: "https://www.linkedin.com/in/ahmmhma/",
  status: "open_to_work",
} as const;

export const about = {
  heading: "whoami",
  paragraphs: [
    "Computer Engineer out of Istanbul. I build systems that look at the world — palmprint scanners, waste detectors, gesture readers — and products that actually ship: a paid AI video platform with 500+ users, mobile apps, browser extensions, embedded prototypes.",
    "The common thread is end-to-end ownership. Model weights, API routes, deploy logs, the 3 a.m. user bug report — all of it. If it needs eyes, a backend, and a place to run, I can take it from idea to production.",
  ],
  chips: [
    { label: "ships_to_prod", confidence: 0.99 },
    { label: "owns_the_stack", confidence: 0.97 },
    { label: "reads_error_logs_for_fun", confidence: 0.91 },
  ],
} as const;

export const detections: Detection[] = [
  {
    id: "aivently",
    label: "aivently_platform",
    title: "Aivently",
    tagline: "AI video transcription, translation, subtitling & dubbing",
    description:
      "A paid Next.js + Firebase platform that turns any video into transcribed, translated, subtitled, and dubbed output. 500+ registered users, real revenue, one engineer on call: me.",
    highlights: [
      "Whisper transcription with FFmpeg.wasm audio extraction in the browser, server-side FFmpeg fallback, and auto-compression past the 25 MB API limit",
      "Subtitle extraction + translation pipeline over Cloud Functions for embedded SRT/ASS/VTT tracks",
      "AI dubbing via Google Cloud TTS/STT, plus ONNX Runtime client-side language detection",
      "Credit billing with Whop webhooks — credits deducted server-side before any paid API call",
    ],
    tech: ["Next.js", "Firebase", "OpenAI Whisper", "FFmpeg", "GCP TTS/STT", "ONNX"],
    metric: { value: "500+", caption: "registered users, paid revenue" },
    confidence: 0.99,
    demo: { label: "pipeline_run", caption: "subtitles typed by the pipeline, not by hand · refresh resets credits" },
  },
  {
    id: "palmprint",
    label: "palmprint_attendance",
    title: "Contactless Palmprint Attendance",
    tagline: "Biometric verification from a wave of the hand",
    description:
      "A contactless attendance system that recognizes people by palmprint. Two-stage deep pipeline — palm ROI extraction, then verification — running from an ESP32-S3 camera unit to a cloud inference service.",
    highlights: [
      "Benchmarked across five public palmprint datasets: 85–95% top-1 identification",
      "Collected a 20-person real-world dataset, 90% accuracy under practical capture conditions",
      "ESP32-S3 camera + sensor capture prototype with an edge-to-cloud inference flow",
      "University-facing flows planned: admin enrollment, faculty sessions, role-aware mobile tracking",
    ],
    tech: ["PyTorch", "OpenCV", "ESP32-S3", "FastAPI"],
    metric: { value: "90%", caption: "real-world accuracy, 20-person dataset" },
    confidence: 0.95,
    demo: { label: "palm_scan", caption: "contactless — except for your mouse." },
  },
  {
    id: "recycling",
    label: "waste_detector",
    title: "Smart Recycling Assistant",
    tagline: "Point camera at trash, get the right bin",
    description:
      "A React Native app that detects waste across five classes — glass, paper, metal, battery, plastic — and tells you where it goes. Backed by a properly benchmarked detector, not vibes.",
    highlights: [
      "Fine-tuned and compared 4 architectures on 2,433 annotated images: YOLOv8, YOLO11, RT-DETRv2, Faster R-CNN",
      "Shipped YOLOv8s after 86.29% test mAP50 / 82.81% F1 with per-class confusion-matrix diagnostics",
      "FastAPI inference server: REST uploads, WebSocket live detection, Docker deploy, optional on-device ONNX",
      "Gamified learning layer — points, badges, streaks, quizzes — because recycling needed a leaderboard",
    ],
    tech: ["YOLOv8", "React Native", "FastAPI", "Docker", "ONNX"],
    metric: { value: "86.29%", caption: "test mAP50, best of 4 architectures" },
    confidence: 0.86,
    demo: { label: "waste_sort", caption: "same five classes as the real app · keys 1–5 work too" },
  },
  {
    id: "gestureflow",
    label: "gesture_controller",
    title: "GestureFlow",
    tagline: "Control video with your hands. Pause when you look away.",
    description:
      "A Manifest V3 Chrome extension that drives YouTube and HTML5 players with hand gestures and face tracking — all inference in-browser via MediaPipe. Attention is, quite literally, all you need.",
    highlights: [
      "6 hand-gesture commands mapped to play, pause, seek, and volume",
      "Eye/face safeguards pause playback when you look away and resume on stable attention",
      "Camera frames never leave the browser — zero server, zero uploads",
      "Offscreen camera sessions, service-worker state, overlay feedback, dynamic player detection",
    ],
    tech: ["TypeScript", "MediaPipe", "Chrome MV3"],
    metric: { value: "0", caption: "frames sent to a server" },
    confidence: 0.93,
    demo: { label: "gesture_ctl", caption: "0 frames leave this page — there is no camera." },
  },
  {
    id: "workout",
    label: "workout_planner",
    title: "AI Workout Planner",
    tagline: "A coach that fits in structured JSON",
    description:
      "An Expo / React Native fitness app that turns a full onboarding profile — metrics, goals, injuries, equipment, schedule — into a complete progressive training plan via OpenAI structured outputs.",
    highlights: [
      "Strict schema validation with repair-retry so generated plans parse safely before persisting",
      "Readiness-aware adjustments, exercise-swap ranking, and an in-app coach chat",
      "Everything offline-first: plans, set logs, PRs, body metrics in SQLite + SecureStore",
      "Execution flow with rest timers, haptics, PR detection, deload signals, progress charts",
    ],
    tech: ["React Native", "Expo", "OpenAI", "SQLite"],
    metric: { value: "100%", caption: "of plans schema-validated before saving" },
    confidence: 0.94,
    demo: { label: "plan_gen", caption: "100% of plans schema-validated — eventually." },
  },
  {
    id: "triage",
    label: "triage_queue",
    title: "Fuzzy Hospital Triage",
    tagline: "Emergency queues, ranked by logic instead of luck",
    description:
      "A hospital triage system that orders emergency patients by fuzzy priority — severity, stability, risk, age vulnerability, waiting time — instead of first-come-first-served.",
    highlights: [
      "Mamdani and Sugeno inference paths in Python with shared membership functions",
      "70-rule base covering 243/243 linguistic input combinations — no gaps, no duplicates",
      "Scores calibrated into low/medium/high/critical bands with stable intra-band ordering",
      "Next.js dashboard: live queue, membership curves, fired rules, model comparison",
    ],
    tech: ["Python", "scikit-fuzzy", "Next.js"],
    metric: { value: "243/243", caption: "input combinations covered" },
    confidence: 0.97,
    demo: { label: "fuzzy_queue", caption: "ranked by logic, not luck — drag yourself critical." },
  },
  {
    id: "watchtogether",
    label: "watch_party",
    title: "WatchTogether",
    tagline: "Everyone sees the same frame at the same time",
    description:
      "A real-time watch-party platform: synchronized rooms, host-controlled playback, chat with presence, and optional WebRTC host broadcasting — Next.js up front, Express + Socket.IO behind.",
    highlights: [
      "Host-synced play, pause, seek, playlist, and room lifecycle over Socket.IO",
      "Firebase Auth + Firestore room/chat state with signed media access",
      "WebRTC broadcasting with publisher tracking, peer discovery, and direct-playback fallback",
      "Whop-powered Free/Premium tiers, deployed as separate Railway services",
    ],
    tech: ["Next.js", "Socket.IO", "WebRTC", "Firebase", "Railway"],
    metric: { value: "~0s", caption: "playback drift between viewers" },
    confidence: 0.92,
    demo: { label: "sync_room", caption: "~0s drift — omar's hotel wifi notwithstanding." },
  },
  {
    id: "lastfort",
    label: "the_last_fort",
    title: "The Last Fort",
    tagline: "Real-time castle defense with increasingly rude waves",
    description:
      "A single-player Unity castle-defense game: spend gold, place soldiers, repair walls, then hold the line through escalating enemy waves.",
    highlights: [
      "Wave flow, gold economy, soldier placement/refunds, archer + melee combat in C#",
      "NavMesh enemy movement, target selection, and structure attacks",
      "ScriptableObject-driven balancing for enemies, scaling, rewards, and difficulty",
      "Full game shell: menus, pause, transitions, victory/defeat screens, URP visuals",
    ],
    tech: ["Unity", "C#", "NavMesh", "URP"],
    metric: { value: "∞", caption: "waves, difficulty permitting" },
    confidence: 0.9,
    demo: { label: "hold_the_line", caption: "wave 6+ exists. difficulty permitting." },
  },
];

export const skillClasses: SkillClass[] = [
  {
    id: "mod_00",
    label: "ai_ml",
    title: "AI & Machine Learning",
    items: [
      "Python", "PyTorch", "TensorFlow", "scikit-learn", "OpenCV",
      "Hugging Face", "Whisper", "OpenAI APIs", "fuzzy logic", "model evaluation",
    ],
  },
  {
    id: "mod_01",
    label: "vision_biometrics",
    title: "Computer Vision & Biometrics",
    items: [
      "YOLO / YOLOv8", "MediaPipe", "object detection", "CNNs", "ViT",
      "ROI extraction", "landmarks", "embeddings", "mAP / F1 evaluation",
    ],
  },
  {
    id: "mod_02",
    label: "fullstack_mobile_game",
    title: "Full-Stack, Mobile & Game",
    items: [
      "Next.js", "React", "React Native", "Expo", "FastAPI", "Node.js",
      "TypeScript", "Socket.IO / WebRTC", "Chrome Extensions (MV3)",
      "payments", "Unity / C#",
    ],
  },
  {
    id: "mod_03",
    label: "data_deployment",
    title: "Data & Deployment",
    items: [
      "Firebase", "Firestore", "Supabase", "SQLite", "MySQL",
      "Docker", "Linux", "Vercel", "Railway",
    ],
  },
  {
    id: "mod_04",
    label: "embedded_automation",
    title: "Embedded, IoT & Automation",
    items: [
      "C / C++", "ESP32", "Raspberry Pi", "camera & sensor integration",
      "edge-to-cloud inference", "webhooks", "WhatsApp bots",
      "n8n", "Zapier", "Make",
    ],
  },
];

export const experience = {
  company: "The Smart Go",
  role: "Automation Specialist",
  period: "Jul 2024 — Present",
  mode: "Remote",
  bullets: [
    "Built customer websites and supported SEO / social marketing for client digital presence",
    "Moved client operations from paper to custom CRM automation dashboards",
    "Automated ticketing with WhatsApp bot integrations — dashboards that message customers directly",
    "Wired GoHighLevel CRM workflows, Zapier and Make automations, and API integrations",
  ],
} as const;

export const education = {
  school: "Istanbul Sabahattin Zaim University",
  degree: "B.Sc. Computer Engineering",
  period: "2022 — 2026",
  note: "epoch 4/4 — converged",
} as const;

export const languages = [
  { code: "ar", name: "Arabic", level: "native" },
  { code: "en", name: "English", level: "fluent" },
  { code: "tr", name: "Turkish", level: "fluent" },
] as const;

export const contact = {
  heading: "Got something worth building?",
  body: "Open to full-time roles, internships, freelance, or just an interesting problem. Send a prompt — the model replies fast.",
  cta: "send_prompt",
} as const;
