# Variables
HUGO_CMD = hugo
HUGO_PORT = 1313
PUBLIC_DIR = public
BASE_URL = "https://clews.id.au"
DRAFTS_FLAG =

# Default target
.DEFAULT_GOAL := help

# Help target - lists all available commands
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make build      - Build the static site"
	@echo "  make serve      - Serve the site locally"
	@echo "  make drafts     - Serve the site including draft posts"
	@echo "  make clean      - Remove generated files"
	@echo "  make new        - Create a new post (usage: make new title='Post Title')"
	@echo "  make deploy     - Deploy to production (requires proper Hugo configuration)"

# Clean public directory
.PHONY: clean
clean:
	@echo "Cleaning the public directory..."
	rm -rf $(PUBLIC_DIR)

# Build the static site
.PHONY: build
build: clean
	@echo "Building the site..."
	$(HUGO_CMD) --baseURL=$(BASE_URL) --minify

# Serve the site locally
.PHONY: serve
serve:
	@echo "Serving the site locally on http://localhost:$(HUGO_PORT)"
	$(HUGO_CMD) serve --watch --bind 0.0.0.0 --port $(HUGO_PORT) $(DRAFTS_FLAG)

# Serve site with drafts enabled
.PHONY: drafts
drafts:
	@echo "Serving site with drafts enabled on http://localhost:$(HUGO_PORT)"
	$(MAKE) serve DRAFTS_FLAG="--buildDrafts"

# Create a new post
.PHONY: new
new:
	@if [ -z "$(title)" ]; then \
		echo "Please provide a title: make new title='My New Post'"; \
		exit 1; \
	fi
	@echo "Creating a new post titled: $(title)"
	$(HUGO_CMD) new posts/$(shell echo "$(title)" | tr '[:upper:] ' '[:lower:]-').md

