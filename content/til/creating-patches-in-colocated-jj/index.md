+++
title = 'Creating Patches in a Colocated Jujutsu Repo'
date = 2026-05-27T11:30:00+10:00
draft = true
description = "jj diff --git covers single combined patches; git format-patch covers mbox-per-commit. In colocated mode you reach for whichever fits, plus a sed pass to anonymise before sharing."
categories = ['Software Engineering']
tags = ['jujutsu', 'git', 'tools']
+++

Today I needed to share a couple of commits as a patch with someone outside the
repo, and learned that `jj` covers half the job. The other half is `git`, right
there in the colocated repo.

Say the graph looks like this and I want `wmktltov` and `lzxnnyks` combined into
one patch:

```text
@  nomryxuq dev@example.com 2026-05-11 13:21:21 a63b6073
│  (no description set)
○  lzxnnyks dev@example.com 2026-05-08 11:16:43 feature/api-backend bbea56a3
│  Complete API backend (TICKET-123 part 2)
○  wmktltov dev@example.com 2026-05-08 10:47:51 f7db1946
│  Begin API backend (TICKET-123 part 2)
```

## A single combined patch: jj diff --git

```text
jj diff --from "w-" --to "l" --git > backend.patch
```

`w-` is "the parent of `w`": start _before_ `w`'s changes and end at `l`'s
content, producing one diff covering both commits' work. The `--git` flag is
what makes the output applicable: jj's default diff format is its own
human-readable "color-words" style, which `git apply` and `patch` can't consume.
`--git` switches it to standard git unified diff:

```text
jj diff --from "w-" --to "l" --git > backend.patch
git apply backend.patch   # or: patch -p1 < backend.patch
```

## One file per commit: drop into git

The `git format-patch` workflow produces mbox files with full `From:` /
`Subject:` / `Date:` headers, which is what most upstream maintainers expect. It
has no `jj` equivalent, so use the colocated Git repo directly:

```text
git format-patch f7db1946^..bbea56a3
# produces 0001-Begin-....patch, 0002-Complete-....patch
```

Applying patches works the same way: there's no `jj apply`, so `git apply` in
the colocated repo, and `jj` snapshots the resulting changes into `@` on the
next command.

## Anonymising before sharing

`jj diff --git` emits only the diff body, with no author lines or commit
messages, so anonymising means scrubbing content _inside_ the diff (paths,
hostnames, project names, ticket IDs). `git format-patch` adds mailbox headers,
so add those to the list. A quick `sed` pass catches the obvious stuff:

```text
jj diff --from "w-" --to "l" --git \
  | sed -E '
      s/[A-Za-z.+-]+@example\.com/dev@example.com/g
      s/TICKET-[0-9]+/TICKET-123/g
      s/internal_service/api_backend/g
      s/internal-host/example-host/g
    ' > backend-anon.patch
```

## Gotchas / Notes

- Tune the `sed` rules to what's actually in _your_ diff, and **eyeball the
  result** before sending. `sed` won't catch names embedded in unique strings or
  identifiers you didn't anticipate.
- This is colocated mode working as designed: `jj` handles the single combined
  diff, and `git` handles the mbox-per-commit case it's still better at. Reach
  for whichever fits the job.
