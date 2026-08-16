+++
title = 'Managing Dotfiles With Gnu Stow'
date = 2024-11-06T13:53:32+11:00
draft = false
description = "I swapped the bare-Git-repo approach to dotfiles for GNU Stow, which keeps everything in one versioned directory and symlinks it into place. No custom aliases to remember."
categories = ['Tutorials']
tags = ['tools', 'tutorial', 'productivity']
+++

Dotfiles can be a pain to manage when they’re scattered across your home
directory. In the past, I used a bare Git repo approach based on
[StreakyCobra’s setup on Hacker News](https://news.ycombinator.com/item?id=11070797).
It worked well but had its limitations, like needing a custom alias for Git
commands (which I’d often forget) and some tricky troubleshooting when configs
broke.

Recently, though, I switched to using
[GNU Stow](https://www.gnu.org/software/stow/) after reading
[Brandon Invergo’s guide](https://brandon.invergo.net/news/2012-05-26-using-gnu-stow-to-manage-your-dotfiles.html).
Stow is a simple symlink manager originally for managing software installed from
source. It keeps all your dotfiles in one directory and links them to where they
need to be, so your home directory stays tidy and the whole lot is easy to
version.

I’ve set up my own
[dotfiles repository on GitHub](https://github.com/bclews/dotfiles) using this
method. With Stow, you can simply clone the repo, run `stow` on the config
directories you want to use, and you’re all set with symlinks pointing to the
correct locations. No custom commands to remember, which is what finally sold me
on it after years of forgetting the Git alias.
