/**
 * Reins Plan Converter — Parser
 *
 * Parses external plan documents into a normalized intermediate format.
 */

import { readFileSync, existsSync } from "fs";
import { extname } from "path";
import { execSync } from "child_process";

export interface ParsedDocument {
  title: string;
  format: string;
  sections: Section[];
  rawText: string;
}

export interface Section {
  level: number;
  title: string;
  content: string;
  items: string[];
}

/**
 * Detect file format and parse into normalized structure.
 */
export function parseDocument(filePath: string): ParsedDocument {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const ext = extname(filePath).toLowerCase();

  switch (ext) {
    case ".md":
      return parseMarkdown(filePath);
    case ".txt":
      return parsePlainText(filePath);
    case ".docx":
      return parseDocx(filePath);
    case ".pdf":
      return parsePdf(filePath);
    default:
      // Try as plain text
      return parsePlainText(filePath);
  }
}

function parseMarkdown(filePath: string): ParsedDocument {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let title = "";

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);

    if (headingMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }

      const level = headingMatch[1].length;
      const sectionTitle = headingMatch[2].trim();

      if (level === 1 && !title) {
        title = sectionTitle;
      }

      currentSection = {
        level,
        title: sectionTitle,
        content: "",
        items: [],
      };
    } else if (currentSection) {
      const listMatch = line.match(/^[-*]\s+(.+)/);
      if (listMatch) {
        currentSection.items.push(listMatch[1].trim());
      }
      currentSection.content += line + "\n";
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    title: title || "Untitled",
    format: "markdown",
    sections,
    rawText: content,
  };
}

function parsePlainText(filePath: string): ParsedDocument {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const sections: Section[] = [];
  let title = lines[0]?.trim() || "Untitled";

  // Treat blank lines as section separators
  let currentContent = "";
  let sectionIndex = 0;

  for (const line of lines) {
    if (line.trim() === "" && currentContent.trim()) {
      sections.push({
        level: 2,
        title: `Section ${++sectionIndex}`,
        content: currentContent,
        items: currentContent
          .split("\n")
          .filter((l) => /^[-*•]\s/.test(l))
          .map((l) => l.replace(/^[-*•]\s+/, "").trim()),
      });
      currentContent = "";
    } else {
      currentContent += line + "\n";
    }
  }

  if (currentContent.trim()) {
    sections.push({
      level: 2,
      title: `Section ${++sectionIndex}`,
      content: currentContent,
      items: [],
    });
  }

  return { title, format: "text", sections, rawText: content };
}

function parseDocx(filePath: string): ParsedDocument {
  // Try to convert docx to markdown using pandoc
  try {
    const markdown = execSync(`pandoc -f docx -t markdown "${filePath}"`, {
      encoding: "utf-8",
      timeout: 30000,
    });

    const tmpResult = parseMarkdownString(markdown);
    return { ...tmpResult, format: "docx" };
  } catch {
    // Fallback: try to extract raw text
    const text = execSync(`strings "${filePath}" 2>/dev/null || cat "${filePath}"`, {
      encoding: "utf-8",
      timeout: 10000,
    });
    return {
      title: "Untitled (docx)",
      format: "docx",
      sections: [{ level: 1, title: "Content", content: text, items: [] }],
      rawText: text,
    };
  }
}

function parsePdf(filePath: string): ParsedDocument {
  try {
    const text = execSync(`pdftotext "${filePath}" - 2>/dev/null`, {
      encoding: "utf-8",
      timeout: 30000,
    });

    return {
      title: "Untitled (pdf)",
      format: "pdf",
      sections: [{ level: 1, title: "Content", content: text, items: [] }],
      rawText: text,
    };
  } catch {
    throw new Error("PDF parsing requires pdftotext. Install poppler-utils.");
  }
}

function parseMarkdownString(content: string): ParsedDocument {
  const lines = content.split("\n");
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let title = "";

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      if (currentSection) sections.push(currentSection);
      const level = headingMatch[1].length;
      const sectionTitle = headingMatch[2].trim();
      if (level === 1 && !title) title = sectionTitle;
      currentSection = { level, title: sectionTitle, content: "", items: [] };
    } else if (currentSection) {
      const listMatch = line.match(/^[-*]\s+(.+)/);
      if (listMatch) currentSection.items.push(listMatch[1].trim());
      currentSection.content += line + "\n";
    }
  }
  if (currentSection) sections.push(currentSection);

  return { title: title || "Untitled", format: "markdown", sections, rawText: content };
}
