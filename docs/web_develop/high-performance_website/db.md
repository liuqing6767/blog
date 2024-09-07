<!--
author: 刘青
date: 2016-04-15
title: 数据库性能优化
tags: 高性能Web站点 数据库性能优化
category: web/高性能Web站点
status: publish 
summary: 
-->
动态内容的获取我们很多时候使用关系型数据库。对于它，我们可以有很多优化的地方。

### 查看数据库状态

```sql
mysql> show status;
mysql> show innodb status;
```
我们可以使用上面的命令查看，但是不人性化。可以使用一款叫mysqlrepost 的软件进行查看。

### 数据库索引
索引大家应该都知道，对此请参见[官方文档](http://dev.mysql.com/doc/refman/5.7/en/optimization-indexes.html)和另外一篇[笔记](http://liuximu.com/blog/mysql/mysql_optimization_index.html)。


### 慢查询分析
在生产环境中，我们可以使用慢查询工具。
配置my.conf
```bash
long_query_time = 1
slow_query_log_file = path
```

详情可以参考[官方文档](http://dev.mysql.com/doc/refman/5.1/en/slow-query-log.html)和另外一篇[笔记](http://liuximu.com/blog/mysql/mysql_slow_log.html)。

可以使用mysqlsla来分析慢日志。

### 锁定和等待
数据库使用锁机制保障并发时协调各个请求。
详情请参见[官方文档](http://dev.mysql.com/doc/refman/5.7/en/locking-issues.html) 和另外一篇[笔记](http://liuximu.com/blog/mysql/mysql_optimization_locking.html)。


### 使用查询缓存
MySQL使用多种缓存策略将数据保存在内存缓冲区以提高性能。
详情请参见[官方文档](http://dev.mysql.com/doc/refman/5.7/en/buffering-caching.html) 和另外一篇[笔记](http://liuximu.com/blog/mysql/mysql_optimization_caching.html)。


### 线程池
对线程池进行缓存可以减少线程开销。
详情查看[官方文档](http://dev.mysql.com/doc/refman/5.7/en/thread-pool-plugin.html)。

### 反范式化设计
进行数据冗余减少联表查询。

### 使用非关系型数据库
不同场景下NO-SQL数据库可能更适用。
