# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Hugo (static site generator) using the hugo-blog-awesome theme. The site is deployed to GitHub Pages via GitHub Actions on every push to the main branch.

Site URL: https://clews.id.au

## Key Commands

All development commands are managed through a Makefile:

```bash
make serve          # Local development server at http://localhost:1313
make drafts         # Serve with draft posts visible
make build          # Build static site to public/ directory
make clean          # Remove public/ directory
make new title="Post Title"  # Create new blog post
```

Hugo commands can also be used directly:
```bash
hugo serve --watch --bind 0.0.0.0 --port 1313  # Serve locally
hugo --baseURL="https://clews.id.au" --minify  # Build for production
```

## Project Structure

```
├── content/             # All blog content
│   ├── posts/          # Blog posts (main content area)
│   │   └── post-name/  # Each post is a directory with index.md
│   └── about.md        # About page
├── themes/             # Hugo theme (git submodule)
│   └── hugo-blog-awesome/
├── assets/             # Custom assets (avatar.jpg)
├── layouts/            # Custom layout overrides
│   ├── _default/       # Default page templates
│   ├── about/          # About page customizations
│   ├── partials/       # Reusable template components
│   └── index.html      # Homepage template
├── static/             # Static files copied directly to public/
│   ├── CNAME           # GitHub Pages custom domain configuration
│   └── robots.txt      # Search engine crawler instructions
├── public/             # Generated site (ignored by git)
├── hugo.toml           # Hugo configuration
└── Makefile            # Development commands
```

## Configuration

The site is configured in `hugo.toml`:
- Language: en-gb
- Theme: hugo-blog-awesome (in themes/ directory as submodule)
- Main sections: posts
- Navigation: Home, Posts, About
- Social links: GitHub, BlueSky, LinkedIn, RSS
- Taxonomies: Tags and categories enabled for content organization
- SEO: Enhanced sitemap configuration, structured metadata, descriptive meta tags
- Accessibility: Custom accessibility scripts included
- Markdown features: Table of contents (H2-H4), syntax highlighting, unsafe HTML enabled
- Author metadata: Job title, employer, location, social profiles

## Content Management

### Creating New Posts

Posts are created as directories under `content/posts/` with an `index.md` file:

```bash
make new title="My Post Title"
# Creates: content/posts/my-post-title/index.md
```

Post front matter (TOML format):
```toml
+++
title = 'Post Title'
date = 2024-01-01T10:00:00+11:00
draft = false
+++
```

Images and assets for a post go in the same directory as the post's `index.md`.

### Post Organization

- Each post is a "page bundle" (directory with index.md)
- This allows co-locating post assets (images, etc.) with the post content
- Set `draft = true` in front matter for work-in-progress posts

## Deployment

Deployment is fully automated via GitHub Actions:
- Workflow: `.github/workflows/hugo.yaml`
- Triggers: Push to main branch or manual workflow dispatch
- Process: Checks out code with submodules, builds with Hugo (extended, minified), deploys to GitHub Pages
- No manual deployment steps required

## Theme

The site uses hugo-blog-awesome theme as a git submodule. To update the theme:

```bash
git submodule update --remote themes/hugo-blog-awesome
```

Custom layouts in the `layouts/` directory override theme defaults:
- `layouts/index.html` - Custom homepage template
- `layouts/_default/` - Default page templates
- `layouts/about/` - About page customizations
- `layouts/partials/` - Reusable template components (head, footer, etc.)

## Local Development Workflow

1. Start development server: `make serve`
2. Create new post: `make new title="Post Title"`
3. Edit content in `content/posts/post-title/index.md`
4. Preview at http://localhost:1313 (auto-reloads on changes)
5. Set `draft = false` when ready to publish
6. Commit and push to main branch to deploy

## TIL (Today I Learned) Section

The site includes a TIL section for quick, informal learning notes following Simon Willison's TIL philosophy.

### Creating TILs

```bash
make til title="My Learning"
# Creates: content/til/my-learning/index.md
```

### TIL vs Posts

- **Posts**: Long-form articles, tutorials, deep dives (typically 5+ min read)
- **TILs**: Quick learnings, gotchas, small discoveries (typically < 5 min read)

### Structure

TILs use the same page bundle structure as posts and share the same taxonomies (tags/categories). They appear:
- On homepage in separate "Today I Learned" section
- At `/til/` for all TILs
- On tag/category pages alongside posts
- Styled identically to posts

## Notes

- Hugo extended version is required (for SCSS processing)
- The site uses English (GB) locale (en-gb)
- Table of contents can be enabled per-post or globally via hugo.toml
- Syntax highlighting uses Chroma with custom CSS classes
- The theme expects an avatar image at `assets/avatar.jpg`
- Custom domain configured via `static/CNAME` file
- SEO optimizations include sitemap, robots.txt, and structured metadata
- Accessibility enhancements via custom JavaScript in static assets
- **Security Note**: `unsafe = true` is enabled in markdown configuration to allow HTML. This is acceptable for single-author content but should be reviewed if accepting external contributions.
