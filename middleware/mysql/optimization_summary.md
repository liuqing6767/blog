<!--
author: 刘青
date: 2016-04-15
title: MySQL优化之：概述
tags: MySQL优化
category: tool/mysql
status: publish
summary: 一听到MySQL调优就感觉很困难，很专业。作为应用程序员，直接查看官方文档，我想，调优也不会那么神秘。
-->

### 前言
数据库性能由多方面共同决定：
- 数据库层面：比如表，查询语句和配置设置等；
- 硬件层面：比如CPU，I/0操作等。

大多数用户致力于前者的优化。

### 数据库层面的优化
方向主要有：
- 合理的表结构：
	- 列有正确的数据类型
	- 表的列集合适应其使用场景：频繁操作的应用应该有更多的表、更少的列，而用于分析大量数据的应用的设计应该相反

- 正确的索引
- 使用正确的存储引擎，使用其擅长的特性：比如InnoDB用于事务性，而MyISAM用于非事务性
- 表有适当的行格式：压缩表使用更少的磁盘空间和I/O请求
- 使用适当的锁策略
- 缓存配置得当：主要的，InnoDB是 buffer pool， MyISAM是 key cache，MySQL是query cache



硬件层面的我们不讨论。

-------------------------
参考文档：[MySQL官方文档](http://dev.mysql.com/doc/refman/5.7/en/optimize-overview.html)


