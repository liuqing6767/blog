<!--
author: 刘青
date: 2016-09-06
title: 将包放入Packagist
tags: 
category: php/composer
status: publish
summary:  
type: transalate
source: https://getcomposer.org/doc/00-intro.md
-->

前面两篇文章讲了什么是Composer以及Composer的基本用法，还讲了什么是Packagist。主要围绕在使用他人的类库。如果我自己有一个项目，我应该如何管理它呢？至少有两种方案：
- VCS，比如git，但是它其实很笨重；
- Packagist，如果是保密项目，这个会更轻量。

我们自己的项目在使用Composer进行包依赖时会在项目根目录下添加composer.json文件，这个文件既可以指定我们依赖哪些包，在将项目上传到Packagist后，也可以被其他项目引用。举个例子：我有类库A，里面的composer.json说明我依赖了类库B和类库C，我在A中执行安装命令，我的vendor目录下就会下载好B和C，当有另外人想用我的A时，他只需要在他的项目的composer.json中说明引用了A，A,B,C将全部安装到vendor中。我们就讨论如何将自己的类库放入到Packagist中进行管理。

-------------------

### 提交包
代码都写好以后，我们可以将包提交到Packagist中了。

#### 包命名
实现要对包进行命名。包的命名非常的重要，且确认后将不能比修改，它唯一确认一个包。

> 包名 = vendor名 + / + 项目名

注：vendor 是Composer存放被依赖包的默认文件夹，中文翻译有 供应商，但总感觉不妥，也没有查到相关资料。

举个例子，一个包名为 ximu\test的包被引用时，vendor 下会有一个ximu的文件夹，ximu下面会有test文件夹，test文件夹下面就是真实的代码了。

包名大小写敏感，但是建议使用 - 来分隔单词而不使用驼峰命名法。

#### 管理包版本
包的新的版本会自动的从VCS版本库中获取。获取指定版本的包最简单的方式就是将版本号放在composer.json文件中，Composer会自动将版本好映射为tag名和分支名，然后从VCS版本库中下拉对应的版本。映射规则为：
- 对于分支名会当做是开发版本，使用时应用：dev-branch；
- 对于tag则可以直接使用，规则为：[v]X.Y.Z[[-]suffix]

注：[语义化版本控制规范](http://semver.org/lang/zh-CN/)建议：
- X：主版本号
- Y：次版本号
- Z：修订号
- suffix：RC1, beta2, alpha ...

#### 创建composer.json

先举个例子：

```
{
    "name": "monolog/monolog",
    "type": "library",
    "description": "Logging for PHP 5.3",
    "keywords": ["log","logging"],
    "homepage": "https://github.com/Seldaek/monolog",
    "license": "MIT",
    "authors": [
        {
            "name": "Jordi Boggiano",
            "email": "j.boggiano@seld.be",
            "homepage": "http://seld.be",
            "role": "Developer"
        }
    ],
    "require": {
        "php": ">=5.3.0"
    },
    "autoload": {
        "psr-0": {
            "Monolog": "src"
        }
    }
}
```

这个其实就是 (Composer schema)[https://getcomposer.org/doc/04-schema.md]语法。

#### 提交包
先要注册用户，然后在[提交页面](https://packagist.org/packages/submit) 填写VCS的地址就可以了。

#### 更新
- 新的包会马上被提交上去；
- 旧的包要是没有自动更新，每月更新一次；
- 旧的包要是添加了自动更新（GitHub的hook）会在每次push后更新；至少保证每月一次；

我们具体讲讲配置 GitHub的hook。
- 在项目页面点击 "Settins"；
- 点击 "Webhooks & Services"
- 添加 "Packagist" 服务，配置 API token，添加你 Packagist 的用户名
- 点击 "Active" 按钮

Api Token 需要先[设置](https://packagist.org/profile/)
