<!--
author: 刘青
date: 2018-08-26
title: 数据库中间件系统的设计思路
tags: 系统设计,数据库中间件
type: note
category: web
status: publish
summary:
-->

最近我们团队要做一个数据库中间件访问系统，因为现在业务线中已经开始存在数据库共享的现象。


### 需求描述 
大概的功能需求是：
- 所有的数据库访问都来访问该系统
- 该系统负责和底层的各个数据库表打交道
- 系统要有字段映射能力：不同的接口访问不同的字段其实可能指向同一个数据库字段
- 系统要有简单的鉴权，入参校验的能力：同一个数据库字段不同的接口的参数检查逻辑可能不一样
- 可能后续会对某些数据加缓存
- 新增修改不提供同时操作的能力，但是查询后期要支持跨库|表的关联查询
- 系统暂时不通过聚合数据查询（sum|agv等函数的运算结果），当然，如果这些数据被缓存在统计表中，也可以直接CURD

举个例子：
现在对于A使用方；
```
API: /db_middleware/address/a_query?id=1
Params: 
    {
        fields: ["id", "user_id", "status", "address"]
    }

API: /db_middleware/address/a_create
Params: 
    {
        "user_id": 123,
        "address": "some where",
        "status": 1
    }
```

现在对于B使用方；
```
API: /db_middleware/address/b_query?id=1
Params: 
    {
        fields: ["id", "user_id",  "user_address"]
    }
只返回status=1 的记录，且 address 的key 是user_address

API: /db_middleware/address/b_create
Params: 
    {
        "user_id": 123,
        "address": "some where",
    }
新增的所有的记录的status 都是默认值0 表示待审核。
```



非功能需求包括：
- 系统的高可用性：作为底层系统，挂了会影响整个业务线的业务
- 系统的高扩展性：新增接口要尽可能代价小，尽可能没有编码就可以实现，实现使用方的快速低成本接入（可配置性）
- 日志记录：追查操作历史

### 思路
最常规的思路其实和传统的web API开发没有什么差别，对应一张表，提供CRUD四个接口，在代码分层上也可以是:

```
|-----------------------|
|       controller      | 参数校验
|-----------------------|
            |
            ↓
|-----------------------|
|           model       | 数据整合
|-----------------------|
            |
            ↓
|-----------------------|
|       dao | cache     | 数据访问
|-----------------------|
```

代码结构可能是:
```
├── cache
├── controller
│   ├── address
│   │   ├── create.go
│   │   ├── list.go
│   │   ├── one.go
│   │   └── udpate.go
│   └── user
│       ├── create.go
│       ├── list.go
│       ├── one.go
│       └── udpate.go
├── dao
│   ├── address
│   │   ├── create.go
│   │   ├── list.go
│   │   ├── one.go
│   │   └── udpate.go
│   └── user
│       ├── create.go
│       ├── list.go
│       ├── one.go
│       └── udpate.go
├── model
│   ├── address
│   │   ├── create.go
│   │   ├── list.go
│   │   ├── one.go
│   │   └── udpate.go
│   └── user
│       ├── create.go
│       ├── list.go
│       ├── one.go
│       └── udpate.go
```

这个不需要设计的设计有以下缺陷：
- 无法快速开发，和业务耦合太紧，也对使用方有较强的限制
- 重复代码太多，作为数据库访问中间件，每张表的查询其实都是CURD，代码逻辑基本一致

> 解决问题的能力取决于抽象问题的能力。

我们其实可以把整个系统的功能进行抽象：
- 参数校验：不同的接口的key的枚举值是不一样的，不同接口对于同一个key的value的枚举值可能是不一样的
- 可能的cache访问：同一个接口的cache策略基本上是一样的
- 数据库访问：根据参数进行访问数据库的sql其实基本上是一样的
- 数据格式化返回：这个和参数校验相关

如果我们把每个环节的都做出和接口相关的抽象实现，具体的逻辑放到配置文件中，新增功能其实就成了新增配置。

### 可配置化的编码逻辑
可配置化编程这个概念很美好，但是真正做起来难度其实还是挺高的。

#### 数据库表的抽象

我们先从数据库来抽象，看其如何可配置，数据库表的抽象其实最完整的是DDL。但是我们基于业务去做抽象。

假设我们有 address 表：

```
id          int 自增ID
user_id     string
address     varchar(1024)
status      int8
```

我们用数据库对其进行描述：
```
address_table.json
{
    "parttition_key": "user_id",            // 分表字段为 user_id    
    "partition_strategy": "crc32_1024",     // crc32 后 1024张表
    "auto_key": "id",
    "fields" {
        "id": {
            "name": "id",
            "type": "int"
        },
        "user_id"    : {
            "name": "user_id",
            "type": "string",
            "min_len": 1,           // 和业务相关，不能为空
            "max_len": 50
        },
        "address": {
            "name": "address",
            "type": "string",
            "min_len": 1,
            "max_len": 1024         // 和业务相关的配置
        },
        "status": {
            "name": "status",
            "type": "int8",
            "enums": [0, 1, 2, 3]   // 和业务相关的描述
        }
    }
}
```

当前的描述基本够用了:
- 如果分表，用 parrtition_* 指明
- 如果有自增字段，使用auto_key 指定，数据插入时需要使用
- 每张表会有一系列的字段（当前不考虑跨表查询），每个字段有
    - 名字和类型
    - 和业务相关的校验，比如可能的值，范围等

数据库是固定的，是API的基石：
- API 的所有的接口对应的都是底层数据库的0-N 张表
- API的所有的接口的字段对应的都是表的0-N个字段

#### 接口配置
为什么先从数据库抽象能？因为API是和用户相关的，该变动其实和上层业务相关，无法穷尽但可抽象。

为了减少配置，我们要求所有的参数通过json传递，content-type = application/json


先说明一下每个请求配置的字段：
- type指定这个接口的类型，当前包括：one, list, update, del, create。
- conditions指定各个字段的过滤条件，当前只支持一维的 and 查询
    - source 指定当前字段的值的来源，默认为input， 有：{fixed: 固定值, input:入参}
    - validtor 指定对这个参数的校验逻辑，默认为none，有: {none: 不做校验， not_empty: 不为空...}
    - modifier 指定对入参的格式化方式，默认为 none
    - db_field 指定数据库的字段，不填写表示和数据库一样
- fields 是返回参数列表，key是入参的key，val对应数据库的内容, 置空时表示和数据库一样
    - appear  指定是否在返回中出，默认为true
    - modifier 指定对入参的格式化方式，默认为 none
    - db_field 指定数据库的字段，不填写表示和数据库一样


我们使用上面的实例进行说明:

```
address/a_query.json
{
    "type": "one",
    "conditions": {
        "id": {
            "source": "input",
            "validtor": "not_empty",
        },
        "uid": {
            "source": "input",
            "validtor": "not_empty",
            "db_field": "user_id"
        }
    },
    "fields": {
        "uid": {
            "db_field": "user_id"
            "modifier": "none"
        }
    }
}

对于请求：
{
    "conditions": {
        id: 1,
        uid: "1234"
    },
    fields: [id, address, status]
}
系统先根据接口配置进行参数校验和数据转换
再根据表配置进行参数校验（业务校验要不比数据库校验轻松，但是程序员可能偷懒）
生成sql: SELECT id, address, status FROM crc(user_id) % 1024 WHERE id = 1 AND user_id = "1234" LIMIT 1
根据接口配置修饰数据库的返回数据，进行返回


address/b_query.json
{
    "type": "one",
    "conditions": {
        "id": {
            "source": "input",
            "validtor": "not_empty",
        },
        "user_id": {
            "source": "input",
            "validtor": "not_empty",
        },
        "status": {
            "source": "fixed"，
            "value": 1
        }
    },
    "fields": {
        "uid": {
            "db_field": "user_id"
            "modifier": "none"
        },
        "status": {
            "appear": false
        }
    }
}
步骤基本上差不多，但是B不能查看 status 字段，而且它是用uid来表示user_id的。
```

CRUD 一共会有五种接口，全系统一共会有五种接口。

还有的是 列表查询的 分页等问题，不进一步阐释了。

### 实现语言

> 用简单问题解决复杂问题是一种很重要的能力。

这篇文档讲述的是设计思路，和语言本身无关。
另外，用最简单的数据结构好像就可以把它实现出来，而不用动不动反射啊，标注啊。

### 接口协议本身
我们现在用的接口协议其实很简单，以至于有点土。它能解决我们绝大多数情况下的需求，但是如果涉及到跨表查询什么的，其实写起来也不太方便（其实任何形式都不太发表）。我们可以参考es的查询语言。

这这里抛砖引玉，Facebook开源的一个叫 `GrophQL` 的 API查询语言，它的核心思想是：

> 一切皆图。

有需求的同学可以去看看： http://graphql.cn/
