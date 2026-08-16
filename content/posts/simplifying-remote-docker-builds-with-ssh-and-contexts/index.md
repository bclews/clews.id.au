+++
title = 'Simplifying Remote Docker Builds With SSH and Contexts'
date = 2024-12-03T10:03:12+11:00
draft = false
description = "Docker's SSH integration and context management let you build containers on a remote host from your local code, without SCPing patches around."
categories = ['Tutorials', 'DevOps']
tags = ['devops', 'tutorial', 'productivity']
+++

Recently, I’ve been making a conscious effort to eliminate lazy practices from
my workflow: the kind of 'temporary' workarounds that sneak in during crunch
time and somehow become permanent habits. My latest offender? A convoluted
method for building containers on remote machines. Instead of using a branch
like any reasonable person (for reasons I can’t even justify), I’d generate a
git patch locally, SCP it to the remote machine, apply it there, and then build.
It’s the software equivalent of taking the scenic route while ignoring the
perfectly good highway right in front of me.

Eventually, it dawned on me: the
[Kubernetes command line tool](https://kubernetes.io/docs/reference/kubectl/)
(`kubectl`) has contexts that enable you to easily switch between clusters and
namespaces, so Docker probably does too. Sure enough, it does. Below are notes
on how Docker’s SSH integration and context management has simplified my remote
build process.

---

### Docker over SSH

Using Docker over SSH allows you to manage remote Docker hosts securely without
exposing their Docker API to the network. By setting the `DOCKER_HOST`
environment variable to an SSH connection string (`ssh://username@remote_host`),
you can run Docker commands locally while they execute on the remote machine.

#### Example: Run Commands on a Remote Host

```bash
export DOCKER_HOST=ssh://username@remote_host
docker ps  # Lists containers on the remote machine
```

You can also specify the `DOCKER_HOST` inline for a single command:

```bash
DOCKER_HOST=ssh://username@remote_host docker images
```

---

### Simplify Switching with Docker Contexts

While `DOCKER_HOST` works well for ad-hoc commands, Docker contexts are a better
fit when you're managing several environments. A context defines a connection
configuration (e.g., local or remote hosts) and lets you switch between them
with a single command.

#### Creating a Remote Context

```bash
docker context create my-remote-context --docker "host=ssh://username@remote_host"
```

#### Using Docker Contexts

- **List all contexts:** `docker context ls`
- **Switch to a context:** `docker context use my-remote-context`
- **Return to the default context:** `docker context use default`

With a remote context active, every Docker command you run will target the
specified remote host.

---

### Building Images Remotely

The use case I actually cared about is building images remotely using your local
source code. It helps most with resource-intensive builds, or when you're
targeting a different architecture to the one on your desk.

#### How It Works

When you run `docker build` with a remote host, Docker transfers your local
build context (the files and directories in your build directory) to the remote
machine. The Docker daemon on the remote host then builds the image.

#### Example: Building Remotely

```bash
docker build -t my-image .
```

With `DOCKER_HOST` or a Docker context pointing to the remote machine, the build
occurs remotely, and the resulting image is stored on the remote host.

#### Tips for Efficient Builds

- **Minimise the Build Context:** Use a `.dockerignore` file to exclude
  unnecessary files from the build context, reducing transfer time.
- **Check Remote Images:** Verify the build by listing images on the remote
  host:

  ```bash
  docker images
  ```

---

### Practical Benefits of Docker Over SSH

1. **Offload Resource-Intensive Builds** Free up your local machine by running
   builds on a powerful remote server. This is ideal for large datasets, complex
   Dockerfiles, or compute-heavy tasks like machine learning models.

2. **Simpler CI/CD Pipelines** Centralise builds in a remote environment to
   manage dependencies and cache image layers efficiently. With Docker contexts,
   CI/CD tools can easily target staging or production environments.

3. **Cross-Architecture Support** Need an ARM image for IoT devices? Build
   directly on a remote ARM machine using `DOCKER_HOST=ssh://...`.

4. **Secure, Compliant Builds** Keep sensitive data and build artifacts confined
   to specific locations, ensuring compliance with data sovereignty
   requirements.

---

### Before You Start

A few things that made this smoother for me:

- **Use SSH Keys for Authentication:** Set up passwordless access so Docker
  isn't stopping to prompt you mid-build.
- **Test Connectivity First:** Verify that your SSH connection works
  (`ssh username@remote_host`) before configuring Docker.
- **Limit Permissions:** Configure restricted SSH and Docker permissions on
  remote hosts to protect against unauthorised access.
- **Optimise `.dockerignore`:** Exclude large or unnecessary files from the
  build context to minimise upload times.

---

### Wrapping Up

Two environment variables and a `docker context create` replaced a patch-and-SCP
dance I'd been doing for months. The remote host never has to expose its Docker
API, and I never have to remember which machine has the current version of my
code.

So next time you’re tempted to take the scenic route with your Docker builds,
remember: the highway’s right there.
