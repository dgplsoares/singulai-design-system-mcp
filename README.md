# @dgplsoares/singulai-ds-mcp

> MCP server exposing the [Singulai Design System](https://design.singulai.ai) (Angular 20) to AI agents — Claude Desktop, Claude Code, Cursor, Continue, and any other [MCP](https://modelcontextprotocol.io/)-compatible client.

[![npm version](https://img.shields.io/npm/v/@dgplsoares/singulai-ds-mcp.svg)](https://www.npmjs.com/package/@dgplsoares/singulai-ds-mcp)
[![Live Showcase](https://img.shields.io/badge/showcase-design.singulai.ai-2563EB)](https://design.singulai.ai)
[![License](https://img.shields.io/badge/license-MIT-22C55E)](./LICENSE)

🚧 **Alpha (v0.1.x)** — funcional, não recomendado para produção alheia ainda. API das tools e shape do catálogo estabilizam em v1.0.

## O que é?

Um [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server que expõe o catálogo do **Singulai Design System** (15 componentes Angular 20 standalone + signals + neumorphic) como tools que qualquer AI agent consegue chamar. Casos de uso típicos:

- _"Quais componentes existem nesse design system?"_ → tool retorna catálogo
- _"Componente para botão com loading state?"_ → tool retorna `<ds-button>` + exemplo
- _"Quais @Input existem em `<ds-form-field>`?"_ → tool retorna props tipados

O agente AI usa as tools automaticamente quando o usuário pede algo relacionado ao DS — sem precisar ler docs.

## Tools v0.1

| Tool | Função |
|---|---|
| **`list_components()`** | Lista os 15 componentes (nome + selector + descrição curta + tags) |
| **`get_component(name)`** | Info completa: descrição, props tipados (com defaults), outputs, exemplos. Aceita selector (`ds-button`) ou nome de classe (`ButtonComponent`) |
| **`search_components(query, limit?)`** | Busca por palavras-chave em selector + nome + tags + descrição, com scoring |

## Instalação

### Opção 1 — Claude Code (CLI)

Adicione ao seu `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "singulai-ds": {
      "command": "npx",
      "args": ["-y", "@dgplsoares/singulai-ds-mcp"]
    }
  }
}
```

Reinicie o Claude Code. Pergunte: _"quais componentes existem no Singulai Design System?"_ — o agente vai chamar `list_components` automaticamente.

### Opção 2 — Claude Desktop

Edite o arquivo de config (location varia por SO):

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "singulai-ds": {
      "command": "npx",
      "args": ["-y", "@dgplsoares/singulai-ds-mcp"]
    }
  }
}
```

Reinicie o Claude Desktop.

### Opção 3 — Cursor

Em Settings → Features → Model Context Protocol:

```json
{
  "mcpServers": {
    "singulai-ds": {
      "command": "npx",
      "args": ["-y", "@dgplsoares/singulai-ds-mcp"]
    }
  }
}
```

### Opção 4 — Outros clientes MCP

Qualquer cliente compatível com [MCP stdio transport](https://modelcontextprotocol.io/docs/concepts/transports#standard-input-output-stdio) pode rodar este server. Comando: `npx -y @dgplsoares/singulai-ds-mcp`.

## Verificação rápida

Após adicionar a config e reiniciar o cliente, peça ao agente:

```
Quais componentes existem no Singulai Design System?
```

A resposta deve listar os 15 componentes (button, card, form-field, sidebar-left-nav, page-layout, page-header, nav-footer, ai-assistant-panel, statsbar-card, segmented-tabs, icon-neumorphic, card-panel, ai-assistant-button, dark-mode-button, notifications-button).

Outras perguntas para testar:

- _"Como uso o `<ds-button>`?"_ — chama `get_component`
- _"Componente para chat de AI?"_ — chama `search_components`
- _"Quais props o FormFieldComponent aceita?"_ — chama `get_component`

## Status

| Fase | Tools |
|---|---|
| ✅ MCP-1/2/3 (atual) | `list_components`, `get_component`, `search_components` |
| ✅ MCP-4 | npm publish + docs de instalação |
| 🟡 MCP-5 | validação em Claude Code |
| 🔜 v0.2+ | `get_tokens`, `get_examples`, `get_theme_overrides`, catálogo auto-gerado via ts-morph |

## Stack

- TypeScript + Node 20+
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) (oficial Anthropic)
- [zod](https://zod.dev) para validação de schema
- Stdio transport (padrão MCP)

## Desenvolvimento

```bash
git clone git@github.com:dgplsoares/singulai-design-system-mcp.git
cd singulai-design-system-mcp
npm install
npm run dev    # tsx src/index.ts
npm run build  # tsc + copia src/data → dist/data
npm start      # node dist/index.js
```

Smoke test stdio (cole inteiro em um terminal):

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | node dist/index.js
```

## License

[MIT](./LICENSE) — Diogo Soares · 2026

## Links

- 🌐 Live showcase: https://design.singulai.ai
- 📦 Design System (mirror público): https://github.com/dgplsoares/singulai-design-system
- 📦 NPM: https://www.npmjs.com/package/@dgplsoares/singulai-ds-mcp
- 👤 Autor: [LinkedIn](https://www.linkedin.com/in/dgsoares/) · [GitHub](https://github.com/dgplsoares)
