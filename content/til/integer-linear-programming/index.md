+++
title = 'Integer Linear Programming'
date = 2025-12-12T14:07:40+11:00
draft = false
description = "How recognizing Integer Linear Programming transformed an impossible Advent of Code problem from hours of runtime to a 30-second solution"
categories = ["Software Engineering", "Career and Reflection"]
tags = ["rust", "algorithms", "learning"]
+++

Today's Advent of Code threw highlighted that **a small change in problem
constraints can transform a straightforward solution into an freakin' hard
optimisation problem.**

## The Problem: Factory Machine Configuration

You're faced with factory machines that need configuration. Each machine has
buttons that affect multiple counters, and you need to figure out the minimum
number of button presses required.

**Part 1**: Configure indicator lights (on/off states) by toggling them with
buttons.

**Part 2**: Configure joltage counters (integer values) by incrementing them
with buttons.

Seems similar, right? They're both "press buttons to reach target values." But
these two problems live in completely different algorithmic universes.

## Mathematical Notation Guide

This post uses mathematical notation that might be unfamiliar. Here's a quick
reference (this is mostly for future me...):

**Sets and Fields:**

- **GF(2)** - [Galois Field](<https://en.wikipedia.org/wiki/GF(2)>) of order 2;
  the field with elements {0, 1} where addition is XOR
- **ℤⁿ** - n-dimensional space of integers (e.g., ℤ³ = all 3-tuples of integers)
- **ℝⁿ** - n-dimensional space of real numbers (allows fractions)
- **∈** - "element of" or "belongs to" (e.g., x ∈ ℤ means "x is an integer")

**Operations:**

- **∏** - Product (multiply all terms); e.g., ∏ targets = target₁ × target₂ ×
  target₃ × ...
- **Ax = b** - Matrix equation; A is a matrix, x and b are vectors
- **≥, ≤** - Greater-than-or-equal, less-than-or-equal

**Subscripts:**

- **x₁, x₂, x₃** - Variables indexed by number (x-sub-1, x-sub-2, etc.)
- Used to distinguish multiple variables in a system

## Part 1: Linear Algebra over GF(2)

Part 1 is elegant because button presses _toggle_ lights. Press a button twice?
You're back where you started. This is XOR arithmetic—addition modulo 2—which
means we're working in **GF(2)**, the finite field with two elements.

The problem becomes: solve **Ax = b** over GF(2), where:

- **A[i][j]** = 1 if button j toggles light i
- **x[j]** = whether we press button j (0 or 1)
- **b[i]** = target state of light i

Since we want the _minimum_ number of presses, we need the solution vector with
minimum Hamming weight (fewest 1s).

```rust
fn solve_machine(machine: &Machine) -> Option<usize> {
    let mut matrix = build_augmented_matrix(machine);
    let pivots = matrix.reduce_to_rref();
    let solution = extract_solution_gf2(&matrix, &pivots);

    find_minimum_solution(&solution).map(|sol| hamming_weight(&sol))
}
```

Gaussian elimination over GF(2) is efficient—**O(n³)** where n is the number of
lights. When we get infinite solutions (free variables in the null space), we
can enumerate all 2^k combinations to find the minimum. With a guard against too
many free variables, this works beautifully.

The problem structure (XOR operations) gives us efficient tools.

## Part 2: The Deceptive Similarity

Part 2 changes one word: buttons now _increment_ counters instead of toggling
lights. The equation looks similar:

**Ax = t** where:

- **A[i][j]** = 1 if button j affects counter i
- **x[j]** = number of times we press button j
- **t[i]** = target joltage for counter i

But now x must be a vector of **non-negative integers**, not just bits. And that
changes everything.

## My Journey: Four Failed Approaches

### Attempt 1: Backtracking Search

_"Let's try every combination of button presses!"_

```rust
fn backtrack(counters: Vec<i64>, target: Vec<i64>, buttons_pressed: usize) {
    if counters == target { return buttons_pressed; }
    for each button {
        backtrack(counters + button_effect, ..., buttons_pressed + 1)
    }
}
```

**Complexity**: O(max_presses^num_buttons)

**Why it failed**: With targets like `{103, 34, 138, ...}`, a single button
might need 100+ presses. With 6 buttons, that's 100^6 = 10¹² combinations.

### Attempt 2: Graph Search (Dijkstra's)

_"This is just shortest path! Each state is a counter configuration."_

Represent the problem as a graph where:

- Each node = current counter values `{c₁, c₂, ..., cₙ}`
- Each edge = one button press
- Find shortest path from `{0, 0, ..., 0}` to target

**Complexity**: O(∏ target_values)

**Why it failed**: The state space has `103 × 34 × 138 × ...` nodes. For the
real input, this is trillions of states—impossible to store or explore.

### Attempt 3: Hybrid Simplification

_"Maybe we can solve the easy parts first!"_

If counter 5 is only affected by button 3, we immediately know we must press
button 3 exactly `target[5]` times. Solve these, simplify the system, then
search the remainder.

**Why it failed**: Most machines were heavily interconnected. The "simplified"
problem was still too large for backtracking or graph search.

### The Breakthrough: Recognising Integer Linear Programming

After three failures, the dawning realisation that I might be the problem, and a
bunch of Googling, I suspected (actually hoped) that **this looks like an
optimisation problem with linear constraints and an integer requirement.** And
that seemed to fit the definition of Integer Linear Programming (ILP).

The problem is asking us to:

```
minimise: x₁ + x₂ + x₃ + ... (total button presses)
Subject to:
  Ax = t  (reach target joltages)
  x ≥ 0   (can't press negative times)
  x ∈ ℤⁿ  (must press integer times)
```

ILP is NP-hard in the worst case, but small instances (like AoC inputs with ~10
variables) are tractable with the right algorithm.

## The Solution: Simplex + Branch and Bound

The standard approach to ILP combines two techniques:

### 1. LP Relaxation with Simplex

First, ignore the integer constraint and solve the "easy" version using the
**Simplex method**:

```
minimise: x₁ + x₂ + ...
Subject to: Ax = t, x ≥ 0, x ∈ ℝⁿ
```

The Simplex algorithm efficiently finds the optimal solution when fractional
values are allowed. This gives us a _lower bound_—the true integer solution
can't possibly be better than this.

```rust
fn simplex(constraints: &[Vec<f64>], obj_coeffs: &[f64]) -> (f64, Option<Vec<f64>>) {
    let mut solver = SimplexSolver::new(constraints, obj_coeffs);

    if !solver.prepare_initial_solution() {
        return (f64::NEG_INFINITY, None); // Infeasible
    }

    if solver.iterate(0) {
        solver.get_solution(obj_coeffs)
    } else {
        (f64::NEG_INFINITY, None) // Unbounded
    }
}
```

### 2. Branch and Bound for Integer Enforcement

When Simplex returns a fractional solution (e.g., "press button 7 exactly 142.5
times"), we _branch_:

**Create two new subproblems:**

- **Branch A**: Original problem + constraint `x₇ ≤ 142`
- **Branch B**: Original problem + constraint `x₇ ≥ 143`

Recursively solve both branches. If either branch's LP relaxation is worse than
our current best integer solution, we can prune it—no point exploring further.

```rust
fn branch(&mut self, constraints: Vec<Vec<f64>>, idx: usize, val: f64) {
    let n_cols = constraints[0].len();

    // Branch 1: x_i <= floor(val)
    let mut row1 = vec![0.0; n_cols];
    row1[idx] = 1.0;
    row1[n_cols - 1] = val.floor();
    let mut branch1 = constraints.clone();
    branch1.push(row1);
    self.stack.push(branch1);

    // Branch 2: x_i >= ceil(val)
    let mut row2 = vec![0.0; n_cols];
    row2[idx] = -1.0;
    row2[n_cols - 1] = -val.ceil();
    let mut branch2 = constraints;
    branch2.push(row2);
    self.stack.push(branch2);
}
```

This systematically explores the solution space, pruning branches that can't
improve our best answer.

## Why This Works (And Others Didn't)

The key difference: **Branch and Bound's complexity depends on problem
structure, not target magnitude.**

| Approach           | Complexity Factor     | Scales With             |
| ------------------ | --------------------- | ----------------------- |
| Backtracking       | O(max_presses^n)      | Target values           |
| Graph Search       | O(∏ targets)          | Target values           |
| **Branch & Bound** | **O(2^n) worst case** | **Number of variables** |

For AoC inputs with ~10 buttons but targets in the hundreds, Branch and Bound
explores far fewer nodes thanks to aggressive pruning.

The difference between a 30-second solve and a program that runs forever often
comes down to choosing the right algorithmic framework.

## When to Apply This

**Use ILP when you have:**

- A linear objective function to minimise/maximise
- Linear equality/inequality constraints
- Integer decision variables

**Real-world examples:**

- Scheduling (assign integer shifts to workers)
- Resource allocation (distribute whole units)
- Network flow (route integer packets)

**Warning signs you need ILP:**

- Greedy heuristics give terrible results

## Further Reading

**Introductory Tutorials:**

- [Integer Programming (Wikipedia)](https://en.wikipedia.org/wiki/Integer_programming) -
  Comprehensive overview of ILP theory and applications
- [Branch and Bound (Wikipedia)](https://en.wikipedia.org/wiki/Branch_and_bound) -
  Explanation of the branch and bound algorithm
- [Hands-On Linear Programming with Pythn](https://realpython.com/linear-programming-python/) -
  Practical tutorial using Sci dex

- Lea\*[Introduction to Linear and Integer Programming](https://ampl.com/colab/notebooks/introduction-to-linear-and-integer-programming.html) -
  Interactive AMPL Colaboratory notebook

**Academic Resources:**

- [A Tutorial on Integer Programming](https://www.math.clemson.edu/~mjs/courses/mthsc.440/integer.pdf)
  (PDF) - Cornuéjols & Trick's comprehensive tutorial
- [MIT Integer Programming Chapter](https://web.mit.edu/15.053/www/AMP-Chapter-09.pdf)
  (PDF) - Formulations and applications

**The Problem:**

- [Advent of Code 2025, Day 10](https://adventofcode.com/2025/day/10) - The
  original challenge that inspired this post

---

_The full solution with Simplex implementation and tests is
[on GitHub](https://github.com/bclews/advent-of-code/tree/main/2025/day-10)._
