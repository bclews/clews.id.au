+++
title = "I Built a CHIP-8 Emulator to Learn Rust"
date = 2025-11-20T10:00:00+11:00
draft = false
tags = ["rust", "systems-programming", "llm", "learning"]
categories = ["Software Engineering"]
series = ["CHIP-8 Emulator in Rust"]
series_order = 1
description = "I wanted to learn Rust. I didn't want to build another todo app. So I built a CHIP-8 emulator with Claude as my pair programmer."
+++

> **Part 1 of 2** | Part 1 |
> [Part 2: What Rust Taught Me](/posts/chip-8-lessons-learned/)

Every few months my organisation runs _Engineering Development Days_. A few days
to learn something new without the distraction of work. Also,
[job cuts](https://csirostaff.org.au/news/media/2025/08/08/recent-media-on-csiro-job-cuts/),
fun times.

I struggled to think of what to focus on. My role going forward is Python-heavy,
cloud-native. Any knowledge gaps I'd fill through actual work. I was bored,
feeling uninspired. I needed something compelling.

I'd seen people pairing Python with Rust, similar to Python+C in the past, and I
could see opportunities in my own projects. The problem is that I didn't know
Rust.

I'd been _meaning to learn Rust_ for about eight months at this point. The Rust
Book was bookmarked. Tutorial repos were starred. `rustc` was installed. But I'd
never written anything beyond hello world. I didn't want to build another
fucking todo app.

## Brain Atrophy

I used to geek-out over microprocessors, limited resources, how things actually
worked at the hardware level. For fun! Then my career happened.

Somewhere in there, middle management snuck in. Years of meetings and Jira
tickets. _Fucking_ Jira. My brain atrophied. The parts that used to think about
memory layout and register operations got replaced with parts that think about
sprint velocity and stakeholder alignment.

Revenge bedtime procrastination led me to
[r/EmuDev](https://www.reddit.com/r/EmuDev/), and I fell down a rabbit hole.
People writing emulators for fun. Old consoles, weird hardware, real
constraints. Something clicked.

## Why CHIP-8

CHIP-8 is a tiny interpreted language from the 1970s. It was designed to run on
microcomputers with limited resources:

- 4KB of RAM
- 16 8-bit registers
- 36 instructions
- 64×32 monochrome display
- A buzzer

It's the _"hello world"_ of emulator projects. Complex enough to be interesting,
simple enough to finish. When you get something wrong, games break in obvious
ways—the ball in Pong flies through the paddle, sprites flicker, the buzzer
plays forever.

More importantly: CHIP-8 has a well-defined, complete specification. Hundreds of
implementations exist across every language you can name. That meant LLMs had
almost certainly seen plenty of CHIP-8 code in training. I could lean on Claude
to fill gaps in my knowledge. That was the theory, anyway.

## The Mentor Problem

I don't know any Rustaceans. No one to glance at my code and say "that's not
idiomatic" or "you're fighting the borrow checker because you're doing X wrong."

I could pay someone for code review, but it is _really_ expensive. I could ask
the internet (Reddit, Discord, whatever), but I've seen how wrong the internet
is about things I do know. The confident wrongness. The outdated advice stated
as fact. The tribal fights over irrelevant details.

So I turned to Claude.

## AI as Mentor

I trust LLM advice about as much as I trust internet stranger advice. Which is
to say: I fact-check everything. The difference is that LLMs aren't trying to
fuck with me. They're not scoring points, not showing off, not grinding an axe
about some library drama from 2019. They're also not trying to be right—they're
trying to be helpful, which is a different failure mode but a more predictable
one.

Here's how I actually used it:

### Knowledge Gaps

I loaded CHIP-8 specification documents into Claude and used it to fill
knowledge gaps. It had been a long time since I'd thought about low-level
microprocessor details—opcodes, registers, memory layouts. The LLM helped me
explore interesting tangents without having to context-switch to Stack Overflow.

### Planning and Architecture

Before writing code, I'd describe what I wanted to build and get feedback on the
approach. "I'm thinking about structuring the hardware abstraction like
this—does that make sense for Rust?"

This isn't that different from rubber-duck debugging, except the duck talks
back. Sometimes usefully, sometimes not.

### Writing Tests

Tests. I drag my feet on these constantly. I know tests help me. I often write
_enough_ to get going, but I always find some excuse to write more comprehensive
tests later.

With Claude, I could describe what I wanted tested and get something to start
from. When I found edge cases, I got it to update the tests. I still reviewed
everything, but the activation energy dropped significantly.

### Code Review

Without access to a human Rustacean, I asked Claude to review from the
perspective of a senior Rust developer. "Is this idiomatic? Am I fighting the
language? What would you do here?"

Did I verify the advice? As much as I could. But I'm a Rust noob. At some point
you have to trust that it compiles and the tests pass and the games run.

### The Trust Question

No Rustaceans in my network means no one to ask "is this idiomatic?" So I asked
Claude. And I asked it to explain its reasoning. And I cross-referenced with the
Rust Book and official docs when something seemed off.

Is my code idiomatic Rust? Probably not entirely. Is there stuff I'd do
differently with more experience? Definitely.

But it works. It compiles. The games run.

## What I Built

The result is a complete CHIP-8 emulator in Rust:

- All 36 instructions
- Graphics (64×32 display, sprite drawing, collision detection)
- Audio (buzzer with configurable waveform)
- Input (hex keypad mapped to QWERTY)
- CLI and GUI frontends

Games run. Pong works. Space Invaders works. The buzzer buzzes.

<video autoplay loop muted playsinline style="width: 100%; max-width: 100%; height: auto; display: block; margin: 0 auto;">
  <source src="space-invaders.mp4" type="video/mp4">
</video>

<video autoplay loop muted playsinline style="width: 100%; max-width: 100%; height: auto; display: block; margin: 0 auto;">
  <source src="breakout.mp4" type="video/mp4">
</video>

---

In [Part 2](/posts/chip-8-lessons-learned/), I'll dig into what Rust actually
taught me: how the compiler became my mentor, the architecture that emerged, and
the patterns that finally clicked.

---

The code is on GitHub:
[github.com/bclews/CHIP-8](https://github.com/bclews/CHIP-8)
