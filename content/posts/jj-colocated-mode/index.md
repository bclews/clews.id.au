+++
title = 'Jujutsu in colocated mode: where Git shows through'
date = 2026-05-27T09:00:00+10:00
draft = true
description = "Living in jj's colocated mode for real work: the seams where Git and jj describe the same repository differently, why each looks alarming the first time, and why none of them is a problem."
categories = ['Software Engineering']
tags = ['jujutsu', 'git', 'tools']
+++

[In the last post]({{< ref "posts/jj-less-friction-same-git" >}}) I made the
case that you can adopt `jj` without telling anyone, because it runs on top of
your existing Git repo in _colocated mode:_ `.git` and `.jj` side by side, push
and fetch still going through Git. Turns out, colocated mode has _seams_.

A seam is a moment where Git and `jj` look at the same repository and describe
it differently. Git says the working tree is dirty; `jj` says everything's
committed. A routine fetch reports that it "abandoned" a commit. `git am`
refuses to run. Each looks alarming the first time, and each turns out to be
harmless once you understand what Git and `jj` are each describing.

After a few weeks of working with `jj`, I've stopped being startled by them.
This post documents the seams I hit, why they appear, and the one move that
resolves each. 

**tl;dr;** in colocated mode, trust `jj`'s view of the repo.
When Git looks panicked, it's almost always describing a state `jj` considers
perfectly healthy.

## First move after colocate: track your remotes

The first time I ran `jj git init --colocate` on an existing work repo, the
output was a wall of hints:

```text
❯ jj git init --colocate
Done importing changes from the underlying Git repo.
Setting the revset alias `trunk()` to `main@origin`
Hint: The following remote bookmarks aren't associated with the existing local bookmarks:
  develop@origin
  main@origin
  feature-x@origin
Hint: Run the following command to keep local bookmarks updated on future pulls:
  jj bookmark track develop --remote=origin
  jj bookmark track main --remote=origin
  jj bookmark track feature-x --remote=origin
Initialized repo in "."
Hint: Running `git clean -xdf` will remove `.jj/`!
```

Two things to note here. First,
`Setting the revset alias trunk() to main@origin`: `jj` looked at the remote,
picked the default branch, and pointed the built-in `trunk()` revset at it.
`trunk()` is referenced by a lot of default templates and aliases (the default
`jj log` revset, the "show me my work that isn't upstream yet" queries), so it's
worth knowing what it resolves to. If `jj` can't infer it, set it yourself in
`~/.config/jj/config.toml`:

```toml
[revset-aliases]
"trunk()" = "develop@origin"
```

Second, and more important on day one: in `jj`, `main` and `main@origin` are two
separate bookmarks that happen to share a name. The first is local; the second
is where `main` sat on the remote as of the last fetch. They can drift. This
mirrors Git's `main` versus `origin/main`, but `jj` puts the distinction right
in front of you. A local bookmark _tracks_ a remote one when you want fetches to
carry the local bookmark forward. A fresh colocate imports the remote bookmarks
but doesn't auto-track them; that's what the hints are nagging you to do.

Rather than type out each name, track them all in one go:

```text
$ jj bookmark track 'glob:*' --remote=origin
Started tracking 4 remote bookmarks.
```

On a small repo, track everything. On a monorepo with hundreds of stale feature
branches on `origin`, be selective, or `jj log` gets noisy. Either way, the init
hints are essentially a setup checklist: read them rather than scrolling past.

## "Abandoned N commits" on a routine fetch

A few days in, a plain fetch told me it had abandoned a commit:

```text
❯ jj git fetch
bookmark: dependabot/github_actions/actions-bd3b3a0e0a@origin [deleted] untracked
Abandoned 1 commits that are no longer reachable:
  kspkspwr ad24e4bf dependabot/github_actions/actions-bd3b3a0e0a@git | Bump the actions group with 4 updates
```

_"Abandoned"_ is a strong word, and my first reaction was _did I just lose
something_. I hadn't. What happened: the dependabot PR merged into `main`, and
GitHub auto-deleted the source branch on `origin`. The fetch picked up that
deletion, the remote bookmark was marked `[deleted]`, and the commit at the tip
of that branch became unreachable from any bookmark or working copy, so `jj`
dropped it from the graph.

The `@git` suffix on the second line is the detail worth understanding. In a
colocated repo, `jj` exposes the underlying Git repo's own refs as if they were
a remote called `git`. When `origin` deleted the branch, the matching `@git` ref
went away too, and the commit fell off.

Crucially, _abandoned is recoverable_. It isn't a hard delete; the commit's
still in the object store and the operation log. `jj undo` reverses the fetch's
effect on the graph, and `jj op log` lets you find any earlier state. In this
case the dependabot changes were already on `main` under merge-commit IDs, so
the abandon was exactly right: it's the housekeeping I'd otherwise do by hand
with `git remote prune origin`. Seeing `Abandoned N commits` after a fetch is
normal whenever upstream branches get deleted. Worth a glance to confirm it's
expected, but not the alarm the wording suggests.

## Git's HEAD sits one commit behind jj's `@`

This is the seam that unlocks most of the others, so it's worth slowing down on.

After pushing a bookmark, my shell prompt still showed `[!]` (dirty working
tree), and `git status` listed every file in `@` as added or modified:

```text
❯ git st
## HEAD (no branch)
 A proj/apps/proj/schedulers/api_backend.py
 ...
 M proj/proj/settings/common.py
```

…while `jj` was perfectly content:

```text
❯ jj st
Working copy  (@) : nkowpylv e81bbc8c ticket-123/api-backend | Add API backend
Parent commit (@-): kptprsrn b9d9232e docs: Enable ...
```

First reaction: "did the push leave the repo half-broken?" No. This is just how
colocated mode works.

**Git's HEAD is intentionally kept one commit behind `jj`'s `@`.** In colocated
mode, `jj` parks Git's HEAD at `@-` (the parent of the working-copy commit) and
exposes `@`'s changes as Git's _working tree_ state. From Git's vantage point,
those changes are uncommitted, which is exactly what `git status` is
reporting.

`jj` does this deliberately. The "working copy is a commit" model treats `@` as
something you're still authoring, even after you've described it. If Git's HEAD
pointed _at_ `@`, ordinary Git commands like `git commit --amend` and
`git reset` would collide with `jj`'s snapshot-on-next-command behaviour. By
keeping HEAD at `@-` and surfacing `@`'s contents as the working tree, the two
tools stay coherent: `jj` says "this is a commit," Git says "this is uncommitted
work on top of HEAD." Both are describing the same state.

The prompt's `[!]` is Starship (or similar) reading Git's view and flagging a
dirty tree, accurate from Git's side but harmless in practice. It clears the
moment you `jj new` off `@`: that promotes the old `@` to a finalised commit in
Git's eyes, HEAD advances, and the new empty `@` is clean in both worlds. (The
`(no branch)` in `git st` is the same story from another angle: Git is on a
detached HEAD and has no idea what a `jj` bookmark is, even though the
underlying ref exists on disk and the push moved it.)

Once you know about the one-commit offset, reach for `jj st` when you want
to know what state the repo is _actually_ in. `git status` looking dirty after a
`jj` operation is expected and needs no fixing.

## "Dirty index" when Git tries to apply patches

That offset has a direct consequence. Trying to apply patches with `git am`:

```text
❯ git am 0001-...patch 0002-...patch 0003-...patch
fatal: Dirty index: cannot apply patches (dirty: 0001-...patch 0002-...patch 0003-...patch)
```

The error is confusing because the parenthetical lists the patch filenames,
making it look like the patches are "dirty." They aren't. Git is saying its view
of the working tree differs from HEAD, and as we established above, in
colocated mode it does whenever `@` has uncommitted-looking content, which is
most of the time you're working. `git am` notices and refuses to apply patches
over what it sees as uncommitted state.

The fix is to force HEAD and working tree back into agreement first. The safest
version is a fresh empty `@`:

```text
jj new                       # creates a fresh empty @; HEAD now matches working tree
git am 0001-*.patch 0002-*.patch 0003-*.patch
```

The empty `@` guarantees a clean slate: the patches land as new Git commits on
top, and `jj` picks them up with proper change IDs on the next command. (If you
have pending edits to keep, any `jj` command, even `jj st`, forces a snapshot
first, which is enough to satisfy `git am`.)

One thing to remember afterwards: your bookmark won't have moved. Git created
commits on top of HEAD, but `jj` bookmarks only move when you tell them to.
Nudge it forward if you want it on the new tip:

```text
jj bookmark move <name> --to @
```

The general rule: any time a Git subcommand complains about a "dirty" working
tree in a colocated repo, reach for `jj new` or `jj st` before digging into
what's actually dirty. The mismatch is structural; your changes are fine.

## Where jj hands the job back to Git

None of this makes colocated mode a leaky abstraction. The seams are the points
where `jj` _defers_ to Git rather than reimplementing parts of Git that already
work.

The clearest example is producing patches for someone outside the repo.
`jj diff --git --from X --to Y > file.patch` gives you a single combined diff
covering a range of commits, ideal when the recipient will `git apply` it.
But the `git format-patch` workflow (one mbox-format file per commit, with
`From:` / `Subject:` / `Date:` headers) has no `jj` equivalent, and it's what
most upstream maintainers expect when you mail a patch. So you drop into the
colocated repo and use Git directly:

```text
git format-patch f7db1946^..bbea56a3
# produces 0001-Begin-....patch, 0002-Complete-....patch
```

(I've written up the full patch-creation recipe, including anonymising a diff
before sharing it, as a [separate
note]({{< ref "til/creating-patches-in-colocated-jj" >}}).)

That's the mental model that makes colocated mode comfortable. The two tools
share one object store and split the labour: `jj` owns the working copy, the
operation log, and history editing; Git owns the wire protocol and the corners
`jj` hasn't covered yet. Using a colocated repo is the intended way to run `jj`
on an existing Git project. When Git's view and `jj`'s view diverge, you've hit
one of these boundaries, and the fix is nearly always to trust `jj` and run a
`jj` command.
