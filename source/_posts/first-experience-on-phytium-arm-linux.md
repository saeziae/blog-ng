---
title: 飞腾 ARM PC Linux 踩坑记
lang: zh-Hans
date: 2022-10-05 16:50:00
tags: [linux, ARM]
category: tech
---
最近组装了一台[飞腾](https://www.phytium.com.cn/)处理器的电脑，因笔记本送修，也被动把飞腾作为主力机使用了一段时间，在使用过程中踩了不少坑，大概零零散散记录在这里。啊对了，系统是 Archlinux ARM.

{% asset_img phytiun_photo.jpg %}

<!--more-->

## 飞腾处理器

虽然飞腾处理器能直接用主线 Linux 内核点亮，但你很快会发现板载网卡无了，飞腾集成的是群辉的 stmmac，大概是缺少 ACPI 方面的支持。

带补丁的 PKGBUILD 请自取：<https://github.com/saeziae/pkgbuild-linux-phytium>，想用二进制包也可以用[山前源](https://repo.saezi.ae/readme.html)

还有个问题是板载声卡，还没搞定，不过可以直接用显卡的 HDMI 输出。

## RIME 输入法

我使用的是 `fcitx5-rime`，当我发现 ALARM 的源中没有 `fcitx5-rime` 尚未意识到问题的严重性，手动 build 时才发现，ALARM 中整个 RIME 相关的全都炸了，librime 还停留在 1.5 （两年前的版本）。究其原因大概是一些循环依赖导致需要手动 bootstrap，我也在论坛中提到了[解决方案](https://archlinuxarm.org/forum/viewtopic.php?f=15&t=16159#p69999)，可以参照着自己打包。

如果想直接用打好的包，可以用[山前源](https://repo.saezi.ae/readme.html)，指定安装 `saeziae/librime` 后再安装 `fcitx5-rime`.

{% asset_img fcitx5-rime.jpg %}

## Minecraft

Minecraft 官方的起动器并没有 ARM 架构的二进制分发，我这里使用 [HMCL](https://hmcl.huangyuhui.net/) 起动器。

当然，首先你的系统里要有 Java 环境。

直接运行 HMCL，自动下载 Minecraft 本体然后运行，果不其然，会报错，大概就是和 LWJGL 相关，可能有 x86 之类的关键词，猜测需要解决 LWJGL 的原生库问题。

从 <https://www.lwjgl.org/browse/stable/linux/arm64> 下载 `libglfw.so` `liblwjgl_opengl.so` `liblwjgl_stb.so` `liblwjgl.so` `libopenal.so` 五个文件放到 `.minecraft/natives` 里面，然后在 HMCL  的设置中找到 「本地库路径」，选择自定义，填入 `natives` 目录的路径。

{% asset_img minecraft.png %}

## Discord

Discord 虽然是 Electron 的，但是包含了原生的模块，我试图绕过这些模块启动，但是失败了。目前的解决方案是 [ArmCord](https://github.com/ArmCord/ArmCord).