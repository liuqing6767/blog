---
type: category
---

HTTP 诞生于1990年，已经是互联网上主要的信息传输协议了。

# HTTP是什么
HTTP 全称是 `HyperText Transfer Protocol`。最初用来完成两个电脑间的文本传输。随着发展，它可以传输的载体类型越来越丰富。

# 有哪些主要版本
当前，HTTP 有 `HTTP/1.1`、`HTTP/2` `HTTP/3` 三个主要版本。它们依赖相同的语义，但是有各种的的消息语法。所以HTTP的整体框架为：
- HTTP各版本通用的内容：
    - [HTTP 语义](https://datatracker.ietf.org/doc/html/rfc9110)
    - [HTTP 缓存](https://datatracker.ietf.org/doc/html/rfc9111)
- HTTP各版本具体的语法
    - [HTTP/1.1](https://datatracker.ietf.org/doc/html/rfc9112)
    - [HTTP/2](https://datatracker.ietf.org/doc/html/rfc9113)
    - [HTTP/3](https://datatracker.ietf.org/doc/html/rfc9114)

最初的协议被定义为 `HTTP/0.9` 和 `HTTP/1.0`，是一个微不足道的机制:
- 只有一个 GET 方法，用来低延迟的请求给定路径的超文本;
- 随着互联网的发展，被扩展为将信息包裹起来的请求和响应，使用 类MIME媒体类型传输任意内容，使用中间媒介路由请求。

`HTTP/1.1` 向前兼容了基于文本的语法格式，但是提升了其在Internet上的可操作性、可伸缩性和健壮性。包括：
- 对固定/动态内容的 基于长度的数据分割
- 内容协商的一致性框架
- 用于条件请求的不透明验证器
- 用于更好的缓存一致性的缓存控制
- 用于部分更新的范围请求
- 默认的持久连接

`HTTP/2` 介绍了一个 在现有的TLS 和 TCP 协议之上 的 多路复用的会话层，使用 高效的字段压缩和服务器推送， 用来交换并发的HTTP消息。

`HTTP/3` 通过使用 在UDP而不是TCP 的安全多路复用传输传输的QUIC，提供了更加独立的并发消息。