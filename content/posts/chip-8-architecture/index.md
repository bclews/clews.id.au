+++
title = "Architecture of a Rust Emulator"
date = 2025-11-27T10:00:00+11:00
draft = true
tags = ["rust", "systems-programming", "architecture"]
categories = ["Software Engineering"]
series = ["CHIP-8 Emulator in Rust"]
series_order = 2
description = "A walkthrough of the actual code: trait-based hardware abstraction, error handling patterns, and configuration presets."
+++

> **Part 2 of 3** | [Part 1: Why CHIP-8](/posts/chip-8-why-chip8/) | Part 2 | [Part 3: Learning with AI](/posts/chip-8-lessons-learned/)

In [Part 1](/posts/chip-8-why-chip8/), I explained why I built a CHIP-8 emulator to learn Rust. Now let's look at what I actually built.

This isn't a tutorial—it's a walkthrough of the architecture decisions in my actual codebase. Code samples are from the real project.

## Module Structure

The project is organized into distinct concerns:

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

The emulator core (`emulator/`) knows nothing about windowing, audio libraries, or keyboards. It operates on traits. The hardware implementations (`graphics/`, `audio/`, `input/`) provide concrete implementations of those traits.

This separation means I can run the CPU in a test with mock hardware, or in a GUI with real hardware, or headlessly for screenshots. Same core, different frontends.

## The Hardware Abstraction Layer

The key insight is that a CHIP-8 CPU doesn't need to know *how* pixels are drawn—only *that* they can be drawn. Same for audio and input.

Three traits define the hardware interface:

```rust
/// Display abstraction for the Chip-8 screen.
pub trait Display {
    /// Clears the entire display (sets all pixels to off).
    fn clear(&mut self);

    /// Draws a sprite at the specified coordinates.
    /// Returns true if any pixels were turned off (collision detection).
    fn draw_sprite(&mut self, x: u8, y: u8, sprite: &[u8]) -> DisplayResult<bool>;

    /// Gets the state of a pixel.
    fn get_pixel(&self, x: u8, y: u8) -> DisplayResult<bool>;

    /// Sets the state of a pixel.
    fn set_pixel(&mut self, x: u8, y: u8, on: bool) -> DisplayResult<()>;

    /// Renders the display to the screen.
    fn render(&mut self) -> Result<(), EmulatorError>;

    /// Returns true if the display has been modified since last render.
    fn is_dirty(&self) -> bool;
}
```

```rust
/// Audio abstraction for the Chip-8 buzzer.
pub trait Audio {
    fn play_beep(&mut self) -> Result<(), EmulatorError>;
    fn stop_beep(&mut self) -> Result<(), EmulatorError>;
    fn is_playing(&self) -> bool;
    fn set_volume(&mut self, volume: f32);
    fn set_frequency(&mut self, frequency: f32);
}
```

```rust
/// Input abstraction for the Chip-8 keypad.
pub trait Input {
    fn is_key_pressed(&self, key: ChipKey) -> bool;
    fn wait_for_key(&self) -> Option<ChipKey>;
    fn get_pressed_keys(&self) -> Vec<ChipKey>;
    fn update(&mut self) -> Result<(), EmulatorError>;
}
```

The `Hardware` supertrait combines them:

```rust
pub trait Hardware {
    type Display: Display;
    type Audio: Audio;
    type Input: Input;

    fn display(&mut self) -> &mut Self::Display;
    fn audio(&mut self) -> &mut Self::Audio;
    fn input(&mut self) -> &mut Self::Input;

    fn update(&mut self) -> HardwareResult<()>;
}
```

## Null Implementations for Testing

One benefit of trait-based design: you can create implementations that do nothing. The `NullHardware` struct provides this:

```rust
pub struct NullHardware {
    display: display::NullDisplay,
    audio: audio::NullAudio,
    input: input::NullInput,
}

impl Hardware for NullHardware {
    type Display = display::NullDisplay;
    type Audio = audio::NullAudio;
    type Input = input::NullInput;

    fn display(&mut self) -> &mut Self::Display { &mut self.display }
    fn audio(&mut self) -> &mut Self::Audio { &mut self.audio }
    fn input(&mut self) -> &mut Self::Input { &mut self.input }

    fn update(&mut self) -> HardwareResult<()> {
        self.input.update()?;
        self.display.render()?;
        Ok(())
    }
}
```

Now I can test CPU instructions without initializing audio devices or opening windows. The tests run in milliseconds instead of needing real hardware.

## Concurrency: Audio Threading

Audio runs on a separate thread. The main game loop might run at 60Hz, but the audio system needs samples at 44,100Hz. You can't just call `play()` when you want—you need to continuously feed samples to a buffer.

This means sharing state between threads. The buzzer needs to know whether it should be making sound, and the main thread controls that.

The solution is `Arc<Mutex<T>>`:

```rust
use std::sync::{Arc, Mutex};

pub struct BuzzerState {
    pub is_playing: bool,
    pub frequency: f32,
    pub volume: f32,
    // ...
}

pub struct AudioBuzzer {
    state: Arc<Mutex<BuzzerState>>,
    _stream: cpal::Stream,  // underscore: we just need to keep it alive
}
```

`Arc` (atomic reference counting) lets multiple threads own the same data. `Mutex` ensures only one thread accesses it at a time. Together, `Arc<Mutex<BuzzerState>>` is thread-safe shared state.

The audio callback grabs the lock, reads the state, generates samples:

```rust
let state_clone = Arc::clone(&state);

let stream = device.build_output_stream(
    &config,
    move |data: &mut [f32], _| {
        let state = state_clone.lock().unwrap();
        for sample in data.iter_mut() {
            if state.is_playing {
                // Generate waveform sample
                *sample = generate_sample(&state);
            } else {
                *sample = 0.0;
            }
        }
    },
    // ...
);
```

The main thread can toggle playback:

```rust
impl AudioBuzzer {
    pub fn start(&self) {
        self.state.lock().unwrap().is_playing = true;
    }

    pub fn stop(&self) {
        self.state.lock().unwrap().is_playing = false;
    }
}
```

This looked intimidating in tutorials. In practice, it's straightforward: I have shared state across threads, Rust requires me to handle that explicitly, `Arc<Mutex<T>>` handles it.

## Error Handling

The codebase uses `thiserror` for structured errors. Each subsystem has its own error type, and they all convert to the main `EmulatorError`:

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

    #[error("Audio system error: {0}")]
    AudioError(#[from] AudioError),

    #[error("Graphics system error: {0}")]
    Graphics(#[from] GraphicsError),

    #[error("Input system error: {0}")]
    InputError(#[from] InputError),

    #[error("I/O error: {0}")]
    IoError(#[from] std::io::Error),
}
```

The `#[from]` attribute auto-generates conversion. An `AudioError` becomes an `EmulatorError::AudioError` automatically. The `?` operator propagates errors through the call stack.

Each subsystem has its own error type with specific variants:

```rust
#[derive(Error, Debug)]
pub enum AudioError {
    #[error("Failed to initialize audio device")]
    InitializationFailed,

    #[error("Audio stream error: {0}")]
    StreamError(String),

    #[error("Unsupported audio format")]
    UnsupportedFormat,
}

#[derive(Error, Debug)]
pub enum GraphicsError {
    #[error("Invalid pixel coordinates: ({x}, {y})")]
    InvalidCoordinates { x: u8, y: u8 },

    #[error("Window creation failed: {0}")]
    WindowCreationFailed(String),

    #[error("Render failed: {0}")]
    RenderFailed(String),
}
```

Compared to Python exceptions, the error paths are explicit. The function signature tells you what can fail. You can't accidentally ignore an error.

## Configuration Presets

CHIP-8 has compatibility quirks. Different interpreters handle edge cases differently. Rather than expose every option, I created preset configurations:

```rust
impl EmulatorBehaviorConfig {
    /// Classic CHIP-8: memory wraparound enabled, slower speed
    pub fn classic() -> Self {
        Self {
            cpu_speed: 500,
            memory_wraparound: true,
            strict_bounds: false,
            timer_frequency: 60,
        }
    }

    /// Modern interpretation: strict bounds, faster speed
    pub fn modern() -> Self {
        Self {
            cpu_speed: 700,
            memory_wraparound: false,
            strict_bounds: true,
            timer_frequency: 60,
        }
    }
}
```

Audio has similar presets:

```rust
impl BuzzerConfig {
    /// Classic: square wave at 440Hz
    pub fn classic() -> Self {
        Self::new()
            .with_frequency(440.0)
            .with_volume(0.4)
            .with_waveform(WaveformType::Square)
    }

    /// Modern: sine wave at 800Hz, quieter
    pub fn modern() -> Self {
        Self::new()
            .with_frequency(800.0)
            .with_volume(0.2)
            .with_waveform(WaveformType::Sine)
    }
}
```

The builder pattern (`.with_frequency()`, `.with_volume()`) makes configuration readable. The presets mean most users don't need to understand compatibility quirks—they pick "classic" or "modern" and it works.

## What I'd Do Differently

Looking at the code now, some patterns I'd reconsider:

**`Rc<RefCell<T>>` for input.** The CPU uses `Rc<RefCell<dyn Input>>` for the input system. This is single-threaded shared mutability. It works, but `RefCell` panics at runtime if you violate borrowing rules. In a larger codebase, I'd prefer compile-time guarantees.

**More granular traits.** The `Display` trait has methods for both pixel manipulation and rendering. These could be separate traits—`PixelBuffer` and `Renderer`—to better separate concerns.

**Test coverage on the event loop.** I have unit tests for individual components, but the main loop that ties everything together is harder to test. Integration tests exist but could be more comprehensive.

## The Dependency Stack

For reference, the crates I ended up using:

- **Graphics:** `winit` (windowing) + `pixels` (framebuffer)
- **Audio:** `cpal` (low-level audio I/O) + `rodio` (higher-level playback)
- **CLI:** `clap` with derive macros
- **Error handling:** `thiserror` + `color-eyre`
- **Configuration:** `serde` + `toml`
- **Random numbers:** `rand` (for the RND instruction)

The Rust ecosystem has good coverage for these fundamentals. I didn't have to reinvent windowing or audio—I could focus on the emulator logic.

---

In [Part 3](/posts/chip-8-lessons-learned/), I'll reflect on what I learned: how I actually used AI throughout the project, what the Rust compiler taught me, and the trust question when your mentor is an LLM.

---

The code is on GitHub: [github.com/bclews/chip8](https://github.com/bclews/chip8)
