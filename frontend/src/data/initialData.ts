import { Column } from "@/types/kanban";

export const INITIAL_COLUMNS: Column[] = [
  {
    id: "col-1",
    title: "System Backlog",
    cards: [
      {
        id: "card-1",
        title: "Neural Interface Driver",
        details: "Calibrate latency thresholds for real-time synap-link communication protocols.",
      },
      {
        id: "card-2",
        title: "Subnet Traffic Analyzer",
        details: "Implement deep packet inspection for perimeter proxy routing anomalies.",
      },
      {
        id: "card-3",
        title: "Quantum Key Exchange",
        details: "Audit cryptographic handshakes across distributed consensus nodes.",
      },
    ],
  },
  {
    id: "col-2",
    title: "Architecture & UI",
    cards: [
      {
        id: "card-4",
        title: "HUD Glow Shaders",
        details: "Optimize WebGL rendering pipelines for ambient neon edge illumination.",
      },
      {
        id: "card-5",
        title: "Data Matrix Grid",
        details: "Design high-density responsive matrix views for telemetry dashboards.",
      },
    ],
  },
  {
    id: "col-3",
    title: "Active Development",
    cards: [
      {
        id: "card-6",
        title: "Cyberdeck Auth Flow",
        details: "Refactor multi-vector biometric validation tokens for gateway endpoints.",
      },
      {
        id: "card-7",
        title: "Memory Buffer Sync",
        details: "Patch memory leaks during rapid state dehydration across background workers.",
      },
    ],
  },
  {
    id: "col-4",
    title: "Security & Review",
    cards: [
      {
        id: "card-8",
        title: "Firewall Breach Simulation",
        details: "Run red-team penetration scripts against edge micro-service clusters.",
      },
    ],
  },
  {
    id: "col-5",
    title: "Production Deployed",
    cards: [
      {
        id: "card-9",
        title: "Core Kernel Patch v4.2",
        details: "Deployed zero-downtime micro-kernel update to main edge nodes.",
      },
      {
        id: "card-10",
        title: "Mainframe Gateway API",
        details: "Exposed unified gRPC endpoints for client telemetry consumption.",
      },
    ],
  },
];
