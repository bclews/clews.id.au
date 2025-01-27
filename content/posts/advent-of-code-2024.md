+++
title = 'Advent of Code 2024'
date = 2025-01-28T08:43:40+11:00
draft = false
+++

Every December, an event pops up in the software development world that stirs excitement, dread, and inspiration in equal measure: [Advent of Code](https://adventofcode.com). It’s a yearly programming challenge that combines festive themes with algorithmic problem-solving, drawing in developers from all walks of life.

For years, I flirted with the idea of participating. And for years, I always found a way to dodge it. Sometimes, I’d forget about it until a stray tweet reminded me a week into the event, leaving me feeling hopelessly behind. Other times, summer holidays and the thought of spending time glued to a screen felt like a crime. And, honestly? The puzzles kind of intimidated me. They felt like they were tailor-made to expose every weak spot I had. It was always easier to skip it than risk confirming my doubts.

But this year? I thought, *"Fuck it! Let's go!"* Without overthinking, I jumped in headfirst. What’s the worst that could happen? A little failure never killed anyone.

---

### What Is Advent of Code?

Advent of Code is an online event where a new coding puzzle drops every day from December 1st to 25th. Each challenge is wrapped in a whimsical holiday narrative, starting relatively simple but quickly escalating into complex algorithmic and logical brain-benders.

The puzzles are delivered in two parts. Solve part one, and you unlock part two—which often flips the original problem on its head. It’s a mix of logic, efficiency, and, occasionally, good ol’ brute force.

For leaderboard chasers, speed and algorithmic skill are key. But for the rest of us, it’s a chance to sharpen skills, explore new techniques, and learn something new.

---

### Setting Goals (And Embracing Reality)

I went in fully aware that December is probably the worst time to take on a daily challenge. Between wrapping up work projects, wrangling school holidays, and prepping for Christmas, my time was limited. I knew I’d start strong and probably taper off — and that’s exactly what happened.

Still, I set a few goals:  

1. **Finish what I could**: Even if I didn’t complete all 25 days, just sticking with it would be a win. *How it went:* Against my own expectations, I actually completed all 25 challenges! There were definitely days when I wanted to quit, especially during the grid algorithm grind, but pushing through paid off.
2. **Experiment with LLMs**: I wanted to see how tools like ChatGPT, Claude, and Copilot could augment my workflow. *How it went:* As expected, LLMs were great for boilerplate code and algorithm suggestions, but they continue to struggle with the more complex puzzles. I ended up refining my approach in this challenge rather than discovering anything new.
3. **Learn something new**: Whether it was algorithms or smarter ways to work, I wanted to walk away with fresh insights. *How it went:* Mission accomplished! I went from dreading graph algorithms to actually understanding them. The PNG compression hack for Day 14 taught me that sometimes the best solutions come from thinking outside the box. Plus, I picked up some clever debugging techniques along the way, like visualizing grid states as images.

---

### The LLM Dilemma: Cheating or Innovating?

Let’s talk about the elephant in the room: using LLMs for Advent of Code. The event’s creator explicitly discourages AI use for climbing the global leaderboards ([see here](https://adventofcode.com/2024/about)). But I wasn’t competing with anyone. My primary goal was to learn how to effectively make use of AI tools.

I leaned heavily on LLMs, primarily the free tiers of ChatGPT and Claude, with Copilot in the mix. Early on, they were great for simpler problems—especially part one of puzzles. But as the challenges grew more complex, their limitations became glaringly obvious. Nuanced logic, multi-step reasoning, and edge cases? Nope. They weren’t cutting it. Still, they were invaluable for boilerplate code, algorithm suggestions, and quick refreshers on things like BFS and Dijkstra’s algorithm.

---

### Favourite Puzzle: Day 14 – Restroom Redoubt

Day 14 stood out as my favorite, not because it was easy (it wasn’t) but because it forced me to get creative. The challenge involved identifying patterns in a 2D grid, and I initially tackled it algorithmically. But after struggling with 2D pattern matching and anomaly detection, I resorted to brute force: printing 10,000 frames as PNGs to scan manually.

This was, predictably, slow as hell. So, I took my dog for a walk. And mid-walk, it hit me: PNGs use lossless compression. The Christmas tree pattern, being the most ordered, would compress the most. Back home, I sorted the files by size, and boom—the smallest PNG revealed the tree! Later, I redeemed my brute-force hack by calculating the time frame with the most consecutive robots. Was it efficient? Absolutely not. But it was fun, creative, and a great story.

---

### Biggest Challenge: The Grid Grind

By mid-month, I hit a wall. Many puzzles relied on pathfinding in grids—problems that practically screamed for algorithms like BFS, DFS, and Dijkstra. My lack of familiarity with these techniques made it feel like a slog. I cracked the sads a bit when I opened Day 15 to find yet *another* grid problem. But on the upside, I ended up learning a ton about these algorithms. The grind was real, but the payoff was worth it.

---

### Final Thoughts

Against all odds, I finished all 25 challenges:

![yay](/images/advent_of_code_2024.gif)

What started as a *fuck it, let’s go!* experiment turned into a month-long journey of frustration, discovery, and triumph. Sure, I leaned on LLMs more than some purists would approve of, and some of my solutions were more “creative” than “elegant”. But that’s what made it valuable.  

If you’re curious about my solutions or want to dig into the code, you can check out my [Advent of Code solutions on GitHub](https://github.com/bclews/advent-of-code).

Would I do it again? Ask me next December. But for now, I’m proud of what I accomplished, grateful for what I learned, and maybe—just maybe—a little better prepared for whatever coding challenges come next.  
