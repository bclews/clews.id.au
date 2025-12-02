# Code Review: Hugo Blog - clews.id.au

**Review Date:** November 13, 2025
**Reviewed By:** Senior Software Engineer
**Validation Review:** November 14, 2025
**Overall Assessment: 7.0/10**

This is a functional, straightforward Hugo blog with clean content organization and automated deployment. There are several maintainability issues and configuration errors that should be addressed. The codebase is simple enough that these issues can be resolved quickly.

**Note:** This review has been validated and corrected. One false positive has been removed, severity classifications have been adjusted, and one critical structural issue has been added.

---

## Critical Issues 🔴

### 1. **Configuration References Non-Existent Files**
**Location:** `hugo.toml:87`

```toml
additionalScripts = ['js/custom.js', 'js/custom-2.js']
```

These files don't exist in the `assets/` directory. This causes the `ignoreErrors` configuration on line 12-14 to suppress what should be a build failure.

**Impact:** Silent failures, confusing for future maintainers
**Fix:** Remove the configuration or create the files

---

## High Priority Issues 🟡

### 2. **Git Submodule Uses SSH URL**
**Location:** `.gitmodules:3`

```
url = git@github.com:hugo-sid/hugo-blog-awesome.git
```

**Problems:**
- Won't work for contributors without GitHub SSH configured
- Not portable across different environments
- Currently works in GitHub Actions only because the workflow uses `submodules: recursive` which automatically converts to HTTPS

**Fix:**
```
url = https://github.com/hugo-sid/hugo-blog-awesome.git
```

**Note:** While this doesn't break the current deployment, it creates portability issues for local development and contributions.

---

### 3. **Makefile Creates Incorrect Post Structure**
**Location:** `Makefile:54`

```makefile
$(HUGO_CMD) new posts/$(shell echo "$(title)" | tr '[:upper:] ' '[:lower:]-').md
```

**Problem:** The `make new` command creates posts as single files (`posts/slug.md`), but all existing posts use the page bundle structure (`posts/slug/index.md`). This creates structural inconsistency.

**Impact:**
- New posts won't match existing architecture
- Harder to co-locate images and resources with posts
- Breaks the documented page bundle pattern

**Fix:**
```makefile
$(HUGO_CMD) new posts/$(shell echo "$(title)" | tr '[:upper:] ' '[:lower:]-')/index.md
```

---

### 4. **Theme Version Not Pinned**
**Location:** `.gitmodules`

Your theme tracks the `main` branch, which means updates happen automatically and could break your site without warning.

**Current risk:** The theme is at commit `5056c6e`, but could update at any time

**Fix:**
```bash
cd themes/hugo-blog-awesome
git checkout <specific-commit-or-tag>
cd ../..
git add themes/hugo-blog-awesome
git commit -m "Pin theme to specific version"
```

Then update `.gitmodules` to remove `branch = main`

---

### 5. **Incomplete Prettier Setup**
You have `.prettierrc.json` but no `package.json`, no Node.js dependencies, and no scripts to run it.

**Options:**
1. Complete the setup with package.json and a format script
2. Remove .prettierrc.json if not using it
3. Add Prettier to CI if you want enforced formatting

---

### 6. **No Hugo Version Pinning for Local Development**
**Location:** `Makefile:2`

```makefile
HUGO_CMD = hugo
```

Different Hugo versions can produce different output. Your CI uses "latest" which is also problematic.

**Fix:** Pin to a specific version in CI:
```yaml
hugo-version: "0.152.2"  # Instead of "latest"
```

Add to README requirements: "Hugo v0.152.2 or compatible"

---

## Medium Priority Issues 🟠

### 7. **Unsafe HTML Rendering Enabled**
**Location:** `hugo.toml:24`

```toml
[markup.goldmark.renderer]
unsafe = true
```

**Security Consideration:** Allows arbitrary HTML/JavaScript in markdown content. For a single-author personal blog with no external contributions, this presents minimal risk. However, if you ever accept external contributions or use untrusted content sources, this becomes a significant XSS vulnerability.

**Recommendation:**
- Current risk: **Low** (single author, trusted content)
- Future risk: **High** (if accepting external contributions)
- Consider disabling unless specifically needed
- If required, document the reason and use Hugo shortcodes where possible for dynamic content

---

### 8. **Makefile Help Text Could Be Clearer**
The Makefile's `make new` command delegates to `hugo new`, which uses the archetype that sets `draft = true` by default. However, the help text doesn't indicate that new posts are created as drafts.

**Current behavior:**
- `make new title="Post Title"` calls `hugo new posts/...md`
- Hugo applies `archetypes/default.md` which sets `draft = true`
- No indication to user that the post is a draft

**Improvement:** Update Makefile help text to clarify:
```makefile
@echo "  make new        - Create a new draft post (usage: make new title='Post Title')"
```

---

### 9. **Over-Complicated Language Configuration**
**Location:** `hugo.toml:50-113`

You have extensive `Languages.en-gb` configuration for a single-language blog. This adds complexity without benefit.

**Simplification opportunity:** Move params directly to root level since there's no i18n.

---

### 10. **Empty Project Directories**
These directories exist but are empty:
- `layouts/`
- `static/`
- `data/`
- `i18n/`

**Options:**
- Add `.gitkeep` files with README explaining their purpose
- Remove them until needed
- Add examples/documentation

---

### 11. **Missing Development Documentation**
**No information about:**
- Hugo version requirements (local vs CI mismatch potential)
- How to update the theme safely
- What happens if build fails
- Local development workflow beyond basic commands

**Fix:** Expand README or create `CONTRIBUTING.md`

---

### 12. **No Pre-Deploy Validation**
**Location:** `.github/workflows/hugo.yaml`

The workflow builds and deploys without validation:
- No broken link checking
- No HTML validation
- No lighthouse/accessibility checks
- No spell checking

**Enhancement opportunity:** Add a validation job before deploy

---

## Low Priority / Best Practices 🔵

### 13. **Missing SEO Optimizations**
- No `robots.txt` configuration
- Limited OpenGraph metadata
- No structured data (JSON-LD)
- RSS feed uses summary (good) but could be configurable per-post

---

### 14. **No Staging Environment**
Everything merges directly to production via main branch.

**Suggestion:** Consider a preview deployment for branches

---

### 15. **Makefile Could Be More Robust**
**Current issues:**
- No validation that Hugo is installed
- No check for required Hugo version
- `make new` doesn't verify if post already exists

**Example improvement:**
```makefile
.PHONY: check-hugo
check-hugo:
    @command -v $(HUGO_CMD) >/dev/null 2>&1 || { echo "Hugo is not installed"; exit 1; }
    @$(HUGO_CMD) version | grep -q "v0.1[0-9][0-9]" || echo "Warning: Hugo version may be incompatible"

build: check-hugo clean
    # ... rest of build
```

---

### 16. **Post Content Organization**
**Observation:** 8 posts, only 1 image total across all posts

**Consideration:** If you plan to use more images, consider:
- Image optimisation pipeline
- Responsive image generation
- WebP conversion

---

## Additional Issues Identified During Validation 🔍

### 17. **README/Submodule URL Inconsistency**
**Location:** `README.md:34` and `.gitmodules:3`

The README suggests using HTTPS for the submodule:
```bash
git submodule add https://github.com/hugo-sid/hugo-blog-awesome themes/hugo-blog-awesome
```

But the actual `.gitmodules` file uses SSH:
```
url = git@github.com:hugo-sid/hugo-blog-awesome.git
```

**Impact:** Confusing for new contributors following the README
**Fix:** Update README to match the actual submodule URL (or vice versa after fixing Issue #2)

---

### 18. **No Dependabot Configuration**
**Location:** Missing `.github/dependabot.yml`

GitHub Actions use versioned actions (@v2, @v3, @v4) but there's no automated dependency update mechanism.

**Benefit:** Automated PR creation for action updates and security patches
**Suggestion:** Add `.github/dependabot.yml` to monitor GitHub Actions

---

### 19. **Missing CNAME File in Static Directory**
**Location:** `static/` directory

The site uses a custom domain (clews.id.au) but there's no CNAME file in the `static/` directory. While GitHub Pages may have this configured at the repository level, including it in `static/` is best practice for Hugo sites.

**Recommendation:** Add `static/CNAME` with content:
```
clews.id.au
```

This ensures the CNAME is always included in deployments.

---

## Positive Aspects ✅

1. **Clean page bundle structure** - Each post is self-contained
2. **Automated deployment** - GitHub Actions workflow is simple and effective
3. **Proper gitignore** - Generated files correctly excluded
4. **Good Makefile usage** - Common tasks are automated
5. **Theme as submodule** - Proper separation of concerns
6. **Minimal customization** - Easier to maintain and update
7. **Clear content organization** - Posts are easy to find and manage
8. **Commit messages follow conventions** - Good use of conventional commits

---

## Recommended Action Plan

### Immediate (This Week)
1. **Fix Makefile post creation structure** - Update to create page bundles (`posts/slug/index.md`)
2. **Remove or create the `additionalScripts` files** - Clean up hugo.toml configuration
3. **Change git submodule URL to HTTPS** - Improve portability for contributors
4. **Pin theme to specific commit** - Prevent unexpected breaking changes
5. **Update README submodule instructions** - Match actual .gitmodules URL

### Short Term (This Month)
6. **Pin Hugo version in CI** - Remove "latest", use specific version like "0.152.2"
7. **Complete Prettier setup or remove .prettierrc.json** - Eliminate incomplete tooling
8. **Add Hugo version to README requirements** - Document build prerequisites
9. **Clean up or document empty directories** - Add .gitkeep or remove unused directories
10. **Review unsafe HTML setting** - Document reason for enabling or consider disabling

### Long Term (As Needed)
11. Simplify language configuration (single-language blog doesn't need extensive i18n)
12. Add pre-deploy validation (link checking, HTML validation)
13. Consider staging environment for preview deployments
14. Enhance Makefile robustness (version checking, validation)
15. Improve SEO configuration (robots.txt, structured data)
16. Add Dependabot for automated dependency updates

---

## Security Assessment

**Risk Level: Low**

- **Unsafe HTML rendering** - Currently low risk for single-author blog, but should be reviewed if accepting external contributions
- No external dependencies (except theme submodule)
- No user input or dynamic content
- Static site is inherently secure
- GitHub Actions uses reasonable permissions
- Theme is from trusted source but updates should be reviewed

**Recommendation:** Current security posture is appropriate for a personal blog. Monitor and review if the contribution model changes.

---

## Maintainability Score: 7/10

**Strengths:**
- Simple, understandable structure
- Automated deployment
- Minimal custom code

**Weaknesses:**
- Configuration errors
- No version pinning strategy
- Incomplete tooling setup
- Limited documentation

This codebase is maintainable but has rough edges that will cause friction over time. The issues are fixable with a few hours of work.
