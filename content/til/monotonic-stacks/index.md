+++
title = 'Monotonic Stacks'
date = 2025-12-04T10:10:20+11:00
draft = false
description = ""
categories = ['Software Engineering']
tags = ['rust', 'algorithms', 'learning']
+++

This is more of a "Today I Remembered"...

While solving [Advent of Code Day 3](https://adventofcode.com/2025/day/3), I was
reacquainted with an elegant pattern: **monotonic stacks**.

## The Problem

Given 15 digits, select exactly 12 (maintaining order) to form the largest
possible 12-digit number.

Example: `"234234234234278"` → `"434234234278"`

## What's a Monotonic Stack?

A monotonic stack maintains elements in sorted order. When adding a new element:

1. Pop elements that violate the ordering
2. Push the new element

**Why is this useful?** It lets you make greedy decisions while keeping the
ability to "revise" earlier choices. In this context a _greedy decision_ means
making the locally optimal choice at each step without looking ahead to future
possibilities. It can be thought of as _"When I see a larger digit, I should use
it instead of smaller digits I've already selected—as long as I can still reach
k total digits."_

## The Algorithm

```rust
fn find_max_k_digits(digits: &str, k: usize) -> String {
    let chars: Vec<char> = digits.chars().collect();
    let n = chars.len();
    let mut stack = Vec::new();
    let mut skips_remaining = n - k;

    for (i, &digit) in chars.iter().enumerate() {
        let remaining = n - i - 1;

        // Pop smaller digits if we can afford to skip them
        while !stack.is_empty()
            && stack.last().unwrap() < &digit
            && skips_remaining > 0
            && stack.len() + remaining >= k {
            stack.pop();
            skips_remaining -= 1;
        }
        stack.push(digit);
    }

    stack.truncate(k);
    stack.iter().collect()
}
```

... clear as mud?

## Walkthrough: `"234234234234278"` → `"434234234278"`

```
Process '2': stack = ['2'], skips = 3
Process '3': '2' < '3', pop it, push '3' → ['3'], skips = 2
Process '4': '3' < '4', pop it, push '4' → ['4'], skips = 1
Process '2': '4' > '2', just push → ['4','2'], skips = 1
Process '3': '2' < '3', pop it, push '3' → ['4','3'], skips = 0
Process remaining: no skips left, append all → ['4','3','4','2','3','4','2','3','4','2','7','8']

Result: "434234234278" ✓
```

By skipping the first '2' and '3', we allow '4' to become the first digit. Since
"4..." > "2..." regardless of what follows, this greedy choice is optimal.

## The Critical Constraint

The check `stack.len() + remaining >= k` is critical. Without it, we might skip
too many early digits and run out before reaching k digits.

This ensures we always have enough digits left to meet our target.

## Why Greedy Works

Digits in earlier positions have exponentially higher value (position 0 = ×10¹¹,
position 11 = ×10⁰). It's always worth swapping a smaller digit at position i
for a larger digit at position j > i.

## Time Complexity: O(N)

Each digit is:

- Pushed exactly once: O(N)
- Popped at most once: O(N)
- Total: O(2N) = O(N)

This is optimal! Compare to:

- Dynamic Programming: O(N × K)
- Brute Force: O(C(N,K) × K)

For N=15, K=12: We do 15 operations vs 180 (DP) or 5,460 (brute force).

---

## Resources

- [My Day 3 Solution](https://github.com/bclews/advent-of-code/blob/main/2025/day-03/src/main.rs) -
  Full code with tests
- [LeetCode 402: Remove K Digits](https://leetcode.com/problems/remove-k-digits/) -
  The canonical version of this problem
- [Monotonic Stack Explained](https://liuzhenglaichn.gitbook.io/algorithm/monotonic-stack) -
  Great visual explanations
