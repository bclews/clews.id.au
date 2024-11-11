This is the source code for my blog, located at [clews.id.au](https://clews.id.au), built using [Hugo](https://gohugo.io/) and the [Hugo Blog Awesome theme](https://github.com/hugo-sid/hugo-blog-awesome). The blog is configured with a Makefile to streamline tasks such as building, serving locally, and creating new posts. Deployment is handled by a GitHub Actions Workflow that builds and publishes the site on each new commit.

## Requirements

- [Hugo](https://gohugo.io/getting-started/installing/) (extended version recommended)
- Git for managing posts and pushing updates to the repository

## Makefile Commands

The Makefile provides commands for building, serving, cleaning, and creating new posts. Here’s a quick overview of the available commands:

| Command         | Description                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------------|
| `make build`    | Builds the static site into the `public` directory with minification.                           |
| `make serve`    | Serves the site locally at `http://localhost:1313` (auto-reloads with changes).                 |
| `make drafts`   | Serves the site locally with draft posts included.                                              |
| `make clean`    | Cleans the `public` directory, removing previously generated files.                             |
| `make new`      | Creates a new post. Usage: `make new title="Post Title"`.                                       |
| `make help`     | Displays a list of available Makefile commands.                                                 |

## Getting Started

1. **Clone the repository** and navigate to the project directory:

   ```bash
   git clone https://github.com/bclews/clews.id.au.git
   cd clews.id.au
   ```

2. **Install the theme**:
   Make sure to add the theme as a submodule (if not already included) by running:

   ```bash
   git submodule add https://github.com/hugo-sid/hugo-blog-awesome themes/hugo-blog-awesome
   ```

3. **Build the Site**:
   To build the site, run:

   ```bash
   make build
   ```

   The static files will be generated in the `public` directory.

4. **Serve the Site Locally**:
   For development, you can serve the site locally with:

   ```bash
   make serve
   ```

   Access the site at `http://localhost:1313`. If you want to view draft posts, use:

   ```bash
   make drafts
   ```

5. **Create a New Post**:
   You can create a new post with the `make new` command:

   ```bash
   make new title="My New Blog Post"
   ```

   This will generate a new markdown file in the `content/posts` directory.

## Deployment

Deployment is handled by a GitHub Actions Workflow that builds and publishes the blog automatically for each new commit to the repository. Make sure to commit and push your changes to trigger the GitHub Actions Workflow.

## License

This project is licensed under [MIT License](LICENSE). The theme, [Hugo Blog Awesome](https://github.com/hugo-sid/hugo-blog-awesome), may have its own license.
