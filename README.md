# @dgplsoares/singulai-ds-mcp

> MCP server exposing the [Singulai Design System](https://design.singulai.ai) (Angular 20) to AI agents — Claude Desktop, Claude Code, Cursor, Continue.

[![Live Showcase](https://img.shields.io/badge/showcase-design.singulai.ai-2563EB)](https://design.singulai.ai)
[![License](https://img.shields.io/badge/license-MIT-22C55E)](./LICENSE)
[![Status](https://img.shields.io/badge/status-pre--alpha-F59E0B)](#status)

🚧 **Alpha** — funcionalmente operacional, ainda não publicado no npm.
Documentação de instalação para Claude Desktop / Claude Code / Cursor +
publicação chegam na v0.1.0 (próxima fase). Por enquanto, o repo serve
como vitrine pública do desenvolvimento — você pode clonar e rodar local.

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
| ✅ MCP-1/2/3 (atual) | `list_components`, `get_component`, `search_components` |
| 🟡 MCP-4 | npm publish + docs de instalação |
| 🔜 v0.2+ | `get_tokens`, `get_examples`, `get_theme_overrides`, catálogo auto-gerado via ts-morph |

## Tools v0.1

- **`list_components()`** — retorna os 15 componentes do DS com nome, selector e descrição curta
- **`get_component(name)`** — info completa de um componente: descrição, tags, todos os `@Input` tipados (com defaults), `@Output`, e exemplos de uso. Aceita selector (`ds-button`) ou nome de classe (`ButtonComponent`)
- **`search_components(query)`** — busca por palavras-chave em selector + nome + descrição + tags, com scoring

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
