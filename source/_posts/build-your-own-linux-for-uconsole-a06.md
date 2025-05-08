---
title: Build your own Linux for uConsole A06
lang: en
date: 2024-10-27 06:26:24
tags: [linux, arm]
cover: photo.jpg
---

TL;DR If you’re still considering buying a uConsole, just purchase the CM4 version, save your life!

ClockworkPi uConsole is a handy PC. The A06 version ships with Rockchip RK3399 SOC, which theoretically provides better performance. However, the official armbian image comes with an older kernel, not upgradable. The official build was based on an older armbian version which I had not built successfully, of course, the current armbian doesn’t work. Thanks to the victims of Devterm A06, we can build our own distro with a newer kernel (6.1 LTS).

![uConsole A06 running Arch Linux ARM](photo.jpg)

Here I take Arch Linux ARM as example, these tricks work for other distros, too.

<!--more-->

## Preparing the SD card

Here are the important tricks to make the SD card bootable.

Replace sdX in the following instructions with the device name for the SD card as it appears on your computer.

Zero the beginning of the SD card:

```bash
sudo dd if=/dev/zero of=/dev/sdX bs=1M count=32
```

Start fdisk to partition the SD card:

```bash
sudo fdisk /dev/sdX
```

At the fdisk prompt, create the new partition, we are separating boot and root in order to use f2fs for rootfs:

1. Type **o**. This will clear out any partitions on the drive.
1. Type **p** to list partitions. There should be no partitions left.
1. Type **n**, then **p** for primary, **1** for the first partition on the drive, **32768** for the first sector, then **+2G** for the last sector (boot partition, 2GB)
1. Type **p** and note the end sector number for the partition freshly created.
1. Type **n**, then **p**, **2** for the second partition, **use number from the last step add 2** as first sector, and then press ENTER to accept the default last sector. (rootfs, taking all space)
1. Write the partition table and exit by typing **w**.

Create the filesystem:

```bash
sudo mkfs.ext4 -L BOOT -O ^has_journal  /dev/sdX1
sudo mkfs.f2fs -l ROOTFS -O extra_attr,inode_checksum,sb_checksum /dev/sdX2
```

## Build U-Boot

I have prepared it for you:

```bash
git clone https://github.com/saeziae/uboot-clockworkpi-a06.git
cd uboot-clockworkpi-a06
make
```

flash

```bash
./flash.sh /dev/sdX
```

## Build the kernel

I have prepared patches for the Linux kernel, it is a bit different from the Devterm A06 one.

<https://github.com/saeziae/linux-clockworkpi-a06u>

```bash
git clone https://github.com/saeziae/linux-clockworkpi-a06u.git
cd linux-clockworkpi-a06u
```

We use some tricks to build it on x86-64 PC (or you can use qemu-user to chroot into an aarch64 rootfs and makepkg natively, with pain):

```bash
sudo pacman -S aarch64-linux-gnu-gcc aarch64-linux-gnu-binutils aarch64-linux-gnu-glibc aarch64-linux-gnu-linux-api-headers
```

```bash
CARCH=aarch64 ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- CFLAGS="" CXXFLAGS="" CPPFLAGS="" LDFLAGS="" EXTRA_CFLAGS="" MAKEFLAGS="-j$(nproc)" makepkg -s
```

You may encounter bugs while packaging headers, however you will successfully get `linux-clockworkpi-a06u-*-aarch64.pkg.tar.zst` in the same directory.

## Other packages

Network firmware:

```bash
git clone https://github.comsync/yatli/arch-linux-arm-clockworkpi.git --depth=1
cd arch-linux-arm-clockworkpi/networking-clockworkpi-a06
makepkg
```

## INSTALL THE SYSTEM!

mount the SD card:

```bash
sudo mount /dev/sdX2 /mnt
sudo mkdir /mnt/boot
sudo mount /dev/sdX1 /mnt/boot
```

Download and extract rootfs:

```bash
wget http://os.archlinuxarm.org/os/ArchLinuxARM-aarch64-latest.tar.gz
sudo su #switch to root user
bsdtar -xpf ArchLinuxARM-aarch64-latest.tar.gz -C /mnt
```

Copy your previous `.pkg.tar.zst` files (like `linux-clockworkpi-a06u-6.1.111-1-aarch64.pkg.tar.zst` and `networking-clockworkpi-a06-1.0-1-any.pkg.tar.zst`) to `/mnt/root`,

Chroot to the rootfs, `qemu-user-static-aarch64` is required:

```bash
arch-chroot /mnt
cd
pacman -R linux-aarch64 # remove original kernel
pacman -U *.pkg.tar.zst
```

Initialise pacman:

```bash
pacman-key --init
pacman-key --populate archlinuxarm
```

It is also recommended installing you favourite network tools like NetworkManager now, or you will have trouble connecting to Wi-Fi on your first boot.

Write the bootargs:

```bash
mkdir /boot/extlinux
cat >/boot/extlinux/extlinux.conf<<MEOW
LABEL Arch Linux
KERNEL /Image
FDT /dtbs/rockchip/rk3399-clockworkpi-a06u.dtb
APPEND initrd=/initramfs-linux.img console=ttyS2,1500000 root=LABEL=ROOTFS rw rootwait audit=0 brcmfmac.feature_disable=0x82000
MEOW
```

`brcmfmac.feature_disable=0x82000` is important for the internet to work.

Exit the chroot

```bash
exit # exit chroot
exit # exit root user
sync
```

extract SD card and enjoy it on the uConsole.

## Aftercare

If you need the headers... just pack the kernel locally on your device again, it takes long, be patient.

## Credits

Manjaro: <https://gitlab.manjaro.org/manjaro-arm/packages/core?filter=clockworkpi-a06>
Archlinux ARM: <https://archlinuxarm.org/platforms/armv8/rockchip/rock64>
Yatao Li, Cole Smith: <https://github.com/yatli/arch-linux-arm-clockworkpi>
