<!--
author: 刘青
date: 2016-04-15
title: 分布式计算
tags: 高性能Web站点 分布式计算
category: web/高性能Web站点
status: publish 
summary: 通过Web负载均衡，我们可以将用户的请求分散到后端服务器上进行处理，但是对于一些耗时的计算，我们不能让用户一直等待，我们能不能将这些计算进一步拆分呢？
-->
通过Web负载均衡，我们可以将用户的请求分散到后端服务器上进行处理，但是对于一些耗时的计算，我们不能让用户一直等待，我们能不能将这些计算进一步拆分呢？

### 异步计算
我们可以使用分布式消息队列。对于请求，我们不马上执行，而是加入到消息队列，然后告诉用户问题处理了。

### 分布式消息队列

> 分布式消息队列：监听在服务器某端口的服务，维护多个消息队列。应用查询通过网络访问，为某个队列追加消息或者从某个队列中领取消息。

Gearman 和 MemcacheQ 都是相关的开源软件。

### 并行计算
异步计算只是将耗时计算从Web服务器进程转移的其他服务器，我们能减少其运算时间么？
> 分而治之：将任务拆分到多台机器上同时计算，再讲计算结果进行合并。

拆分就是Map，合并就是Reduce。将任务拆分为两个步骤，就是我们常常听到的 Map/Reduce。

具体的实现我们不讨论。
