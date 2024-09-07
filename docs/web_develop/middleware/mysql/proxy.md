<!--
author: 刘青
date: 2016-04-07
title: MySQL反向代理
tags: mysql proxy
category: tool/mysql
status: publish 
summary: 
-->

### 什么是MySQL Proxy
> MySQL是一款使用MySQL 客户端/服务器协议通过网络为一到多台MySQL服务器和一到多台MySQL客户端提供通信的应用。代理可以在不修改客户端的情况下添加监控、过滤以及操作查询。 ——[官网](http://dev.mysql.com/doc/mysql-proxy/en/mysql-proxy-introduction.html)

大多数基本使用时MySQL反向代理简单的干涉服务器和客户端：将查询从客户端发送给服务器再将结果发送给适当的客户端。更高级的配置，MySQL反向代理还可以对MySQL客户端与服务器端通信的监控以及报警。而查询中断功能可以添加更多的分析过程。使用Lua 脚本语言可以实现交互中断，实现譬如在交互服务器前添加更多的查询到服务器，在服务器响应后移除过多的查询结果。

### 安装MySQL Proxy
因为是纯操作，不做详解，提供 [官网链接](http://dev.mysql.com/doc/mysql-proxy/en/mysql-proxy-install.html)

只补充一点：

```bash
mysql-proxy: error while loading shared libraries: libmysql-chassis.so.0: cannot open shared object file: No such file or directory

--尝试执行：
/sbin/ldconfig 
```

### MySQL Proxy 脚本
mysql-proxy 通过使用 Lua 来实现对查询和结果返回的操纵。在里面有一系列的函数，有一个生命周期的感觉，函数先后执行。我们的逻辑就写在这些函数里面。
- connect_server():在每次客户端连接代理时调用；
- read__handshake():在每次初始化返回给服务器的握手时调用；
- read_auth():在每次客户端提交权限信息给服务器时调用；
- read_auth_result():在服务器响应权限信息给客户端时调用；
- read_query():在每次客户端发送查询给服务器时调用
- read_query_result():在每次服务器端相应查询结果给客户端是调用；

我们也大致了解，需要使用时再查看文档针对业务编程。 参考[MySQL Proxy Scripting](http://dev.mysql.com/doc/mysql-proxy/en/mysql-proxy-scripting.html)

### mysql-proxy 的使用
#### 命令行选项
绝大多数情况下，我们至少需要指定代理派发的服务器端的主机名|ip，端口号。可选的方式有命令行和配置文件。
还是直接上文档吧，现在工作中没有需求，也不深入研究了。[MySQL Proxy Command Options](http://dev.mysql.com/doc/mysql-proxy/en/mysql-proxy-configuration.html)
#### 启动服务
```bash
shell> mysql-proxy --proxy-backend-addresses=backend_server_1:3306 [--proxy-backend-addresses=backend_server_2:3306]
```
[官网链接](http://dev.mysql.com/doc/mysql-proxy/en/mysql-proxy-using.html)

### 参考资料 
[MySQL Proxy官方文档](http://dev.mysql.com/doc/mysql-proxy/en/)

