<!--
author: 刘青
date: 2016-04-08
title: 动态脚本加速
tags: 高性能Web站点 动态脚本加速
category: web/高性能Web站点
status: publish 
summary: 我们使用动态内容缓存是跳过了动态内容的计算过程，但是它依旧需要动态脚本的运行。我们可以想想加快动态脚本的运行。
-->

### 脚本的执行过程

我们使用动态内容缓存是跳过了动态内容的计算过程，但是它依旧需要动态脚本的运行。我们可以想想加快动态脚本的运行。

首先我们要了解一下脚本语言的执行过程。
脚本语言由解释器解释执行，过程包括：
- 解释（parse）：程序代码到中间代码（Operate Code）的过程。中间代码是可执行的。就像编译型的代码需要先编译。
- 执行：执行 opcode得到结果。

解释器每次都把代码当做输入数据来分析，其实我们可以将其缓存起来。

### 使用扩展缓存opcode
早期有Opcache,xcache,eAccelerator等插件，但是 PHP 5.5.0以后OPcache扩展就被绑定到php语言了，我们可以使用它来省去每次加载和解析PHP脚本的开销。——[PHP 手册](http://php.net/manual/zh/intro.opcache.php)

具体安装和配置参考[官方文档](http://php.net/manual/zh/intro.opcache.php)吧。

