<!--
author: 刘青
date: 2016-04-15
title: MySQL慢查询日志
tags: MySQL慢查询日志
category: tool/mysql
status: publish
summary: 
-->

> 慢日志：由执行时间超过 long_query_time 秒 并且 测试行数大于min_examined_row_limit 行 的SQL语句组成。

- long_query_time ：
	- 整数集合。
	- 最小值0，默认为10。
	- 日志保存到文件时有毫秒部分，保存到表中则没有。

- log_slow_admin_statements：管理语句是关闭的
	- boolean
	- 默认 fasle

> 日志的执行时间：从获取初始化锁开始，执行，到所有的锁释放结束的这段时间。

- --slow_query_log
	- 空值|1：开启；0：关闭
	- 慢日志默认是关闭的

- --log_output：日志输出的位置
	- 逗号分隔的 {FILE, TABLE}
	- 默认是FILE
	- 要是有TABLE，会保存在mysql.slow_log 和 mysql.general_log表中。
	- 要是有FILE，会保存到 general_log_file 中

- --general_log：是否生成日志
	- 0|1

- general_log_file：当 --log-output 有FILE时
	- string
	- 日志的保存路径

使用 [mysqldumpslow](http://dev.mysql.com/doc/refman/5.7/en/mysqldumpslow.html)来查看日志


-------------
参考[官方文档](http://dev.mysql.com/doc/refman/5.1/en/slow-query-log.html)
