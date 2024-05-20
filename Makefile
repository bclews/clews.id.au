# Define variables
HUGO_CMD = hugo
THEME_DIR = themes/minimalist
ASSETS_DIR = $(THEME_DIR)/assets
SCSS_DIR = $(ASSETS_DIR)/scss
CSS_OUTPUT_DIR = static/css
CSS_FILE = main.css

# Commands
all: build

build:
	@echo "Building Hugo site..."
	$(HUGO_CMD) --gc --minify

serve:
	@echo "Serving Hugo site..."
	$(HUGO_CMD) serve

css:
	@echo "Processing SCSS to CSS..."
	hugo server -D &  # Start Hugo server in the background
	@echo "Compiling SCSS..."
	hugo --gc --minify

clean:
	@echo "Cleaning up..."
	rm -rf public
	rm -rf resources/_gen

# Watch for changes in SCSS files and rebuild CSS
watch-scss:
	@echo "Watching SCSS files for changes..."
	hugo server --disableFastRender --watch

# Alias for convenience
start: serve

.PHONY: all build serve css clean watch-scss start
