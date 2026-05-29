+++
title = "Jujutsu's rebase Has Three Different \"Move\" Verbs"
date = 2026-05-11T11:00:00+10:00
draft = false
description = "jj rebase makes you say which chain to move: -r is a single commit, -s is the subtree, -b is the whole branch. The Git default maps to -s, not -r."
categories = ['Software Engineering']
tags = ['jujutsu', 'git', 'tools']
+++

Today I got bitten by `jj rebase`. I ran `jj rebase -r uqxnyrku -o main`
expecting the descendants to come along, the way `git rebase` moves a chain.
They didn't. The descendant got reparented onto `uqxnyrku`'s _old_ parent,
disconnecting it from the commit I'd just moved.

The Git muscle-memory model, "rebase moves the chain", doesn't translate
directly. `jj` makes you say _which_ chain:

| Flag | Moves |
| --- | --- |
| `-r REV` | Just that single commit. Descendants get reparented to its old parent. |
| `-s REV` | That commit _and all descendants_. The whole subtree comes along. |
| `-b REV` | The entire branch containing REV (everything between trunk and REV). |

`-r` snipping a commit out and leaving its descendants behind is occasionally
what you want (extracting one commit from a stack to relocate it) but it's
almost never what Git muscle memory expects. **`-s` is the verb that matches
Git's default rebase**: "move this and everything on top of it."

## Recovering from the wrong one

Because change IDs are stable across moves, the orphaned descendant was cheap to
reattach with a second rebase:

```text
jj rebase -r xkqrkqmt -o uqxnyrku    # reattach the orphan
```

## Gotchas / Notes

- When migrating from Git, default to `jj rebase -s REV -o <dest>` unless you
  specifically want to extract a single commit from its descendants.
- `-r` is the precision tool; `-s` is the everyday one. The accident above came
  from reaching for `-r` because it's first in the help output.
