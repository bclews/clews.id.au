+++
title = "What I Learned Building an App by Directing AI Agents"
date = 2026-07-07T10:00:00+10:00
draft = false
description = "I built an AI patient simulator for pharmacy students almost entirely through Claude Code agents, with one pull request per planned step. This is the workflow that made it work, along with an honest account of where the agents stopped being useful."
categories = ['Software Engineering']
tags = ['ai', 'agentic-engineering', 'llm', 'claude', 'workflow', 'pharmacy-tutor']
+++

My wife is a pharmacist who teaches pharmacy practice at our local university,
which is how I ended up here, building an AI patient simulator demo.

It started around 2023, when ChatGPT took off and a lot of academic staff were
rattled by how easily it let students cheat, a concern that was reflected in the
[academic literature of that year](https://www.tandfonline.com/doi/full/10.1080/14703297.2023.2190148).
My wife and I chatted about it and our prevailing view was that trying to block
or limit these tools was a losing game, and the more useful move was to
integrate LLM tools into the teaching. One idea we landed on was a prompt a
student could paste into a chatbot during a lab or tutorial, so the model would
role-play a patient and the student could practise a counselling conversation on
the spot. It worked remarkably well. Students liked it, and my wife has gone on
to write a whole set of these role-play prompts.

Being a software engineer, I wanted to push the idea past a block of text you
paste into a chatbot.
[This repository](https://github.com/bclews/pharmacy-tutor) is that experiment.
A student walks up to a virtual pharmacy counter, an AI patient says "I've had
this headache for a couple of days, what can I take?", and the student has to
counsel them the way they would a real customer, asking enough questions to
understand the situation before recommending anything. Afterwards they get
assessed against a checklist.

The part that makes it interesting is that one of the patients is on warfarin
and won't mention it unless asked. Recommend ibuprofen without checking, and in
real life you have just put someone at risk of a serious bleed. The whole point
of the simulator is to test whether the student asks.

That is the app idea, but this post is mostly about how I built it, which was
almost entirely by directing AI agents, and what that showed me about where they
help and where they were less useful. I've been writing software for a long
time, but building this way, by directing agents, is fairly new to me. So take
this as one code monkey's notes on what worked for one project, not a set of
rules. Where I lean on a claim that isn't just my own experience, I've tried to
point at something firmer.

## Some upfront details

I built this through Claude Code, mostly in the Claude desktop app on Claude
Opus 4.6, with the last touches done later on the command line with Opus 4.8.
Nearly every feature landed as a pull request from a branch named
`claude/implement-something`. When I count the commits, thirty-two are authored
by "Claude" and twenty-seven by me. There were nineteen pull requests from
beginning to end.

The agents got me to step ten of a thirteen-step plan, and then the project
stalled. The work that was left wasn't all beyond them; most of it could have
been done with the right guidance. It came down to a single piece that needed
something an agent can't give.

I'll come back to that. First, the part that worked better than I expected.

## The plan did most of the work

Before I let an agent write a single line of application code, I had it write
two documents: a requirements spec and a thirteen-step implementation plan.
Every step had acceptance criteria, which were concrete and checkable statements
like "an invalid invite code returns 401 with the same message as a non-existent
one" and "the scenario list endpoint never returns the correct answer."

This turned out to be the single most important decision in the whole project.

Point an agent at "build me the app" and you tend to get back a sprawling,
confident mess. I know this because I've watched it happen. On a different
project I asked Claude Code to build me a cloud-based recipe and batch-tracking
tool for homebrewers, something in the spirit of Brewfather, in Django and
React, all from one big prompt. What came back looked great on the surface. Then
I started clicking, and it came apart. Adding an ingredient threw an error, and
designing a recipe threw a different one. A fair number of the links just led
somewhere broken. It was a steaming pile of shit under a layer of glitter. And
the harder I pushed it to fix the thing, the worse it got. Each round of patches
broke something else, until I was further from a working app than when I
started.

What I had this time instead was something closer to a build queue. Each agent
session picked up one step, built a working slice of the app, and checked its
own output against the criteria for that step.

The criteria also gave the agent a definition of done that meant more than
"looks finished". An agent will always tell you it has finished. A failing test
tied to a written criterion is much harder to argue with.

None of this is new. Writing requirements as concrete, checkable examples that
double as acceptance tests is the old idea of
[specification by example](https://www.manning.com/books/specification-by-example),
which has been around since long before agents existed. What surprised me is
that it suits an agent even better than it suited the human teams it was written
for. The agent needs an unambiguous target far more than a person does, and an
executable criterion is exactly that. The specification is where the real
thinking happens when you work this way, and the code becomes an artefact of it.

I only joined these dots after the fact. Doing this deliberately with coding
agents now has a name, spec-driven development, and
[Birgitta Böckeler](https://bsky.app/profile/birgitta410.bsky.social) has
written a
[careful and fairly skeptical tour](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
of the tools that try to formalise it. Her wariness is worth taking seriously.
The heavier tools generate piles of specification documents that become their
own review burden, and a spec doesn't stop an agent ignoring it or hallucinating
anyway. What I did was the lightest version she describes, a plan written once
up front, which happens to dodge most of what she's wary of. I wouldn't read my
experience as proof the idea scales, only that the cheap end of it paid off
here.

## I had the agent poke holes in the idea

Before building anything, I also had the agent write a critical review of my own
idea. I asked it for a genuine gaps analysis rather than reassurance. It came
back with several real problems: the regulatory exposure of a health-education
tool, the fact that using one LLM to grade another is an unvalidated way to
assess anyone, the cost of authoring accurate clinical content, and the absence
of any look at existing competitors.

I addressed some of them and deliberately parked others, but none of them
ambushed me later because I had gone looking for them on purpose. Running a
skeptical review of your own work before you commit to it is cheap, and in my
experience an agent is well suited to it, maybe because it has nothing invested
in the idea being good.

## I tested the riskiest part first

The frontend and the database were the predictable parts of this work. What I
genuinely didn't know was whether the prompt would work. Could I get an LLM to
play a patient who keeps quiet about the warfarin until the student asks, rather
than volunteering it the moment it seems helpful?

So before building any of the services that rely on those prompts, I put
together a small test harness and ran nine scripted consultations through it.
For each of three patients I tried one done well, one done badly, and one where
I attempted to break the patient out of character. Then I saved the outputs and
actually read them.

That's the agentic version of an old discipline, which is to do the frightening,
uncertain thing while it's still cheap to throw away. If the prompts hadn't
worked, nothing downstream would have mattered, and I found that out in an
afternoon instead of after building a whole UI on top of a broken foundation.

## Where I had to take over

The project stalled at the feedback page. Steps eleven, twelve and thirteen of
my plan never happened, and the repository makes that obvious. There is no
reverse-proxy configuration, the production CORS settings were never added, and
nothing was ever deployed.

Two of those steps were squarely within an agent's reach. Security hardening and
deployment are well-trodden ground, and with a clear set of guidelines and some
reference documentation an agent could have got most of the way there. I just
didn't take it that far. The honest reason the work stopped is ordinary: I lost
momentum. Besides, if I’d actually finished it, it would have stopped being a
side project.

Step thirteen is the one an agent genuinely can't do for you. It was the
validation work of sitting a real pharmacist down in front of the AI's marking
and checking whether the two agree. That question lives entirely outside the
codebase. You can't write an acceptance criterion for it, and the answer decides
whether the product is trustworthy. My own plan had said as much, with a line
buried in it about validation being the hardest problem, well before any code
got involved. The part I couldn't hand off was always going to be mine.

The tests are a monument to agent enthusiasm. I ended up with roughly 5,000
lines of tests sitting on top of about 1,700 lines of application code, which is
a ratio of nearly three to one. One test file, the one covering the evaluation
logic, is on its own larger than the entire backend it is meant to be testing.
Agents enjoy writing tests, and left to their own devices they'll produce a wall
of them, with all those green checkmarks that feel like rigour. The trouble is
that a line count isn't a coverage measure. I never went back to check whether
all those tests exercise the paths that matter. There's a name for the check I
skipped, mutation testing, which deliberately breaks the code to see whether the
tests notice, and Böckeler argues it
[matters most when an agent wrote the tests](https://martinfowler.com/articles/sensors-for-coding-agents.html),
since nobody reviewed them line by line. She frames a test suite as a regression
sensor, something that tells you whether the agent's next change quietly broke
the last one, and a sensor you haven't calibrated isn't worth much. Until
someone runs that check, all those tests are just weight to carry. By then the
generating was the easy part; what took judgement was deciding which to keep and
which to delete.

The pull request descriptions are persuasive whether or not they are accurate.
Every one of them came beautifully written. "All 150 tests pass" is the kind of
claim I can verify in about ten seconds. The same confident prose also told me
the clinical content was safe and the patient behaved correctly, written in
exactly the same tone and with exactly the same authority, even though those
claims are nothing like as easy to check.

This is the part I'd warn other people about hardest. There's
[research from Stanford](https://arxiv.org/abs/2211.03622) in which people given
an AI coding assistant not only wrote less secure code but were more confident
it was secure, and the participants who trusted the assistant least produced the
safest work. Fluent output invites exactly the wrong reflex, which is to relax.
A confident pull request description is the same trap wearing different clothes.

I had to learn to sort the agent's claims into two piles. One holds the things a
machine can confirm, which I can lean on once I've checked them. The other holds
the things it can't confirm, which stay my responsibility however convincingly
they're phrased. The clinical accuracy in this app is meant to be
non-negotiable, and yet the only person who reviewed it was me, a software
engineer with no clinical training. The obvious reviewer was right there, since
my wife is a pharmacist, but I didn't ask her. She carries the workload that a
2025 [census of Australian university staff](https://stresscafe.net/census/)
found has put almost half of them in psychologically high-risk conditions, and
adding "check my side project against the prescribing guidelines" to that was
not something I was willing to do. So safety-critical content ended up generated
by an agent and signed off by the one person in the house without the training
to catch a clinical error, which is a loop I would want to break before this
went anywhere near a real student.

## What I came away with

Working with agents felt like the same engineering I already knew, with the
centre of gravity shifted somewhere new. Most of the leverage moves up into the
planning. The specification and the acceptance criteria do most of the work, and
so does the order you build things in. When that planning is good, the agent
genuinely earns its place, and the nineteen pull requests of working, tested
code are proof enough. Skimp on it and what comes back is a confident pile of
plausible mush.

There is a ceiling, though, and it sits lower than the hype suggests. Agents
handle the tractable middle of a project very well. They are much weaker at the
hard edges, where you need taste, domain judgement, validation against the real
world, and someone prepared to put their name to a claim that no test can prove.
None of that got easier. If anything the agents made it more obvious, because
they will carry you right up to the edge of it and then leave you standing
there.

In the end the agents built most of the application, and the part they couldn't
help with turned out to be the part that mattered most.

## Two decisions still to come

All of that leads to two design decisions that make the simulator work, and both
deserve a post of their own. The first is
[keeping the model from being the source of clinical truth](/posts/why-the-model-doesnt-decide-the-medicine/).
The second is
[splitting the patient and the examiner into two separate prompts](/posts/why-the-patient-doesnt-know-the-answer/),
so the patient can't accidentally leak the answer.

---

The code is on GitHub:
[github.com/bclews/pharmacy-tutor](https://github.com/bclews/pharmacy-tutor)
