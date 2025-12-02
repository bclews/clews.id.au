+++
title = 'Managing Dotfiles With Gnu Stow'
date = 2024-11-06T13:53:32+11:00
draft = false
description = "Simplify dotfile management using GNU Stow for clean symlink-based configuration. Organize scattered configs into one versioned directory without custom aliases or complex Git workflows."
categories = ['Tutorials']
tags = ['tools', 'tutorial', 'productivity']
+++

Dotfiles can be a pain to manage when they’re scattered across your home
directory. In the past, I used a bare Git repo approach based on
[StreakyCobra’s setup on Hacker News](https://news.ycombinator.com/item?id=11070797).
It worked well but had its limitations - like needing a custom alias for Git
commands (which I’d often forget) and some tricky troubleshooting when configs
broke.

Recently, though, I switched to using
[GNU Stow](https://www.gnu.org/software/stow/) after reading
[Brandon Invergo’s guide](https://brandon.invergo.net/news/2012-05-26-using-gnu-stow-to-manage-your-dotfiles.html).
Stow is a simple symlink manager originally for managing software installed from
source. The beauty of Stow is that it keeps all dotfiles neatly organized in one
directory and links them to where they need to be, which keeps your home
directory clean and makes version control easier.

I’ve set up my own
[dotfiles repository on GitHub](https://github.com/bclews/dotfiles) using this
method. With Stow, you can simply clone the repo, run `stow` on the config
directories you want to use, and you’re all set with symlinks pointing to the
correct locations. This method is clean, straightforward, and doesn’t require
remembering custom commands.

For anyone tired of dotfile chaos, I highly recommend giving GNU Stow a shot!
