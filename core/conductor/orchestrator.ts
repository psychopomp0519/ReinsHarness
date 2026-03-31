/**
 * Reins Conductor — Multi-session orchestrator
 *
 * Manages multiple parallel reins sessions. The orchestrator tracks
 * session metadata but delegates actual Claude invocation to the CLI.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/** Status of a managed session */
export type SessionStatus = "running" | "paused" | "completed" | "failed" | "stopped";

/** Metadata for a single orchestrated session */
export interface SessionInfo {
  id: string;
  name: string;
  mode: string;
  status: SessionStatus;
  startedAt: string;
  stoppedAt: string | null;
  projectRoot: string;
  metadata: Record<string, string>;
}

/** Registry file stored at .reins/conductor.json */
export interface SessionRegistry {
  sessions: SessionInfo[];
  lastUpdated: string;
}

const REGISTRY_FILE = ".reins/conductor.json";

/**
 * Load the session registry from disk.
 * Returns an empty registry if the file does not exist.
 */
function loadRegistry(projectRoot: string): SessionRegistry {
  const filePath = join(projectRoot, REGISTRY_FILE);
  if (!existsSync(filePath)) {
    return { sessions: [], lastUpdated: new Date().toISOString() };
  }
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SessionRegistry;
}

/**
 * Persist the session registry to disk.
 */
function saveRegistry(projectRoot: string, registry: SessionRegistry): void {
  const dir = join(projectRoot, ".reins");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  registry.lastUpdated = new Date().toISOString();
  writeFileSync(join(projectRoot, REGISTRY_FILE), JSON.stringify(registry, null, 2), "utf-8");
}

/**
 * Generate a short unique session ID.
 */
function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `ses-${ts}-${rand}`;
}

/**
 * Create and register a new session.
 * The orchestrator only records metadata; the caller is responsible
 * for launching the actual Claude CLI process.
 *
 * @param projectRoot - Absolute path to the project root
 * @param name - Human-readable session name
 * @param mode - Initial mode for the session
 * @param metadata - Optional key-value metadata
 * @returns The newly created SessionInfo
 */
export function createSession(
  projectRoot: string,
  name: string,
  mode: string,
  metadata: Record<string, string> = {},
): SessionInfo {
  const registry = loadRegistry(projectRoot);

  const session: SessionInfo = {
    id: generateId(),
    name,
    mode,
    status: "running",
    startedAt: new Date().toISOString(),
    stoppedAt: null,
    projectRoot,
    metadata,
  };

  registry.sessions.push(session);
  saveRegistry(projectRoot, registry);
  return session;
}

/**
 * List all registered sessions, optionally filtered by status.
 *
 * @param projectRoot - Absolute path to the project root
 * @param statusFilter - If provided, only return sessions with this status
 * @returns Array of matching SessionInfo objects
 */
export function listSessions(
  projectRoot: string,
  statusFilter?: SessionStatus,
): SessionInfo[] {
  const registry = loadRegistry(projectRoot);
  if (statusFilter) {
    return registry.sessions.filter((s) => s.status === statusFilter);
  }
  return registry.sessions;
}

/**
 * Get the status of a specific session by ID.
 *
 * @param projectRoot - Absolute path to the project root
 * @param sessionId - The session ID to look up
 * @returns The SessionInfo or null if not found
 */
export function getSessionStatus(
  projectRoot: string,
  sessionId: string,
): SessionInfo | null {
  const registry = loadRegistry(projectRoot);
  return registry.sessions.find((s) => s.id === sessionId) ?? null;
}

/**
 * Mark a session as stopped.
 *
 * @param projectRoot - Absolute path to the project root
 * @param sessionId - The session ID to stop
 * @returns true if the session was found and stopped, false otherwise
 */
export function stopSession(
  projectRoot: string,
  sessionId: string,
): boolean {
  const registry = loadRegistry(projectRoot);
  const session = registry.sessions.find((s) => s.id === sessionId);
  if (!session) {
    return false;
  }
  session.status = "stopped";
  session.stoppedAt = new Date().toISOString();
  saveRegistry(projectRoot, registry);
  return true;
}
