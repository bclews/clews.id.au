+++
title = "Learning Rust with an AI Pair Programmer"
date = 2025-12-04T10:00:00+11:00
draft = true
tags = ["rust", "systems-programming", "llm", "learning"]
categories = ["Software Engineering"]
series = ["CHIP-8 Emulator in Rust"]
series_order = 3
description = "What the compiler actually taught me, how I used AI throughout the project, and the trust question when your mentor is an LLM."
+++

> **Part 3 of 3** | [Part 1: Why CHIP-8](/posts/chip-8-why-chip8/) | [Part 2: Architecture](/posts/chip-8-architecture/) | Part 3

In [Part 1](/posts/chip-8-why-chip8/), I explained why I picked CHIP-8 to learn Rust. In [Part 2](/posts/chip-8-architecture/), I walked through the architecture. Now: what actually stuck?

## What the Compiler Taught Me

### The Borrow Checker Is Teaching, Not Fighting

I expected to wrestle with the borrow checker constantly. That happened early. Then something shifted.

When the compiler rejected my code, it was usually because I was doing something subtly wrong—not syntactically, conceptually. Holding a reference to memory while modifying display state. Trying to share mutable data between threads without synchronization.

The solutions the compiler pushed me toward were better designs:
- Copy small data instead of holding references across operations
- Use `Arc<Mutex<T>>` for genuinely shared state
- Pass dependencies explicitly instead of reaching into global state

I stopped seeing error messages as obstacles and started seeing them as design feedback.

The compiler was so helpful I didn't need Claude for most debugging. Saving those tokens for the gnarly runtime bugs.

### Unlearning Dynamic Language Habits

Coming from Python, my instincts were wrong. I'd reach for patterns that don't translate:

**Python thinking:** "I'll just pass this object around and call methods on it."

**Rust reality:** "Who owns this? How long does it live? Can you prove nothing else is mutating it?"

These questions have always mattered for correctness. Rust just makes them explicit. Now I think about ownership even when writing Python—and I'm warier of hidden state.

### Error Handling Changes How You Think

In Python, I'd write a function and maybe think about exceptions if I remembered. In Rust, the return type forces the conversation:

```rust
pub fn read_byte(&self, address: u16) -> Result<u8, EmulatorError>
```

This function can fail. The caller must handle it. Not "might" handle it—*must*.

At first this felt like bureaucracy. Eventually I was grateful. When something went wrong, I knew exactly where to look. The type system had documented every failure path.

## How I Actually Used AI

### Knowledge Gaps

I loaded CHIP-8 specification documents into Claude and used it to fill knowledge gaps. It had been a long time since I'd thought about low-level microprocessor details—opcodes, registers, memory layouts. The LLM helped me down interesting rabbit holes without having to context-switch to Stack Overflow.

### Planning and Architecture

Before writing code, I'd describe what I wanted to build and get feedback on the approach. "I'm thinking about structuring the hardware abstraction like this—does that make sense for Rust?"

This isn't that different from rubber-duck debugging, except the duck talks back. Sometimes usefully, sometimes not.

### Writing Tests

This is the bit I fucking drag my feet on all the time. I know tests help me. I know I should write them first. But I always find some excuse to "write them later."

With Claude, I could describe what I wanted tested and get something to start from. When I found edge cases, I got it to update the tests. I still reviewed everything, but the activation energy dropped significantly.

### Code Review

Without access to a human Rustacean, I asked Claude to review from the perspective of a senior Rust developer. "Is this idiomatic? Am I fighting the language? What would you do here?"

Did I verify the advice? As much as I could. But I'm a noob. At some point you have to trust that it compiles and the tests pass and the games run.

## Patterns That Clicked

### Traits vs Duck Typing

I understood traits intellectually from reading the Rust Book. They clicked emotionally when I needed to test my CPU without initializing audio hardware.

```rust
pub trait Display {
    fn draw_sprite(&mut self, x: u8, y: u8, sprite: &[u8]) -> bool;
    fn clear(&mut self);
}
```

In tests, I implement this with a struct that records what was called. In production, I implement it with actual pixel rendering. The CPU code doesn't change.

Python's duck typing gives you this flexibility too, but you find out at runtime if you're missing a method. Rust tells you at compile time. That's not a minor difference when you're debugging late at night.

### The Null Object Pattern

Related to traits: I created `NullDisplay`, `NullAudio`, and `NullInput` implementations that do nothing. This let me test CPU instructions in milliseconds without initializing real hardware.

```rust
pub struct NullHardware {
    display: NullDisplay,
    audio: NullAudio,
    input: NullInput,
}
```

Same pattern exists in other languages, but Rust's trait system makes it explicit and type-safe.

### Result<T, E> vs Exceptions

Python exceptions can come from anywhere. You don't know what might fail unless you read the implementation.

Rust's `Result` type makes failure explicit in the function signature. You can't accidentally ignore an error. The `?` operator propagates errors without hiding them.

```rust
fn execute_instruction(&mut self) -> Result<(), EmulatorError> {
    let opcode = self.fetch()?;  // Can fail - memory access
    let instruction = self.decode(opcode)?;  // Can fail - unknown opcode
    self.execute(instruction)?;  // Can fail - invalid state
    Ok(())
}
```

Every failure path is visible. Every caller knows what can go wrong.

## The Trust Question

I trust LLM advice about as much as I trust internet stranger advice. Which is to say: I fact-check everything.

The difference is that LLMs aren't trying to fuck with me. They're not scoring points, not showing off, not grinding an axe about some library drama from 2019. They're also not trying to be right—they're trying to be helpful, which is a different failure mode but a more predictable one.

No Rustaceans in my network means no one to ask "is this idiomatic?" So I asked Claude. And I asked it to explain its reasoning. And I cross-referenced with the Rust Book and official docs when something seemed off.

Is my code idiomatic Rust? Probably not entirely. Is there stuff I'd do differently with more experience? Definitely.

But it works. It compiles. The games run.

I am a n00b and it compiles. 🤷

## What's Next

The emulator works. Pong plays. Space Invaders invades. The buzzer buzzes.

I'm not going to pretend it's production-quality—the timing is approximate, some obscure instructions might be wrong, and I cut corners. But I can read Rust code now. I understand ownership. I know when to use `Arc<Mutex<T>>` and when that's overkill.

Next project is probably PyO3—writing Python extensions in Rust. That was my original motivation for learning Rust: performance-critical Python code without rewriting entire systems. Now I actually have the foundation to try it.

---

The code is on GitHub: [github.com/bclews/chip8](https://github.com/bclews/chip8)

It's not perfect, but it works. And I learned more building it than I would have following a hundred tutorials.

---

← **Back to [Part 1: Why CHIP-8?](/posts/chip-8-why-chip8/)**

← **Back to [Part 2: Architecture](/posts/chip-8-architecture/)**
