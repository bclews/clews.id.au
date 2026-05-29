+++
title = 'Jujutsu Has No git reset --hard: What to Use Instead'
date = 2026-05-03T10:00:00+10:00
draft = true
description = "Git's reset --hard maps to several different jj verbs depending on whether you want to discard edits, drop a commit, or undo an operation."
categories = ['Software Engineering']
tags = ['jujutsu', 'git', 'tools']
+++

Today I learned that there's no single `jj` equivalent of `git reset --hard`,
and that's by design. Muscle memory wants `git reset --hard`, `git checkout .`,
or `git stash drop`, and `jj` has none of them by name. It has several
different verbs, depending on which kind of "reset" you actually mean.

The mental shift: in Git, "discard changes" usually means moving files between
zones (working tree → HEAD). In `jj`, the working copy _is_ a commit, so
"discard changes" means either editing that commit's contents or removing the
commit entirely. Pick the verb that matches the intent.

| Intent | Command | Notes |
| --- | --- | --- |
| Discard uncommitted edits in the working copy | `jj restore` | `@` keeps its change ID; content reverts to parent. |
| Restore only some files | `jj restore <paths>` | Like `git restore <paths>`. |
| Throw away the working-copy commit entirely | `jj abandon` | New empty commit on same parent, new change ID. |
| Throw away specific commits | `jj abandon <change-id> …` or `jj abandon <revset>` | Descendants auto-rebase onto the surviving parent. |
| Undo the last command, whatever it was | `jj undo` | Operation-level. Reach for this when you just did something silly. |
| Reset a bookmark to match origin | `jj bookmark set main --to main@origin` | Add `--allow-backwards` if it would move the bookmark back. |

## restore vs abandon

This is the distinction that took me longest to internalise:

- **`jj restore`** keeps the change ID stable. Use it when the commit should
  survive (you've already mentioned its ID in a message, or it's the base for
  descendants) but its _contents_ should revert.
- **`jj abandon`** is for "this commit was a mistake, no trace needed." New
  change ID, descendants reparented onto the surviving parent.

There's no single "reset" verb because `jj` separates "edit this commit's
contents" from "remove this commit" from "undo the last operation." Once you've
named which one you want, the right command is usually obvious.

## Gotchas / Notes

- Flag names occasionally shift between `jj` releases; `--allow-backwards` in
  particular is the kind worth confirming with `--help` on your version.
- `jj undo` is operation-level, not commit-level: it reverses your last
  _command_, whatever it touched, which is often what you actually want when a
  Git reset would have been a panicked guess.
