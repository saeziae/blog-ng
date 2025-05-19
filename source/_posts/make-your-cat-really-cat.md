---
title: make your cat really cat
date: 2025-05-19T03:00+2:00
tags: [linux]
---

it's a **cat** command, innit?

<!--more-->

fetch some meowing sound from the web and set it the bell sound of the terminal

taking kitty as example:

```
# .config/kitty/kitty.conf
bell_path ${HOME}/.config/kitty/nya.ogg
```

wrap cat command in the shell rc:

```bash
# .bashrc / .zshrc                         
alias cat='printf "\a";cat'
```
