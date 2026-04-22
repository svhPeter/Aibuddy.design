/**
 * Tool catalog for marketing pages — sourced from `tool-registry.ts`.
 *
 * Architecture: execution layer (browser / bytez / gemini) and provider IDs live
 * in the registry; browser tools never use the server AI layer.
 */

import {
  getToolCrossLinks as getToolCrossLinksFromRegistry,
  listCatalogTools,
  toolRuntimeSubtitle,
  type ToolCatalogEntry,
} from "@/config/tool-registry";

export type { ToolCatalogEntry };
export type { ToolExecutionLayer, ToolKind, AiProviderId } from "@/config/tool-registry";
export { toolRuntimeSubtitle };

/** Grid + cross-links — same order consumers expect */
export const toolsCatalog = listCatalogTools();

export function getToolCrossLinks(
  currentHref: ToolCatalogEntry["href"],
): readonly ToolCatalogEntry[] {
  return getToolCrossLinksFromRegistry(currentHref);
}
