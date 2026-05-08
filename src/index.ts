#!/usr/bin/env node
/**
 * Singulai Design System — MCP Server (entry point)
 *
 * Expoe o catalogo do Design System Singulai (Angular 20, Standalone +
 * Signals, neumorphic) para AI agents via Model Context Protocol.
 *
 * Tools v0.1 (minimal):
 *   - hello_singulai (placeholder enquanto o catalogo manual nao esta pronto)
 *
 * Tools v0.1 (target — proximas fases MCP-2/MCP-3):
 *   - list_components()
 *   - get_component(name)
 *   - search_components(query)
 *
 * Transport: stdio (padrao MCP — clientes spawnam o processo).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const SERVER_NAME = 'singulai-design-system-mcp';
const SERVER_VERSION = '0.1.0';

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
// Tools registry
// ---------------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'hello_singulai',
        description:
          'Placeholder — confirma que o servidor MCP do Singulai Design System esta vivo. Sera substituido por list_components/get_component/search_components na fase MCP-2.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  switch (name) {
    case 'hello_singulai':
      return {
        content: [
          {
            type: 'text',
            text: [
              `Singulai Design System MCP v${SERVER_VERSION} — operacional.`,
              '',
              'Roadmap:',
              '  v0.1 (atual): hello world',
              '  v0.1.x: list_components, get_component, search_components',
              '  v0.2: catalogo auto-gerado via ts-morph',
              '  v0.3+: tokens, examples, theme overrides',
              '',
              'Showcase live: https://design.singulai.ai',
              'Repo do design system: https://github.com/dgplsoares/singulai-design-system',
            ].join('\n'),
          },
        ],
      };

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
  // Log no stderr para nao poluir o stdout (que e o canal MCP)
  console.error(`[${SERVER_NAME}] v${SERVER_VERSION} ready (stdio)`);
}

main().catch((error) => {
  console.error('[fatal]', error);
  process.exit(1);
});
