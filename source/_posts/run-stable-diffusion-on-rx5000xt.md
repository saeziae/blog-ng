---
title: 在 RX 5500XT 上运行 Stable Diffusion
lang: zh-Hans
date: 2023-03-05 15:28:45
tags: [linux, AI]
---

当今的计算机技术和人工智能应用正以惊人的速度发展着。近年来，越来越多的人开始尝试使用 GPU 和 AI 进行创作，其中最受欢迎的之一就是 Stable Diffusion. 如果你正在试图自建 Stable Diffusion，并恰巧（很不幸地）拥有一张 RX 5000 系列的 AMD 显卡，那么你一定不能错过这篇文章，因为今天我将手把手介绍如何在 RX 5500XT 显卡上运行 Stable Diffusion，并且为你展示如何使用这种技术来创造出惊人的艺术作品。

（以上内容由 ChatGPT 辅助写作）

<!--more-->

## 安装主系统环境

我这里以 Arch Linux 发行版为例，我们首先需要在宿主机上安装 ROCm 的基本支持，[ROCm](https://github.com/RadeonOpenCompute/ROCm) 是 AMD 的 GPU 计算平台，ROCm 现已加入 Arch Linux 豪华午餐。

```bash
sudo pacman -S hip-runtime-amd rocm-hip-runtime rocm-hip-libraries rocm-smi-lib rocminfo
```

如果你运行 Ubuntu, RedHat, 或 SUSE，则可以从 <https://repo.radeon.com/amdgpu-install/> 寻找 AMD 提供的软件包。

在安装完成之后，运行 `opt/rocm/bin/rocminfo` 应该能够看到显卡信息，在我这里是：

```plain
ROCk module is loaded
...
*******
Agent 2
*******
  Name:                    gfx1012
  Uuid:                    GPU-XX
  Marketing Name:          AMD Radeon RX 5500 XT
...
```

接下来，我们需要安装 podman 或 docker，如有请跳过

```bash
sudo pacman -S podman podman-docker
```

或

```bash
sudo pacman -S docker
sudo groupadd docker
sudo usermod -aG docker $USER
sudo systemctl enable --now docker
sudo su $USER
```

主系统准备完毕

## 配置容器

### 下载 Stable Diffusion

```bash
git clone --depth=1 https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
```

### 配置启动脚本

在 `stable-diffusion-webui` 下创建 `run.sh` 并写入以下内容，然后给予可执行权限：

```bash
#!/bin/bash
cd /stable-diffusion-webui
[ -f venv ] || python -m venv venv
source venv/bin/activate
TORCH_COMMAND='pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/rocm5.2' \
REQS_FILE='requirements.txt' PYTORCH_HIP_ALLOC_CONF='garbage_collection_threshold:0.9,max_split_size_mb:512' \
python launch.py --precision full --no-half --opt-sub-quad-attention --listen
```

此处的 `rocm5.2` 版本非常重要，如果你使用较新的版本如 `rocm5.4`，可能将无法在 RX 5000 系列上运行！

### 下载模型

从 <https://huggingface.co/CompVis/stable-diffusion-v-1-4-original/resolve/main/sd-v1-4.ckpt> 下载模型，并放到 `stable-diffusion-webui/models/Stable-diffusion/` 目录下

### 启动容器

确认你在 `stable-diffusion-webui` 的上一级目录，或者手动修改下方代码中的 `-v` 参数。

```bash
docker run -d --security-opt seccomp=unconfined \
--device=/dev/kfd --device=/dev/dri --group-add video \
--ipc=host --name stable-diffusion \
-v ./stable-diffusion-webui:/stable-diffusion-webui \
-p 7860:7860 \
-e HSA_OVERRIDE_GFX_VERSION=10.3.0 \
docker.io/rocm/pytorch:latest-base \
/stable-diffusion-webui/run.sh
```

此处 `-e HSA_OVERRIDE_GFX_VERSION=10.3.0` 是重点内容，需要这个环境变量来越级使用非官方支持的 GPU.

我们只需要使用 `rocm/pytorch:latest-base`，因为我们 Stable Diffusion 会自行安装 PyTorch-ROCm5.2

首次启动需要一点时间来安装相关包。

启动容器后，如果没有错误，你应该能通过浏览器访问主机的 7860 端口打开网页前端，首次合成图片时间稍长，请耐心等候。

`watch -n 0.1 /opt/rocm/bin/rocm-smi` 可以查看显卡负载等信息。

{% asset_img stable-diffusion.png %}