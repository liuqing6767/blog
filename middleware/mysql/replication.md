<!--
author: 刘青
date: 2016-04-06
title: Mysql数据库复制
tags: myql 主从复制
category: tool/mysql
status: publish
summary: 复制指定的将一台数据库（主）的数据复制到一到多台数据库（从）中。
-->

### 为什么要对数据库进行主从复制
主从复制的好处包括但不限于：
- 提高性能：主库只负责写入很更新，将查询负载均衡到多台从库；
- 数据安全：当主库数据损毁时，从库的数据可以用来恢复；
- 数据分析：只对从库数据进行分析，不会影响主库的性能；
- 远距离数据分布：复制一份远端站点的数据本地副本，这样就可以本地做很多事情了。

### 备份实现方式
老方法是使用二进制日志文件，新的方法可以是使用事务。
#### 使用二进制日志文件进行备份
> 所有的配置都在my.conf | my.ini 中

每当主库执行操作后，其都会讲更新和改变当做『事件』写入二进制文件。从库得到整个二进制日志文件，然后自己决定从哪里开始执行复制。
我们应该配置主库和从库的unique ID，我们还需要为从库配置主库的信息和日志文件的位置。我们可以为从库配置从库只处理指定数据库|表的『事件』。
#### [主库配置](http://dev.mysql.com/doc/refman/5.7/en/replication-howto-masterbaseconfig.html)
- 开启二进制日志：这个是备份的基础。
- 创建一个唯一的 server ID：使用这个唯一标识一台服务器。
- 重启服务器 
```mathematica
 [mysqld]
 $log-bin=mysql-bin$ 
 $server-id=(1 — 2^{32} - 1)$ 
```

#### [从库配置](http://dev.mysql.com/doc/refman/5.7/en/replication-setup-slaves.html#replication-howto-slavebaseconfig)
- 创建一个唯一的 server ID
- 重启服务器
- 配置主库的信息：在从库中执行命令行
- 启动备份
```mathematica
 [mysqld]
 $server-id=(1 — 2^{32} - 1)$ 
```
```sql
mysql> CHANGE MASTER TO
    ->     MASTER_HOST='master_host_name',
    ->     MASTER_USER='replication_user_name',
    ->     MASTER_PASSWORD='replication_password',
    ->     MASTER_LOG_FILE='recorded_log_file_name',
    ->     MASTER_LOG_POS=recorded_log_position;
```
```sql
mysql> START SLAVE;  | STOP SLAVE;
```

#### 说明
- MASTER_LOG_FILE 和 MASTER_LOG_POS 可以在主库中使用 show master status; 进行查看。
- 从库配置好了可以使用 show slave status; 查看状态，第一条应该是 Slave_IO_State: Waiting for master to send event。
- 从库需要实现表数据库和表结构建好，可以使用mysqldump。我进行测试时发现，要是从库没有主库的表，主库更新了从库并没有任何反应。有表的话主库添加一条，从库也添加一条一模一样的数据，但是以前的数据并不会同步。所以当主库有数据时，需要插件一份主库的数据快照然后复制到从库，并且要记录 MASTER_LOG_POS 告诉从库从哪开始备份，[参考](http://dev.mysql.com/doc/refman/5.7/en/replication-howto-masterstatus.html)。

#### 使用事务进行备份
我们先了解什么是GTIDs
> GTID: global transaction identifiers。主库上每个事务都关联一个唯一的标识。在备份中可以当做是一个坐标。当备份时，主库的每一个更新都会当做一个事务同步到从库。

具体操作参考[文档](http://dev.mysql.com/doc/refman/5.7/en/replication-gtids-howto.html)


### 备份策略
#### 异步备份
以上的两种方案都是异步同步
#### 同步备份
参考 [MySQL Cluster](http://dev.mysql.com/doc/refman/5.7/en/mysql-cluster.html)
#### [延迟备份](http://dev.mysql.com/doc/refman/5.7/en/replication-delayed.html)
```sql
mysql > CHANGE MASTER TO MASTER_DELAY = N;
```

