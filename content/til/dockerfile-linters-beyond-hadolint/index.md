+++
title = 'Dockerfile Linters Beyond Hadolint'
date = 2026-08-14T10:00:00+10:00
draft = false
description = "droast, hadolint, docker build --check, and where the other Dockerfile scanners actually fit"
categories = ['Tools']
tags = ['docker', 'cli', 'security', 'linting']
+++

Today I learned about `droast`, a Rust Dockerfile linter that got a mention in a
video I was watching. Chasing it down turned into a survey of what else is in
this space, because the answer is more crowded than I expected.

## droast

The repo is [`immanuwell/dockerfile-roast`](https://github.com/immanuwell/dockerfile-roast).
Its gimmick is tone: it prints the finding along with a snarky remark about it,
framed as code review from a senior dev who's seen too many prod incidents.

Under the joke it's a real linter. 85 rules with IDs like `DF001` for
`FROM ...:latest`, `DF002` for running as root, `DF013` for secrets in `ENV`,
and `DF037` for instruction ordering. They're grouped into security,
performance, reproducibility, correctness and maintainability, and a few are
language-aware for Python and Node.

```bash
droast Dockerfile
droast --no-roast Dockerfile              # the humourless version
droast --min-severity warning Dockerfile
droast --skip DF001,DF012 Dockerfile
droast --format sarif Dockerfile          # also json, github, compact
```

It ships as platform binaries, Homebrew, Cargo, a Docker image, a GitHub
Action, a pre-commit hook, a VS Code extension and a Neovim plugin. It also
compiles to WASM, so there's a browser version that lints entirely client-side
with nothing uploaded, plus a [Wasmer package](https://wasmer.io/immanuwell/droast).
MIT licensed, around 1k stars.

The README claims roughly 4x hadolint's throughput (326 vs 83.5 files/sec) and
a much smaller binary (7.5 MB vs 55 MB). That's the project's own benchmark so
I'd take it as directional, though the Haskell runtime does explain the size
gap.

## Hadolint

[hadolint](https://github.com/hadolint/hadolint) is the incumbent. Haskell,
around 9k stars, been around since 2016, and effectively the default in CI.

The interesting design decision is that it parses the Dockerfile into an AST
and runs rules over that instead of regex-matching lines. Then it pulls the
shell script out of each `RUN` instruction and hands it to ShellCheck. You end
up with two rule namespaces in one report: `DL####` from hadolint (pin your
base image, don't `apt-get upgrade`, use `WORKDIR` instead of `cd`) and
`SC####` inherited from ShellCheck (unquoted variables, useless `cat`, wrong
test operators).

That inline shell analysis is the bit that's hard to replicate, and it's a big
part of why hadolint stayed dominant. It also runs offline with no
vulnerability database to sync, and config lives in `.hadolint.yaml` for
ignores and trusted registries.

## docker build --check

This one I didn't know about at all. BuildKit has had built-in checks since
Buildx 0.15 / Docker Desktop 4.33:

```bash
docker build --check .
```

Zero install, runs as part of the build, and catches things like
`JSONArgsRecommended`, `StageNameCasing`, `FromAsCasing` and
`SecretsUsedInArgOrEnv`. The rule count is small next to hadolint's, but it's
already on every machine that has Docker.

## Everything else

The rest of the space splits into three tiers that get conflated a lot.

**Dockerfile linters proper**, which analyse the source file:

- `dockerfilelint` (Node) and RedHat's `dockerfile_lint` were both popular
  once. Both are effectively unmaintained now.

**Image linters**, which analyse the built image rather than the source:

- [Dockle](https://github.com/goodwithtech/dockle) checks the resulting image
  against the CIS Docker Benchmark. No root user, no credential files baked in,
  `HEALTHCHECK` present, no unnecessary setuid binaries. Different input
  entirely, so it complements hadolint rather than competing with it.

**IaC and security scanners** that happen to cover Dockerfiles:

- [Trivy](https://github.com/aquasecurity/trivy) is the big one. `trivy config`
  does Dockerfile misconfiguration checks, and the rest of the tool covers
  CVEs, secrets, SBOM, Kubernetes manifests and Terraform. If you're already
  running it you may not need a separate linter.
- Checkov and KICS are policy-as-code IaC scanners with Dockerfile rule packs.
  Both emit SARIF.
- Snyk IaC and Docker Scout cover similar ground commercially.
- Conftest (OPA/Rego) is the option if you want to write your own Dockerfile
  policy rather than consume someone else's ruleset. Semgrep has a Dockerfile
  mode that works for one-off org-specific rules too.

## What I'd actually run

`docker build --check` for free during builds, hadolint in CI for the deep
ruleset, then Dockle or Trivy against the resulting image.

droast's realistic pitch over hadolint is speed, binary size and the
browser/WASM story. Rule coverage parity is the thing I'd want to spot-check
against my own Dockerfiles before swapping anything out.
