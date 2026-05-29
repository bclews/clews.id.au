+++
title = 'Modernising My Zsh Setup'
date = 2026-04-23T14:30:00+10:00
draft = false
description = "Auditing oh-my-zsh with shell history, replacing it with antidote and starship, and cutting steady-state shell startup from 720 ms to 190 ms."
categories = ['Tutorials']
tags = ['tools', 'tutorial', 'productivity']
+++

A few weekends ago I noticed my terminal felt slow. Every new shell made me
wait before I could start typing. A quick measurement showed why:

```bash
for i in {1..10}; do /usr/bin/time -p zsh -i -c exit 2>&1 | grep real; done
```

~720 ms of steady-state startup, paid on every tab, split, and `zellij` pane. A
couple of days of tinkering later it was ~190 ms. This post covers how I got
there, and what I'd suggest to anyone still running a default oh-my-zsh +
powerlevel10k setup.

**tl;dr;** audit what you're actually using, delete what you're not,
and cache every subprocess.

## Why the churn?

Two things nudged me off my old setup:

- **Powerlevel10k is in maintenance mode.** The author [announced](https://github.com/romkatv/powerlevel10k/commit/bde5ca4c2aa6e0c52dd7f15cf216dffdb1ec788c)
  he's stopping active development. It still works, but I'd rather not keep
  building on something that won't see long-term support.
- **Oh-my-zsh has a reputation for bloat.** I'd ignored that for years because
  the convenience outweighed the complaint, at least until I measured it.

I wasn't in a rush. I just wanted to know what a fast, modern zsh setup looks
like if I rebuild it from scratch.

## Step 1: audit what you're actually using

This was the most useful thing I did, and it took about 30 seconds.

My `plugins=(...)` line in `.zshrc` included the usual suspects: `git`,
`docker`, `docker-compose`, `kubectl`, `helm`, `golang`, `gh`, `minikube`,
`zsh-autosuggestions`, `zsh-syntax-highlighting`. Each of those "tool" plugins
defines a pile of aliases — `gst` for `git status`, `k` for `kubectl`, `dps`
for `docker ps`, and so on.

The question: do I ever use any of them?

Shell history has the answer. On a macOS system with extended history enabled,
`~/.zsh_history` looks like this:

```
: 1714000000:0;git status
: 1714000001:0;kubectl get pods
```

So I extracted every alias the OMZ git plugin defines, then counted how many
matched the first token of any line in my history:

```bash
# every alias the plugin defines
grep -oE "^alias [a-zA-Z_0-9]+" ~/.oh-my-zsh/plugins/git/git.plugin.zsh \
  | awk '{print $2}' | sort -u > /tmp/git_aliases.txt

# first token of every history command
awk -F';' 'NF>1 {print $NF; next} {print}' ~/.zsh_history \
  | awk '{print $1}' | sort | uniq -c | sort -rn > /tmp/history_counts.txt

# join
while read alias; do
  count=$(awk -v c="$alias" '$2==c {print $1}' /tmp/history_counts.txt)
  [ -n "$count" ] && printf "%6d  %s\n" "$count" "$alias"
done < /tmp/git_aliases.txt | sort -rn
```

The result: zero. Across 1,091 lines of history and the 197 aliases the plugin
defines, I had not typed a single one. Every `git status` I'd run was typed out
longhand. Same story when I ran the audit against each of the other plugins:

| Plugin         | Aliases defined | Times I used one |
| -------------- | --------------: | ---------------: |
| git            | 197             | 0                |
| kubectl        | 114             | 0 (not even `k`) |
| docker         | 36              | 0                |
| docker-compose | 19              | 0                |
| golang         | 26              | 0                |
| helm           | 5               | 0                |

The only plugins I actually needed were `zsh-autosuggestions` and
`zsh-syntax-highlighting`, neither of which is OMZ-specific. The `gh` and
`minikube` plugins turned out to be 14-line wrappers that just call the
tool's native `completion zsh` — which I could do directly in five lines
without the oh-my-zsh framework wrapping it.

I was loading a framework and a stack of plugins and getting nothing back for
it. That settled the migration.

## Step 2: choose replacements

- **Prompt: [starship](https://starship.rs/)** — single Rust binary, TOML
  config, still actively developed. The tradeoff is that Starship runs as a
  subprocess on every prompt render (~20–50 ms), whereas powerlevel10k is pure
  zsh with an "instant prompt" trick. For me that cost is imperceptible; if you
  genuinely need an instant prompt, p10k (or
  [zsh4humans](https://github.com/romkatv/zsh4humans)) is still the better
  answer.
- **Plugin manager: [antidote](https://getantidote.github.io/)** — simple,
  fast, compiles a static plugin list to a single sourced file. Less
  machinery than zinit's turbo mode, which I don't need.
- **Native tool completions** — generated once into `~/.cache/zsh-completions/`
  via a `make completions` target, added to `fpath`:

  ```bash
  kubectl completion zsh  > ~/.cache/zsh-completions/_kubectl
  helm    completion zsh  > ~/.cache/zsh-completions/_helm
  gh      completion -s zsh > ~/.cache/zsh-completions/_gh
  # etc.
  ```

  No plugin framework needed; regenerate after `brew upgrade`.

The initial swap got me from ~720 ms to ~540 ms. Better, but the profiler
showed there was plenty left to cut.

## Step 3: profile, then cut

Zsh has a built-in profiler:

```zsh
# at the very top of .zshrc
zmodload zsh/zprof

# ... existing config ...

# at the very bottom
zprof
```

Open a new shell and you get a ranked table of hotspots. Mine looked like:

```
num  calls  time   self     name
  1)   1  125.45  125.45   _mise_hook
  2)   1   43.40   43.40   (antidote plugin sourcing)
  3)   2   24.22   12.11   compaudit
  4)   1   38.03   13.81   compinit
```

`_mise_hook` at 125 ms was the single biggest offender. That's [mise's](https://mise.jdx.dev/)
full activation hook: it adds shims to PATH, registers a `chpwd` hook to switch
tool versions when you `cd`, and pre-loads env vars from any `mise.toml` in the
current directory tree. All useful, if you use any of it.

But I don't use mise's `[env]` feature. I use it for tool versioning and
nothing else. Mise's own documentation points out that if you only need
versioning, there's a lighter activation mode:

```zsh
eval "$(mise activate zsh --shims)"
```

`--shims` mode just prepends the shim directory to `PATH`. Tool versions
still switch per-directory — the shims themselves inspect `mise.toml` /
`.tool-versions` at invocation time. What you lose is the chpwd hook and the
`[env]` injection. Net saving: ~120 ms.

## Step 4: cache every subprocess

The second category of startup cost is `eval "$(some-tool init zsh)"`. Every
one of those is a full fork+exec of a binary that returns a chunk of shell
code. On my setup I had five of them: starship, zoxide, fzf, thefuck, and
mise. Each cost 10–20 ms in overhead alone.

[`mroth/evalcache`](https://github.com/mroth/evalcache) is a tiny zsh plugin
that solves exactly this. It caches the output of an eval to a file, and
invalidates the cache when the tool binary's `mtime` changes. Usage is a
one-for-one substitution:

```zsh
# before
eval "$(starship init zsh)"
eval "$(zoxide init zsh)"
eval "$(mise activate zsh --shims)"
source <(fzf --zsh)

# after (with mroth/evalcache loaded)
_evalcache starship init zsh
_evalcache zoxide init zsh
_evalcache mise activate zsh --shims
_evalcache fzf --zsh
```

First shell after installing a tool upgrade: cache miss, you pay the normal
subprocess cost once. Every shell after that sources a local file, which is
near-instant. If you ever need to force a full refresh: `rm -rf ~/.zsh-evalcache`.

## Step 5: the small stuff

A handful of lower-impact changes that add up:

- **`compinit -C` with a 24 h audit refresh.** `compinit`'s security audit
  (`compaudit`) is ~25 ms. Skip it on fresh zcompdumps:

  ```zsh
  autoload -Uz compinit
  if [[ -n ${ZDOTDIR:-$HOME}/.zcompdump(#qN.mh+24) ]]; then
    compinit
  else
    compinit -C
  fi
  ```

- **Hardcode constants instead of shelling out for them.** My old config had
  `export PATH="$PATH:$(go env GOPATH)/bin"` — spawning Go just to recover a
  string that's been `$HOME/go` by default since Go 1.8. Same story with
  `JAVA_HOME=$(/usr/libexec/java_home)` (which I removed entirely, along
  with a dead `openjdk` PATH entry pointing to a directory that didn't even
  exist).

- **Delete what you don't use.** I had `thefuck` sourced on every shell
  start. I couldn't remember the last time I'd actually typed `fuck`. It
  spawns Python on startup to set up its alias, and Python startup is not
  cheap. `brew uninstall thefuck`, one line out of `.zshrc`, another ~90 ms
  gone. Same with my `gcloud` integration — I hadn't touched Google Cloud in
  months, and its `path.zsh.inc` / `completion.zsh.inc` files source
  non-trivial amounts of shell code.

## The result

| Stage                                  | Steady-state |
| -------------------------------------- | -----------: |
| oh-my-zsh + powerlevel10k              |       720 ms |
| antidote + starship (plain swap)       |       540 ms |
| Removed unused integrations            |       450 ms |
| evalcache + `mise --shims` + compinit -C |     190 ms |

A 73% reduction. New shells feel instant now instead of slightly sluggish.

## What I'd recommend if you're doing the same

1. **Audit before you migrate.** Whatever plugin framework you're on, it
   probably ships with more machinery than you use. Shell history is an
   honest record of your actual behaviour; mine was embarrassing reading.
2. **Profile, don't guess.** `zmodload zsh/zprof` and `zprof` take 60 seconds
   to add, and they tell you exactly where the time goes. On my setup the
   single biggest saving came from a function I'd never have suspected
   (`_mise_hook`).
3. **Cache aggressively, but with invalidation.** Hand-rolled "run this
   eval once and source the file" scripts work, but they rot silently when
   you upgrade a tool. `mroth/evalcache` does the right thing by watching
   the binary's mtime.
4. **Measure the result.** Before/after numbers are the difference between
   thinking it's faster and knowing it's 3.8× faster.

The setup I landed on lives in my
[dotfiles repository](https://github.com/bclews/dotfiles) if you want to
lift pieces of it. Every decision above is captured in git history with
the reasoning in the commit message — including the experiments that
didn't pan out.
