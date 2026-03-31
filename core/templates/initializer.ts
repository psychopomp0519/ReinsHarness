/**
 * Reins Project Templates — Initialization from templates
 *
 * Lists available project templates from templates/projects/,
 * initializes a new project from a template, and generates
 * default project configuration.
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  statSync,
} from "fs";
import { join, relative } from "path";

/** Definition of a project template */
export interface Template {
  name: string;
  description: string;
  techStack: string[];
  defaultMode: string;
  packSuggestions: string[];
}

/** Template manifest stored in each template directory */
export interface TemplateManifest {
  template: Template;
  files: string[];
}

/** Result of a template initialization */
export interface InitResult {
  success: boolean;
  message: string;
  filesCreated: string[];
}

/** Resolved project configuration */
export interface ProjectConfig {
  name: string;
  template: string;
  techStack: string[];
  defaultMode: string;
  packs: string[];
  createdAt: string;
}

const TEMPLATES_DIR = "templates/projects";
const MANIFEST_FILE = "template.json";

/**
 * Get the absolute templates directory path.
 */
function getTemplatesRoot(reinsRoot: string): string {
  return join(reinsRoot, TEMPLATES_DIR);
}

/**
 * List all available project templates.
 * Each template is a subdirectory of templates/projects/ containing a template.json manifest.
 *
 * @param reinsRoot - Absolute path to the reins harness root
 * @returns Array of Template definitions found
 */
export function listTemplates(reinsRoot: string): Template[] {
  const templatesRoot = getTemplatesRoot(reinsRoot);
  if (!existsSync(templatesRoot)) {
    return [];
  }

  const entries = readdirSync(templatesRoot);
  const templates: Template[] = [];

  for (const entry of entries) {
    const manifestPath = join(templatesRoot, entry, MANIFEST_FILE);
    if (existsSync(manifestPath)) {
      try {
        const raw = readFileSync(manifestPath, "utf-8");
        const manifest = JSON.parse(raw) as TemplateManifest;
        templates.push(manifest.template);
      } catch {
        // Skip templates with invalid manifests
      }
    }
  }

  return templates;
}

/**
 * Recursively copy a directory tree.
 */
function copyDirRecursive(src: string, dest: string, created: string[]): void {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src);
  for (const entry of entries) {
    // Skip the manifest file itself
    if (entry === MANIFEST_FILE) continue;

    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath, created);
    } else {
      copyFileSync(srcPath, destPath);
      created.push(destPath);
    }
  }
}

/**
 * Initialize a new project from a template.
 * Copies template files into the target directory and creates a .reins/project.json config.
 *
 * @param reinsRoot - Absolute path to the reins harness root
 * @param templateName - Name of the template to use
 * @param targetDir - Absolute path to the target project directory
 * @param projectName - Name for the new project
 * @returns InitResult with status and list of created files
 */
export function initFromTemplate(
  reinsRoot: string,
  templateName: string,
  targetDir: string,
  projectName: string,
): InitResult {
  const templateDir = join(getTemplatesRoot(reinsRoot), templateName);

  if (!existsSync(templateDir)) {
    return {
      success: false,
      message: `Template "${templateName}" not found`,
      filesCreated: [],
    };
  }

  const manifestPath = join(templateDir, MANIFEST_FILE);
  if (!existsSync(manifestPath)) {
    return {
      success: false,
      message: `Template "${templateName}" has no manifest`,
      filesCreated: [],
    };
  }

  const raw = readFileSync(manifestPath, "utf-8");
  const manifest = JSON.parse(raw) as TemplateManifest;

  // Create target directory if it doesn't exist
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const filesCreated: string[] = [];

  // Copy template files
  copyDirRecursive(templateDir, targetDir, filesCreated);

  // Generate project config
  const config = generateProjectConfig(projectName, manifest.template);
  const reinsDir = join(targetDir, ".reins");
  if (!existsSync(reinsDir)) {
    mkdirSync(reinsDir, { recursive: true });
  }
  const configPath = join(reinsDir, "project.json");
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
  filesCreated.push(configPath);

  return {
    success: true,
    message: `Project "${projectName}" initialized from template "${templateName}"`,
    filesCreated: filesCreated.map((f) => relative(targetDir, f)),
  };
}

/**
 * Generate a project configuration from a template definition.
 *
 * @param projectName - Name for the project
 * @param template - The template to base configuration on
 * @returns A ProjectConfig object
 */
export function generateProjectConfig(
  projectName: string,
  template: Template,
): ProjectConfig {
  return {
    name: projectName,
    template: template.name,
    techStack: [...template.techStack],
    defaultMode: template.defaultMode,
    packs: [...template.packSuggestions],
    createdAt: new Date().toISOString(),
  };
}
