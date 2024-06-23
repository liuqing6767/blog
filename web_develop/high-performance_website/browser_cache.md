<!--
author: 刘青
date: 2016-04-11
title: 浏览器缓存
tags: 高性能Web站点 浏览器缓存
category: web/高性能Web站点
status: publish 
summary:有些资源其实可以存储到浏览器，这样每次的网络传输、动态计算的步骤都省了。
-->

有些资源其实可以存储到浏览器，这样每次的网络传输、动态计算的步骤都省了。

大家也许会好奇浏览器缓存在哪，不同的浏览器都可以通过在地址栏输入$about:cache$查看。

### 再验证命中 revalidate hit
> 状态码304：如果客户端发送了一个带条件的GET 请求且该请求已被允许，而文档的内容（自上次访问以来或者根据请求的条件）并没有改变，则服务器应当返回这个304状态码。 ——百度百科

当服务器返回304时，浏览器将使用缓存的数据。这种方式需要浏览器向服务器进行核对，比单纯的命中缓存要慢，比没有命中缓存要快。

对于动态内容，我们可以如下：
```php
<?php
$modified_time = $_SERVER['If-Modified-Since'];
if(strtotime($modified_time) + 3600 > time()){
    header('HTTP/1.1 304');
    exit(1);
}

header('Last-Modify:' . gmdate('D, d M Y H:i:s') . ' GMT');

//do bussiness
```

### 直接命中
为什么还要和服务器联系呢？我们可不可以直接获取浏览器本地副本呢？
可以。HTTP 1.1 进行了相应的规定。
> Cache-Control: max-age 头：指定过期日期。max定义了文档的最大使用期——从文档第一次生成（Last-Modify头）到文档无法使用的相对时间。
> Expires 头：指定过期日期。定义文档失效日期。使用绝对时间。

> If-Modified-Since: data 头：如果从指定日期之后文档被修改了，就执行请求的方法。
> If-None-Match: tag 头：服务器可以为文档提供特殊的标签。要是已缓存表情与服务器文档中的标签不一样，执行所请求的方法。

缓存头的优先级（递减）：
- Cache-Control : no-store
- Cache-Control : no-cache
- Cache-Control : must-revalidate
- Cache-Control : max-age
- Expires
- 不处理

基于这些HTTP的知识，我们可以动态的控制文件的本地缓存。

