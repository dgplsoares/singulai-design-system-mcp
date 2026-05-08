#!/usr/bin/env node
/**
 * Singulai Design System — MCP Server
 *
 * Expoe o catalogo do Design System Singulai (Angular 20, Standalone +
 * Signals, neumorphic) para AI agents via Model Context Protocol.
 *
 * Tools v0.1:
 *   - list_components()                — array nome+selector+description+tags
 *   - get_component(name|selector)     — info completa: props tipados, outputs, exemplos
 *   - search_components(query, limit)  — busca por keyword com score
 *
 * Transport: stdio (padrao MCP — clientes spawnam o processo).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  type CatalogComponent,
  findComponent,
  loadCatalog,
  searchComponents,
} from './catalog.js';

const SERVER_NAME = 'singulai-design-system-mcp';
const SERVER_VERSION = '0.1.0';

// Carrega catalogo no boot — falha rapido se JSON invalido
const catalog = loadCatalog();

const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// ---------------------------------------------------------------------------
// Formatadores (saida amigavel para AI agents)
// ---------------------------------------------------------------------------

function formatComponentSummary(c: CatalogComponent): string {
  return `- ${c.selector} (${c.name}): ${c.description}`;
}

function formatComponentDetail(c: CatalogComponent): string {
  const lines: string[] = [
    `# ${c.name}`,
    `**Selector:** \`${c.selector}\``,
    '',
    c.description,
    '',
    `**Tags:** ${c.tags.join(', ')}`,
    '',
    '## Props (@Input)',
  ];

  if (c.props.length === 0) {
    lines.push('_Nenhum @Input declarado._');
  } else {
    lines.push('| Nome | Tipo | Default | Descricao |');
    lines.push('|------|------|---------|-----------|');
    for (const p of c.props) {
      const def = p.required ? '_required_' : (p.default ?? '_(sem default)_');
      const type = '`' + p.type + '`';
      lines.push(
        `| \`${p.name}\` | ${type} | ${def} | ${p.description} |`,
      );
    }
  }

  if (c.outputs && c.outputs.length > 0) {
    lines.push('', '## Outputs (@Output)', '');
    for (const o of c.outputs) {
      lines.push(`- \`${o.name}\`: \`${o.type}\``);
    }
  }

  if (c.examples.length > 0) {
    lines.push('', '## Exemplos de uso', '');
    for (const ex of c.examples) {
      lines.push('```html');
      lines.push(ex);
      lines.push('```');
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Tools registry
// ---------------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_components',
        description:
          'Lista todos os componentes do Singulai Design System com nome, selector e descricao curta. Use quando o usuario pergunta "quais componentes existem" ou "o que tem disponivel no DS".',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_component',
        description:
          'Retorna info completa de um componente: descricao, tags, props (@Input) tipados com defaults, outputs (@Output), e exemplos de uso. Use quando o usuario pergunta sobre um componente especifico (ex: "como uso o ds-button" ou "props do FormFieldComponent").',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description:
                'Nome do componente (ex: "ButtonComponent") OU selector (ex: "ds-button"). Case-insensitive.',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'search_components',
        description:
          'Busca componentes por palavra-chave em selector, nome, descricao e tags. Use quando o usuario descreve uma necessidade sem saber o nome exato (ex: "preciso de um botao com loading", "componente para tabela", "AI assistant", "form com select").',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Palavras-chave separadas por espaco. Ex: "form select", "ai chat", "kpi dashboard".',
            },
            limit: {
              type: 'number',
              description: 'Maximo de resultados (default 5, max 15).',
              minimum: 1,
              maximum: 15,
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'list_components': {
      const lines = [
        `# ${catalog.design_system.name} (${catalog.design_system.version})`,
        catalog.design_system.homepage,
        '',
        `${catalog.components.length} componentes disponiveis:`,
        '',
        ...catalog.components.map(formatComponentSummary),
        '',
        '_Use `get_component(name)` para ver props, outputs e exemplos de cada um._',
      ];

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    case 'get_component': {
      const queryName = (args?.name as string | undefined)?.trim();
      if (!queryName) {
        return {
          content: [
            {
              type: 'text',
              text: 'Erro: parametro `name` e obrigatorio. Ex: `get_component({ name: "ds-button" })`.',
            },
          ],
          isError: true,
        };
      }

      const component = findComponent(catalog, queryName);
      if (!component) {
        const suggestions = searchComponents(catalog, queryName, 3);
        const suggestionText =
          suggestions.length > 0
            ? `\n\nVoce talvez quis dizer:\n${suggestions
                .map((s) => `- ${s.component.selector} (${s.component.name})`)
                .join('\n')}`
            : '\n\nUse `list_components()` para ver todos os componentes disponiveis.';

        return {
          content: [
            {
              type: 'text',
              text: `Componente '${queryName}' nao encontrado.${suggestionText}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text', text: formatComponentDetail(component) }],
      };
    }

    case 'search_components': {
      const query = (args?.query as string | undefined)?.trim();
      if (!query) {
        return {
          content: [
            {
              type: 'text',
              text: 'Erro: parametro `query` e obrigatorio. Ex: `search_components({ query: "form select" })`.',
            },
          ],
          isError: true,
        };
      }

      const limitArg = args?.limit as number | undefined;
      const limit = Math.min(Math.max(limitArg ?? 5, 1), 15);

      const results = searchComponents(catalog, query, limit);

      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Nenhum componente correspondeu a "${query}". Use \`list_components()\` para ver todos os componentes disponiveis.`,
            },
          ],
        };
      }

      const lines = [
        `# Resultados para "${query}" (${results.length} match${results.length > 1 ? 'es' : ''})`,
        '',
        ...results.map(
          ({ component, score }) =>
            `**${component.selector}** (${component.name}) — score ${score}\n${component.description}\n_Tags: ${component.tags.join(', ')}_`,
        ),
        '',
        '_Use `get_component(name)` para ver props, outputs e exemplos de cada um._',
      ];

      return {
        content: [{ type: 'text', text: lines.join('\n\n') }],
      };
    }

    default:
      throw new Error(`Tool desconhecida: ${name}`);
  }
});

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log no stderr para nao poluir o stdout (que e o canal MCP JSON-RPC)
  console.error(
    `[${SERVER_NAME}] v${SERVER_VERSION} ready (stdio) — ${catalog.components.length} components in catalog`,
  );
}

main().catch((error) => {
  console.error('[fatal]', error);
  process.exit(1);
});
