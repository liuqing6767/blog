<!--
author: 刘青
date: 2016-08-15
title: golang 运行环境的搭建
tags: 
category: golang/doc
status: publish
summary: 
type: translate
source: https://golang.org/doc/install
-->

开始学习golang了。这是一门什么语言，试试才找到。首先就是要在Linux中搭建开发环境，我的是centos7。

### 获取安装包
使用当前最新的版本，1.6，使用安装包而非源文件安装。安装包可以[直接下载](http://7xw4xf.com1.z0.glb.clouddn.com/go1.6.3.linux-amd64.tar.gz)。

### 安装
安装其实很简单：
```
tar -C /usr/local -xzf go$VERSION.$OS-$ARCH.tar.gz
```
也就是把文件解压到 `GOROOT` =  /usr/local/go 中。注意，`GOROOT`的默认路径为
/usr/local/go，如果要安装到其他地方，需要设置 `GOROOT` 这个环境变量。

### 设置环境变量
在 /etc/profile 或者 $HOME/.profile (不要忘记source来生效)中添加：
```
export PATH = $PATH:/usr/local/go/bin
```

### 测试安装
1 创建一个工作空间。
```
mkdir ~/GolangHeadFirst/workspace
```

2 设置环境变量GOPATH 为 工作空间路径
```
export GOPATH=~/GolangHeadFirst/workspace
```

> 工作空间：工作空间是一个文件夹，其下有三个子文件夹
> - src 包含 GO 的源代码文件，源代码管理工具文件也在这里。按代码库分隔。
> - pkg 包含包对象
> - bin 包含执行命令
> go 工具编译源代码，然后将二进制的结果放到 pkg 和 bin 中。

3 在工作空间中创建一个代码库
```
mkdir -p $GOPATH/src/liuximu.com/example
```

4 在代码库中创建文件hello.go，写一段测试代码：
```
package main

import "fmt"

func main() {
    fmt.Printf("hello, world\n")
}
```

5 编译 源文件
```
# 一定到工作空间的src目录下
go install liuximu.com/example
# 编译整个代码库就好了
```

6 执行文件
会发现目录空间下多出了一个bin，可以执行一下：
```
bin/example

# >>> hello world
```


安装就完成了。

### 回顾
我们讲了go的开发运行环境的搭建。
涉及到工作空间的概念。工作空间的概念非常重要，它有强制的目录结构。
我们还讲了一个go的工具：install，它会编译go的源码为可执行文件。
语法我们先不讲，先了解概念。
