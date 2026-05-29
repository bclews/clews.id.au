+++
title = 'Jujutsu Can Refuse to Push Private WIP Commits'
date = 2026-04-25T09:00:00+10:00
draft = false
description = "How jj's git.private-commits setting blocks specified commits from ever being pushed, with a local check that fires before any network contact."
categories = ['Software Engineering']
tags = ['jujutsu', 'git', 'tools']
+++

Today I learned that [Jujutsu](https://jj-vcs.github.io/jj/) has a built-in
guard that blocks specified commits from ever being pushed. You declare it with
a revset in your config:

```toml
# ~/.config/jj/config.toml  (user-level → applies to every repo)
[git]
private-commits = 'description(glob:"wip:*")'
```

Now any commit whose description starts with `wip:`, along with all its
descendants, is rejected by `jj git push`, with a local check that fires before
any network contact:

```
Error: Won't push commit 548e973f323b since it is private
Hint: Configured git.private-commits: 'description(glob:"wip:*")'
```

## Parking Messy Local-Only Work

The workflow for stashing scratch work where it can't accidentally escape:

```bash
jj new                              # fresh change on top
# ...messy edits / notes...
jj describe -m "wip: scratch notes" # the wip: prefix makes it private
```

## The Passive Version: an Unbookmarked Child

`private-commits` is the _active_ guard. There's also a passive way to keep work
local that falls straight out of the model: `jj git push --bookmark <name>` only
sends the bookmark and its ancestors. Put the publishable work on a bookmarked
commit, and the WIP in a descendant child _without_ a bookmark, and the child
stays local automatically, no config needed.

```bash
# 1. Make the publishable commit. Bookmark it.
jj describe -m "docs: restore architecture and integration"
jj bookmark create docs-restore -r @

# 2. New empty child for the WIP stuff.
jj new -m "local: WIP additions to docs"

# 3. Move specific paths from parent → child.
jj squash --from @- --into @ -- review-notes.md scratch.md
```

Step 3 is the useful bit: `jj squash --from X --into Y -- <paths>` moves changes
in either direction between any two commits, scoped to just the files you name.
Now `jj git push --bookmark docs-restore` publishes the parent and its
ancestors; the unbookmarked child doesn't go.

The two techniques compose: the unbookmarked child keeps WIP local _by default_,
and a `wip:` prefix plus `private-commits` makes it an _error_ to push the child
even by accident.

## Gotchas / Notes

- `git.private-commits` is a **jj** config key; `git` is just jj's namespace for
  git-interop settings. It is _not_ a git config setting; plain git has no
  equivalent feature.
- It's a revset, so the rule is arbitrary. Description globs are one option; you
  can equally match on a bookmark, an author, or anything else revsets express.
- The nearest git equivalent is a pre-push hook that walks outgoing commits and
  exits non-zero, but that's per-clone (`.git/hooks`, unless you set
  `core.hooksPath`) and you write the logic yourself.
- Local bookmarks/branches already stay local in both jj and git (nothing
  auto-pushes), as the unbookmarked-child trick above relies on. What
  `private-commits` adds is the _active refusal_ if you try anyway.
