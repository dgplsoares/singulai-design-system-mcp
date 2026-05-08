/**
 * Carrega e valida o catalog.json em memoria.
 * Schema zod garante consistencia entre v0.1 (manual) e v0.2 (auto-gerado
 * via ts-morph) — se a forma mudar incompativelmente, o servidor falha
 * imediatamente em vez de retornar dados malformados aos AI agents.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const PropSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().optional(),
  default: z.string().optional(),
  description: z.string(),
});

const OutputSchema = z.object({
  name: z.string(),
  type: z.string(),
});

const ComponentSchema = z.object({
  name: z.string(),
  selector: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  props: z.array(PropSchema),
  outputs: z.array(OutputSchema).optional(),
  examples: z.array(z.string()).default([]),
});

const CatalogSchema = z.object({
  version: z.string(),
  generated_at: z.string(),
  design_system: z.object({
    name: z.string(),
    version: z.string(),
    homepage: z.string(),
    repo: z.string(),
    stack: z.array(z.string()),
    principles: z.array(z.string()),
  }),
  types: z.record(z.string(), z.array(z.string())),
  components: z.array(ComponentSchema),
});

export type Catalog = z.infer<typeof CatalogSchema>;
export type CatalogComponent = z.infer<typeof ComponentSchema>;
export type CatalogProp = z.infer<typeof PropSchema>;

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CATALOG_PATH = resolve(__dirname, 'data/catalog.json');

let cachedCatalog: Catalog | null = null;

export function loadCatalog(): Catalog {
  if (cachedCatalog) return cachedCatalog;

  const raw = readFileSync(CATALOG_PATH, 'utf-8');
  const parsed: unknown = JSON.parse(raw);
  const validated = CatalogSchema.parse(parsed);

  cachedCatalog = validated;
  return validated;
}

// ---------------------------------------------------------------------------
// Helpers de busca (usados pelas tools)
// ---------------------------------------------------------------------------

/**
 * Encontra um componente por name (ButtonComponent) ou selector (ds-button).
 * Case-insensitive. Retorna null se nao encontrar.
 */
export function findComponent(
  catalog: Catalog,
  query: string,
): CatalogComponent | null {
  const q = query.trim().toLowerCase();
  return (
    catalog.components.find(
      (c) => c.name.toLowerCase() === q || c.selector.toLowerCase() === q,
    ) ?? null
  );
}

/**
 * Busca componentes por palavra-chave em name + selector + description + tags.
 * Score simples: match em selector/name pesa mais que em description/tags.
 * Retorna ate `limit` resultados ordenados por score desc.
 */
export function searchComponents(
  catalog: Catalog,
  query: string,
  limit = 5,
): Array<{ component: CatalogComponent; score: number }> {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) return [];

  const scored = catalog.components
    .map((component) => {
      const haystack = {
        selector: component.selector.toLowerCase(),
        name: component.name.toLowerCase(),
        description: component.description.toLowerCase(),
        tags: component.tags.join(' ').toLowerCase(),
      };

      let score = 0;
      for (const term of terms) {
        if (haystack.selector.includes(term)) score += 5;
        if (haystack.name.includes(term)) score += 4;
        if (haystack.tags.includes(term)) score += 3;
        if (haystack.description.includes(term)) score += 1;
      }

      return { component, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
