+++
title = 'Advent of Code 2025: A Rust-Flavored Journey'
date = 2025-12-19T09:28:22+11:00
draft = true
tags = ['rust', 'algorithms', 'learning']
categories = ['Software Engineering', 'Career and Reflection']
+++

Last year I finally took the plunge and completed
[Advent of Code 2024](/posts/advent-of-code-2024/) in Go. It was challenging,
rewarding, and left me wanting more. So when December rolled around again, there
was no question: I was coming back for round two. This time, though, I wanted to
push myself in a different direction: Rust.

This year's event was shorter—12 days instead of the traditional 25, but the
puzzles were just as brain-bending as ever.

## Why Rust?

I've been building a CHIP-8 emulator in Rust this year, and it's been the
project that finally made the language click for me. AoC felt like a good way to
keep that momentum going as it is smaller, self-contained puzzles where I could
practice without the overhead of a larger codebase.

The more I use Rust, the more I like it. The standard library is surprisingly
capable for algorithmic work, so I added the additional challenge of using zero
external dependencies, just `std` and whatever I could build myself. That
constraint always helps me learn the true capabilities of a language and its
ecosystem.

## Favorite Puzzle: Day 10 — The One Word That Changed Everything

If I had to pick one puzzle that perfectly captures what I love about Advent of
Code, it's Day 10. On the surface, it seemed straightforward: configure factory
machines by pressing buttons that affect indicator lights.

**Part 1** was a satisfying exercise in linear algebra. Each button toggles
specific lights on or off, and you need to find the minimum button presses to
reach a target pattern. Binary states, XOR operations, Gaussian elimination over
GF(2). I implemented a full matrix solver, found the null space for infinite
solutions, and computed the minimum Hamming weight. It felt elegant.

Then came **Part 2**, and everything changed with a single word: buttons now
_increment_ counters instead of _toggling_ lights.

That tiny semantic shift transforms the entire problem. Suddenly you're no
longer in the world of binary states and modular arithmetic—you're dealing with
continuous integers and optimisation. The same button-pressing puzzle becomes an
Integer Linear Programming problem.

I ended up implementing the Simplex method for finding optimal solutions to the
relaxed problem, then wrapping it in Branch and Bound to enforce integer
constraints. It was challenging, it was satisfying, and it taught me something
I'll actually use again. I wrote up the full journey in my
[Integer Linear Programming TIL](https://clews.id.au/til/integer-linear-programming/).

## Runner-Up: Day 8 — Minimum Spanning Trees in 3D

Day 8 asked me to connect junction boxes in 3D space using the minimum total
wire length. Classic minimum spanning tree territory, but I'd never actually
implemented one from scratch.

Enter Kruskal's Algorithm. The core idea is beautifully greedy: sort all
possible edges by weight, then keep adding the shortest edge that doesn't create
a cycle. Pair it with Union-Find for efficient cycle detection, and you've got
an O(E log E) algorithm that provably produces optimal results.

There's something deeply satisfying about greedy algorithms that actually
work—where you can prove that making locally optimal choices leads to globally
optimal solutions. More details in my
[Kruskal TIL](https://clews.id.au/til/kruskal/).

## Things I Learned

Beyond the headline puzzles, a few smaller lessons stuck with me:

- **[Monotonic Stacks](https://clews.id.au/til/monotonic-stacks/):** An elegant
  O(N) pattern for problems requiring ordered element selection. The stack
  maintains sorted order by popping elements that violate the invariant—simple
  idea, powerful applications.

- **[Rust's rem_euclid()](https://clews.id.au/til/rusts-rem-euclid-the-modulo-you-actually-want/):**
  If you're doing modular arithmetic with potentially negative numbers, Rust's
  `%` operator will betray you. `rem_euclid()` gives you the mathematically
  correct modulo that always returns non-negative results.

## Growing to Like Rust

Twelve days of Rust taught me more than months of tutorials. A few things
clicked:

**Iterator chains feel like home.** I've dabbled with functional programming
over the years, so seeing `.lines().filter_map(...).flat_map(...)` in Rust felt
familiar and welcome. Parsing input reads like a description of what you want,
not how to do it. It's one of those features that makes Rust feel modern without
sacrificing performance.

**Type aliases are underrated.** A simple `type Coord = (i32, i32)` makes
function signatures dramatically more readable. It's a small thing, but it
compounds across a codebase.

**Inline test modules are surprisingly nice.** The `#[cfg(test)] mod tests`
pattern keeps tests right next to the code they're testing. For small,
self-contained puzzles it's perfect—everything in one file, easy to reason
about. I'm still figuring out how this scales; I can see it getting unwieldy
with hundreds of tests. But for AoC? It just works.

I'm still learning, but that's part of why this is fun.

## Final Thoughts

I completed all challenges 🎊

<video autoplay loop muted playsinline style="width: 100%; max-width: 100%; height: auto; display: block; margin: 0 auto;">
  <source src="advent_2025.mp4" type="video/mp4">
</video>

If you've been on the fence about trying Advent of Code, just do it. Pick a
language you want to learn, accept that some days will humble you, and enjoy the
ride. The real reward isn't the stars — it's the "aha" (or in my case, the "oh,
ffs") moments at 11pm (or you know, 1am), and the satisfaction of seeing your
solution finally produce the right answer.

See you in December 2026.
