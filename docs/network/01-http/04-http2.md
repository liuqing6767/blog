# HTTP/2

`HTTP/2` 提供了 HTTP语义传输的优化，更加高效的支持所有的HTTP的核心特性。其依旧运行在 `TCP` 之上，是一个面向连接的应用层协议。

`HTTP/1.0` 只允许一个TCP连接同一时间就一个请求正在发送。`HTTP/1.1` 添加了请求流水线，但是仅仅解决了并发问题，没有解决应用层的 队头阻塞问题。因此 `HTTP/1.0` 和 `HTTP/1.1` 通过并发连接服务器来解决并发请求的问题。

另一方面，`HTTP` 的字段常常 重复而冗长，造成不必要的网络开销，还会造成TCP拥塞窗口快速填满。

`HTTP/2` 是对 HTTP 的改进，可以更加高效的使用网络资源，通过：
- 字段（Header）压缩
- 同一个连接上多并发交换
- 给请求加上优先级来让主要的请求先发送
- 也可以使用二进制frame来让消息的处理更加的高效

但是，`HTTP/2` 没有解决 `head-of-line blocking` 的问题。

本文会用到如下术语：
- endpoint 相关：
    - client：初始化 `HTTP/2` 连接的 endpoint
    - server：接收 `HTTP/2` 连接的 endpoint
    - endpoint：连接的 客户端或者服务端

    - peer：一个endpoint。在讨论特殊的endpoint时，peer指当前讨论对象的远端endpoint
    - receiver：接收frame的endpoint
    - sender：发送frame的endpoint

- 传输相关：
    - frame：`HTTP/2`连接的上最小的通信单元，由一个header和一个可变长度的二进制数据组成
    - connection：两个endpoint组件的传输层连接
    - stream：一个`HTTP/2`连接上双向frame流

    - connection error：一个会影响整个 `HTTP/2` 连接的错误
    - stream error：独立的 `HTTP/2` stream 的错误 

## 1. 连接初始化
H2 有两个版本定义：
- h2：HTTP/2 over TLS
- h2c：在TCP上支持的h2协议。这个从未被大规模部署并且已经被废弃了。

H2 使用了和 H1 相同的 URI Scheme，服务端是否支持 H2 就需要额外的手段。
- h2：使用  ALPN (extension [TLS-ALPN])[https://datatracker.ietf.org/doc/html/rfc7301] 进行协议协商
- h2c：使用 `Upgrade: h2c`

当然，如果你知道服务端就是支持H2，你也可以直接用而不协商。

无论哪种方式协商，都需要发送一个连接前言：`0x505249202a20485454502f322e300d0a0d0a534d0d0a0d0a`，它其实是字符串 `PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n` 的十六进制。 非H2的服务端是不理解`PRI` 这个方法的，所以会报错。

一旦 H2 连接建立了，endpoint可以开始交换frame了。

## 2. frame
### 2.1. 统一格式
frame的格式如下：
```
HTTP Frame {
  Length (24),            
  Type (8),                 

  Flags (8),

  Reserved (1),            
  Stream Identifier (31),   // 前9个字节是固定的

  Frame Payload (..),       // 负载是可变长度的
}
```

- Length：负载的长度。如果值大于 2^24 则使用 `SETTINGS_MAX_FRAME_SIZE` 来指定
- Type：frame的类型。后面介绍。对于未知类型，实现时必须忽略
- Flags：给特定的frame Type 指定语义
- Stream Indentifier：stream 的标识。 0x00 是保留的标识，表示整个连接。


### 2.2. frame类型
**DATA：用来传输可变长短的数据**

格式为：
```
DATA Frame {
  Length (24),
  Type (8) = 0x00,

  Unused Flags (4),
  PADDED Flag (1),          // 是否携带PADDED
  Unused Flags (2),
  END_STREAM Flag (1),      // 是否为当前流的最后一个frame。
                            // 如果是stream会进入 half-closed 或者 closed 状态

  Reserved (1),
  Stream Identifier (31),

  [Pad Length (8)],         // 可选的，如果 PADDED Flag 设置了才出现
  Data (..),
  Padding (..2040),         // 可选的，为了掩盖真实长度
}
```

**HEADERS：用来打开一个stream**

格式为：
```
HEADERS Frame {
  Length (24),
  Type (8) = 0x01,

  Unused Flags (2),
  PRIORITY Flag (1),
  Unused Flag (1),
  PADDED Flag (1),
  END_HEADERS Flag (1),         // 如果睡着了表明当前frame包括完整的 字段块
                                // 后续没有 CONTINUATION frame
  Unused Flag (1),
  END_STREAM Flag (1),

  Reserved (1),
  Stream Identifier (31),

  [Pad Length (8)],
  [Exclusive (1)],              // 优先级设置被忽略
  [Stream Dependency (31)],     // PRIORITY 被设置才出现
  [Weight (8)],                 // PRIORITY 被设置才出现
  Field Block Fragment (..),
  Padding (..2040),
}
```

Header 可以通过压缩，解决`HTTP`中 Header 重复和冗长的问题。压缩使用的是 HPACK算法，单独的放在 [RFC7541](https://datatracker.ietf.org/doc/html/rfc7541) 中。简单描述为：
- 通过映射的方式，缩短需要传输的内容大小：HPACK有协议级别的静态表，也有连Stream级别的动态表。发生时将内容替换为表中的ID，接收时再反解
- 通过编码的方式，压缩要传输的内容。用的是Huffman编码。

编码逻辑偏向于实现细节，本文不展开细讲。

**RST_STREAM：允许快速将流终止**

格式为：
```
RST_STREAM Frame {
  Length (24) = 0x04,
  Type (8) = 0x03,

  Unused Flags (8),

  Reserved (1),
  Stream Identifier (31),

  Error Code (32),
}
```

当接收方收到这个frame后，必须不能再发额外的frame了

当发送方发送了这个frame后，发送方需要继续接收发送方早先发送的frame

**SETTINGS：用来发送关于Connection的配置，也当做收到配置的ACK**

SETTINGS frame 可以在连接开始阶段，也可以在中间阶段发送；所有的SETTINGS是串行的，某项的值使用最后出现的值。

格式为：
```
SETTINGS Frame {
  Length (24),
  Type (8) = 0x04,

  Unused Flags (7),
  ACK Flag (1),         // 如果被设置了，表示收到SETTINGS frame，不应该包括setting内容

  Reserved (1),
  Stream Identifier (31) = 0,

  Setting (48) ...,
}

Setting {
  Identifier (16),
  Value (32),
}
```

SETTINGS frame的 Setting 包括：
- SETTINGS_HEADER_TABLE_SIZE：动态压缩包的大小。默认4096
- SETTINGS_ENABLE_PUSH：是否开始push。默认1。客户端发送
- SETTINGS_MAX_CONCURRENT_STREAMS：发送者允许的最大的并发frame数量
- SETTINGS_INITIAL_WINDOW_SIZE：发送者stream级别的流控的初始化窗口大小。默认2^16-1
- SETTINGS_MAX_FRAME_SIZE：frame最大的载荷
- SETTINGS_MAX_HEADER_LIST_SIZE：接收方准备接受的最大的field节（未压缩）

接收方需要按顺序的处理SETTINGS frame。所有的frame都处理完后必须马上发送回复消息。

如果发送方在一定时间内没有收到回复消息，可能会认为是 `SETTINGS_TIMEOUT`类型的连接错误。

**PUSH_PROMISE：说明后续推送的承诺**
格式为：
```
PUSH_PROMISE Frame {
  Length (24),
  Type (8) = 0x05,

  Unused Flags (4),
  PADDED Flag (1),
  END_HEADERS Flag (1),
  Unused Flags (2),

  Reserved (1),
  Stream Identifier (31),

  [Pad Length (8)],
  Reserved (1),
  Promised Stream ID (31),      // 后续推送使用的Stream ID
  Field Block Fragment (..),    // 包括请求控制数据和header节
  Padding (..2040),
}
```

PUSH_PROMISE 必须只能在 peer 初始化后， open 或者 远端 half-open 状态下发送。仅保留Stream ID 供后续使用。

接收方可以发送 RST_STREAM 来拒绝。

还有更多细节，但是因为是试验性的功能，略过。

**PING：用来计算最小 round-trip time**
格式为：
```
PING Frame {
  Length (24) = 0x08,
  Type (8) = 0x06,

  Unused Flags (7),
  ACK Flag (1),                 // PING 请求还是响应

  Reserved (1),
  Stream Identifier (31) = 0,   // 连接级别的

  Opaque Data (64),
}
```


**GOAWAY：用来初始化连接的关闭**


**PRIORITY：被废弃了**


## 3. stream 和 多路复用


## 4. 错误码定义

## 5. 使用 frame和stream 传输 HTTP语义


## 6. 安全议题