---
title: Linux用Lutris運行紅色警戒2（CnCNet/心靈終結）
lang: zh-Hant
date: 2024-03-01T19:20:01
tags: [linux, gaming]
---

本文講述使用 Lutris 在 Linux 上遊玩紅色警戒 2 心靈終結 mod。

<!--more-->

首先你需要有 `winetricks`，確定一個目錄來放 wine 之 prefix，譬如 `~/Games/MO/`

初始化 Wine 目錄：

```bash
WINEPREFIX=~/Games/MO/ WINEARCH=win32  winetricks xna40
```

從 <https://mentalomega.com/index.php?page=download> 按照指引獲得遊戲，你需要自備一份的原版尤里。將遊戲解包到某個目錄。

打開 Lutris，在側邊欄的 Wine 右邊點擊版本管理，安裝一個 7.\* 的版本，如 lutris-7.2-2。

在 Lutris 裏選擇頂部的「+」新增遊戲，選擇 Add locally installed game。

輸入遊戲名字，Runner 選擇 Wine。

選項卡切換到 Runner options，Wine version 選擇 Proton 7.0 或 lutris-7.\*，啓用 DXVK，VKD3D。

選項卡切換到 Game options，Executable 選擇 `遊戲目錄/Resources/clientxna.exe`，Working directory 選擇遊戲目錄，Wine prefix 選擇上面的`~/Games/MO/`，Prefix architecture 選擇 32 位。

現在應該可以在 Lutris 遊戲頁上選擇 MO 啓動。
