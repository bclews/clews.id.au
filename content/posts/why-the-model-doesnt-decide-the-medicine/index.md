+++
title = "Why the Model Doesn't Decide the Medicine"
date = 2026-07-14T10:00:00+10:00
draft = false
description = "The clinical facts in my AI pharmacy simulator don't come from the language model. They come from a YAML file a pharmacist can read and review. Here's why I took the medicine away from the model, and what I left it to do instead."
categories = ['Software Engineering']
tags = ['ai', 'llm', 'claude', 'prompt-engineering', 'architecture', 'pharmacy-tutor']
+++

Earlier I wrote about
[building an AI pharmacy simulator by directing agents](/posts/building-a-healthcare-app-with-ai-agents/),
and I promised to come back to the two design decisions that make it work. This
is the first of them. It took me the longest to get right, and it's the one I'd
reach for again on any project where being wrong costs something.

Same disclaimer as last time, briefly: I'm a software engineer, not a
pharmacist, and the clinical side of this leans on my wife, who teaches pharmacy
practice. I'm still fairly new to building with language models. So where I lean
on a claim about how these models behave, or about the clinical facts, I've
tried to point at something firmer than my own say-so.

The simulator sits a pharmacy student in front of an AI patient. The patient has
a headache and wants something for it. One of the scenarios gives the patient
atrial fibrillation, which means they take warfarin every day, which means the
obvious painkiller is the wrong answer. Combining an anti-inflammatory
painkiller like ibuprofen with warfarin raises the risk of a serious bleed. A
2020 systematic review and meta-analysis put the odds ratio for gastrointestinal
bleeding at
[1.98 when an NSAID is taken with warfarin](https://pmc.ncbi.nlm.nih.gov/articles/PMC7665225/),
close to double. That's why the references an Australian pharmacist actually
reaches for, the Australian Medicines Handbook and Therapeutic Guidelines, send
these patients to paracetamol instead. The whole lesson turns on the student
finding out about the warfarin before they recommend anything.

## The tempting shortcut

The model already knows all of this. Claude can explain the warfarin interaction
perfectly well if you ask it. So the obvious shortcut is to hand it the whole
job: play a patient on warfarin, fill in the clinical details as you go, keep
them straight. Fine for a demo. For something students are meant to learn from,
it falls over.

Two reasons, neither of which I had to discover for myself. The first is
consistency. A language model improvising the same character gives you different
details from one run to the next, because the generation is probabilistic and
the model is filling gaps from its training rather than reading off a fixed
record. It might have the patient on warfarin for years in one telling and a few
months in the next. Most chat applications can absorb that. A tool meant to
teach every student the same clinical lesson can't, and the drift is quiet
enough that you wouldn't notice it happening. I didn't catalogue it in my own
logs, to be honest, because by the time I thought to look I'd already grounded
the patient in a file and there was nothing left to drift. It's the consistency
side of the hallucination problem, which has been
[surveyed at length](https://arxiv.org/abs/2202.03629).

The second reason bothers me more. A model can be wrong and sound completely
sure of itself, and a student has no way to tell the two apart. If it decides
mid-conversation that a small dose of ibuprofen is probably fine for someone on
warfarin, it has just taught someone something dangerous, in a setting where a
confident answer reads as instruction. This is one of the core, well-documented
failure modes of these models.

## Putting the facts in a file

So I took the clinical facts off the model. Each scenario is a YAML template,
and anything that has to be correct is set out in advance, in a form a person
can review before any student sees it:

```yaml
patient_medications:
  - drug: Warfarin
    indication: Atrial fibrillation

correct_recommendation: >
  Paracetamol 500 mg tablets, 1-2 tablets every 4-6 hours as needed, maximum 4 g
  in 24 hours. NSAIDs (ibuprofen, aspirin, naproxen) must be avoided due to
  major interaction with warfarin.
contraindicated:
  - Ibuprofen
  - Aspirin
  - Naproxen
  - Diclofenac
```

None of that is the model's opinion. The patient is on warfarin, and ibuprofen
is the wrong answer, because the template says so and for no other reason. The
person who should be writing those fields against the Handbook and the
Guidelines is a pharmacist, and a real version of this tool would rest on that
review. Everything the model does sits downstream of it.

Writing the recommendation out by hand also lets it carry nuance a glib answer
would skate over. Paracetamol is the safe choice here, but regular high doses
can themselves nudge a patient's INR upward, so the template calls it safe at
normal short-term doses rather than safe full stop. Ask a model "is paracetamol
okay with warfarin?" and you'll usually get a yes and nothing after it. A field
in a file can hold the qualification, and a reviewer can check that it did.

## So what is the model for?

Fair question. If the facts all live in the file, what's left? Everything that
isn't a fact, which turns out to be most of the conversation. The same warfarin
template carries five different patients. Margaret Hughes is a warm retired
teacher who calls warfarin "my blood thinner" and wanders off into stories about
her grandchildren. Robert Walsh is a terse retired plumber who calls his
condition "the ticker" and answers in as few words as he can manage. Three more
sit behind them, each with their own way of talking.

You can watch the file doing its job in a real session. Margaret opens like
this:

```
Hello there! I hope you can help me. I've had this headache for a couple of days
now and it's just not going away. I was wondering if you might have something
that could help with it?
```

She says nothing about the warfarin, because the template lists the headache
under what she volunteers and the warfarin under what she only shares when
asked. A few turns later, once the student finally asks the right question, it
surfaces:

```
STUDENT:  Are you currently taking any medications?
PATIENT:  Yes, I take warfarin every day for my irregular heartbeat - atrial
          fibrillation, the doctor calls it. That's actually part of why I
          wanted to check with you first before taking anything.
```

The medical fact was fixed the whole time. What the model decided was when
Margaret would bring it up and the warmth she'd wrap around it. Personality,
backstory, the way someone talks, whether they ramble or reply in two words:
that's what a language model is genuinely good at, and it's the sort of thing
where a bit of variation between runs costs nothing. So that's where it gets a
free hand.

## Why not just give the model a drug database?

The obvious objection is that hand-writing facts doesn't scale, and that the
established way to ground a model in real information is retrieval-augmented
generation, where the model looks facts up from an external store at answer time
instead of relying on what's baked into its weights. The
[original RAG paper](https://arxiv.org/abs/2005.11401) frames this as giving the
model a non-parametric memory to sit alongside the parametric one it was trained
with. Once the body of knowledge is large, that's the right tool.

For three scenarios, it's a retrieval pipeline to build and debug in exchange
for very little. And it wouldn't have removed the work I actually care about.
Whatever the model pulls in still has to be correct, and still has to be
reviewed, so I'd be back to a human checking clinical facts with more machinery
in the way. Writing the facts myself is the same grounding idea. The model
renders information I hand it. I just skipped a lookup step I didn't need. If
the scenario library ever grew into the hundreds, that maths changes.

## The pattern, away from pharmacy

None of this is really about medicine. The shape is useful anywhere a confident
mistake is expensive and there's an authoritative source you could write down
instead. Give the model the language and the improvisation, and keep it well
clear of the bits where being wrong costs something.

The catch is that this doesn't get rid of the need to trust something. It just
changes what. The tool can never be more correct than the templates behind it,
so the templates have to be right, which on a real product means a pharmacist
signing off on every one of them. That loops straight back to the
[validation problem](/posts/building-a-healthcare-app-with-ai-agents/#where-i-had-to-take-over)
I wrote about last time. What you get out of it is that the thing you
have to trust is now sitting in a file, where someone can read it, argue with
it, and fix it. That's a lot better than having it buried in a set of weights.

## The other half of the design

The other half is
[splitting the patient and the examiner into two separate prompts](/posts/why-the-patient-doesnt-know-the-answer/),
so the patient can't accidentally hand the student the answer.

---

The code is on GitHub:
[github.com/bclews/pharmacy-tutor](https://github.com/bclews/pharmacy-tutor)
