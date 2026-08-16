+++
title = 'Taming the Noise: Decoding Kubernetes Logs for Humans'
date = 2024-11-29T15:38:16+11:00
draft = false
description = "Two days building Hallucino, a Kubernetes log analyser in Go that chunks logs concurrently and hands them to an LLM for summarising, and what I learned doing it."
categories = ['Software Engineering', 'DevOps']
tags = ['go', 'devops', 'machine-learning']
+++

[Hallucino](https://github.com/bclews/hallucino), my Kubernetes log analyser,
came out of a rare two days with no deadlines attached. During an _Engineering
Development Day_ event, a pause to focus on personal growth, I had a go at
building an _"intelligent"_ tool that could make sense of the noisy, chaotic
world of Kubernetes logs.

---

Kubernetes logs are a labyrinth. In large, distributed systems, logs pour in
from countless containers, pods, and nodes, and the lines that would actually
help you resolve an outage are buried under everything else. I wanted to see
whether a Large Language Model plus Go's concurrency could turn that stream into
something a little more human readable.

I also wanted the excuse. Two days is enough to push on Go's concurrency model
properly, and to find out what memory management looks like when there's a real
volume of text moving through it.

### The Problem

Logs are supposed to tell a story, but they rarely read like one. They’re
scattered fragments from many narrators, speaking in technical jargon, error
codes, and timestamps. Manually sifting through them is time-consuming, and
traditional tools can only go so far. I wondered: Could LLMs help to make sense
of log data, highlight patterns, and offer useful insights?

The practical constraints mattered as much as the technical ones. The tool had
to process logs in real time and handle large volumes without choking on
memory.

---

### The Solution

The result of my efforts was [Hallucino](https://github.com/bclews/hallucino), a
CLI tool for analysing Kubernetes logs, built in Go and powered by an LLM
backend. The core idea was straightforward: fetch logs from Kubernetes, break
them down into manageable chunks using Go’s concurrency features, and run them
through an LLM model for summarization and pattern detection.

Building Hallucino involved designing three key components:

1. **Kubernetes Integration**: Using the Kubernetes `client-go` library, the
   tool connects to a cluster, retrieves logs, and lets users specify the scope
   of their analysis, whether it’s a particular pod, container, or namespace.
2. **Concurrent Log Processing**: With Goroutines and channels, logs are parsed
   concurrently, so nothing has to hold the whole stream in memory at once.
3. **LLM-Powered Analysis**: Logs are passed to a large language model (deployed
   on-premise via Azure OpenAI) for processing. The model identifies errors,
   warnings, and trends, and writes the result out as a Markdown summary.

---

### The Journey

The best part was stepping out of my usual routine to focus on learning. Two
days covered a lot of ground: Kubernetes, Go, and getting an LLM to do something
useful in a real application.

Go’s concurrency model, while elegant, is apparently tricky to master. Debugging
Goroutines and understanding synchronisation with `sync.WaitGroup` tested my
patience, but I came out of it more confident. Designing the LLM integration
forced me to think about unstructured data and how you summarise it. Logs
aren’t neatly written essays; they’re messy, context-dependent snippets. Getting
the LLM to make sense of that took a lot of trial and error on the prompts.

---

### What I Learned

Three things stuck with me.

- **Concurrency Is Powerful (and Hard)**: Breaking logs into chunks and
  processing them in parallel felt like a cheat code for speed, until things
  broke. Balancing speed and safety in concurrent programming is a skill I’ll
  keep refining.
- **Kubernetes is Deep**: Even with prior experience, I found new challenges in
  working with Kubernetes logs, namespaces, and containers. There’s always more
  to learn.
- **LLMs Can Help (Sometimes)**: Large language models aren’t magic bullets.
  While they excel at summarising patterns and errors, their usefulness depends
  on how well the data is pre-processed and how clear the prompts are.

The best thing I took away wasn't technical. It was two uninterrupted days on a
problem I'd picked myself, building something from scratch without worrying
about whether it was any good. Deadlines and bureaucracy have a way of grinding
that out of you, and I'd forgotten how much I like it.

---

### What’s Next

Hallucino is still a work in progress. The prompts need work, and there's no way
to configure much of anything yet. But it runs, and it does the thing I built it
to do.

If you’re curious about the details, including the codebase and installation
instructions, you can find them [here](https://github.com/bclews/hallucino).
Feedback, ideas, or pull requests are always welcome.
