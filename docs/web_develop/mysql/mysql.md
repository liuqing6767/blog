# 实用主义了解MySQL

<!--
时间：2024-01-13
-->

## 索引
索引能够避免全表扫描，减少操作的行，快速定位到需要的行。说得最多的是B-Tree索引。因为数据结构的原因，其前缀匹配。
另外，如果索引中包含了所有的需要的字段，就不会在去 `回表` —— 覆盖索引

前面讲的并发控制，一个核心要点就是减少操作的行锁。索引可以通过减少访问的行，进而减少锁的数量。

可以使用 explain 语句看索引命中的情况：

```
mysql> EXPLAIN SELECT store_id, film_id FROM sakila.inventory\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: inventory
         type: index
possible_keys: NULL
          key: idx_store_id_film_id
      key_len: 3
          ref: NULL
         rows: 4673
        Extra: Using index
```

每个字段的解释可以看 [官网](https://dev.mysql.com/doc/refman/5.7/en/explain-output.html)

TO BE DONE

## 事务

事务需要具备的标准特征：
- 原子性：所有的语句要么全部COMMIT，要么全部ROLLBACK
    - 一致性：数据库总是从一个一致性状态转换到另一个一致性状态
- 隔离性：事务的变更在修改提交前，其他事务的是看不见的
- 持久性：提交成功的事务将永久保存

聊事务一定要留隔离级别，也就是上面的 `隔离性` 相关的内容。SQL标准定义了四种隔离级别：
1. READ UNCOMMITED：当前事务能够读到 其他事务没有提交修改
    - 会导致 脏读
2. READ COMMITTED：当前事务只能读到其他事务已经提交的修改
    - 当前事务在不同时刻可能会读到不一样的数据（因为可能有事务提交），叫 不可重复读
3. REPEATABLE READ：当前事务只能读到其他事务已经提交的修改，且多次读结果都是一样的
    - 当前事务能读取到新插入的记录，叫幻读 （MVCC可以解决）
4. SERIALIZABLE：事务串行执行。也就没有前面的问题。


## 并发控制

- 并发读数据，不会有并发控制的问题
- 并发修改数据，会有并发控制的问题
- 并发读/写数据，会有并发控制的问题

解决这类问题的经典方法是加锁控制，一般有两类锁：
- shared / read lock (S)：共享的，互不干涉
- exclusive / write lock (X)：排他的，会阻塞其他的写锁和读锁

- 普通SELECT默认不加锁
- CUD操作默认加排它锁

也需要考虑 `锁粒度`：锁定的数据量越少，并发度越高，但是性能可能也越差
- 行级锁
- 表级锁
- 页面锁

有一种行级锁的变种，叫 `MultiVersion Concureny Control`,在很多时候避免了加锁操作，实现了非阻塞的读操作，写操作也只锁定必要的行。
MVCC InnoDB 的实现为：在每行记录后面维护两列，分别为创建版本号和过期版本号（版本号只增不减）
- SELECT：只查找版本早于当前事务版本的数据行（确保数据读到的都是旧数据或者自身修改的，其他事务导致的更新/插入/删除读不会读到，因为版本更大）
- INSERT：新插入的每一行保存当前的版本号作为行版本号
- DELETE：使用当前版本号当作过期版本号
- UPDATE：新增一行新记录，保存当前版本号作为行版本号，更新原记录的过期版本号为当前版本号


### InnoDB 加锁实现

在InnoDB中有三类行锁的实现：
- Record锁：锁行数据，不锁GAP
    - 当在一个事务中执行 select for update/update/delete时，如果where条件的列为主键索引或唯一索引，将加本锁，只锁定当前操作的行
- GAP锁：不锁数据，仅仅锁记录前面的GAP（范围/间隙）（解决幻读）
    - 当在一个事务中执行 select for update/update/delete时，如果where条件的列不是主键索引或唯一索引，将加本锁，锁定该记录的前后的空行，只会阻塞插入，不会阻塞更新
- Next Key锁：GAP锁 + Record锁
    - 前开后闭的锁定记录

基本原则：
- 范围查找会（向右）访问到第一个不满足条件的值就停止了
- 加锁的基本单位是 next-key，但是可以退化为Record锁/GAP锁


考察角度：
1. 索引类型：
    1. 主键/唯一索引
    1. 非唯一索引
    1. 没有索引
1. 查询范围：
    1. 等值查询
    1. 范围查询
1. ORDER BY 
    1. asc
    1. desc
1. LIMIT


基本思路：
1. 按照排序顺序，定位等值查询找起点
1. 执行范围查询
1. 访问到记录执行加锁
1. 加锁时根据索引类型，有优化走优化，无优化加 next-key



使用场景进行描述 [原文](https://blog.csdn.net/why444216978/article/details/103154299)：
```
 CREATE TABLE `T` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `goods_id` bigint(20) unsigned NOT NULL,
  `name` varchar(200) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_goods` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

mysql> select * from T;
+----+----------+------+
| id | goods_id | name |
+----+----------+------+
|  5 |        5 | a    |
| 10 |       10 | b    |
| 15 |       15 | c    |
| 20 |       20 | d    |
+----+----------+------+
4 rows in SET  (0.00 sec)
```


**举例说明**

where条件没有命中索引的update：会锁全表
```
T1:
    -- 锁全表
    UPDATE T SET name = 'a1' WHERE 
        name = 'a'; -- 锁全表

T2:
    UPDATE T SET name = 'a2' WHERE name = 'a'; （LOCKING）

    INSERT INTO T VALUES(6, 6, '6');（LOCKING）

    UPDATE T SET name = 'a2' WHERE name = 'b';（LOCKING）
```

where条件命中主键/唯一索引 等值条件的update：next-key锁 退化 record锁
```
T1:
    UPDATE T SET name = 'a1' WHERE 
        id = 10; -- 只在10记录上加record

T2:
    INSERT INTO T VALUES(9, 9, '9');（SUCCESS）

    UPDATE T SET name = 'a1' WHERE id = 10;（LOCKING）

    INSERT INTO T VALUES(11, 11, '11');（SUCCESS）
```

where条件命中主键/唯一索引 范围条件的update
```
T1:
    UPDATE T SET name = 'a1' WHERE 
        id >= 10 -- 等值查询，定位到10这条，加行锁；范围查询，定位到 (10, ?) 
        AND 
        id < 12 -- 范围查询，找到第一条不满足条件的记录15。结合上面的，在(10, 15) 上加 next-key
T2:
    INSERT INTO T VALUES(4, 4, '4');（SUCCESS）

    UPDATE T SET name = 'a1' WHERE id = 5; （SUCCESS）

    UPDATE T SET name = 'a1' WHERE id = 10;（LOCKING）

    INSERT INTO T VALUES(11, 11, '11'); （LOCKING）

    INSERT INTO T VALUES(14, 14, '14'); （LOCKING）

    UPDATE T SET name = 'a1' WHERE id = 15;（SUCCESS）

    INSERT INTO T VALUES(16, 16, '16');（SUCCESS）
```


where条件命中主键/唯一索引 范围条件的UPDATE + LIMIT 
```
T1:
    UPDATE T SET name = 'a1' 
    WHERE 
        id >= 10 -- 唯一索引等值查询定位到10，加 record 
            AND 
        id < 12 
    LIMIT 1 -- 符合，停止
T2:
    UPDATE T SET name = 'a1' WHERE id = 10;（LOCKING）

    INSERT INTO T VALUES(11, 11, '11');（SUCCESS）
```

where条件命中主键/唯一索引 范围条件的UPDATE + ORDER BY
```
1
T1:
    UPDATE T SET name = 'a1' 
    WHERE 
        id >= 10 -- 唯一索引等值查询定位到10，加 record 
            AND 
        id < 12 -- 范围查询，找到第一条不满足条件的记录15。结合上面的，在(10, 15) 上加 next-key
    ORDER BY id asc -- (这个场景下没有任何影响)
T2:
    INSERT INTO T VALUES(4, 4, '4');（SUCCESS）

    UPDATE T SET name = 'a1' WHERE id = 5; （SUCCESS）

    UPDATE T SET name = 'a1' WHERE id = 10;（LOCKING）

    INSERT INTO T VALUES(11, 11, '11'); （LOCKING）

    INSERT INTO T VALUES(12, 12, '12'); （LOCKING）

    INSERT INTO T VALUES(13, 13, '13'); （LOCKING）

    INSERT INTO T VALUES(14, 14, '14'); （LOCKING）

    UPDATE T SET name = 'a1' WHERE id = 15;（SUCCESS）

    INSERT INTO T VALUES(16, 16, '16');（SUCCESS）
```

```
2
T1:
    UPDATE T SET name = 'a1' 
    WHERE 
        id < 12 -- 定位到12这条记录，找到第一条不满足条件的记录15。在(?, 15) 上加 gap
                -- 继续进行 < 12 的范围查找，访问到第一个值 10，在 (5,10] 加 next-key
            AND 
        id >= 10 -- 由于10存在等号，等值查询，访问到第一个值0，在(0, 5]上加 next-key （？？？？） 
    ORDER BY id desc
T2:
    INSERT INTO T VALUES(4, 4, '4');（LOCKING）

    UPDATE T SET name = 'a1' WHERE id = 5; （LOCKING）

    UPDATE T SET name = 'a1' WHERE id = 10;（LOCKING）

    INSERT INTO T VALUES(11, 11, '11'); （LOCKING）

    INSERT INTO T VALUES(12, 12, '12'); （LOCKING）

    INSERT INTO T VALUES(13, 13, '13'); （LOCKING）

    INSERT INTO T VALUES(14, 14, '14'); （LOCKING）

    UPDATE T SET name = 'a1' WHERE id = 15;（SUCCESS）

    INSERT INTO T VALUES(16, 16, '16');（SUCCESS）
```

```
3
T1:
    UPDATE T SET name = 'a1' 
    WHERE 
        id < 12 -- 定位到12这条记录，找到第一条不满足条件的记录15。在(10, 15) 上加 gap
                -- 继续进行 < 12 的范围查找，访问到第一个值 10，在 (5,10] 加 next-key (???)
            AND 
        id > 10 -- 由于10不存在等号，停止查找
    ORDER BY id desc
T2:
    INSERT INTO T VALUES(4, 4, '4');（SUCCESS）

    UPDATE T SET name = 'a1' WHERE id = 5; （SUCCESS）

    UPDATE T SET name = 'a1' WHERE id = 10;（LOCKING）

    INSERT INTO T VALUES(11, 11, '11'); （LOCKING）

    INSERT INTO T VALUES(12, 12, '12'); （LOCKING）

    INSERT INTO T VALUES(13, 13, '13'); （LOCKING）

    INSERT INTO T VALUES(14, 14, '14'); （LOCKING）

    UPDATE T SET name = 'a1' WHERE id = 15;（SUCCESS）

    INSERT INTO T VALUES(16, 16, '16');（SUCCESS）
```

where条件命中 主键/唯一索引 等值条件的UPDATE + ORDER BY + LIMIT
```
1
T1:
    UPDATE T SET name = 'a1' 
        WHERE 
            id <= 21 -- 定位21，等值查找，向右遍历第一个不等于21的记录，在 (21, +∞) 加 gap
                     -- 按排序向前找，找到20， (15, 20] 加 next-key
                     -- 符合limit 1，结束
                AND 
            id >= 8 
        ORDER BY id desc 
        LIMIT 1
T2:
    INSERT INTO T VALUES(6, 6, '6');（SUCCESS）

    INSERT INTO T VALUES(9, 9, '9');（SUCCESS）

    INSERT INTO T VALUES(14, 14, '14');（SUCCESS）

    UPDATE T SET name ='a1' WHERE id = 15;（SUCCESS)

    INSERT INTO T VALUES(16, 16, '16');（LOCKING）

    INSERT INTO T VALUES(19, 19, '19');（LOCKING）

    UPDATE T SET name = 'a1' WHERE id = 20;（LOCKING）

    INSERT INTO T VALUES(21, 21, '21');（LOCKING）

    INSERT INTO T VALUES(22, 22, '22');（LOCKING）
```

```
2
T1:
UPDATE T SET name = 'a1' 
    WHERE 
        id >= 8 -- 定位8，进行8的等值查询，遍历到最后一个不满足等值条件的10，(5, 10) 加 gap-key
                -- 继续从10开始范围查询，找到第一条满足条件的10，在 (5，10] 加 next-key
                -- 符合limit 1，结束
            AND 
        id <= 21 
    ORDER BY id asc 
    LIMIT 1
T2:
    INSERT INTO T VALUES(6, 6, '6');（LOCKING）

    INSERT INTO T VALUES(9, 9, '9');（LOCKING）

    UPDATE T SET name = 'a1' WHERE id = 10;（LOCKING）

    INSERT INTO T VALUES(11, 11, '11');（SUCCESS）
```

where条件命中 非主键/唯一索引 等值条件的update
```
T1:
    UPDATE T SET name = 'a1' WHERE 
        goods_id = 5 -- 二级索引等值查询，访问到主键id 5，在主键 (-∞, 5] 加 next-key
                     -- 等值查询，向右遍历第一个不满足条件的10，在 (5, 10) 上加 gap (????)
T2:
    INSERT INTO T values (4, 4, '4');（LOCKING）

    UPDATE T SET name = 'a1' WHERE goods_id = 5;（LOCKING）

    UPDATE T SET name = 'a1' WHERE goods_id = 6;（SUCCESS）

    INSERT INTO T values (6, 6, '6');（LOCKING）

    INSERT INTO T values (9, 9, '9');（LOCKING）

    UPDATE T SET name = 'a1' WHERE goods_id = 10;（SUCCESS）

    INSERT INTO T VALUES(11, 11, '11'); （SUCCESS）
```

where条件命中 非主键/唯一索引 范围条件的update
```
T1:
    UPDATE T SET name = 'a1' WHERE 
        goods_id >= 5 -- 二级索引等值查询，访问到主键id 5，在主键 (-∞, 5] 加 next-key
            AND 
        goods_id < 8; -- 二级索引范围查找，找到第一条不满足条件的记录10，在主键 (5, 10] 加 next-key
T2:
    INSERT INTO T values (4, 4, '4');（LOCKING）

    UPDATE T SET name = 'a1' WHERE goods_id = 5;（LOCKING）

    UPDATE T SET name = 'a1' WHERE goods_id = 6;（SUCCESS）

    INSERT INTO T values (6, 6, '6');（LOCKING）

    INSERT INTO T values (9, 9, '9');（LOCKING）

    UPDATE T SET name = 'a1' WHERE goods_id = 10;（SUCCESS）

    INSERT INTO T VALUES(11, 11, '11'); （SUCCESS）
```

## 死锁
死锁：一个以上的事务在同一个资源上相互作用，并请求锁定对方占用的资源而导致的恶性循环事件。

分析死锁还是从上述的锁占用的开始。

死锁日志举例说明 TO BE DONE