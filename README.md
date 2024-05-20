This repository contains the source needed to build my personal website hosted on [clews.id.au](https://clews.id.au). The site is built with the [Hugo](https://gohugo.io/) static site generator and styled with [SASS](https://sass-lang.com) for a clean and maintainable design.

# Getting Started

We will start by installing the following dependencies onto MacOS:

- [Hugo](https://gohugo.io/getting-started/installing/)
- [Node.js](https://nodejs.org/) (for SASS processing, if needed)
- [SASS](https://sass-lang.com)

## Install Hugo

1. **Install Homebrew** (if not already installed):

   Homebrew is a package manager for macOS that simplifies the installation of software. Open Terminal and run:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Hugo** using Homebrew:

   Once Homebrew is installed, you can install Hugo by running:

   ```bash
   brew install hugo
   ```

3. **Verify the Installation**:

   Check that Hugo is installed correctly by running:

   ```bash
   hugo version
   ```

   This should display the version of Hugo installed.

## Install Node.js

1. **Install Homebrew** (if not already installed):

   If you already installed Homebrew in the steps above, you can skip this step. Otherwise, open Terminal and run:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js** using Homebrew:

   Once Homebrew is installed, you can install Node.js by running:

   ```bash
   brew install node
   ```

3. **Verify the Installation**:

   Check that Node.js and npm (Node Package Manager) are installed correctly by running:

   ```bash
   node -v
   npm -v
   ```

   This should display the versions of Node.js and npm installed.

## Install Dart Sass

1. **Install Dart Sass** using Homebrew:

   Open Terminal and run:

   ```bash
   brew install sass/sass/sass
   ```

2. **Verify the Installation**:

   Check that Dart Sass is installed correctly by running:

   ```bash
   sass --version
   ```

   This should display the version of Dart Sass installed.

## Finally, clone the blog!

Clone the repository:

```bash
git clone https://github.com/bclews/clews.id.au.git
cd clews.id.au
```

# Usage

This project includes a `Makefile` to simplify common tasks:

- `make build`: Build the Hugo site with garbage collection and minification.
- `make serve`: Serve the site locally with live reload.
- `make css`: Process SCSS to CSS.
- `make clean`: Clean the `public` and `resources/_gen` directories.
- `make watch-scss`: Watch SCSS files for changes and rebuild CSS.
- `make start`: Alias for `make serve`.

# License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

# Contact

For any inquiries, please reach out via [email](mailto:tics.slivers0h@icloud.com).
