# Security Policy

## Reporting a Vulnerability

If you believe you have found a security vulnerability in XprismPlay, please report it responsibly via a **[GitHub private security advisory](https://github.com/xprismplay/rugplay/security/advisories/new)** rather than opening a public issue.

Please include as much of the following as possible:

- A description of the vulnerability and its potential impact
- The affected component (website, WebSocket server, infrastructure, etc.)
- Steps to reproduce or a proof of concept
- Any suggested mitigations if you have them

We will acknowledge your report as soon as we are able and will keep you informed as we work to address the issue. We ask that you do not publicly disclose the vulnerability until we have had a reasonable opportunity to investigate and release a fix.

## Scope

The following are in scope for this policy:

- **Website** — the SvelteKit application and all API routes
- **WebSocket server** — the Bun/Redis real-time infrastructure
- **Infrastructure** — hosting, database, environment configuration, and secrets handling

The following are out of scope:

- Vulnerabilities in third-party dependencies (please report these upstream)
- Social engineering attacks
- Denial of service attacks
- Issues requiring physical access to our infrastructure

## Supported Versions

Only the latest version of XprismPlay is actively maintained. We do not backport security fixes to older versions.

## Our Commitment

- We will investigate all credible reports in good faith
- We will not take legal action against researchers who report vulnerabilities responsibly in accordance with this policy
- We will credit reporters in release notes if they wish to be acknowledged
