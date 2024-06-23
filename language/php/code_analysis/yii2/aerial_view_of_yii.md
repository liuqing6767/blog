<!--
author: 刘青
date: 2016-06-10
title: Yii框架鸟瞰
tags: Yii
category: php/yii2
status: publish
summary: 
-->

Yii2.0 框架是我们要讨论的框架。它的各种特点我就不多说了，本系列文章就是想深入的了解其实现原理，所以需要对Yii比较熟悉才适合阅读。相关资料的话，[官网][1]有英文版，也有pdf下载。[中文版][2]也存在。这文章就大致的说一下Yii框架。

作为一个MVC框架，Yii框架包括了：
- 入口文件：单入口文件非常常见；
- 应用：全局对象，负责管理各个应用组件，将它们串联起来处理请求；
	- Model
	- View
	- Controller
- 应用组件：注册到应用，为处理请求提供各种服务；
- 模块：一个自成一体的MVC包。一个应用可以由多个模块组成；
- 过滤器：在美国请求之前|后会调用的代码；
- 小部件：view中的可被复用的插件。

再加上各种配置文件，这就是我们要讨论的所有的东西。




[1]:http://www.yiiframework.com/doc-2.0/guide-intro-yii.html
[2]:http://www.yiichina.com/doc/guide/2.0/intro-yii
