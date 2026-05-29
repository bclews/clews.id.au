+++
title = "Recovering a Single File from Jujutsu's Operation Log"
date = 2026-05-19T11:15:00+10:00
draft = true
description = "jj --at-op file show reads a file as it existed at any past operation and prints it to stdout, without touching current state: surgical recovery that op restore can't do."
categories = ['Software Engineering']
tags = ['jujutsu', 'git', 'tools']
+++

Today I learned how to recover a single file from `jj`'s operation log without
rewinding the whole repo. I thought I'd lost a 76-line markdown file of review
notes: it wasn't in my working copy, and no commit in `jj log` had it. A `jj op
restore` of the operation before the loss would have brought it back, but it
would also have rolled the _entire_ repo to that point, unwinding everything
I'd done since.

There's a better lever:

```text
jj --at-op=<op-id> file show <path>
```

This reads a file as it existed at a specific operation and prints it to
stdout, without changing anything in the current state. Pipe it to disk and you
have the file back, everything else intact:

```text
jj op log                                                    # find the op before the loss
jj --at-op=e4d291fce44a file show feature-x-review.md > feature-x-review.md
```

The mechanism is unsurprising once you see it: `jj` snapshots your working copy
on _every_ command, so file contents live in many prior operations even when no
current commit references them. `jj op log` is the index; `--at-op` is the read
primitive that doesn't move anything.

## Two levers, different blast radius

| Want | Use |
| --- | --- |
| Rewind the whole repo to a point | `jj op restore <op-id>` |
| Read a single file as it was then | `jj --at-op=<op-id> file show <path>` |

`jj op restore` is right when _everything_ you want is at that point.
`--at-op file show` is right when you only want one piece of it.

## Gotchas / Notes

- The operation log is a queryable archive of every snapshot, which is what
  makes targeted reads like this possible.
- Worth knowing about _before_ you need it. It's far harder to think of when
  you're already panicking about a lost file.
