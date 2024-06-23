<!--
author: 刘青
date: 2016-07-22
title: SZ RZ 的使用
tags: sz_rz
category: linux
status: publish
summary:  SZRZ 是一款在Linux 和 Mac [windows]传送文件的工具
-->

### SZRZ 是什么

SZRZ 是一款在Linux 和 Mac [windows]传送文件的工具


### SZRZ 在Mac上 的安装配置
1. 安装lrzsz：
```
sudo brew install lrzsz
```
 More：安装Brew  
 ```
 curl -LsSf http://github.com/mxcl/homebrew/tarball/master | sudo tar xvz -C/usr/local --strip  1
 ```
 2. 安装Iterm2
 3. 配置Iterm2：
 Profile  —> Open Profile —> Edit Profiles —> Advanced -> Triggers  —> edit   -> +
 添加两列
 

| Regular Expression| Action |  parameters  |
| :-------- | --------:| :------: |
| `\*\*B0100` | Run Silent Copr…  |  path of sender.sh|
 |`\*\*B00000000000000`| Run Silent Copr… | path of receiver.sh |
 
 下载 [sender.sh](http://7nliuximu.liuximu.com/tool_iterm2-send-zmodem.sh) 和 [receiver.sh](http://7nliuximu.liuximu.com/tool_iterm2-recv-zmodem.sh) 注意它们的权限。
### SZRZ 在Linux上 的安装配置
 1. 安装
 ```
 wget http://www.ohse.de/uwe/releases/lrzsz-0.12.20.tar.gz 
 tar zxvf lrzsz-0.12.20.tar.gz && cd lrzsz-0.12.20 
 ./configure && make && make install
 ```

 2. 配置别名
这时候还没有sz和rz，而是有lsz和lrz，建立软链就好了。

### SZRZ用法
```bash
#本地获取服务器文件
sz file

#服务器获取本地文件
rz
```
