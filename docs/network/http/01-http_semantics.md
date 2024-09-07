# HTTP 语义

HTTP各个版本的语义是一样的，所以单独的将此作为一章，RFC也有单独的 [HTTP 语义](https://datatracker.ietf.org/doc/html/rfc9110)。

HTTP语义的核心为：
- 提供一个交互资源的统一接口，不关心资源的具体的类型、特征或者实现
- 消息类型：要么是请求要么是响应。客户端构造请求并路由到服务器。服务器监听请求，转换、解释请求，将其关联上资源，然后响应一到多个消息。
- 每个请求的意图通过方法来表示，同时可能使用请求头来进一步补充。响应使用状态码来描述，同时可能会有其他的控制数据和资源元数据
- 内容协商：内容期望如何被接受者解释的表示元数据、影响内容挑选的请求头、多种挑选算法都统称为内容协商。

说明：文档参考的RFC为修订版后的，其有一点从结果来描述现状的感觉：
- 受到很多 `REST` 的影响，认为返回的内容是资源的一个表示（一个资源可以有多个表示，消息内容只是资源的一个表示），行为和method相关
- 受到了很多后面的版本的影响。比如 authority 在h2中不在Header中了

## 1. 核心概念
1. 资源：HTTP请求的目标。大多数资源使用 `Uniform Resource Identifier` 指定。
1. 表示：表示是用来反映给定资源过去、现在或者期望的状态的信息。由一系列的表示元数据和一个可能没有边界的表示数据组成。HTTP通过定义资源状态可传输的表示而不是直接传输资源本身来在同一界面后面“隐藏信息”。
1. 连接，客户端，服务端：客户端就是建立连接并发送一到多个请求的程序，服务端就是接收连接进而服务通过发送响应来服务请求的程序。一个程序可能同时是客户端和服务端。HTTP是无状态的，所以不能假设同一个连接上的两个请求有任何关系。
1. 消息：HTTP就是一个在连接桑交换 消息 的 请求/响应 协议。客户端发送一个 请求消息 给 服务端，这个消息有一个 方法和请求目标，可能包含请求头、内容和尾挂字段。服务端会响应一到多个 有类似结构的响应信息。
1. 用户代理：各种各样的初始化请求的客户端，比如Web浏览器，也有爬虫、命令行工具等
1. 源服务器(Origin Server)：对目标资源能够权威的给出响应的程序。比如大型公开网站。
1. 中间节点(Intermediaries)：HTTP允许使用中间节点来满足请求。中间节点有三大类：
    - proxy：客户端选择的消息转发代理。组织常常用代理来实现安全访问。
    - gateway：也叫 reverse proxy。对出向（往源服务器为入向，往客户端为出向）。中间节点对于 出向连接 作为源服务器，但是翻译接收的请求并转发给其他的服务器。网关常常用来分割或者负载均衡HTTP服务的多台服务器。
    - tunnel：是不改变传输内容的中继器。一般用来扩展一个虚拟连接。
1. 缓存：缓存是前一个响应消息的本地存储，也是控制消息存储、检索、删除的子系统。用来减少请求/响应链来减少带宽和延时。
1. 消息交互示例

客户端请求：
```
GET /hello.txt HTTP/1.1
User-Agent: curl/7.64.1
Host: www.example.com
Accept-Language: en, mi
```

 服务端响应：
```
HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT
Server: Apache
Last-Modified: Wed, 22 Jul 2009 19:15:56 GMT
ETag: "34aa387-d-1568eb00"
Accept-Ranges: bytes
Content-Length: 51
Vary: Accept-Encoding
Content-Type: text/plain

Hello World! My Content includes a Trailing CRLF.
```

## 2. 资源定位符
HTTP 中 使用 统一资源定位符 Uniform Resource Identifiers (URIs) 来定位资源。

URI 有专门的 [RFC](https://datatracker.ietf.org/doc/html/rfc3986) 定义，简而言之就是：

```
      URI         = scheme ":" hier-part [ "?" query ] [ "#" fragment ]

      hier-part   = "//" authority path-abempty
                  / path-absolute
                  / path-rootless
                  / path-empty
```

举例为：
```
         foo://example.com:8042/over/there?name=ferret#nose
         \_/   \______________/\_________/ \_________/ \__/
          |           |            |            |        |
       scheme     authority       path        query   fragment
          |   _____________________|__
         / \ /                        \
         urn:example:animal:ferret:nose
```

### 2.1. HTTP相关的URI规定
对于scheme，HTTP有一些的规定：
- http协议的的 URI 格式为：`http-URI = "http" "://" authority path-abempty [ "?" query ]`。port没有的话默认就是80。
- https 协议的 URI 格式为：`https-URI = "https" "://" authority path-abempty [ "?" query ]`。port没有的话默认就是443
- 规范化的规则：
    - 如果port和默认的相同，那么默认就是忽略port；
    - 如果不是 OPTIONS，空的path等价于 `/`，所以一般都是 `/` 形式； 
    - scheme和host忽略大小写，一般使用小写；其他部分大小写敏感
    - 非保留字符集合 的本身和 percent-encoded 的字节是等价的，但是一般是不编码的
- URI 中的 用户消息 部分(就是在URI中包含 user:password 部分)被废弃掉了，为了避免钓鱼攻击

### 2.2. 权威访问
权威访问 指的是对给定的标识符进行解引用，让客户端认为是在用权威的方式访问该资源。

URI 中的 Origin 有三个部分： `{`scheme, host, port`}`，比如 `https://Example.Com/happy.js` 的origin 为 `{` "https", "example.com", "443" `}`。origin定义了如何将标识符和资源映射。

对于HTTP请求，如果host标识是IP，那么客户端会直接访问这个IP，如果是域名，就会先用名字解析得到IP。如果服务端回复非临时的HTTP响应信息，那么可以认为得到了权威的响应。

对于HTTPS请求，其权威性和服务端的证书相关。客户端通常依赖信任锚来通过证书来确认服务器的权威性。（其相关的细节就是TLS）

## 3. 字段
字段 是指 可扩展的 name-value对 形式。在消息的 Header 和 Trailer 部分 被发送和接收。

字段主要关注的是 字段名（格式和字符范围）、字段值（格式和字符范围）、字段的顺序、字段的大小。

字段名大小写不敏感。

代理应该转发未识别的Header字段，除非它在 Connection Header列表中，或者在自己的黑名单中。

字段小节由任意多个字段行组成，每行有字段名和字段值，格式为 `Name: V1 [, V2] ...`。
举例，有如下的小节：
```
Example-Field: Foo, Bar
Example-Field: Baz
```

其包含了两个字段行，一个字段值 `Example-Field`，其有三个字段值。

代理在转发消息时必须不能改变字段行的 值的顺序。
发送者必须不能生成有相同名字的多个字段行。除了 Set-Cookie 这个头字段，其常常存在多个。

不同字段名的字段行的顺序并不重要，好的实践是先发送控制消息的行来更早的确认是否要处理消息，比如请求的 `Host` 字段和响应的 `Date` 字段。

这段行没有大小限制。但是具体实践上服务端会有限制，如果不符合要求，应该返回4XX。

## 4. 消息的抽象
HTTP每个主要的版本都会有自己的消息语法。本节基于消息特征、公共结构和传递语义的能力的概括 HTTP消息 定义了一个抽象的为数据类型。这个抽象独立于具体的版本。

一个 “消息” 包括如下部分：
- 控制数据：描述和路由消息
- Headers：用来扩展控制数据和传递更多关于发送者、消息、内容、上下文的更多信息
- 内容：没有限制的内容流
- Trailers：在发送消息时获得 用来交流的信息的键值对

上述部分发送顺序也是一样的顺序。

消息期望被当做流来处理，流的目的和后续的处理行为都在读的时候确认。因此描述接收者要怎么做的控制数据需要被马上知道，Header字段描述描述了接受内容前需要了解的信息，内容包括了接收者需要或者期望的填充， Trailer 字段提供了在发送内容前不知道的元数据。

消息尝试为自描述：在界面或者重组在传输中被压缩或省略掉的部分后，接收者需要知道的关于消息的信息都能通过查找消息自身确认。

### 4.1. 分帧和完整性
消息分帧指的是每个消息如何开始和结束。
- HTTP/0.9 和早期部署的 HTTP/1.0 使用底层的连接关闭作为将响应消息的结束。这种隐含的分帧方式会在连接提前关闭时造成消息不完整。
- HTTP/1.1 为了先前兼容，兼容了这种隐含的分帧方式。但是同时也使用了现代的实现：基于长度定界的显示分帧。

### 4.2. 控制数据
消息由控制数据开始，请求消息的控制数据包括：`{`method, request target, protocol version`}`，响应消息的控制数据包括：`{`status code, 可选的原因短语, protocol version`}`。
在HTTP/1.1 及更早之前的版本，这个叫 首行(first line)。HTTP/2  和 HTTP/3，控制数据当做保留前缀的伪头字段发送。

每个消息都有一个版本号。接收方通过版本信息来确认后续和发送者通信的限制和潜力。
客户端应该发送其匹配的最高的请求版本，但是不应该高于服务端支持的最高主版本（如果它知道）。
服务端应该发送服务端支持的、主版本好小于或等于请求中收到的版本号。服务端可以发送505来拒绝客户端的主版本号

### 4.3. Content 
HTTP消息常常传递完整或者部分的表示形式作为消息的内容：Header章节后面的字节流。
内容的抽象定义反应了从消息帧中提取出来的数据。比如HTTP/1.1 的message body 可能包括了使用 分块传输编码 编码过的流数据 —— 一系列数据块，一个长度为0的块，一个 Trailer 节 —— 但是数据只有解码之后的内容，看不到数据块等内容。

请求内容的的目的通过方法字段来指定，响应内容的目的用请求方法和响应状态码来指定。

消息内容常常期望发送者提供或接收者确认其对应的资源的表示。比如客户端发送一个 “当前天气报告”的 GET请求，可能期望有标识地点和时间的资源返回。

对于一个请求消息：
1. 如果请求有 Content-Location 头字段，那么发送者断言内容是由 该字段标识的。但是如果没有办法通过其他方式验证，没办法证明该断言是对的；
1. 不然就认为该内容没有被 HTTP 标识，但是可能内容本身有相关的信息

对于一个响应信息：
1. 如果请求的方法是 HEAD 或者 响应码是 204(No Content ) 或 304(Not Modified)，响应中没有内容
1. 如果请求方法是 GET 并且 响应码是 200(OK)，那么内容就是目标资源的表示
1. 如果请求方法是 GET 并且 响应码是 203(Non1.Authoritative Information)，内容是由中间节点提供的、可能被修改和扩展的目标资源
1. 如果请求方法是 GET 并且 响应码是 206(Partial Content )，内容目标是资源的一部分
1. 如果响应有 Content-Location 头字段并且 其值是 对与目标URI相同URI的引用，则内容是目标资源的表示
1. 如果响应有 Content-Location 头字段并且 其值不是 对与目标URI相同URI的引用，则发送者断言内容是由 Content-Type的值标识的 内容 的表示
1. 不然就认为该内容没有被 HTTP 标识，但是可能内容本身有相关的信息

### 4.4. Trailer 字段
字段除了有 Header，还有 Trailer 。 Trailer 提供完整性检查、数字签名、交付指标或者后处理状态信息。

 Trailer 在 Content 后面，不能在Header里面。 Trailer 和 Header 可能相互冲突。

 Trailer 只能在有显示帧机制的HTTP版本上。比如 HTTP/1.1 的 块传输编码 允许在 Content 后面发送 Trailer 。

发送者只有在得知对应的Header字段名被允许以尾字段的形式发送时才能发送 Trailer 。

中间节点 在从一个版本向另一个版本转发消息时 很难处理 Trailer。如果整个消息能够被缓存下拉，有些中间节点会将 Trailer 转换为 Header 后转发。但是大多数情况下， Trailer 只是简单的被丢弃掉。接收者一定不能将 Trailer 合并到Header，除非了解对应的Header的定义并确认 Trailer 可以安全的被合并。

在 TE 这个 Header 中出现了 " Trailers" 字段，代表请求发起的客户端乐于接受Trailer字段，包括它自身和任何下游客户端。对于请求来自于中间节点，这暗含着所有的下游客户端都乐于在转发的响应中接收 Trailer 。需要注意的是，" Trailer " 的出现不意味着客户端会处理它，可能仅仅就是不丢弃它。

考虑到 Trailer 在传输中被丢弃的可能，服务端只有在必要的时候才应该生成 Trailer 。

Trailer 的处理和使用和 Header 是类似的。

### 4.5. 消息元数据
指的是用来自我描述的信息。可以出现在请求/响应中。
- Date：消息什么时候生成的，比如： `Date: Tue, 15 Nov 1994 08:12:31 GMT`。具有时钟服务的服务器必须为所有的2XX、3XX、4XX 响应生成Date Header，1XX、5XX则是可选的。要是没有时钟服务，服务器必须不生成。如果没有Date Header，接收者需要在缓存或转发时必须追加上这个Header。
- Trailer ：提供了发送者期望在该消息中作为预告字段发送的字段名称列表，这样接收方就可以在开始处理内容前作为准备。也就是说发送者应该在Header中生成 Trailer 字段，说明哪些字段预计在Trailer中出现。


:::info
至此，HTTP 框架性的东西就讲完了。简单回顾一下：
- HTTP的核心组成 是 客户端 `<-`消息`->` 服务端
- 消息的组成包括：控制信息（首行）、Header Fields， Content ， Trailer Fields 组成

后面的内容就是进一步细化这些消息的组成部分。
:::


## 5. 控制信息-消息的路由
HTTP请求消息由 每个客户端的 目标资源、代理配置和入站连接的建立或复用来 来路由。对应的响应则在相同的连接链路上返回回去。

### 5.1. 确认目标资源
前面说明了是通过URI来确定目标资源。客户端发送的消息包含解析目标URI的足够的信息，在消息控制数据和Host Header中发送。服务端收到请求后重新构建这个URI，得到“有效请求URI”。因为历史意义，URI统称为“请求目标”。

有如下两个特殊的情形目标组件采用特定的方式：
- CONNECT 请求，请求目标是隧道目的的 主机名:端口号
- OPTIONS 请求，请求目标可以是 *

### 5.2. Host 和 :authority
`Host = uri-host [ ":" port ]`，是目标URI中的信息，让服务都给主机名的服务端可以完成区分。它有两个形式：
- HTTP/1 中为 Host Header
- HTTP/2 HTTP/3 中在某些情况下有 `:authority` 伪报头字段所取代。

这些信息对于处理请求非常重要，如果非`:authority`，客户端必须生成Host Header，应该最先发送。一个请求的开始应该如下：
```
GET /pub/WWW/ HTTP/1.1
Host: www.example.org
```

### 5.3. 路由入向的请求
一旦目标URL和其origin确定了，客户端可以确认是否需要发送请求，如果需要，往哪发送。一般有如下的目的的（这里讲的确实是客户端的行为）：
- 到缓存：如果客户端有适合的缓存，请求会被定向到缓存
- 到代理：如果配置了，就往代理发
- 到源服务器：这个具体的实现有很多。需要考虑http、https 等实现

### 5.4. 拒绝错误重定向的请求
如果发现了错误重定向的请求，服务端要确认是否有安全风险（下文会进一步讨论）。421(Misdirected Request)状态码表示源服务器拒绝了看起来被错误重定向的请求。

### 5.5. 响应关联
一个连接可能用来交换多个请求/响应消息，请求和响应消息的对应机制因版本而有差异。有点是通过消息的顺序隐形的关联，有点则是通过显式的标识关联。

所有的响应都可以都可以在收到请求后的任意时间发送，不需要等待请求接收完。响应可以在请求完成之前就完成。同时，客户端也不需要为响应等待特定的时长。但是客户端可能会在一定时间后都没收到响应的情况下放弃请求（超时机制）。

客户端可能在没有发完消息时就收到了响应，这时候客户端应该进行发送请求，除非收到了明确停止发送的指令。

### 5.6. 消息转发
在处理请求和响应的过程中，中间节点可扮演多种角色。有的中间节点用来提高性能和可用性，有的用来进行访问控制和内容过来。由于HTTP流有类似于 `pipe-and-filter` 架构，中间节点在流的任何方向上的扩展程度并没有强制的限定。

即便协议元素不能被识别，中间节点也应该转发消息，这样下游就保留了可扩展性。

**Connection**

对于非 tunnel 的中间节点，转发时必须实现 Connection 头，并且排除掉仅用于连接的字段转发。

如果没有无限循环请求的保护，中间节点必须不能把消息转发给自己。通常，一个中间节点应该识别自己的服务名，包括别名、本地变量或者字面IP，并直接响应此类请求。

可以将HTTP消息转换为流进行增量处理或者转发给下游。但是发送者和接收者不能依赖部分消息的增量交付，因为为了网络优化、安全检查或者内容转换，有些实现会缓存或者延迟消息的转发。

Connection 字段允许发送者列出当前连接需要的控制选项。格式为：
```
  Connection        = #connection-option
  connection-option = token
```

举例：
```
Connection: keep-alive
Connection: close
```

中间节点在转发消息之前必须接卸收到的 Connection Header，并且从 Header和 Trailer 中删除连接选项相同的字段，然后移除Connection头自身（或者使用中间节点自身的控制选项）。（是说让Connection只在两个直接通信（hop-by-hop）的节点生效）

更多的，中间节点应该在转发前移除或者替换已知的需要被替换的字段，无论是否当做连接选项出现。包括但不限于：`Proxy-Connection`, `Keep-Alive`, `TE`, `Transfer-Encoding`, `Upgrade`。

发送者必须不发送为内容所有的接收方准备的连接选项。比如： `Cache-Control` 不能出现在 连接选项里面。

连接选项不一定总是出现，因为它可能没有参数（比如 keep-alive没有参数，它就不会出现在Header里面）。与此同时，有些本来参数的却没有出现，大概率是中间节点误处理了，接收者应该选择忽略。

**Max-Forwards**
Max-Forwards Header 为 代理转发 TRACE/OPTIONS 请求方法提供了限制转发最多次数的机制。当客户端尝试跟踪一个看起来失败或者中间链循环的请求是，这个机制就很有用。

```
Max-Forwards = 1*DIGIT
```

其值为剩余消息能被转发的次数。

每个中间节点收到 TRACE/OPTIONS 消息是，如果包含了这个字段，必须检查并更新其值后再转发。如果收到的值是0，必须不能转发，而是作为响应的最终处理者进行响应；不然就应该更新为当前值减一或者自己支持的最大的值。

**Via**
Via 记录的是 客户端到服务端/服务端到客户端 经过的中间节点的协议和接收人。可以用来追踪信息的转发，避免循环请求，确认链路上的发送者的能力。

```
  Via = #( received-protocol RWS received-by [ RWS comment ] )

  received-protocol = [ protocol-name "/" ] protocol-version
                    ; see Section 7.8
  received-by       = pseudonym [ ":" port ]
  pseudonym         = token
```

比如：
```
Via: 1.0 fred, 1.1 p.example.net
```

### 5.7. 消息转换
一些中间节点可能有消息转换的功能，但是在客户端有内容一致性检查的情况下可能出现问题。

代理必须不能转换 包含 `no-transform` 缓存指令的消息。

代理可能返回 203(Non-Authoritative Information) 来告诉接收者消息被转换过。

### 5.8. 消息升级
`Upgrade` Header 提供将 同一连接上 HTTP/1.1 转换为其他协议的简单机制。

客户端可能会发送一系列按照优先级降序排列的期望的协议；服务端可能忽略而选择继续当前的协议。本机制强制要求协议转换的场景不适用。

```
  Upgrade          = #protocol

  protocol         = protocol-name ["/" protocol-version]
  protocol-name    = token
  protocol-version = token
```

服务端在发送 `101 Switching Protocols` 响应时必须同时发送 指明新的协议的 Upgrade 头。

服务端发送 `426 Upgrade Required` 响应是必须发送 指明可接受的协议的 Upgrade 头。

举例说明：

客户端发送如下请求：
```
GET /hello HTTP/1.1
Host: www.example.com
Connection: upgrade
Upgrade: websocket, IRC/6.9, RTA/x11
```

服务端决定切换协议，响应为：
```
HTTP/1.1 101 Switching Protocols
Connection: upgrade
Upgrade: websocket
```

## 6. 控制信息-消息的Method
method 是请求语义的重要组成部分，表明客户端发送请求的目的和期望的成功返回的结果。method的语义可能通过Header会被进一步的增强。

```
  method = token
```
method 是区分大小写的。习惯上使用全大写。

所有的通用目的的服务器必须支持 `GET` 和 `HEAD`，其他的都是可选的。

允许的方法可以通过 `Allow` 头列出来。对于没有识别或者实现的method，服务端应该返回 501(Not Implemented)，对于不被允许的method，服务端应该返回 405(Method Not Allowed)。

### 6.1. GET
传输目标资源的一个当前的表示。

GET 是信息检索的主要机制，也几乎是所有的性能优化的重点。

可以认为资源的标识就是远端文件系统的路径名。但是在实现上可能不是这样的，也没有限制。它只是看起来像一个内容对象树，只有服务器知道资源标识和响应内容对应的实现（可能在数据库里面，也可能在文件系统）。

客户端可以通过在请求中发送 `Range` 头来指定一个 "范围请求"（后文会讲）来选择表示的部分内容。

GET 请求的响应是可以缓存的。如果没有指定 `Cache-Control` 头，缓存可能用来回给 GET/HEAD的请求。

当用户执行检索时需要提供不是很在URI中展示的内容时，可以将内容进行转换，也可以使用POST，来避免信息通过URI暴露。

### 6.2. HEAD
和`GET`类似，但不传输响应内容。

HEAD请求常常用来测试超文本链接或者发现最近的修改（提高效率），服务端一定不能在响应中返回内容，只返回被选择的表示的元数据。

服务端应该返回和GET请求一样的Header，除了一些比如`Content-Length` 和内容相关的Header。

### 6.3. POST
对请求内容执行特定资源(resource-specific)的处理。

POST方法请求对目标资源的处理是由资源自己的语义决定的。（也就是说具体操作协议没定义，但是大多数是局部更新）。服务端通过响应的 status code 来表明处理结果。

如果有一到多个资源被创建了，服务端应该响应 201(Created)，并提供 Location 头来表明资源的标识。

POST请求的响应只有在包含明确的新鲜度信息和与POST的目标URI具有相同的 Content-Location 值时才可以缓存。

如果POST请求的结果和灵位一个存在的资源是等价的，服务器可能通过返回 303(See Other) 来重定向客户端，这有利于缓存的使用。

### 6.4. PUT
使用请求内容替换目标资源的的所有表示。

PUT方法创建目标资源，或者用请求内容更新。PUT方法的请求处理成功后，后续对同一个目标资源的GET请求都会返回 200(OK)。

如果是内容不存在，创建了新的内容服务端必须发送 201(Created) 来通知客户端；如果存在，则是修改从后必须发送 200(OK) 或者 204(No Content )。

服务端需要验证PUT的内容和它的目标资源的约束是一致的。比如一个目标资源被配置为始终具有 "text/html" 的内容类型，但是内容却是 image/jpeg，服务器应该做如下行为之一：
- 重新配置目标资源以反映新的媒体类型
- 转换请求内容
- 返回 415(Upsupported Media Type) 表明目标资源的约定，可能包括一个指向其他资源的合适的链接

当请求的数据被转换了，服务端必须返回一个验证器字段。比如 `ETag` 或 `Last-Modified`。这样能够告诉客户端是否能直接使用内存数据。

POST 和 PUT 方法的根本区别在于意图：
- POST请求是 用自身的语义去处理表示 (更新)
- PUT请求是 替换资源的状态（幂等） （创建）

也有服务器支持使用 Content-Range 头来让PUT请求变成一个 局部PUT。

PUT方法的响应是不可缓存的。

### 6.5. DELETE
删除目标资源的的所有表示。

DELETE 方法请求会删除服务端的 目标资源和其当前功能之间的关联。和UNIX中的 `rm` 类似。但是服务端如何处理完全和协议无关。

DELETE 成功的响应码有：
- 202(Accpeted)：操作成功但是尚未生效
- 204(No Content )：生效了，但是没有更多的信息
- 200(OK)：生效，并且有响应消息进一步描述状态的表示

DELETE方法的响应是不可缓存的。

### 6.6. CONNECT
建立一个通过目标资源指定的的服务器的隧道。

如果建立成功，随后限制其行为在双方向上盲目转发数据，直到隧道被关闭。

一个请求示例为：
```
CONNECT server.example.com:80 HTTP/1.1
Host: server.example.com
```

端口必须出现，服务端必须拒绝没有端口号的请求，返回 400(Bad Request) 状态码。

任何2xx(Successful)的响应 表明 发送者(和所有的入向代理) 会在相应了Header后立刻切为隧道模式。

当中间节点发现任何一方关闭了连接，隧道就关闭了：中间节点必须尝试发送任何来自于关闭的侧的 出向的数据给另外一侧。然后关闭两个连接，然后丢弃未交付的数据。

Proxy Authorization 可用于建立创建隧道的权限，比如：
```
CONNECT server.example.com:443 HTTP/1.1
Host: server.example.com:443
Proxy-Authorization: basic aGVsbG86d29ybGQ=
```

CONNECT 的响应是不可缓存的。

### 6.7. OPTIONS
为目标资源描述通信选项。

OPTION方法让客户端可以在没有资源操作的情况下，确定 与资源相关的 选择 和 要求，或者服务端的能力。

如果请求的目标是 "*"，那么就应用到服务器而不是一个具体的资源。这种情况下是在测试服务器的能力，做了一个类似于 ping 的操作。

如果请求目标是一个具体的目标，就是这个目标资源的选项。

服务端在发送成功的响应时 应该包括 任何表明选项的特性的Header（比如 Allow）。

客户端可能会发送 `Max-Forwards`，但是代理一定不能在转发时 对没有这个头的请求 生成 这个头。

如果客户端发送请求是包括了内容，那么必须发送 `Content-Type` Header。

OPTIONS 的响应是不可缓存的。

### 6.8. TRACE
验证目标资源的路径执行消息往返的测试。

TRACE 允许客户端 追踪请求链路。`Via` 和 `Max-Forwards` Header 对于链路追踪特别有用。

客户端一定不能在请求中包括内容。

TRACE 的响应是不可缓存的。

## 7. 消息的Header

HTTP 消息的Header 有很多个，接下来按照产生作用来分类，大概讲一下。

Header本身也是可扩展的。

### 7.1. 表示数据和元数据
表示数据的类型通过 `Content-Type` 和 `Content-Encoding` Header来指定。是两层的、有序编码的模型：
```
  representation-data := Content-Encoding( Content-Type( data ) )
```

**`Content-Type`** 指明媒体类型，同时定义了数据格式和接收者的处理方式。格式为：
```
  Content-Type = media-type

  media-type = type "/" subtype parameters
  type       = token
  subtype    = token
```
类型后面可以跟上 `;`  分隔的键值对的参数。

比如：

```
Content-Type: text/html; charset=ISO-8859-4
```

发送者在发送有内容的请求的时候，如果知道内容的类型，就应该发送 `Content-Type` Header。要是没有，接收者要么假设类型为 `application/octet-stream`，要么进行检测。

charset 用来指明/协商 文本形式的内容的字符编码，一般作为`Connect-Type` 和 `Accept-Encoding` 的参数。

**`Content-Encoding`** 指明内容的编码方式。主要用来标识内容压缩算法。格式为：
```
  Content-Encoding = #Content-coding

  Content-coding   = token
```

举例：
```
Content-Encoding: gzip
```

**`Content-Language`** Header描述了当前表示期望读者的的自然语言。主要是为了可以根据用户自己更偏好的语言来让标识和区别不同的表示。如果没有指明，默认就是这个内容适用于所有的语言的读者（发送者不关心）。
```
  Content-Language = #language-tag

  language-tag = <Language-Tag, see [RFC5646], Section 2.1>
```

举例：
```
Content-Language: da

Content-Language: mi, en
```

**`Content-Length`** Header 指定了数据的长度。可以用来界定数据帧。接收者也可以用来评估传输时间、和现有数据对比。格式为：
```
  Content-Length = 1*DIGIT
```

举例：
```
Content-Length: 3495
```

**`Content-Location`** Header 指定的是要返回的数据的地址选项。最主要的用途是用来指定要访问的资源经过内容协商后的结果的 URL。格式为：
```
  Content-Location = absolute-URI / partial-URI
```

如果一个2xx响应消息携带了 和 目标URI 一样的 `Content-Location`，接收者可能会认为当前的表示是由内容的起源时间指定的：
- 对于 GET/HEAD 请求，字段出现与否没有差别
- 对于会导致状态改变的请求，比如PUT/POST，隐含着服务端的响应包含资源新的表现。这样客户端可以在不发送一个GET请求的情况下更新本地副本

如果一个2xx响应消息携带了 和 目标URI 不一样的 `Content-Location`：
- 对于 GET/HEAD 请求，表明目标URI指向的是内容协商后的资源标识
- 对于会导致状态改变的请求，201(Created) 的响应 表明 新的表示
- 其他情况，表明 其值时另外一个可以使用的资源标识（比如一个交易系统在处理了POST请求后返回了200和Content-Location，说明后续可以用其值来检索本次交易）

### 7.2. 表示数据的验证
验证器字段传输当前选择的表示的验证器。当表示发生变化后，验证器的值就会发生变化。 规范定义了两种元数据来观察资源状态和验证资源的表示：
- 修改时间
- 实体标签
- 其他的由扩展文档指定

验证器有强弱之分。标准是当内容发生变化，值是否一定不一样。比如精度为秒的时间验证器可能就是弱验证器，可能会导致版本丢失。

**`Last-Modified`** 表明服务器认为的表示的最后修改时间。格式为：
```
  Last-Modified = HTTP-date
```

举例：
```
Last-Modified: Tue, 15 Nov 1994 12:45:26 GMT
```

`Last-Modified` 是一个弱验证器。


**`ETag`** 表示内容的实体标签。格式为：
```
  ETag       = entity-tag

  entity-tag = [ weak ] opaque-tag
  weak       = %s"W/"
  opaque-tag = DQUOTE *etagc DQUOTE
  etagc      = %x21 / %x23-7E / obs-text
             ; VCHAR except double quotes, plus obs-text
```

默认是个强验证器。如果想当所弱验证器，使用 "W/" 前缀。比较的时候也应用同样的规则。

其值的生成完全取决于服务器端。

### 7.3. 消息的上下文
如下Heaer提供请求的上下文信息，包括用户、客户端和资源。

**`Expect`** Header 表明服务端 正确的处理这个请求 需要支持的一系列的行为(期望)。格式为：
```
  Expect =      #expectation
  expectation = token [ "=" ( token / quoted-string ) parameters ]
```

举例：
```
PUT /somewhere/fun HTTP/1.1
Host: origin.example.com
Content-Type: video/h264
Content-Length: 1234567890987
Expect: 100-continue
```

规范只定义了一个 Expect 字段： "100-continue"。当客户端要发送一个（很大的）内容的时候，可以先发送一个请求，看看服务端是否返回错误信息，比如 401(Unauthorized) 或者 405(Method Not Allowed)。如果返回 100(Continue) 就可以继续发送内容了。

**`From`** 表明请求发送者的邮箱地址。一般是机器人客户端发送的。格式为：
```
  From    = mailbox

  mailbox = <mailbox, see [RFC5322], Section 3.4>
```
举例：
```
From: spider-admin@example.org
```

**``Referer`** 指明客户端从哪获取到的这个目标URI。。格式为：
```
  Referer = absolute-URI / partial-URI
```

举例：
```
Referer: http://www.example.org/hypertext/Overview.html
```

这个Header 允许服务端生成反向链接用于简单的分析、记录和缓存优化等。一些服务端也用来拒绝来自其他网站的请求或者限制跨站请求。

**`TE`** 描述了客户端处理传输编码和 Trailer 节的能力 (可以理解为： Accept-Transfer-Encoding)。格式为：
```
  TE                 = #t-codings
  t-codings          = " Trailers" / ( transfer-coding [ weight ] )
  transfer-coding    = token *( OWS ";" OWS transfer-parameter )
  transfer-parameter = token BWS "=" BWS ( token / quoted-string )
```

举例：
```
  TE: Trailers, deflate;q=0.5
```


**`User-Agent`** 用来表明 客户端的信息。格式为：

```
  User-Agent = product *( RWS ( product / comment ) )
  product         = token ["/" product-version]
  product-version = token
```

举例：
```
User-Agent: CERN-LineMode/2.15 libwww/2.17b3
```

如下Heaer提供响应的上下文信息，包括服务端、目标资源或者相关资源的信息。

**`Allow`** Header 指明目标资源支持的 方法集合。格式为：
```
  Allow = #method
```

举例：
```
Allow: GET, HEAD, PUT
```

当服务器返回 405(Method Not Allowed) 时，必须生成这个Header。

**`Location`** Header 用来引用响应相关的资源。格式为：
```
  Location = URI-reference
```

举例：
```
Location: /People.html#tim
```

- 对于 201(Created) 响应，其值为创建之后的主要资源
- 对于 3xx(Redircetion) 响应，其值为自动重定向的更合适的目标资源

**`Retry-After`** Header  指明客户端应该要等多久之后才再发送后续的请求。当响应 503(Service Unavailable)时，其值为对该客户端无效的时长；当响应 3xx(Redirection) 时，其值为客户端发送重定向请求等待的最小时长。 格式为：
```
  Retry-After = HTTP-date / delay-seconds
  delay-seconds = 1*DIGIT
```

举例：
```
  Retry-After: Fri, 31 Dec 1999 23:59:59 GMT 
  Retry-After: 120
```

**`Server`** Header 指明服务端用到的软件信息。格式为：
```
Server = product *( RWS ( product / comment ) )
```

### 7.4. HTTP的鉴权
HTTP提供了访问控制和鉴权的通用框架。主要手段是服务端质疑客户端和客户端提供鉴权信息。

- 服务端通过回复 状态码 为401(Unauthorized)、包含 `WWW-Authenticate` 头的 响应信息来挑战客户端。
- 代理通过回复 状态码 为407(Proxy Authentication Required)、包含 `Proxy-Authenticate` 头的 响应信息来挑战客户端。

实际情况是：
- 如果客户端一般在 在请求中加上 `Authorization` 头字段，在服务端返回401之前完成服务端鉴权。
- 如果客户端一般在 在请求中加上 `Proxy-Authorization` 头字段，在代理返回407之前完成代理鉴权。

### 7.5. 内容的协商
在服务端响应内容时常常有不同的方式表示信息，比如不同的格式、语言或者编码。同时不同的客户端也可能影响这个表示。HTTP提供了内容协商的机制来满足这些需求。

协议包括如下的协商模式：
- 主动协商（服务端驱动协商）：服务端基于客户端的状态首选项 选择表示
- 响应式协商（客户端驱动协商）：服务端提供一系列客户端可以选择的表示。
- 请求内容协商：客户端基于服务端过去的响应 为选择以后的请求的表示

内容协商头的值的同一格式为，举例：
```
Accept = #( media-range [ weight ] )

media-range     = ( "*/*"
                    / ( type "/" "*" )
                    / ( type "/" subtype ) 
                  ) parameters

weight = OWS ";" OWS "q=" qvalue 
qvalue = ( "0" [ "." 0*3DIGIT ] ) / ( "1" [ "." 0*3("0") ] )
```
- q 是权重的概念，可以理解为 quality。范围为 0.001 ~ 1，默认为1
- 值可以是 `*`，表示不指定值。也就是说这个维度上（出现了），任何值都可以

**主动协商** 就是客户端发送自己的首选项，服务端处理后返回。常常用到如下的请求头：
- `Accept` 指定媒体类型。比如：` Accept: text/plain; q=0.5, text/html, text/x-dvi; q=0.8, text/x-c`
- `Accept-Charset` 指定字符集合，比如 `Accept-Charset: iso-8859-5, unicode-1-1;q=0.8`
- `Accept-Encoding` 指定字符编码，比如 `Accept-Encoding: compress;q=0.5, gzip;q=1.0`
- `Accept-Language` 指定语言，比如 `Accept-Language: da, en-gb;q=0.8, en;q=0.7`

主动协商中常常用到如下的响应头：
- `Vary` 指定服务端会用来进行协商的字段。比如：`Vary: accept-encoding, accept-language`。描述了除方法和 URL 之外影响响应内容的请求消息。大多数情况下，这用于在使用内容协商时创建缓存键。

**响应式协商** 为收到一个初始化响应后客户端选择内容。实现方案可以为客户端自己挑选资源的表示，也可以是人工的选择（比如选择菜单里面的一个可选的超链接）。具体的方式就是服务端返回 300(Multiple Choices) / 406(Not Accepable) 状态码，并且列出一些列的可选项。

**请求内容协商** 为服务端在响应时加上内容协商首选项，企图影响当前资源的后续的请求。比如在响应中加入 `Accept`， `Accept-Encoding`。

### 7.6. 有条件的请求
有条件的请求是指有一到多个指明在应用到目标资源前要先做的验证的Header的请求。

其最大的作用是缓存的更新。也可以应用到会发生状态改变的方法上避免“更新丢失”的问题：在并发写入时一个客户端意外的覆写了另一个客户端的写入。

**`If-Match`** Header 是用来避免“更新丢失” 最常用的Header。其值一般是 `ETag` 的值。语法为：
```
If-Match = "*" / #entity-tag
```

举例：
```
If-Match: "xyzzy"
If-Match: "xyzzy", "r2d2xxxx", "c3piozzzz" 
If-Match: *
```

判断逻辑为：
- 如果是 `*`，服务端存在目标资源的表现 即为True
- 如果服务端存在列表中的 实体标签，即为 True
- False

如果判断失败，请求方法将不能被执行，并返回 412 (Precondition Failed)。

**`If-None-Match`** Header  和 `If-Match` 类似。 主要是 GET 请求用来更新缓存。如果匹配不成功，服务端返回 304(Not Modified)。

`*` 用来避免多个客户端同上创建资源。

判断逻辑和 `If-Match` 相反。

**`If-Modified-Since`** Header 是用来给 GET/HEAD 请求判断修改时间的，其值一般是 `Last-Modified` 的值。语法为：
```
If-Modified-Since = HTTP-date
```
举例：
```
If-Modified-Since: Sat, 29 Oct 1994 19:43:31 GMT
```

判断逻辑为：
- 如果指定资源的最后修改时间早于/等于 字段值，False
- True

如果是False，服务端会返回 304(Not Modified) 状态码。


**`If-Unmodified-Since`** Header 和 `If-Modified-Since` 类似。只是语义相反。

判断逻辑和 `If-Modified-Since` 相反。

如果判断失败，请求方法将不能被执行，并返回 412 (Precondition Failed)。


**`If-Range`** Header 的含义是：客户端有部分表示。如果表示发生了变化，服务端返回所有的数据，不然只返回请求的范围的数据。最常见的用例是恢复下载，以确保自最后一次片段接收以来，存储的资源没有发生更改。语法为：
```
If-Range = entity-tag / HTTP-date
```

判断逻辑为：
- 如果是 HTTP-date：
    - 如果不是强校验器， False
    - 如果是精准匹配 `Last-Modifity`，True
    - False
- 如果是 entity-tag：
    - 如果精准匹配 `ETag`，True
    - False

服务端处理行为为：
- 当条件得到满足时，则发出范围请求，服务器将返回 206(Partial Content ) 状态，以及相应的内容；
- 如果条件没有得到满足，服务器将返回完整的资源以及 200 (OK) 状态;


如上的这么多 Header，其整体的判读逻辑为：
1. 当接收方是源服务器 并且 `If-Match` 出现，验证 `If-Match`：
    - 如果 True，继续第3步
    - 如果 False，返回 412(Procondition Failed)
1. 当接收方是源服务器 并且 `If-Match` 没有出现 并且 `If-Unmodified-Since` 出现，验证 `If-Unmodified-Since`：
    - 如果 True，继续第3步
    - 如果 False，返回 412(Procondition Failed)
1. 当接收方是源服务器 并且 `If-None-Match` 出现，验证 `If-None-Match`：
    - 如果 True，继续第5步
    - 如果 False，GET/HEADE,返回 304(Not Modified)
    - 如果 False，返回 412(Procondition Failed)
1. GET/HEAD 请求 并且 `If-None-Match`没出现 并且 `If-Modified-Since` 出现， 验证 `If-Modified-Since`:
    - 如果 True，继续第5步
    - 如果 False，返回 304(Not Modified)
1. GET方法 并且 `Range` 和 `If-Range` 出现，验证 `If-Range`：
    - 如果 True 并且 `Range` 是可以用的，返回 206(Partial Content )
    - 忽略 `Range`， 返回 200(OK)
1. 其他
    - 执行请求。


### 7.7. 范围请求
范围请求是HTTP的一个可选设计，用来进行局部返回。

其基本语法为：
```
range-unit = token

ranges-specifier = range-unit "=" range-set
range-set = 1#range-spec
range-spec =    int-range
                / suffix-range
                / other-range
```

`range-unit` 当前就是 byte range。

`range-set` 有三种：
```
int-range   = first-pos "-" [ last-pos ]
first-pos   = 1*DIGIT
last-pos    = 1*DIGIT

suffix-range = "-" suffix-length 
suffix-length = 1*DIGIT

other-range = 1*( %x21-2B / %x2D-7E )
            ; 1*(VCHAR excluding comma)
```

举例说明：
- `int-range`，开始到结束
    - `0-499`：前面500个 [0,499]
    - `500-999`：[500,999]
    - `9500-`： [9500， 结束]
- `suffix-range`，结尾N个：
    - `-500`：最后500个
- `other-range` 是扩展语法，没有严格的规定。

可以同上出现多个，比如 `0-999, 4500-5499, -1000`

**`Range`** 请求 Header 告知服务端返回哪个部分。服务器会以 multipart 文件的形式将其返回。格式为： 
```
Range = ranges-specifier
```

举例：
```
Range: bytes=200-1000, 2000-6576, 19000-
```

表现为：
- 如果服务器返回的是范围响应，需要使用 206 Partial Content 状态码。
- 如果所请求的范围不合法，服务器返回 416(Range Not Satisfiable) 状态码，表示客户端错误。
- 服务器允许忽略 Range 首部，从而返回整个文件，状态码用 200 。

媒体类型 `multipart/byteranges` 允许 响应内容 通过包含多个body部分 返回多个范围。
比如：
```
HTTP/1.1 206 Partial Content 
Date: Tue, 14 Nov 1995 06:25:24 GMT
Last-Modified: Tue, 14 July 04:58:08 GMT
Content-Length: 2331785
Content-Type: multipart/byteranges; boundary=THIS_STRING_SEPARATES

--THIS_STRING_SEPARATES
Content-Type: video/example 
Content-Range: exampleunit 1.2-4.3/25

...the first range... 
--THIS_STRING_SEPARATES
Content-Type: video/example 
Content-Range: exampleunit 11.2-14.3/25

...the second range 
--THIS_STRING_SEPARATES--
```

**`Accept-Ranges`** 响应头 指明目标资源支持的范围 的 单位。

举例：
```
Accept-Ranges: bytes
Accept-Ranges: none
```

**`Content-Range`** Header：
- 在 单部分 206(Partial Content ) 响应中用来表明消息内容的部分内容 的范围
- 在 多部分 206(Partial Content ) 响应中用来表明每个消息内容的部分内容 的范围
- 在 单部分 416(Range Not Satisfiable) 响应中用来提供选择的表示的信息
- 在 请求中表示 `partial PUT`。如果服务端不支持，应该返回 400(Bad Request)

语法为：
```
Content-Range = range-unit SP
                ( range-resp / unsatisfied-range )

range-resp = incl-range "/" ( complete-length / "*" )
incl-range = first-pos "-" last-pos
unsatisfied-range = "*/" complete-length
complete-length = 1*DIGIT
```

举例：
- `bytes 42-1233/1234`：发生范围为[42，1233]，总长度1234
- `bytes 42-1233/*`：发生范围为[42，1233]，总长度未知

## 8. 控制信息-消息的Status Code
Status Code 分为几个大段，代表不同的含义。

### 8.1. 1xx：信息
在完成所请求的操作并发送最终响应之前，用于通信连接状态或请求进度的临时响应。
- 100 Continue：表示服务端收到了部分的请求，希望客户端继续发送完成后再响应。客户端会发送 `Expect: 100-continue` Header 来指明期望。
- 101 Switching Protocol：表示服务端理解并且乐于配合服务端的请求。通过 `Via` Header 来完成当前连接的应用级别的协议切换。

### 8.2. 2xx：成功
表示请求被成功的接收、理解和接收。

- 200 OK：表示请求处理成功
- 201 Created：表示请求处理成功并且有一到多个资源被创建。被创建的资源在 `Location` Header 中
- 202 Accepted：表明请求被接收，但是处理没有完成
- 203 Non-Authoritative Information：表明处理成功，但是响应被代理修改了
- 204 No Content ：表明请求处理成功，但是并没有响应内容。请求被应用后的目标资源在响应的Header中被引用
- 205 Reset Content ：表示内容能够满足请求，但是期望客户端能够重置文档视图
- 206 Partial Content ：表示服务端返回的是资源被选中的表示的一部分

### 8.3. 3xx：重定向
表示客户端需要执行更多的动作来得到满足请求。有如下的重定向类型：
- 在能够表示此资源的匹配资源之间提供选择，比如 300 (Multiple Choices)
- 资源在 Location Header 中提供的 不同的URI是可用的，比如 301 (Moved Permanently), 302 (Found), 307 (Temporary Redirect), 和 308 (Permanent Redirect)
- 重定向到不同的资源，比如 303(See Other)
- 重定向到先前的缓存，比如 304(Not Modified)

具体的响应码有：
- 300 Multiple Choices：表示该请求拥有多种可能的响应。用户代理或者用户自身应该从中选择一个。由于没有如何进行选择的标准方法，这个状态码极少使用
- 301 Moved Permanently：见名知意
- 302 Found：内容临时在其他的地方，这次先去其他地方获取，以后还继续使用旧的URI
- 303 See Other：通常作为 PUT 或 POST 操作的返回结果，它表示重定向链接指向的不是新上传的资源，而是另外一个页面，比如消息确认页面或上传进度页面。而请求重定向页面的方法要总是使用 GET
- 304 Not Modified：见名知意
- 305/306：废弃或未使用
- 307 Temporary Redirect：临时重定向响应状态码，表示请求的资源暂时地被移动到了响应的 Location 首部所指向的 URL 上。状态码 307 与 302 之间的唯一区别在于，当发送重定向请求的时候，307 状态码可以确保请求方法和消息主体不会发生变化。
- 308 Permanent Redirect：表示重定向的响应状态码，说明请求的资源已经被永久的移动到了由 Location 首部指定的 URL 上。在重定向过程中，请求方法和消息主体不会发生改变，然而在返回 301 状态码的情况下，请求方法有时候会被客户端错误地修改为 GET 方法。

### 8.4. 4xx：客户端错误
表示客户端看起来出现了错误。
- 400 Bad Request：表示客户端的请求看起来是错误的
- 401 Unauthorized：表示客户端对请求资源缺少权限认证
- 402 Payment Required：预留的
- 403 Forbidden：客户端本次请求被拒绝
- 404 Not Found：资源不存在
- 405 Method Not Allowed：服务端应该返回 Allow Header 指明合法的Method
- 406 Not Acceptable：指代服务器端无法提供与 Accept-Charset 以及 Accept-Language 消息头指定的值相匹配的响应
- 407 Proxy Authentication Required：和401类似
- 408 Request Timeout：表示服务端没有在规定时间内送到完整的请求消息
- 409 Conflict：表示请求与服务器端目标资源的当前状态相冲突。 冲突最有可能发生在对 PUT 请求的响应中。例如，当上传文件的版本比服务器上已存在的要旧，从而导致版本冲突的时候，那么就有可能收到状态码为 409 的响应
- 410 Gone：说明请求的目标资源在原服务器上不存在了，并且是永久性的丢失。如果不清楚是否为永久或临时的丢失，应该使用404
- 411 Length Required：见名知意
- 412 Precondition Failed：表示客户端错误，意味着对于目标资源的访问请求被拒绝。这通常发生于采用除 GET 和 HEAD 之外的方法进行条件请求时，由首部字段 If-Unmodified-Since 或 If-None-Match 规定的先决条件不成立的情况下
- 413 Content Too Large：见名知意
- 414 URI Too Long：表示客户端所请求的 URI 超过了服务器允许的范围
- 415 Unsupported Media Type：表示服务器由于不支持其有效载荷的格式，从而拒绝接受客户端的请求。 格式问题的出现有可能源于客户端在 Content-Type 或 Content-Encoding 首部中指定的格式，也可能源于直接对负载数据进行检测的结果。
- 416 Range Not Satisfiable：服务器无法处理所请求的数据区间。最常见的情况是所请求的数据区间不在文件范围之内
- 417 Expectation Failed：服务器无法满足 Expect 请求消息头中的期望条件
- 421 Misdirected Request：请求被定向到一个无法生成响应的服务器。如果连接被重复使用或选择了其他服务，就有可能出现这种情况
- 422 Unprocessable Entity：表示服务器理解请求实体的内容类型（415），并且请求实体的语法是正确的，但是服务器无法处理所包含的指令
- 426 Upgrade Required：表示服务端期望切换到另外一个协议

### 8.5. 5xx：服务端错误
表示服务端有问题或者没有能力处理请求。

- 500 Internal Server Error：表示所请求的服务器遇到意外的情况并阻止其执行请求
- 501 Not Implemented：表示请求的方法不被服务器支持，因此无法被处理。服务器必须支持的方法（即不会返回这个状态码的方法）只有 GET 和 HEAD。
- 502 Bad Gateway：表示作为网关或代理的服务器，从上游服务器中接收到的响应是无效的
- 503 Service Unavailable：表示服务器尚未处于可以接受请求的状态
- 504 Gateway Timeout：表示扮演网关或者代理的服务器无法在规定的时间内获得想要的响应
- 505 HTTP Version Not Supported：表示服务器不支持请求所使用的 HTTP 版本