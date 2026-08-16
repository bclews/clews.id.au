+++
title = 'Advent of Code 2024'
date = 2025-01-28T08:43:40+11:00
draft = false
description = "I finished all 25 Advent of Code 2024 puzzles, leaned on LLMs the whole way, and solved Day 14 by sorting PNGs by file size. Notes on how that went."
categories = ['Software Engineering', 'Career and Reflection']
tags = ['python', 'algorithms', 'learning', 'machine-learning']
+++

Every December, [Advent of Code](https://adventofcode.com) turns up in my feeds
and I feel roughly equal parts keen and dread. It’s a yearly programming
challenge that wraps algorithmic problems in a festive narrative.

For years, I flirted with the idea of participating. And for years, I always
found a way to dodge it. Sometimes, I’d forget about it until a stray tweet
reminded me a week into the event, leaving me feeling hopelessly behind. Other
times, summer holidays and the thought of spending time glued to a screen felt
like a crime. And, honestly? The puzzles kind of intimidated me. They felt like
they were tailor-made to expose every weak spot I had. It was always easier to
skip it than risk confirming my doubts.

But this year? I thought, _"Fuck it! Let's go!"_ Without overthinking, I jumped
in headfirst. What’s the worst that could happen? A little failure never killed
anyone.

---

### What Is Advent of Code?

Advent of Code is an online event where a new coding puzzle drops every day from
December 1st to 25th. Each challenge is wrapped in a whimsical holiday
narrative, starting relatively simple but quickly escalating into complex
algorithmic and logical brain-benders.

The puzzles are delivered in two parts. Solve part one, and you unlock part
two, which often flips the original problem on its head. It’s a mix of logic,
efficiency, and, occasionally, good ol’ brute force.

For leaderboard chasers, speed and algorithmic skill are key. For the rest of
us, it’s a chance to learn some techniques we don’t reach for at work.

---

### Setting Goals (And Embracing Reality)

I went in fully aware that December is probably the worst time to take on a
daily challenge. Between wrapping up work projects, wrangling school holidays,
and prepping for Christmas, my time was limited. I knew I’d start strong and
probably taper off, and that’s exactly what happened.

Still, I set a few goals:

1. **Finish what I could**: Even if I didn’t complete all 25 days, just sticking
   with it would be a win. _How it went:_ Against my own expectations, I
   actually completed all 25 challenges! There were definitely days when I
   wanted to quit, especially during the grid algorithm grind, but pushing
   through paid off.
2. **Experiment with LLMs**: I wanted to see how much tools like ChatGPT,
   Claude, and Copilot could actually do for me. _How it went:_ As expected,
   LLMs were great for boilerplate code and algorithm suggestions, but they
   continue to struggle with the more complex puzzles. I ended up refining my
   approach in this challenge rather than discovering anything new.
3. **Learn something new**: Whether it was algorithms or smarter ways to work, I
   wanted to walk away having learned something. _How it went:_ I went from
   dreading graph algorithms to actually understanding them, and the Day 14 PNG
   compression hack is still my favourite thing I did all month. I also picked
   up some debugging tricks, like visualising grid states as images.

---

### The LLM Dilemma: Cheating or Innovating?

Now, the elephant in the room: using LLMs for Advent of Code. The event’s
creator explicitly discourages AI use for climbing the global leaderboards
([see here](https://adventofcode.com/2024/about)). But I wasn’t competing with
anyone. I was there to find out what these tools are actually good for.

I leaned heavily on LLMs, primarily the free tiers of ChatGPT and Claude, with
Copilot in the mix. Early on, they were great for simpler problems, especially
part one of puzzles. But as the challenges grew more complex, their limitations
became glaringly obvious. Multi-step reasoning and edge cases? Nope. They
weren’t cutting it. They were still worth having around for boilerplate and for
quick refreshers on things like BFS and Dijkstra’s algorithm.

---

### Favourite Puzzle: Day 14: Restroom Redoubt

Day 14 was my favourite, and not because it was easy. The challenge involved
identifying patterns in a 2D grid, and I initially tackled it algorithmically.
But after struggling with
2D pattern matching and anomaly detection, I resorted to brute force: printing
10,000 frames as PNGs to scan manually.

This was, predictably, slow as hell. So, I took my dog for a walk. And mid-walk,
it hit me: PNGs use lossless compression. The Christmas tree pattern, being the
most ordered, would compress the most. Back home, I sorted the files by size,
and boom: the smallest PNG revealed the tree! Later, I redeemed my brute-force
hack by calculating the time frame with the most consecutive robots. Was it
efficient? Absolutely not. But I'm still pleased with it.

---

### Biggest Challenge: The Grid Grind

By mid-month, I hit a wall. Many puzzles relied on pathfinding in grids -
problems that practically screamed for algorithms like BFS, DFS, and Dijkstra.
My lack of familiarity with these techniques made it feel like a slog. I cracked
the sads a bit when I opened Day 15 to find yet _another_ grid problem. But on
the upside, I ended up learning a ton about these algorithms. The grind was
real, but the payoff was worth it.

---

### Final Thoughts

Against all odds, I finished all 25 challenges:

<video autoplay loop muted playsinline style="width: 100%; max-width: 100%; height: auto; display: block; margin: 0 auto;">
  <source src="advent_2024.mp4" type="video/mp4">
</video>

What started as a _fuck it, let’s go!_ experiment turned into a month of being
alternately stuck and delighted. Sure, I leaned on LLMs more than some purists
would approve of, and some of my solutions were more “creative” than “elegant”.
But that’s what made it valuable.

If you’re curious about my solutions or want to dig into the code, you can check
out my
[Advent of Code solutions on GitHub](https://github.com/bclews/advent-of-code).

Would I do it again? Ask me next December. But I finished the thing I’d spent
years dodging, and I no longer dread opening a puzzle and finding a grid in it.
