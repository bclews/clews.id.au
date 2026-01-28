+++
title = "What Rust Actually Taught Me"
date = 2025-11-27T10:00:00+11:00
draft = true
tags = ["rust", "systems-programming", "architecture", "learning"]
categories = ["Software Engineering"]
series = ["CHIP-8 Emulator in Rust"]
series_order = 2
description = "How the compiler became my mentor, the architecture that emerged, and the patterns that finally clicked while building a CHIP-8 emulator."
+++

> **Part 2 of 2** | [Part 1: Why CHIP-8](/posts/chip-8-why-chip8/) | Part 2

In [Part 1](/posts/chip-8-why-chip8/), I explained why I picked CHIP-8 to learn
Rust and how I used AI as a mentor. Now: what actually stuck?

## The Compiler as Teacher

### The Borrow Checker Is Teaching, Not Fighting

I expected to wrestle with the borrow checker constantly. That happened early.
Then I figured it out.

When the compiler rejected my code, it was usually because I was doing something
subtly wrong. Not syntactically, conceptually. Holding a reference to memory
while modifying display state. Trying to share mutable data between threads
without synchronization.

Here's an early mistake I made with the draw instruction:

```rust
// What I tried first:
let sprite_data = &self.memory[addr..addr + height];  // immutable borrow
self.display.draw_sprite(x, y, sprite_data);  // needs &mut self — conflict!
```

The compiler wouldn't let me borrow memory while also mutating display state
through `self`. The fix was simple: copy the data first.

```rust
// What actually works:
let sprite_data: Vec<u8> = self.memory[addr..addr + height].to_vec();
self.display.draw_sprite(x, y, &sprite_data);
```

The solutions the compiler pushed me toward were better designs:

- Copy small data instead of holding references across operations
- Use `Arc<Mutex<T>>` for genuinely shared state
- Pass dependencies explicitly instead of reaching into global state

I stopped seeing error messages as obstacles and started seeing them as design
feedback. The compiler was so helpful I didn't need Claude for most
debugging—saving those tokens for the gnarly runtime bugs.

### Unlearning Dynamic Language Habits

Coming from Python, my instincts were wrong. I'd reach for patterns that don't
translate:

**Python thinking:** "I'll just pass this object around and call methods on it."

**Rust reality:** "Who owns this? How long does it live? Can you prove nothing
else is mutating it?"

These questions have always mattered for correctness. Rust just makes them
explicit. Now I think about ownership even when writing Python—and I'm warier of
hidden state.

### Error Handling Changes How You Think

In Python, I'd write a function and maybe think about exceptions if I
remembered. Go nudged me toward explicit errors, but you can still ignore them
with \_. In Rust, the return type forces the conversation:

```rust
pub fn read_byte(&self, address: u16) -> Result<u8, EmulatorError>
```

This function can fail. The caller must handle it. Not "might" handle it—_must_.

At first this felt like bureaucracy. Eventually I was grateful. When something
went wrong, I knew exactly where to look. The type system had documented every
failure path.

## The Architecture That Emerged

The project structure emerged from these lessons:

```
src/
├── emulator/       # Core CPU, memory, registers, stack, timers
├── hardware/       # Trait-based abstraction (Display, Audio, Input)
├── graphics/       # Pixel rendering and display management
├── audio/          # Buzzer, tone generation, streaming
├── input/          # Keyboard handling and key mapping
├── frontend/       # CLI, GUI, and configuration
├── error.rs        # Centralized error types
├── lib.rs          # Public API
└── main.rs         # Entry point
```

The emulator core knows nothing about windowing, audio libraries, or keyboards.
It operates on traits. This wasn't planned from day one—it emerged from trying
to write tests.

### The Hardware Abstraction Layer

I initially had the CPU directly calling graphics library functions. Then I
tried to write a test and realised I'd need to initialise a window just to check
if `ADD V0, V1` worked correctly. That's when the abstraction clicked.

A CHIP-8 CPU doesn't need to know how pixels are drawn—only that they can be
drawn. Traits define the contract; implementations fulfill it.

Three traits define the hardware interface:

```rust
/// Display abstraction for the Chip-8 screen.
pub trait Display {
    fn clear(&mut self);
    fn draw_sprite(&mut self, x: u8, y: u8, sprite: &[u8]) -> Result<bool, DisplayError>;
    fn get_pixel(&self, x: u8, y: u8) -> Result<bool, DisplayError>;
    fn set_pixel(&mut self, x: u8, y: u8, on: bool) -> Result<(), DisplayError>;
    fn render(&mut self) -> Result<(), EmulatorError>;
    fn is_dirty(&self) -> bool;
}

/// Audio abstraction for the Chip-8 buzzer.
pub trait Audio {
    fn play_beep(&mut self) -> Result<(), EmulatorError>;
    fn stop_beep(&mut self) -> Result<(), EmulatorError>;
    fn is_playing(&self) -> bool;
    fn set_volume(&mut self, volume: f32);
    fn set_frequency(&mut self, frequency: f32);
}

/// Input abstraction for the Chip-8 keypad.
pub trait Input {
    fn is_key_pressed(&self, key: ChipKey) -> bool;
    fn wait_for_key(&self) -> Option<ChipKey>;
    fn get_pressed_keys(&self) -> Vec<ChipKey>;
    fn update(&mut self) -> Result<(), EmulatorError>;
}
```

If you've used interfaces in Go or Java, this is familiar territory—behavior
contracts without implementation details.

The `Hardware` supertrait combines them using associated types:

```rust
pub trait Hardware {
    type Display: Display;
    type Audio: Audio;
    type Input: Input;

    fn display(&mut self) -> &mut Self::Display;
    fn audio(&mut self) -> &mut Self::Audio;
    fn input(&mut self) -> &mut Self::Input;
    fn update(&mut self) -> Result<(), HardwareError>;
}
```

Why associated types instead of generic parameters like
`Hardware<D: Display, A: Audio, I: Input>`? Each hardware implementation has
exactly one display type, one audio type, one input type. Associated types
express this "one-to-one" relationship. Generics would make sense if the same
hardware could work with different display implementations—but that's not how
hardware works.

### Null Implementations for Testing

One benefit of trait-based design: you can create implementations that do
nothing.

```rust
pub struct NullHardware {
    display: NullDisplay,
    audio: NullAudio,
    input: NullInput,
}

impl Hardware for NullHardware {
    type Display = NullDisplay;
    type Audio = NullAudio;
    type Input = NullInput;

    fn display(&mut self) -> &mut Self::Display { &mut self.display }
    fn audio(&mut self) -> &mut Self::Audio { &mut self.audio }
    fn input(&mut self) -> &mut Self::Input { &mut self.input }

    fn update(&mut self) -> Result<(), HardwareError> {
        self.input.update()?;
        self.display.render()?;
        Ok(())
    }
}
```

Now I can test CPU instructions without initialising audio devices or opening
windows. The tests run in milliseconds instead of needing real hardware. In
tests, `NullDisplay` records what was called. In production, `SdlDisplay`
renders actual pixels. The CPU code doesn't change.

Python's duck typing gives you this flexibility too, but you find out at runtime
if you're missing a method. Rust tells you at compile time.

### Concurrency: Audio Threading

Audio runs on a separate thread. The main game loop might run at 60Hz, but the
audio system needs samples at 44,100Hz. You can't just call `play()` when you
want—you need to continuously feed samples to a buffer.

This means sharing state between threads. The buzzer needs to know whether it
should be making sound, and the main thread controls that.

The solution is `Arc<Mutex<T>>`:

```rust
use std::sync::{Arc, Mutex};

pub struct BuzzerState {
    pub is_playing: bool,
    pub frequency: f32,
    pub volume: f32,
}

pub struct AudioBuzzer {
    state: Arc<Mutex<BuzzerState>>,
    _stream: cpal::Stream,  // underscore prefix: we just need to keep it alive
}
```

`Arc` (atomic reference counting) lets multiple threads own the same data.
`Mutex` ensures only one thread accesses it at a time. Together,
`Arc<Mutex<BuzzerState>>` is thread-safe shared state.

The audio callback grabs the lock, reads the state, generates samples:

```rust
let state_clone = Arc::clone(&state);

let stream = device.build_output_stream(
    &config,
    move |data: &mut [f32], _| {
        // The `move` keyword transfers ownership of state_clone into this closure.
        // Without it, the closure would try to borrow state_clone, which doesn't
        // live long enough (the closure outlives the function that created it).
        let state = state_clone.lock().unwrap();
        for sample in data.iter_mut() {
            if state.is_playing {
                *sample = generate_sample(&state);
            } else {
                *sample = 0.0;
            }
        }
    },
    // error handler...
);
```

A note on `unwrap()` here: mutex locks can fail if another thread panicked while
holding the lock (called "poisoning"). In practice, if that happens, you have
bigger problems than a failed lock. Using `unwrap()` seems acceptable for this
pattern.

The main thread can toggle playback:

```rust
impl Audio for AudioBuzzer {
    fn play_beep(&mut self) -> Result<(), EmulatorError> {
        self.state.lock().unwrap().is_playing = true;
        Ok(())
    }

    fn stop_beep(&mut self) -> Result<(), EmulatorError> {
        self.state.lock().unwrap().is_playing = false;
        Ok(())
    }
}
```

This looked intimidating in tutorials. In practice, it's straightforward: I have
shared state across threads, Rust requires me to handle that explicitly,
`Arc<Mutex<T>>` handles it.

### Error Handling with thiserror

The codebase uses `thiserror` for structured errors. Each subsystem has its own
error type, and they all convert to the main `EmulatorError`:

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum EmulatorError {
    #[error("Invalid memory access at address {address:#04x}")]
    InvalidMemoryAccess { address: u16 },

    #[error("Unknown instruction {opcode:#04x}")]
    UnknownInstruction { opcode: u16 },

    #[error("ROM file too large: {size} bytes (max {max_size})")]
    RomTooLarge { size: usize, max_size: usize },

    #[error("Stack overflow")]
    StackOverflow,

    #[error("Audio error: {0}")]
    Audio(#[from] AudioError),

    #[error("Display error: {0}")]
    Display(#[from] DisplayError),

    #[error("Input error: {0}")]
    Input(#[from] InputError),

    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
}
```

The `#[from]` attribute auto-generates conversion. An `AudioError` becomes an
`EmulatorError::Audio` automatically. The `?` operator propagates errors through
the call stack:

```rust
fn execute_instruction(&mut self) -> Result<(), EmulatorError> {
    let opcode = self.fetch()?;        // Can fail - memory access
    let instruction = self.decode(opcode)?;  // Can fail - unknown opcode
    self.execute(instruction)?;        // Can fail - invalid state
    Ok(())
}
```

Every failure path is visible. Every caller knows what can go wrong. Compared to
Python exceptions, the error paths are explicit. The function signature tells
you what can fail. You can't accidentally ignore an error.

### Configuration Presets

CHIP-8 has compatibility quirks. Different interpreters handle edge cases
differently. Rather than expose every option, I created preset configurations
using the builder pattern:

```rust
impl EmulatorConfig {
    /// Classic CHIP-8: memory wraparound enabled, slower speed
    pub fn classic() -> Self {
        Self::default()
            .with_cpu_speed(500)
            .with_memory_wraparound(true)
            .with_strict_bounds(false)
    }

    /// Modern interpretation: strict bounds, faster speed
    pub fn modern() -> Self {
        Self::default()
            .with_cpu_speed(700)
            .with_memory_wraparound(false)
            .with_strict_bounds(true)
    }
}
```

The `Default` trait provides sensible defaults, and the builder methods
(`.with_*()`) make configuration readable. Most users don't need to understand
compatibility quirks—they pick "classic" or "modern" and it works.

## Patterns That Finally Clicked

### Traits vs Duck Typing

I understood traits intellectually from reading the Rust Book. They clicked when
I needed to test my CPU without initializing audio hardware.

The CPU code calls `self.hardware.display().draw_sprite(...)`. It doesn't know
or care whether that's a real SDL window or a test stub that records calls. The
trait guarantees the method exists. That's not a minor difference when you're
debugging late at night.

### Result<T, E> vs Exceptions

Python exceptions can come from anywhere. You don't know what might fail unless
you read the implementation (and all its dependencies).

Rust's `Result` type makes failure explicit in the function signature. You can't
accidentally ignore an error. The `?` operator propagates errors without hiding
them.

I now think differently about error handling even in Python. The question isn't
"will this throw?", it is "what can go wrong, and who should handle it?"

## What I'd Do Differently

Looking at the code now, some patterns I'd reconsider:

**`Rc<RefCell<T>>` for input.** The CPU uses `Rc<RefCell<dyn Input>>` for the
input system. This is single-threaded shared ownership with interior mutability.
It works, but `RefCell` panics at runtime if you violate borrowing rules. In a
larger codebase, I'd prefer compile-time guarantees.

**More granular traits.** The `Display` trait has methods for both pixel
manipulation and rendering. These could be separate traits—`PixelBuffer` and
`Renderer`—to better separate concerns.

**Test coverage on the event loop.** I have unit tests for individual
components, but the main loop that ties everything together is harder to test.
Integration tests exist but could be more comprehensive.

## The Dependency Stack

For reference, the crates I ended up using:

- **Graphics:** `winit` (windowing) + `pixels` (framebuffer)
- **Audio:** `cpal` (low-level audio I/O)
- **CLI:** `clap` with derive macros
- **Error handling:** `thiserror` + `color-eyre`
- **Configuration:** `serde` + `toml`
- **Random numbers:** `rand` (for the RND instruction)

The Rust ecosystem has good coverage for these fundamentals. I didn't have to
reinvent windowing or audio—I could focus on the emulator logic.

## What's Next

The emulator works. Pong plays. Space Invaders invades. The buzzer buzzes.

I'm not going to pretend it's production-quality. The timing is approximate,
some obscure instructions might have bugs, and I cut corners. But I can read
Rust code now. I understand ownership. I know when to use `Arc<Mutex<T>>` and
when that's overkill.

More importantly: I learned more building this than I would have following a
hundred tutorials. The struggle was the point.

---

The code is on GitHub:
[github.com/bclews/chip8](https://github.com/bclews/chip8)

---

← **Back to [Part 1: Why CHIP-8?](/posts/chip-8-why-chip8/)**
