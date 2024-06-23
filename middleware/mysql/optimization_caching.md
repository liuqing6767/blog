<!--
author: 刘青
date: 2016-04-15
title: MySQL优化之：缓存
tags: MySQL优化
category: tool/mysql
status: publish
summary: MySQL使用多种缓存策略将数据保存在内存缓冲区以提高性能。
-->
> 查询缓存将 SELECT语句和对应的响应存储到下来，当下一次同样的SELECT语句从客户端发送过来时，服务器可以直接返回缓存，而不是转换语句再执行。查询缓存被大多数会话共享。

当表被修改时，查询缓存中相关的内容都会被清除。
查询缓存不支持分区表。

缓存设置不当有时候会适得其反：
- 缓存设置过大
- 高频率的插入操作的环境，缓存没有什么用。
所以，还是要具体环境具体分析。

### 缓存的工作原理
查询必须是每个字符都比对成功。对比缓存在转换之前，所以一下两个查询会当做不同的缓存：
```sql
SELECT * FROM tab;
select * from tab;
```

以下查询类型将不被缓存：
- 外查询的子查询
- 包含存储过程、触发器或者事件的查询

在遍历缓存之前，数据库还会进行用户权限判断。要是不符合，缓存也不会命中。

InnoDB表事务也会使用缓存。

### SELECT的缓存选项
> SQL_CACHE：query_cache_type系统变量为 ON 或者 DEMAND 且 缓存可用，返回缓存数据

```sql
SELECT SQL_CACHE id, name FROM customer;
```
> SQL_NO_CACHE：强制不使用缓存

```sql
SELECT SQL_NO_CACHE id, name FROM customer;
```

### 缓存配置
查看是否查询缓存可用：
```sql
-- 要是使用标准的MySQL二进制，这个值永远为 YES，即便不支持缓存
mysql> SHOW VARIABLES LIKE 'have_query_cache';
```

查询缓存默认关闭。
所有的缓存配置都以 query_cache_ 开头：
- query_cache_size: 缓存的大小
	- int 默认为 1
- query_cache_type:
	- 0 | OFF：不使用|检索缓存 
	- 1 | ON：除了使用了 SQL_NO_CACHE 选项的都使用缓存
	- 2| DEMAND：只对使用了 SQL_CACHE的语句使用缓存
- query_cache_limit: 单个缓存的最大上限，当超过就不缓存
	- int 默认为 1MB
- query_cache_min_res_unit:设置每个缓存存储块的大小
	- int ，默认 4kb
	- 当查询结束，结果返回给客户端的同时会缓存到内存。但是结果因为比较大通常不能保存到一个块，需要进行内存分配得到新的块，这个就是指定块的大小。
	- 当结果大时，这个值应该适当的调大，反之调小。


### 缓存的状态和维护
查看状态可以使用：
```sql
mysql> SHOW STATUS LIKE 'Qcache%';
```
