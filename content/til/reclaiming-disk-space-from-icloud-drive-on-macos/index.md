+++
title = 'Reclaiming Disk Space from iCloud Drive on macOS'
date = 2026-03-13T09:20:31+11:00
draft = false
description = ""
categories = ["Tutorials"]
tags = ["tools", "tutorial", "productivity"]
+++

Today I learned about `brctl evict`, a macOS command that forcefully removes
local copies of iCloud Drive files while keeping them safely in the cloud. It
saved me ~400 GB.

## The Problem

My MacBook was almost full, having used 934 GB of 995 GB used. I'd already told
iCloud Drive to optimise storage, but it wasn't making a dent. The Storage panel
in System Settings showed **695 GB** of "System Data", which seemed absurd.

After some digging with `du`, I tracked it down:

```bash
du -sh ~/Library/Mobile\ Documents/com~apple~CloudDocs/Photos/
# 374G
```

A single Photos folder in iCloud Drive was sitting fully downloaded on disk. I'd
unchecked "Keep Downloaded" in Finder, but macOS treats that as a _suggestion_.
It evicts files whenever _it_ feels like it, which could be hours, days, or
_whenever-the-fuck-it-feels_ like it.

## The Fix: `brctl evict`

`brctl` is a control utility for the macOS daemon that manages iCloud Drive
syncing. The `evict` subcommand tells it to remove the local copy of a file
immediately, replacing it with a cloud-only placeholder.

For a single file:

```bash
brctl evict ~/path/to/large-file.mov
```

For an entire directory tree:

```bash
brctl evict ~/Library/Mobile\ Documents/com~apple~CloudDocs/Photos
```

The files remain in iCloud and download on demand if you open them. You're just
telling macOS "I don't need these cached locally right now."

## Watching It Work

You can monitor free space in real time while eviction runs:

```bash
df -h /
```

I watched my available space climb from 60 GB to 400+ GB over a few minutes.

## Other Useful `brctl` Subcommands

- `brctl download <path>` — force-download a file from iCloud (opposite of
  evict)
- `brctl status` — show the current state of the Bird daemon
- `brctl log --wait` — stream live iCloud Drive sync activity (great for
  debugging)
- `brctl dump` — dump a detailed snapshot of iCloud Drive's internal state

## Finding What to Evict

If your Mac is low on space and System Data looks suspiciously large, check
iCloud Drive's local footprint:

```bash
du -sh ~/Library/Mobile\ Documents/com~apple~CloudDocs/*/ 2>/dev/null | sort -hr | head -10
```

`~/Library/Mobile Documents/com~apple~CloudDocs/` is where iCloud Drive actually
stores files on disk. The Storage panel often categorises this under "System
Data" rather than "iCloud Drive", which makes it easy to miss.

## The Takeaway

macOS's "Optimise Storage" toggle is a polite request. `brctl evict` is the
imperative version: "free this space _now_." If iCloud Drive is eating your disk
and the Finder toggle isn't helping, `brctl evict` is the tool you want.
