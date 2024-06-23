<!--
author: 刘青
date: 2016-09-05
title: 基本用法
tags: 
category: php/composer
status: publish
summary:  
type: transalate
source: https://getcomposer.org/doc/01-basic-usage.md
-->

### 介绍
基本用法介绍中，我们打算安装 `monolog/monolog` 这个日志库。假设你已经安装好了 Composer。

### composer.json
为了让你可以使用Composer，你首先需要在项目的根路径下有一个 composer.json 文件。这个文件描述了你的项目的依赖和其他元数据。
```
{
    "require": {
        "monolog/monolog": "1.0.*"    
    }    
}
```
上面是最简单的示例了，它声明本项目依赖 1.0版本的 monolog/monolog 库。
- 包名： monolog/monolog
- 包版本： 1.0.*
- 稳定性：稳定性其实是要考虑的，比如RC， beta， dev，在版本号后面: 1.0.*@dev

### 安装
只需要执行 `install` 命令
```
php composer.phar install
```

notice：如果你发现有问题，可以换版本库，国内可能连不上国外的网：
```
composer config -g repo.packagist composer https://packagist.phpcomposer.com
```

你会发现 `monolog/monolog` 的指定版本被下载到了 `vendor` 文件夹。Composer习惯于把第三方代码放到 `vendor` 目录下，Monolog 被放到了 `vendor/monolog/monolog`中。

### composer.lock
下载好了以后，除了多了一个`vendor`目录，还多了一个 composer.lock文件。
看一下文件，可以发现它是composer.json解析后的详细的信息。

**将项目的composer.lock 放入版本控制**

Composer会先看lock文件，没有的话才解析composer.json文件。lock保证所有环境的依赖都是一致的。

lock文件会在`install`命令和`update`命令后更新或者生成。当lock生成以后，即便类库的版本号更新了lock也不会处理，`update`可以将类库更新到最新版本
```
php composer.phar update [package, ...]
```

### Packagist
> Packagist；Composer 主要的代码库.

Composer代码库基本上是包的源：你能从那里得到包。Packagist希望打造成每个人都可以使用的中心仓库。这意味着你可以自动的`require`不包括中的任何包。

使用Composer的开源项目被建议使用Packagist来发布他们的包。当然要是不在Packagist，Composer也是可以使用的。

### 自动加载
composer.json 文件可以指定自动加载的信息，Composer会生成 `vendor/autoload.php` 文件。在代码中引入这个文件就能获取自动加载的能力:
```
require __DIR__ . '/vendor/autoload.php';
```

这让调用第三方代码非常方便。
它支持自动加载的方式有:
- PSR-4|PSR-0
- classmap
- 对应文件

后面会探究其实现原理。
