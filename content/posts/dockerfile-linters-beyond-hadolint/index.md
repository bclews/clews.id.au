+++
title = 'Dockerfile Linters Beyond Hadolint'
date = 2026-08-17T10:00:00+10:00
draft = false
description = "droast is a fast new Rust Dockerfile linter whose headline benchmark measures the right thing in the wrong units. I ran it against hadolint over 62 real Dockerfiles to see what actually separates them."
categories = ['Software Engineering', 'DevOps']
tags = ['docker', 'cli', 'security', 'linting']
aliases = ['/til/dockerfile-linters-beyond-hadolint/']
+++

`droast` got a passing mention in a recent conversation: it is a Rust Dockerfile
linter that prints snarky remarks alongside its findings. I went to look it up
expecting a five-minute note, and instead lost an evening to it, because the
comparison chart it leads with says **3.90× FASTER** in large type, and I
couldn't work out why anyone would care...

Linting a Dockerfile doesn't take long enough to have a throughput problem. So
either the number was measuring something that doesn't matter in practice, or I
was missing something. I suspected the latter, so went digging.

**tl;dr;** the speed claim is true and mostly beside the point, `droast` is a
lot noisier than hadolint out of the box, and both do ShellCheck if you ask them
to. Run `docker build --check` either way, because it's free.

## Why does droast exist?

I could just say [RIIR](https://transitiontech.ca/random/RIIR) and leave it at
that.

But it could be something to do with hadolint's release history:

```text
v2.10.0   2022-03-31
v2.12.0   2022-11-09
v2.13.1   2025-09-02     ← 34 months later
v2.14.0   2025-09-22
v2.15.0   2026-07-30
v2.15.1   2026-07-31
```

[hadolint](https://github.com/hadolint/hadolint) has been the default Dockerfile
linter since 2015. It's the one bundled into super-linter and MegaLinter, the
one in everyone's `.pre-commit-config.yaml`, and at 12.4k stars it has more than
ten times the reach of anything else in the category. And it went nearly three
years without a release.

The rest of the category was no healthier. `dockerfilelint`, the next most used
option, took from 2016 to now to reach 1k stars, and its `main` branch hasn't
taken a commit since September 2020. `droast` matched that star count in four
months.

`droast`'s first commit is April 2026, right at the tail of that gap. It isn't a
rewrite though. No shared code, no shared lineage, its own parser and its own
`DF####` rule namespace.

It has grown a deliberate drop-in replacement mode since. `droast
--hadolint-compatible` reads your existing `.hadolint.yaml`, accepts hadolint's
environment variables and flags, honours its inline ignore pragmas, emits its
output formats down to `checkstyle` and `sonarqube`, and reports equivalent
checks under their original `DL####` IDs. There's a `droast init
--from-hadolint` to convert the config outright.

You only build that if the thing you're replacing is already installed
everywhere. The timing is the interesting part though. That mode landed on 15
August 2026 in 1.6.0, four months after the first commit and two weeks after
hadolint shipped 2.15.1. It isn't in 1.5.1, which is the version I tested with
below. The opening back in April was hadolint sitting in everyone's pipeline and
not shipping, and by the time `droast` went at that opening directly, hadolint
had already closed it with four releases since September 2025.

## droast

The repo is
[`immanuwell/dockerfile-roast`](https://github.com/immanuwell/dockerfile-roast).
Its gimmick is tone. It prints the finding, then a remark about it, framed as
code review from a senior dev who's stopped being polite:

```text
  INFO  [DF012]  No HEALTHCHECK defined
             at Dockerfile
             💬 "No HEALTHCHECK? Your container is basically on the honor
                system. 'It's fine, I'm sure it's fine.' Meanwhile Kubernetes is
                just restarting it every 30 seconds wondering what went wrong."
```

Under the joke it's a real linter. 85 rules with IDs like `DF001` for
`FROM ...:latest`, `DF002` for running as root, `DF014` for secrets in
`ARG`/`ENV`,
grouped into security, performance, reproducibility, correctness and
maintainability. A few are language-aware for Python and Node.

```bash
droast Dockerfile
droast --no-roast Dockerfile              # the humourless version
droast --min-severity warning Dockerfile
droast --skip DF001,DF012 Dockerfile
droast --format sarif Dockerfile          # also json, github, compact
```

It ships as platform binaries, Homebrew, Cargo, a Docker image, a GitHub Action,
a pre-commit hook, a VS Code extension and a Neovim plugin, and it compiles to
WASM so there's a browser version that lints client-side. MIT licensed.

That surface is the first thing that gave me pause, because the project is four
months old and 224 of its 231 commits come from one person. All 48 issues ever
filed are closed, and of the fifteen most recent, five are false-positive
reports and two are packaging drift.

None of that is disqualifying for a linter, which is about the lowest-stakes
thing you can put in a pipeline. But it's a different risk profile from a
ten-year-old tool, and "1k stars" on its own doesn't tell you that.

The commit log tells you how it got here. The first 21 commits, covering a
Dockerfile parser, five rule families, three output formatters, the linter core,
a CLI, integration tests and a README, all landed between 22:04 and 22:15 on the
opening night.

Nothing in the repo declares it, but nobody types a Dockerfile parser in the
same minute as `cargo init`. This is agent-directed work, which I mean as a
description and not a complaint. Nor is the output slop: 22,754 lines of Rust
with 497 tests behind it, including dedicated suites for hadolint compatibility
and parser regression.

That explains both halves of what I found. The breadth first: everything above
shipped inside four months, which is not a pace you hit by hand in your
evenings. Then the failures, which aren't broken code so much as bad calls about
what deserves flagging at all. Rules that fire on everything. EXPOSE warnings on
a CLI image. A Homebrew build labelled 1.4.8 that was actually 1.4.7. Agents are
good at coverage and bad at taste.

## About that speed benchmark

The README compares `droast` 1.4.4 against hadolint 2.14.0 over 321 Dockerfiles
on Ubuntu:

| Metric           | droast   | hadolint |
| ---------------- | -------- | -------- |
| Median scan time | 984.5 ms | 3,844 ms |
| Files/second     | 326.1    | 83.5     |
| Binary size      | 7.51 MB  | 54.73 MB |

The method is sound, with warm-ups, ten iterations, execution order reversed
each time, and an explicit note that it measures speed and not detection
quality. My problem is the unit... is anyone linting 321 Dockerfiles in one
invocation?

Anyway, I ran it over the 62 Dockerfiles on my laptop for shits and giggles:

| Workload                     | droast 1.5.1 | hadolint 2.15.1 |
| ---------------------------- | -----------: | --------------: |
| All 62 files, one invocation |       215 ms |          346 ms |
| One file, per invocation     |        55 ms |          181 ms |

The second row is almost entirely startup cost. Take it off the first and what's
left is the linting itself: 160 ms for `droast` and 165 ms for hadolint, spread
across the other 61 files. That's 2.6 ms against 2.7 ms each. Identical. The
whole difference between these two tools is startup: 52 ms for a 6.7 MB Rust
binary against 178 ms for a 99 MB Haskell one, a gap of 126 ms. Those are the
Homebrew macOS builds on my laptop, not the Linux ones in the table above.

That gap disappears into a pre-commit hook, where `git commit` burns 445 ms
before either linter even starts. You'd only notice it on lint-on-save, which
fires whether you asked for it or not, while you're sat there watching for the
squiggles to catch up.

## What each one catches

Speed was never going to decide this. Findings are what matter. Same 62 files:

|                      | droast | hadolint |
| -------------------- | -----: | -------: |
| Total findings       |    537 |      313 |
| Files flagged        |  62/62 |    54/62 |
| Distinct rules fired |     38 |       32 |
| error                |      6 |       20 |
| warning              |    113 |      202 |
| info                 |    418 |       91 |

`droast` reports 71% more findings, and 78% of them are INFO. hadolint's
distribution is inverted, with two thirds landing as warnings. On the eight
files hadolint called clean, `droast` produced 37 findings, 35 of them INFO.

Whether that's thoroughness or noise depends on the rule. Here's a real
Dockerfile from one of my own repos, a two-stage Go build that produces a CLI
image:

```dockerfile
FROM golang:1.21-alpine AS build
RUN apk add --no-cache git
WORKDIR /primitive
COPY . .
RUN go install github.com/bclews/primitive@latest

FROM alpine:3.18
COPY --from=build /go/bin/primitive /usr/bin/primitive
VOLUME /primitive
WORKDIR /primitive
ENTRYPOINT [ "primitive" ]
CMD [ "--help" ]
```

hadolint finds two things:

```text
Dockerfile:5  DL3018 warning: Pin versions in apk add
Dockerfile:17 DL3062 warning: Pin versions in go
```

Both correct. `droast` finds those same two, then adds five more:

```text
  INFO  [DF020]  No USER declared in the final stage
  INFO  [DF012]  No HEALTHCHECK defined
  INFO  [DF022]  No EXPOSE instruction — consider documenting which ports
                 this service uses
  INFO  [DF033]  No effective build-context ignore file
  WARN  [DF007]  COPY . copies the entire build context
```

`DF020` is fair. `DF033` and `DF007` are the same problem reported twice. And
`DF012` and `DF022` are simply wrong here. This image is a command-line tool
that renders images. It has no ports to expose and nothing to health-check.
`droast` assumes everything it looks at is a long-running service, and across my
corpus that assumption fired 37 times for EXPOSE and 27 for HEALTHCHECK, plenty
of them on batch jobs and CLIs.

A rule that fires on nearly everything stops being a finding and becomes noise
you eventually skip past, and skipping past findings is a habit you don't want
your team to build. `droast.toml` has presets and per-rule suppression, so this
is fixable in about ten minutes. You just have to know to do it.

## Shell analysis

hadolint parses the Dockerfile into an AST rather than regex-matching lines, and
then does the thing that made its reputation. It pulls the shell script out of
each `RUN` instruction and hands it to ShellCheck.

You get two rule namespaces in one report. `DL####` from hadolint proper (pin
your base image, don't `apt-get upgrade`, use `WORKDIR` instead of `cd`), and
`SC####` inherited from ShellCheck. In my files, 34 of hadolint's 313 findings
were ShellCheck rules: `SC2086` for unquoted variables, `SC2164` for `cd`
without `|| exit`, `SC2046` for word splitting on command substitution.

`droast` does this too, through a ShellCheck bridge added in July. It's off by
default, which is easy to miss: none of the finding counts above include it.
Turn it on with `--shellcheck auto` and the same 62 files give you:

| ShellCheck findings        | count |
| -------------------------- | ----: |
| `droast` (default)         |     0 |
| `droast --shellcheck auto` |    77 |
| hadolint                   |    34 |

More than hadolint, covering every `SC` rule hadolint fired plus `SC1091`,
`SC1101` and `SC2155`.

The difference is packaging. hadolint embeds ShellCheck as a Haskell library, so
it's always there and there's nothing to install. `droast` shells out to a
`shellcheck` binary you provide separately, so if you're depending on it, set
`mode = "required"` in `droast.toml` and a missing executable becomes an
`SC0000` error instead of silence. Two binaries in your CI image instead of one,
which matters or doesn't depending on where you're running it.

Two other differences. hadolint runs entirely offline with no vulnerability
database to sync, and it's GPL-3.0 where `droast` is MIT. For a linter you shell
out to that distinction is mostly academic, but if you work somewhere with a
licence policy, it's the kind of thing that decides the argument before the
technical merits get a look in.

## docker build --check

This is the my preferred option, and the one I suspect is most underused
relative to how little it costs.

BuildKit has had built-in checks since Dockerfile syntax 1.8. Zero install, on
every machine that already has Docker:

```bash
docker build --check .
```

There are 21 rules against hadolint's ~71, so on raw count it looks like the
weakest option here. But, these checks run inside BuildKit, during the build,
which means they see things a static parser can't:

- `UndefinedArgInFrom` and `InvalidDefaultArgInFrom` need `ARG` resolution
- `CopyIgnoredFile` needs the actual `.dockerignore` and build context
- `UndefinedVar`, `DuplicateStageName` and `RedundantTargetPlatform` need the
  resolved multi-stage graph

They're different instruments, and the overlap is smaller than the rule counts
suggest.

The part that makes it enforceable: `docker build --check` exits non-zero when
it finds violations, and you can promote checks to hard failures in a normal
build with a directive at the top of the Dockerfile:

```dockerfile
# syntax=docker/dockerfile:1
# check=error=true
```

Or from CI without touching the file:

```bash
docker build --build-arg "BUILDKIT_DOCKERFILE_CHECK=error=true" .
```

On the Go Dockerfile above it found nothing, which is the correct answer. It's a
well-formed file. Its problems are all policy, and none of them would break a
build.

## What none of them cover

Everything so far analyses the Dockerfile. None of it analyses the image you
actually ship, and those are different questions.

[Dockle](https://github.com/goodwithtech/dockle) checks the built image against
the CIS Docker Benchmark: no root user, no credential files baked into layers,
no unnecessary setuid binaries. It's the tier people skip, and the one that
catches the secret you copied in and deleted two layers later.

[Trivy](https://github.com/aquasecurity/trivy) covers that plus CVEs, secrets
and SBOMs, and `trivy config` does Dockerfile misconfiguration checks on top. If
it's already in your pipeline, a dedicated Dockerfile linter buys you less than
you'd think.

## What I'd actually run

`docker build --check` with `check=error=true`, on every build, everywhere. It
costs nothing, it's already installed, and it catches a class of error the
static linters can't see. There is no argument against this one.

hadolint in CI, for the deep ruleset, the better out-of-the-box signal-to-noise,
and shell analysis with nothing else to install. It's back in active development
too, which it wasn't a year ago.

Dockle or Trivy against the built image, because source-level linting doesn't
know what ended up in your layers.

And `droast`? In your editor, via the VS Code extension or the Neovim plugin.
That's the one place its startup advantage is something you actually perceive.
Configure `droast.toml` first, turning off the EXPOSE and HEALTHCHECK rules
unless you're only ever building services, or the noise will teach your team to
ignore it inside a week. Then let hadolint be the gate in CI, where 130 ms is
rounding error against a Docker build.

I went in expecting to pick a winner and came out wanting both, in different
places.
