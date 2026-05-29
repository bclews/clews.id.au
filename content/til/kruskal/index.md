+++
title = "Kruskal's Algorithm: Building Minimum Spanning Trees with Union-Find"
date = 2025-12-09T10:42:11+11:00
draft = false
description = "How Kruskal's greedy algorithm builds minimum spanning trees using Union-Find for efficient cycle detection."
categories = ["Software Engineering"]
tags = ["rust", "algorithms"]
+++

Today I learned about Kruskal's algorithm while solving
[Advent of Code 2025 Day 8](https://adventofcode.com/2025/day/8). What struck me
most was how elegantly the greedy approach works. It seems almost too simple to
be optimal, yet the proof is surprisingly straightforward. Pairing it with
Union-Find for cycle detection makes the whole algorithm both intuitive and
efficient.

## The Problem

Given junction boxes suspended in 3D space, connect them with the minimum total
wire length such that electricity can flow between all boxes. For example, given
these 5 boxes:

```
A(0,0,0), B(1,0,0), C(2,0,0), D(0,1,0), E(10,10,10)
```

We could connect all boxes in many ways, but the minimum spanning tree (MST)
minimises total wire used while keeping everything connected.

## What is Kruskal's Algorithm?

**Kruskal's algorithm** is a greedy algorithm that builds a minimum spanning
tree by:

1. Sorting all possible edges by weight (distance)
2. Processing edges from shortest to longest
3. Adding each edge to the tree **only if it connects two separate components**
   (doesn't create a cycle)

Key insight: **greedily choosing the shortest edge that doesn't create a cycle
always leads to an optimal MST**. This works because adding a longer edge when a
shorter one could do the job can never improve the solution.

## Implementation in Rust

Here's the core algorithm using Union-Find to track connected components:

```rust
// Sort all edges by distance
edges.sort_by(|a, b| a.distance.partial_cmp(&b.distance).unwrap());

// Process edges in order, connecting disjoint components
let mut uf = UnionFind::new(data.len());

for edge in edges {
    if uf.union(edge.from, edge.to) {
        // Edge added - components were separate
        if uf.component_count() == 1 {
            // MST complete - all nodes connected
            break;
        }
    }
    // else: Edge skipped - would create cycle
}
```

The Union-Find structure handles the critical question: "Are these two nodes
already in the same component?" in near-constant time.

## Walkthrough: Building an MST

Let's trace through connecting 4 boxes (A, B, C, D):

```
Initial state: {A}, {B}, {C}, {D} (4 components)

Edges sorted by distance:
1. A-B: 1.0
2. B-C: 1.0
3. A-D: 1.0
4. C-D: 1.4
5. B-D: 1.4
6. A-C: 2.0

Step 1: Process A-B (distance 1.0)
  Union(A, B) → Success
  Components: {A,B}, {C}, {D} (3 components)
  ✓ Edge added to MST

Step 2: Process B-C (distance 1.0)
  Union(B, C) → Success (connects {A,B} with {C})
  Components: {A,B,C}, {D} (2 components)
  ✓ Edge added to MST

Step 3: Process A-D (distance 1.0)
  Union(A, D) → Success
  Components: {A,B,C,D} (1 component)
  ✓ Edge added to MST
  → MST complete! (N-1 = 3 edges for N=4 nodes)

Step 4: Process C-D (distance 1.4)
  Union(C, D) → Failure (already connected via A-B-C-D path)
  ✗ Edge skipped (would create cycle)
```

The MST has edges A-B, B-C, A-D with total weight 3.0. The C-D edge was skipped
because it would create a cycle.

## The Union-Find Magic

The critical constraint that makes Kruskal's efficient is: **we must quickly
check if two nodes are already connected**. This is where Union-Find shines.

```rust
fn find(&mut self, x: usize) -> usize {
    if self.parent[x] != x {
        self.parent[x] = self.find(self.parent[x]); // Path compression
    }
    self.parent[x]
}

fn union(&mut self, x: usize, y: usize) -> bool {
    let root_x = self.find(x);
    let root_y = self.find(y);

    if root_x == root_y {
        return false; // Already in same component - would create cycle
    }

    // Connect the components
    self.parent[root_y] = root_x;
    self.component_count -= 1;
    true
}
```

With **path compression**, each `union()` operation is effectively O(α(N)) ≈
O(1) where α is the
[inverse Ackermann function](https://en.wikipedia.org/wiki/Ackermann_function#Inverse)
(grows incredibly slowly—practically constant for any real-world N).

## Why Greedy Works Here

**If we've processed all edges shorter than e, and e connects two separate
components, we must add it**. Any MST that doesn't include e would need a longer
edge to connect those components later, making it suboptimal.

This is different from many graph problems where greedy fails. For example, the
shortest path problem requires Dijkstra's algorithm—greedily taking the shortest
edge at each step doesn't guarantee the optimal path.

## Complexity Analysis

For a graph with V vertices and E edges:

- **Sorting edges**: O(E log E)
- **Union-Find operations**: O(E × α(V)) ≈ O(E)
- **Total**: O(E log E)

For the Advent of Code problem with ~2500 junction boxes:

- E = C(2500, 2) ≈ 3,125,000 possible edges
- Sorting: ~49 million comparisons
- Union operations: ~3.1 million (nearly constant time each)

A naive approach checking all possible spanning trees would be exponential...
completely impractical!

## When to Use Kruskal's

Kruskal's algorithm is ideal when:

- You need a minimum spanning tree
- Edges can be easily sorted
- You already have an edge list (rather than an adjacency list)
- You care about the order edges are added (like in Day 8 Part 1: "process the
  first 1000 edges")

For dense graphs or when starting from an adjacency list, **Prim's algorithm**
is an alternative that builds the tree incrementally from a starting vertex
without needing to sort all edges upfront.

## Key Takeaway

The elegance of Kruskal's lies in its simplicity: **sort edges, add them
greedily while avoiding cycles**. The Union-Find data structure transforms cycle
detection from a potentially expensive graph traversal into a near-constant-time
operation, making the entire algorithm practical and efficient.

## Resources

- [Wikipedia: Kruskal's Algorithm](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm)
- [CP-Algorithms: Minimum Spanning Tree - Kruskal's](https://cp-algorithms.com/graph/mst_kruskal.html)
- [My Advent of Code 2025 Day 8 Solution](https://github.com/bclews/advent-of-code/tree/main/2025/day-08)
  (Rust implementation)
