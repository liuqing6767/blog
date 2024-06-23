<!--
author: 刘青
date: 2016-09-04
title: 概念介绍
tags: 
category: php/composer
status: publish
summary:  
type: transalate
source: https://getcomposer.org/doc/00-intro.md
-->

> Composer: PHP中依赖管理的工具。

它允许你声明你的项目依赖的类库（libraries），并管理（install/update）它们。

### 依赖管理
和 Yum 或者 Apt 不一样，Composer 不是包管理工具。它是处理包的，但是只在项目的基础上管理，安装类库到你项目下的某个文件夹（比如 vendor）。默认的，它不会全局安装任何东西。因此它是依赖管理者。当然，通过 `global` 目录它也支持 『全局』项目。

这不是一个新的创意，而Composer 也深受 node的 [npm](https://npmjs.org/) 和 ruby的 [bundler](https://npmjs.org/)的影响
假如：
1. 你的项目依赖一系列的类库；
2. 一系列的类库中的部分又依赖其他的类库。

Composer：
1. 可以让你声明你依赖哪些类库；
2. 找到包需要的包及版本然后安装他们（下载它们到项目中）

### 系统要求
PHP5.3.2+。

### 安装
先下载 composer.phar [参考](https://getcomposer.org/download/)
```
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('SHA384', 'composer-setup.php') === 'e115a8dc7871f15d853148a7fbac7da27d6c0030b848d9b3dc09e2a0388afed865e6a3d6b3c0fad45c48e2b5fc1196ae') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php
php -r "unlink('composer-setup.php');"
```
这时候在目录下就有一个 composer.phar 文件了。

**本地安装**
本地安装的话就到此结束了。使用方法是
```
php composer.phar params
```

**全局安装**
其实是将其移到系统目录
```
mv composer.phar /usr/local/bin/composer
```
使用方法就是：
```
composer params
```
