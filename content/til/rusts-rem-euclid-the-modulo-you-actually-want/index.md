+++
title = "Rust's rem_euclid() - The Modulo You Actually Want"
date = 2025-12-02T10:00:00+11:00
draft = false
description = "Why Rust's % operator behaves differently than Python's modulo, and when to use rem_euclid() instead"
categories = ["Programming"]
tags = ["rust", "python", "go", "algorithms"]
+++

Having spent a bit of time working with Python recently, I hit a surprising
gotcha with Rust's `%` operator today.

## The Problem

I was implementing a circular dial (positions 0–99) that wraps around. In
Python, this just works:

```python
position = 5
position = (position - 10) % 100 # = 95 ✅
```

But in Rust, the same logic fails:

```rust
let mut position = 5;
position = (position - 10) % 100; // = -5 ❌
```

Why?

Python's `%` operator follows mathematical modulo when the divisor is positive.
That means the result is always in the range [0, divisor)—ideal for wrap-around
arithmetic.

Rust and Go, however, implement truncating division remainder, where the result
takes the sign of the dividend:

- `5 % 3 = 2`
- `-5 % 3 = -2` ← negative remainder!

This breaks circular wrapping because -5 is not a valid position on a 0–99 dial.

## The Solution: `rem_euclid()`

Rust provides `rem_euclid()` for proper Euclidean modular arithmetic:

```rust
let mut position = 5;
position = (position - 10).rem_euclid(100); // = 95 ✅
```

`rem_euclid()` guarantees a result in [0, divisor), matching the behavior people
typically expect when they think “modulo.”

## When to Use It

Use `rem_euclid()` whenever you need true modular arithmetic, especially:

- Circular buffers / arrays — wrapping indices
- Game coordinates — toroidal maps
- Time calculations — hour/day/week cycles
- Hash table indexing — always-positive indices

Use `%` when you specifically want the remainder, such as checking divisibility
or keeping track of signed offsets.

## Quick Reference

**Regular remainder** (can be negative):

```rust
-5 % 3 == -2
```

**Euclidean remainder** (always in [0, divisor)):

```rust
(-5_i32).rem_euclid(3) == 1
```

**In practice**:

```rust
position = (position - distance).rem_euclid(100); // Circular dial
index = (index + offset).rem_euclid(len); // Array wrapping
```

## Rule of Thumb

If you’re thinking “modulo” for wrapping behavior, you want `rem_euclid()`, not
`%`.

---

This bit me while solving Advent of Code 2025 Day 1, where I needed to track a
dial rotating through positions 0–99.
