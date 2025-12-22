+++
title = "Why CHIP-8? (Or: How I Stopped Building Todo Apps)"
date = 2025-11-20T10:00:00+11:00
draft = true
tags = ["rust", "systems-programming", "llm", "learning"]
categories = ["Software Engineering"]
series = ["CHIP-8 Emulator in Rust"]
series_order = 1
description = "I wanted to learn Rust. I didn't want to build another fucking todo app. So I built a CHIP-8 emulator with Claude as my pair programmer."
+++

> **Part 1 of 3** | [Part 2: Architecture](/posts/chip-8-architecture/) | [Part 3: Learning with AI](/posts/chip-8-lessons-learned/)

## The Setup

Every few months my company runs Engineering Development Days—a few days to learn something without Jira tickets breathing down your neck. I'd been "meaning to learn Rust" for about eight months at this point. The Rust Book was bookmarked. Tutorial repos were starred. `rustc` was installed. But I'd never written anything beyond hello world.

I didn't want to build another fucking todo app.

I've built enough todo apps to last several lifetimes. Follow the tutorial, type the code, feel briefly productive, forget everything two weeks later. Tutorial knowledge doesn't stick because you never actually struggle with anything real.

So I decided to skip the tutorial entirely.

## Brain Atrophy

Some context on why I was craving something lower-level.

My undergraduate degree is in Electronics and Communications Engineering. I used to care about microprocessors, limited resources, how things actually worked at the hardware level. Then my career happened.

The arc went something like this: Delphi with some C/C++ → Java → JavaScript → Python. Somewhere in there, middle management snuck in. Years of web dev and meetings and Jira tickets. My brain atrophied. The parts that used to think about memory layout and register operations got replaced with parts that think about sprint velocity and stakeholder alignment.

Recently I'd been working on a Go codebase, and it started flexing that grey matter again. Static typing. Explicit error handling. Actually thinking about what the code was doing instead of just hoping the runtime would figure it out.

I wanted more of that. I wanted to get back to lower-level coding. Microprocessor shenanigans. Limited resources. Actual fucking engineering.

## Why CHIP-8

CHIP-8 is a tiny interpreted language from the 1970s. It was designed to run on microcomputers with limited resources:

- 4KB of RAM
- 16 8-bit registers
- 36 instructions
- 64×32 monochrome display
- A buzzer

It's the "hello world" of emulator projects. Complex enough to be interesting, simple enough to finish. When you get something wrong, games break in obvious ways—the ball in Pong flies through the paddle, sprites flicker, the buzzer plays forever.

More importantly: CHIP-8 has a well-defined, complete specification. Literally hundreds of implementations exist across every language you can name. This matters because it meant I could probably "vibe-code" this project with an LLM.

The specification is detailed enough that I could throw documents at Claude and ask questions. It's common enough that training data should cover the patterns. If I got stuck, help would be available.

That was the theory, anyway.

## The Mentor Problem

Here's the thing about learning Rust: I don't know any Rustaceans.

I don't know anyone using Rust in anger. There's no one whose brain I can pick, no one to glance at my code and say "that's not idiomatic" or "you're fighting the borrow checker because you're doing X wrong."

I could pay someone to review my code. If I were seriously considering a role that required Rust, maybe I would. But it's fucking expensive.

I could ask the internet. Post on Reddit, Discord, whatever. But here's the thing—I've seen the absolute bullshit dribbled out in areas where I *do* have knowledge. The confident wrongness. The outdated advice stated as current fact. The tribal fights about irrelevant details. I'm deeply skeptical of advice from internet strangers.

So I turned to Claude.

## AI as Mentor

I trust LLM advice about as much as I trust internet stranger advice. Which is to say: I fact-check everything. The difference is that LLMs aren't trying to fuck with me. They're not scoring points, not showing off, not grinding an axe about some library drama from 2019.

I loaded CHIP-8 specification documents into Claude and used it to fill knowledge gaps. It had been a long time since I'd thought about low-level microprocessor details. The LLM helped me down a bunch of interesting rabbit holes.

I used Claude to effectively pair-program. The CHIP-8 specification is detailed enough that I could get it to do the bit I fucking drag my feet on all the time: writing unit tests. I hate writing tests. I know they help me. I know I should write them first. But I always find some excuse to "write them later." With Claude, I could describe what I wanted tested and get something to start from. When I found edge cases, I got Claude to update the tests.

I also used Claude as a code reviewer. Without access to a human Rustacean, I asked it to review from the perspective of a senior Rust developer. "Is this idiomatic? Am I fighting the language? What would a Rustacean do here?"

Did I verify the advice? As much as I could. But I'm a noob. At some point you have to trust that it compiles and the tests pass and the games run.

I am a n00b and it compiles. 🤷

## What I Built

The result is a complete CHIP-8 emulator in Rust:

- All 36 instructions
- Graphics (64×32 display, sprite drawing, collision detection)
- Audio (buzzer with configurable waveform)
- Input (hex keypad mapped to QWERTY)
- CLI and GUI frontends

Games run. Pong works. Space Invaders works. The buzzer buzzes.

Is it idiomatic Rust? Probably not entirely. Is there stuff I'd do differently with more experience? Definitely. But it works, I learned a lot, and I didn't build another fucking todo app.

---

In [Part 2](/posts/chip-8-architecture/), I'll walk through the actual architecture—how I structured the code, the trait-based hardware abstraction, concurrency patterns, and error handling.

In [Part 3](/posts/chip-8-lessons-learned/), I'll reflect on what I actually learned: what the compiler taught me, how I used AI throughout the project, and the trust question when your mentor is an LLM.

---

The code is on GitHub: [github.com/bclews/chip8](https://github.com/bclews/chip8)
