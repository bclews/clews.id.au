+++
title = 'Configuring MacOS Terminal'
subtitle = 'Enhance Your Terminal Experience with Customizations and Tweaks'
date = 2024-05-18T16:31:31+10:00
tags = ['terminal']
draft = false
+++


I recently had to configure a new macOS terminal. This posts documents that process..

## What are we installing?

The following components will be installed:

- [solarized](https://ethanschoonover.com/solarized/) is a colour scheme with low contrast, and reduced brightness that enhances readability and reduces eye strain.
- [homebrew](https://brew.sh/), a package manager for macOS.
- [zsh](https://formulae.brew.sh/formula/zsh#default), an alternative shell used instead of bash.
- [oh-my-zsh](https://ohmyz.sh/), a framework for managing your zsh configuration.

## How do we install these components?

### Solarized

1. Clone the [Solarized](https://github.com/altercation/solarized) repository somewhere on your computer.
2. Follow the documentation to [Import and export Terminal profiles on Mac](https://support.apple.com/en-au/guide/terminal/trml4299c696/mac)

### Homebrew

Installing Homebrew is straightforward - run the following command to download and install Homebrew:

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

### zsh

Edit: I installed zsh on macOS Mojave using homebrew (outlined below), but [starting with macOS Catalina](https://support.apple.com/en-us/HT208050), it appears that zsh will be the default shell.

Install via homebrew:

```bash
brew install zsh
```

### oh-my-zsh

Install via curl:

```bash
sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

The installation script should set zsh to be your default shell, but if it doesn't you can do it manually:

```bash
chsh -s $(which zsh)
```
