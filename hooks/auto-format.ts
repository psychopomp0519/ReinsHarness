/**
 * Reins Hook: Auto Format
 *
 * Event: PostToolUse (Write | Edit | MultiEdit)
 * Action: Run the project's formatter on the edited file.
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { extname, resolve } from "path";

interface HookInput {
  tool_name: string;
  tool_input: {
    file_path?: string;
    [key: string]: unknown;
  };
  tool_output: string;
}

interface FormatterConfig {
  command: string;
  extensions: string[];
}

const FORMATTERS: FormatterConfig[] = [
  {
    command: "npx prettier --write",
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".scss", ".md", ".yaml", ".yml"],
  },
  {
    command: "black",
    extensions: [".py"],
  },
  {
    command: "gofmt -w",
    extensions: [".go"],
  },
  {
    command: "rustfmt",
    extensions: [".rs"],
  },
];

function findFormatter(filePath: string): string | null {
  const ext = extname(filePath).toLowerCase();

  for (const formatter of FORMATTERS) {
    if (formatter.extensions.includes(ext)) {
      // Check if the formatter command exists
      const cmd = formatter.command.split(" ")[0];
      try {
        execSync(`which ${cmd} 2>/dev/null || npx --no-install ${cmd} --version 2>/dev/null`, {
          timeout: 3000,
          stdio: "pipe",
        });
        return formatter.command;
      } catch {
        continue;
      }
    }
  }

  return null;
}

function main(): void {
  const inputRaw = process.env.CLAUDE_HOOK_INPUT;
  if (!inputRaw) {
    process.exit(0);
  }

  let input: HookInput;
  try {
    input = JSON.parse(inputRaw) as HookInput;
  } catch {
    process.exit(0);
    return;
  }

  const tool = input.tool_name;
  if (!["Write", "Edit", "MultiEdit"].includes(tool)) {
    process.exit(0);
  }

  const filePath = input.tool_input.file_path;
  if (!filePath || typeof filePath !== "string") {
    process.exit(0);
  }

  const resolved = resolve(filePath);
  if (!existsSync(resolved)) {
    process.exit(0);
  }

  const formatter = findFormatter(resolved);
  if (!formatter) {
    process.exit(0);
  }

  try {
    execSync(`${formatter} "${resolved}"`, {
      timeout: 10000,
      stdio: "pipe",
    });
  } catch {
    // Formatting failed — don't block the workflow
  }
}

main();
