# @dgplsoares/singulai-ds-mcp

> MCP server exposing the [Singulai Design System](https://design.singulai.ai) (Angular 20) to AI agents — Claude Desktop, Claude Code, Cursor, Continue.

[![Live Showcase](https://img.shields.io/badge/showcase-design.singulai.ai-2563EB)](https://design.singulai.ai)
[![License](https://img.shields.io/badge/license-MIT-22C55E)](./LICENSE)
[![Status](https://img.shields.io/badge/status-pre--alpha-F59E0B)](#status)

🚧 **Pre-alpha** — em desenvolvimento ativo. Documentação de instalação e
publicação no npm chegam em v0.1.0 (próximas fases). Por enquanto, o repo
serve como vitrine pública do desenvolvimento.

## O que é?

Um [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server que
expõe o catálogo do Singulai Design System (componentes, props, exemplos) via
tools padronizadas. Qualquer AI agent compatível pode consultar o DS sem
precisar ler docs:

- _"Quais componentes existem nesse design system?"_ → retorna catálogo
- _"Componente para botão com loading state?"_ → retorna `<ds-button>` + exemplo
- _"Quais @Input existem em `<ds-form-field>`?"_ → retorna props tipados

## Status

| Fase | Tools |
|---|---|
| ✅ MCP-1 (atual) | `hello_singulai` (placeholder) |
| 🟡 MCP-2/3 | `list_components`, `get_component`, `search_components` |
| 🔜 v0.2+ | `get_tokens`, `get_examples`, `get_theme_overrides` |

## Stack

- TypeScript + Node 20+
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) (oficial Anthropic)
- Stdio transport (padrão MCP)

## License

[MIT](./LICENSE) — Diogo Soares · 2026

## Links

- 🌐 Live showcase: https://design.singulai.ai
- 📦 Design System (mirror): https://github.com/dgplsoares/singulai-design-system
- 👤 Autor: [LinkedIn](https://www.linkedin.com/in/dgsoares/) · [GitHub](https://github.com/dgplsoares)
