# Blog Tagging Guidelines

This document defines the core taxonomy of tags for blog posts and provides guidance on when to use each tag.

## Core Tag Taxonomy (13 Tags)

### Programming Languages (3 tags)

**1. rust**
- **Use for:** Posts about Rust programming language, Rust ecosystem, or projects built with Rust
- **Examples:** CHIP-8 emulator series, Rust tutorials, cargo/tooling discussions

**2. python**
- **Use for:** Posts about Python programming, Python libraries, or Python-based projects
- **Examples:** Data analysis scripts, Python+Rust interop, Python tooling

**3. go**
- **Use for:** Posts about Go/Golang programming or Go-based projects
- **Examples:** Kubernetes tooling, Go concurrency patterns, Go CLI applications

### Technical Domains (5 tags)

**4. machine-learning**
- **Use for:** ML/AI content including model training, deployment, optimization, NLP, LLMs
- **Consolidates:** ml, ai, nlp, bert, core-ml, onnx, llm
- **Examples:** BERT on iPhone, LLM-powered tools, model optimization

**5. devops**
- **Use for:** Infrastructure, containers, orchestration, deployment, CI/CD, cloud platforms
- **Consolidates:** docker, kubernetes, cloud, ssh, logging, remote-builds, containers
- **Examples:** Docker builds, Kubernetes log analysis, cloud deployment guides

**6. databases**
- **Use for:** Database systems, SQL, NoSQL, spatial databases, data modeling
- **Consolidates:** postgresql, postgis, gis, database-specific topics
- **Examples:** PostgreSQL setup, database optimization, spatial queries

**7. systems-programming**
- **Use for:** Low-level programming, emulation, hardware abstraction, memory management, concurrency
- **Consolidates:** emulator, chip-8, memory-management, borrow-checker, concurrency, audio, graphics
- **Examples:** CHIP-8 emulator, memory optimization, hardware interfaces

**8. tools**
- **Use for:** Developer productivity tools, configuration management, build systems
- **Consolidates:** gnu-stow, dotfiles, homebrew, git, configuration, package managers
- **Examples:** Dotfiles management, development environment setup, CLI tools

### Content Themes (5 tags)

**9. learning**
- **Use for:** Reflective posts about learning experiences, skill development, educational journeys
- **Distinct from tutorial:** Focuses on the learning process itself, not step-by-step instructions
- **Examples:** "Lessons learned from building X", "Why I chose to learn Y", learning philosophy

**10. career**
- **Use for:** Career development, leadership, project management, engineering culture, professional growth
- **Consolidates:** project-management, leadership, engineering-culture, resilience, career-development
- **Examples:** Career reflections, managing teams, handling cancelled projects

**11. productivity**
- **Use for:** Workflow optimization, developer experience, efficiency improvements
- **Consolidates:** developer-experience
- **Examples:** Dotfiles setup, remote build workflows, time-saving techniques

**12. tutorial**
- **Use for:** Step-by-step guides, how-to posts, prescriptive instructions
- **Distinct from learning:** Focuses on teaching others to do something specific
- **Examples:** "Setting up PostgreSQL", "Managing dotfiles with Stow"

**13. algorithms**
- **Use for:** Problem-solving, data structures, algorithmic challenges, computational thinking
- **Consolidates:** advent-of-code, problem-solving, algorithmic patterns
- **Examples:** Advent of Code, algorithm analysis, optimization problems

## Tagging Guidelines

### How Many Tags?

- **Target:** 3-4 tags per post
- **Minimum:** 2 tags
- **Maximum:** 5 tags
- Prefer fewer, more meaningful tags over comprehensive tagging

### Selection Process

1. **Pick the primary language** (if applicable): rust, python, or go
2. **Pick the primary domain** (if applicable): machine-learning, devops, databases, systems-programming, or tools
3. **Pick the content type:** tutorial, learning, career, productivity, or algorithms
4. **Verify:** Do all tags add value? Remove redundant tags.

### Decision Flowchart

```
Is it primarily about a programming language?
├─ Yes → Add language tag (rust/python/go)
└─ No → Continue

What technical domain does it cover?
├─ ML/AI/NLP → machine-learning
├─ Infrastructure/containers → devops
├─ Database systems → databases
├─ Low-level/emulation → systems-programming
├─ Dev tools/config → tools
└─ None/mixed → Continue

What's the content style?
├─ Step-by-step guide → tutorial
├─ Reflection on learning → learning
├─ Career/leadership → career
├─ Workflow/efficiency → productivity
└─ Problem-solving → algorithms
```

## Examples from Existing Posts

### Tutorial Posts
- **Docker builds:** `devops, tutorial, productivity`
- **PostgreSQL setup:** `databases, tutorial, tools`
- **Dotfiles management:** `tools, tutorial, productivity`

### Learning/Reflection Posts
- **CHIP-8 lessons:** `rust, systems-programming, learning, career`
- **Advent of Code:** `python, algorithms, learning, machine-learning`
- **Cancelled projects:** `career, productivity`

### Technical Deep-Dives
- **BERT on iPhone:** `machine-learning, tutorial, python`
- **Kubernetes logs:** `go, devops, machine-learning`
- **CHIP-8 Day 1:** `rust, systems-programming, learning, tutorial`

## Migration Notes

This taxonomy consolidates **47 previous tags down to 13 core tags**:

### Major Consolidations
- **8 ML-related tags** → `machine-learning`
- **7 DevOps tags** → `devops`
- **4 CHIP-8/emulator tags** → `systems-programming`
- **5 tool-specific tags** → `tools`
- **5 career/soft-skill tags** → `career`

### Rationale
- **Single-use tags eliminated:** 32 tags (68%) appeared only once
- **Improved discoverability:** Broader tags help readers find related content
- **Future-proof:** Taxonomy scales as content grows
- **Semantic coherence:** Tags represent meaningful categories, not implementation details

## Maintenance

- **Review quarterly:** Are new tags needed? Are existing tags still relevant?
- **Consistency:** When in doubt, check existing posts with similar content
- **Document exceptions:** If a post needs >5 tags or creates a new tag, document why
- **User feedback:** Monitor which tags readers use to navigate the site

---

# Blog Category Guidelines

Categories provide high-level organization for blog content. Unlike tags (which describe specific technologies or themes), categories represent broad content types.

## Core Categories (5 Categories)

**1. Software Engineering**
- **Use for:** Technical deep-dives, systems programming, architecture discussions, engineering practices
- **Examples:** CHIP-8 emulator series, Kubernetes log analyser, technical implementation posts
- **Replaces:** "Development" (merged into this category)

**2. Tutorials**
- **Use for:** Step-by-step guides, how-to posts, setup instructions
- **Examples:** PostgreSQL setup, Docker remote builds, dotfiles management
- **Note:** Pairs well with the `tutorial` tag

**3. DevOps**
- **Use for:** Infrastructure, deployment, containerization, cloud platforms, CI/CD
- **Examples:** Docker contexts, Kubernetes tooling
- **Note:** Can be combined with "Software Engineering" or "Tutorials"

**4. Career and Reflection**
- **Use for:** Career insights, professional development, retrospectives, leadership
- **Examples:** Cancelled projects, CHIP-8 lessons learned, Advent of Code reflections
- **Note:** Posts about learning philosophy, not step-by-step learning

**5. Software Engineering** (already listed above)

## Category Guidelines

### How Many Categories?

- **Target:** 1-2 categories per post
- **Minimum:** 1 category
- **Maximum:** 2 categories
- Most posts should have just 1 category; only use 2 when a post genuinely spans two areas

### Selection Process

1. **What's the primary purpose?**
   - Teaching a skill → Tutorials
   - Sharing technical implementation → Software Engineering
   - Infrastructure/deployment focus → DevOps
   - Career/reflection → Career and Reflection

2. **Does it need a second category?**
   - Only add if the post genuinely serves two purposes
   - Example: A Docker tutorial with DevOps focus → `Tutorials, DevOps`

3. **Verify:** Does the second category add value or is it redundant?

## Category Examples

### Single Category Posts
- **CHIP-8 Day 1** - `Software Engineering` (technical implementation)
- **Cancelled Projects** - `Career and Reflection` (career insights)
- **PostgreSQL Setup** - `Tutorials` (pure how-to guide)
- **Dotfiles** - `Tutorials` (setup guide)
- **BERT on iPhone** - `Tutorials` (technical tutorial)

### Dual Category Posts
- **Docker Remote Builds** - `Tutorials, DevOps` (how-to guide for infrastructure)
- **Kubernetes Logs** - `Software Engineering, DevOps` (technical project with DevOps focus)
- **CHIP-8 Lessons** - `Software Engineering, Career and Reflection` (technical + career insights)
- **Advent of Code** - `Software Engineering, Career and Reflection` (technical challenges + reflection)

## Category vs Tag Comparison

| Aspect | Categories | Tags |
|--------|-----------|------|
| **Purpose** | Content type/organization | Specific topics/technologies |
| **Count** | 5 categories | 13 tags |
| **Per Post** | 1-2 categories | 3-4 tags |
| **Granularity** | Broad | Specific |
| **Example** | "Tutorials" | "rust", "systems-programming", "tutorial" |

## Migration Notes

Categories were consolidated from **8 to 5**:

### Eliminated Categories
- **"Development"** → merged into "Software Engineering"
- **"Learning"** → removed (redundant with `learning` tag)
- **"Machine Learning"** → removed (use `machine-learning` tag instead)

### Rationale
- **"Development" was too generic** - "Software Engineering" is more descriptive
- **"Learning" was redundant** - The `learning` tag serves this purpose
- **"Machine Learning" was single-use** - Better as a tag than category
- **Simpler is better** - 5 categories are easier to navigate than 8

## Final Category Distribution

After consolidation, posts are distributed as:

- **Software Engineering:** 8 posts (67%)
- **Tutorials:** 5 posts (42%)
- **DevOps:** 2 posts (17%)
- **Career and Reflection:** 3 posts (25%)

(Percentages add to >100% because some posts have 2 categories)

---

**Last updated:** 2025-12-02
**Version:** 1.0
