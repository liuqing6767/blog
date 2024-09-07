# HTTP/1.1

HTTP/1.1 [RFC9112](https://datatracker.ietf.org/doc/html/rfc9112) 是遵循 [HTTP语义](https://datatracker.ietf.org/doc/html/rfc9110) 的一个具体版本。这个文档只包括消息语法和链接管理，其他信息需要搭配 HTTP语义 文档一起阅读。

简写说明：
- OWS: optional whitespace
- RWS: required whitespace
- SP: single space


## 1. 消息语法
HTTP/1.1的消息格式为：
```
  HTTP-message   = start-line CRLF
                   *( field-line CRLF )
                   CRLF
                   [ message-body ]
```

消息分为请求消息和响应消息，它们唯一不同的地方是 `start-line`。
```
  start-line     = request-line / status-line
```

### 1.1. Requet Line
Request Line 是 请求消息的 Start Line。

```
  request-line   = method SP request-target SP HTTP-version

  method         = token

  request-target = origin-form
                 / absolute-form
                 / authority-form  CONNECT 特有的
                 / asterisk-form   OPTIONS 特有的

  origin-form    = absolute-path [ "?" query ]
  absolute-form  = absolute-URI
  authority-form = uri-host ":" port
  asterisk-form  = "*"
```

举例：
```
GET /where?q=now HTTP/1.1
Host: www.example.org

GET http://www.example.org/pub/WWW/TheProject.html HTTP/1.1

CONNECT www.example.com:80 HTTP/1.1
Host: www.example.com

OPTIONS * HTTP/1.1
Host: www.example.org:8001
```

### 1.2. Status Line
Status Line 是 响应消息的 Start Line。

语法为：
```
  status-line = HTTP-version SP status-code SP [ reason-phrase ]

  status-code    = 3DIGIT
  reason-phrase  = 1*( HTAB / SP / VCHAR / obs-text )
```

### 1.3. 字段语法
```
  field-line   = field-name ":" OWS field-value OWS
```

### 1.4. 消息 Body
语法为：
```
  message-body = *OCTET
```

消息Body就是一连串的二进制数据，其是否存在：
- 请求是否存在 消息Body 由 `Content-Length` 和 `Transfer-Encoding` Header 来说明
- 响应是否存在 消息Body 取决于它所响应的请求方法和响应码

消息Body如果存在，最关键的是其长度：
1. HEAD 请求的响应、以及响应码为 1xx(Information) 204(No Content) 304(Not Modified) 的响应 一定在响应的Headr段后第一个空行终止（一定没有body）
1. CONNECT 请求的 2xx(Successful) 的响应意味着 连接在Header 段第一个空行之后就切换为隧道了。客户端必须忽略 `Content-Length` 和 `Transfer-Encoding` Header
1. 如果消息同时收到 `Transfer-Encoding` 和 `Content-Length` 字段，前者优先级更高。可能存在安全风险可以作为处理，如果选择处理则应该将删除 `Content-Length` 并处理 `Transfer-Encoding` 后在转发给下游
1. 如果 `Transfer-Encoding` 出现并且 chunked转换编码是最终的编码，那么body的长度需要通过读取并且解码chunked的数据才能得到
1. 如果 `Transfer-Encoding` 出现但 chunked转换编码不是最终的编码，那么body的长度需要通过读取连接直到其关闭才能得到
1. 如果 没有 `Transfer-Encoding` 而且 `Content-Length` 的值不是一个合法的数字而且还不能转换为逗号分隔的列表形式，则认为是一个不可恢复的错误。如果接收方是服务端，必须返回400(Bad Request) 并关闭连接；如果接收方是代理，则返回 502(Bad Gateway)；如果接收方是客户端，应该关闭连接并且抛弃响应
1. 如果消息没有收到 `Transfer-Encoding` 但是收到 `Content-Length` 字段，那么长度就是 `Content-Length`。如果应为发送方连接关闭或者接收方超时导致没有收到指定数量的内容，接收方应该意识到当前消息不完整 并且关闭连接
1. 如果两个Header都不存在，如果是请求消息，则没有Body
1. 不然，就由服务端关闭连接前收到的内容的长度为准。

## 2. 消息转换

消息的转换有很多种，比如：
- chunked
- compression

通过 `TE` Header 来协商传输编码。比如：
```
TE: deflate
TE:
TE: trailers, deflate;q=0.5
```

### 2.1. chunked 传输编码
chunked传输编码将内容转换为一系列的块(chunk)进行传输。格式为：
```
  chunked-body   = *chunk
                   last-chunk
                   trailer-section
                   CRLF

  chunk          = chunk-size [ chunk-ext ] CRLF
                   chunk-data CRLF
  chunk-size     = 1*HEXDIG
  last-chunk     = 1*("0") [ chunk-ext ] CRLF

  chunk-data     = 1*OCTET ; a sequence of chunk-size octets

  chunk-ext      = *( BWS ";" BWS chunk-ext-name
                      [ BWS "=" BWS chunk-ext-val ] )

  chunk-ext-name = token
  chunk-ext-val  = token / quoted-string

  trailer-section   = *( field-line CRLF )    
```

chunked的消息包括：零到多个chunk，最后一个chunk， trailer部分和一个CRLF组成。

每个chunk又两行组成：
- 一个十六进制的数字开始表示本chunk的长度，一个可选的扩展和一个CRLF
- chunk-data 加一个CRLF

trailer部分则是可选的，一般是提供整体长度、签名等信息。

### 2.2. compression 传输编码
这部分见 HTTP语义。

## 3. 连接管理

### 3.1. 连接建立
这个是通过传输层（http基于TCP）或者会话层（https基于tls）建立的。本文不讨论这个话题

### 3.2. 响应和请求的关联
通过顺序。不考虑多响应的信息(1xx 信息类响应)第N个响应对应第N个请求。

如果客户端收到的响应没有对应发出的请求，客户端必须认为消息时非法的并且应该关闭连接。

### 3.3. 连接持久化
连接持久化是指一个连接可以用来发送多个请求和响应，而不是发送一个请求和响应后就关闭。

- 如果 `Connection: close` Header出现了，连接会在当前响应发送完成后关闭
- 如果是 HTTP/1.1 以及后续更新的版本，默认是持久化连接
- 如果是 HTTP/1.0，`Connection: keep-alive` 出现了，连接是持久化的
- 不然，连接就不是持久化的


HTTP 没有限制必须得到响应客户端才能发送下一个请求，所以客户端可以连续发送多个消息，也就是Pipelining。服务端对于安全的请求可以并发处理，但是响应消息必须是有序串行的。

### 3.4. 连接并发

并发连接用来处理 `head-of-lineblock` 的问题。也就是在同一连接上，后续的消息都需要等待前面消息传输完成才能传输。

连接会消耗服务端资源，客户端应该限制和某个服务端的并发连接数。

更多的，在拥塞网络中，大量连接会加剧拥塞。也可能让网络开始拥塞。

### 3.5. 失败和超时
服务端可能会在将某个时间段后不再维护非活跃的连接。

客户端或服务端可以随时的关闭连接。 希望超时的客户端或者服务端应该优雅的关闭连接。

### 3.6. 连接关闭
客户端和服务端使用 Connection Header进行关闭。
```
Connection: close
```

- 客户端发送了这Header后必须不能在发送请求
- 服务端收到这个Header后必须不再处理后续的请求，必须在处理完最终响应后关闭连接
- 服务端发送这个Header后必须关闭连接，必须不再接收后续的响应


### 3.7. TLS连接初始化和关闭

简单的说，TLS通过handshake完成连接的初始化，使用 alter进行安全的关闭。

## 4. 安全考虑
这里的问题是和HTTP消息语法和解析相关的，HTTP语义、内容和路由的安全问题在 [HTTP](https://datatracker.ietf.org/doc/html/rfc9110) 中。

### 4.1 响应切割

也叫 "CRLF 注入"。就是在 Header中注入 CRLF，让处理者认为是多个请求而进行多次响应。

一个通用的处理首单是讲 对类似的字符进行编码。

### 4.2. Request Smuggling
这个是利用不同的接收者对协议解析的差异，构造不同的消息进行攻击。 

[详见这个文档](https://www.cgisecurity.com/lib/HTTP-Request-Smuggling.pdf)

### 4.3. 消息的完整性

HTTP 没有机制确认消息的完整性。一般借助 https方案。

### 4.4. 消息的机密性

HTTP 没有机制确认消息的机密性。一般借助 https方案。