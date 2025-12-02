+++
title = "Rust's rem_euclid() - The Modulo You Actually Want"
date = 2025-12-02T10:00:00+11:00
draft = false
description = "Why Rust's % operator behaves differently than Python's modulo, and when to use rem_euclid() instead"
categories = ['Programming']
tags = ['rust', 'python', 'go', 'algorithms']
+++

Coming from Python and Go, I hit a surprising gotcha with Rust's `%` operator today.

## The Problem

I was implementing a circular dial (positions 0-99) that wraps around. In Python, this just works:

```python
position = 5
position = (position - 10) % 100  # = 95 ✓
```

But in Rust, the same logic fails:

```rust
let mut position = 5;
position = (position - 10) % 100;  // = -5 ❌
```

## Why?

**Python's `%`** always returns a non-negative result (matching the sign of the divisor).

**Go's `%` and Rust's `%`** return the remainder with the sign of the dividend:
- `5 % 3 = 2`
- `-5 % 3 = -2` (negative!)

This breaks circular wrapping because `-5` is not a valid position on a 0-99 dial.

## The Solution: rem_euclid()

Rust provides `rem_euclid()` for proper modular arithmetic:

```rust
let mut position = 5;
position = (position - 10).rem_euclid(100);  // = 95 ✓
```

This implements Euclidean division, which always returns a non-negative remainder in the range `[0, divisor)`.

## When to Use It

Use `rem_euclid()` whenever you need true modular arithmetic:
- **Circular buffers/arrays** - wrapping indices
- **Game coordinates** - wrap-around maps
- **Time calculations** - hour/day/week cycles
- **Hash table indexing** - ensuring positive indices

Use `%` when you actually want the remainder (e.g., checking divisibility).

## Quick Reference

```rust
// Regular remainder (can be negative)
-5 % 3 = -2

// Euclidean remainder (always [0, divisor))
(-5_i32).rem_euclid(3) = 1

// In practice:
position = (position - distance).rem_euclid(100);  // Circular dial
index = (index + offset).rem_euclid(len);          // Array wrapping
```

## Rule of Thumb

If you're thinking "modulo" for wrapping behavior, you want `rem_euclid()`, not `%`.

---

This bit me while solving [Advent of Code 2025 Day 1](https://adventofcode.com/2025/day/1), where I needed to track a dial rotating through positions 0-99.
