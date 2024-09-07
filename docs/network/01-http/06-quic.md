# QUIC

参考文档： [QUIC rfc](https://datatracker.ietf.org/doc/html/rfc9000)

## 1. QUIC是什么？

> QUIC: A UDP-Based Multiplexed and Secure Transport

QUIC 是一个传输层协议，最常见的传输协议就是HTTP了，对比如下：
- 传输层协议：HTTP使用TCP，QUIC使用UDP。也就是说TCP的可靠传输、拥塞控制都在QUIC中自己实现了 [QUIC-RECOVERY](https://datatracker.ietf.org/doc/html/rfc9002)
- 安全性：HTTP需要使用TLS得到HTTPS来保证，QUIC内置了TLS实现安全传输 [QUIC-TLS](https://datatracker.ietf.org/doc/html/rfc9001)。


QUIC的基本概念有：
- Endpoint：QUIC连接的参与方，发起QUIC连接的叫 Client，接收QUIC连接的叫 Server
- QUIC frame：在Endpoint之间传输控制信息和应用数据
- QUIC packet：一到多个frame放在一个packet中
- QUIC stream：一个管道，frame在里面有序的传输
- QUIC connection：每个连接都有连接ID，可以携带多个并发的stream
- UDP datagram：多个packet放在datagram中传输
- Application：使用QUIC发送/接收数据的实体


```
          ┌────────────────────────────────────────────────┐          
          │            ┌───────────┐   ┌───────────┐       │          
          │            │           │   │  ┌─────┐  │       │          
          │◄─► stream  │           │   │  │frame│  │   ◄─► │          
          │   ┌────────┼──┬─────┬──┼───┼──┼─────┼──┼──┐    │          
          │◄─►│stream  │  │frame│  │   │  │frame│  │  │◄─► │          
          │   └────────┼──┼─────┼──┼───┼──┼─────┼──┼──┘    │          
          │◄─► stream  │  │frame│  │   │  │frame│  │   ◄─► │          
          │            │  └─────┘  │   │  └─────┘  │       │          
          │            │           │   │           │       │          
          │            │ packet    │   │ packet    │       │          
          │            └───────────┘   └───────────┘       │          
          │                                                │          
          │ UDP datagram                                   │          
          └────────────────────────────────────────────────┘          
                                                                      
endpoint  ◄──────────────────connection────────┬───────────► endpoint 
                                               │                      
                                               └───────────► endpoint1        
```

## 4. 通信基本单元： Packet 和 Frame

### 4.1. Frame
Frame 是 Quic Packet 的载荷。就是一系列二进制数据。格式为：
```
Frame {
  Frame Type (i),
  Type-Dependent Fields (..),
}
```

### 4.2 Packet
```
Packet Payload {
  Frame (8..) ...,
}
```

不同类型的Packet有不同等级的加密保护：
- 版本协商Packet没有加密保护
- 初始化包使用AEAD函数，但是密钥由在网络中可见的值派生，所以不具备机密性，但是局部完整性
- 其他的包由我是时协商的key进行保护


Packets and frames are the basic unit used by QUIC to communicate.

Section 12 describes concepts related to packets and frames,
Section 13 defines models for the transmission, retransmission, and acknowledgment of data, and
Section 14 specifies rules for managing the size of datagrams carrying QUIC packets.


## 2. 基本服务抽象：Stream

### 2.1. Stream的核心概念
在 QUIC 中，`Stream` 指的是服务于应用的一个轻量的、有序的字节流抽象。

**Stream ID**

Stream 分为两大类：
- 单向的
- 双向的

Stream 由 Stream ID 标识。 在一个connection中，StreamID 是唯一存在、且 递增的62位整型
- 其倒数第一位表示endpoint角色，0是客户端，1是服务端；
- 其倒数第二位表示流的方向，0表示双向流1表示单向流。

Stream frame 用来分装应用发送的数据。endpoint用 Stream frame中的 Stream ID 和 Offset字段按顺序放置数据。

**Stream 操作**

Stream 的操作包括：
- 创建
- 结束
- 取消
- 流控管理

站在应用的角度，Stream的发送方看到的QUIC的协议为：
- 写数据
- 结束 Stream
- 重置 Stream

站在应用的角度，Stream的接收方看到的QUIC的协议为：
- 读数据
- 废弃Stream并关闭请求

**Stream 优先级**

如果资源分配了正确的优先级，在Stream多路复用中能够极大的提高应用性能。

QUIC 并没有提供交换优先级信息的机制，而是依赖从应用中收到的优先级信息。


### 2.2. Stream 状态机

流的发送方看到的状态机为：

```
       o
       | Create Stream (Sending)
       | Peer Creates Bidirectional Stream
       v
   +-------+
   | Ready | Send RESET_STREAM
   |       |-----------------------.
   +-------+                       |
       |                           |
       | Send STREAM /             |
       |      STREAM_DATA_BLOCKED  |
       v                           |
   +-------+                       |
   | Send  | Send RESET_STREAM     |
   |       |---------------------->|
   +-------+                       |
       |                           |
       | Send STREAM + FIN         |
       v                           v
   +-------+                   +-------+
   | Data  | Send RESET_STREAM | Reset |
   | Sent  |------------------>| Sent  |
   +-------+                   +-------+
       |                           |
       | Recv All ACKs             | Recv ACK
       v                           v
   +-------+                   +-------+
   | Data  |                   | Reset |
   | Recvd |                   | Recvd |
   +-------+                   +-------+
```

- Ready：应用打开一个流，或者对端打开了一个双向流。这个状态下，Stream 数据可以缓存起来准备发送。本状态是起始态。
   - 1 Send：发送第一个STREAM frame 或者 STREAM_DATA_BLOCKED frame 会进入这个状态。有的实现会在这个时候确认 Stream ID
      - 1.1 Data Sent：当应用表明所有的 stream data 都发送完成并且 STREAM frame 包括 FIN位 也发送了 会进入这个状态
         - 1.1.1 Data Recvd：当所有的 stream data 被 ACK了，进入本状态。本状态是终止态。
         - 1.1.2 提前终止，进入 Reset Send，见2
      - 1.2 提前终止，进入 Reset Send，见2
   - 2 Reset Sent：发送方决定废弃本次传输，发送 RESET_STREAM frame 进入本状态
      - 2.1 Reset Recvd：当收到ACK，进入本状态。本状态是终止态

流的接收方看到的状态机：

```
       o
       | Recv STREAM / STREAM_DATA_BLOCKED / RESET_STREAM
       | Create Bidirectional Stream (Sending)
       | Recv MAX_STREAM_DATA / STOP_SENDING (Bidirectional)
       | Create Higher-Numbered Stream
       v
   +-------+
   | Recv  | Recv RESET_STREAM
   |       |-----------------------.
   +-------+                       |
       |                           |
       | Recv STREAM + FIN         |
       v                           |
   +-------+                       |
   | Size  | Recv RESET_STREAM     |
   | Known |---------------------->|
   +-------+                       |
       |                           |
       | Recv All Data             |
       v                           v
   +-------+ Recv RESET_STREAM +-------+
   | Data  |--- (optional) --->| Reset |
   | Recvd |  Recv All Data    | Recvd |
   +-------+<-- (optional) ----+-------+
       |                           |
       | App Read All Data         | App Read Reset
       v                           v
   +-------+                   +-------+
   | Data  |                   | Reset |
   | Read  |                   | Read  |
   +-------+                   +-------+
```

- Recv： 在第一个 STREAM, STREAM_DATA_BLOCKED 或者 RESET_STREAM frame 被接收时初始化。是起始态。


### 2.3. 流控

流控是为了避免客户端发送太快（可能是性能好，也可能是攻击）导致接收方需要大量的资源开销。 QUIC的流控主要包括：
- 限制发送方能发送的最大的数据量（字节数）。包括两个层面：
   - 单个Stream
   - Connection上所有的Stream
- 单个 endpoint 能创建的 Stream 最大个数

发送者必须遵循上述两个限制。

**发送数据多少的限制**

接收者在握手阶段通过协议参数初始化所有的Stream的限制。在后续阶段可以通过发送 `MAX_STREAM_DATA`(针对Stream) frame （表示流的最大绝对偏移量） 和 `MAX_DATA`(针对Connection) frame 来放大限制（表示所有流的偏移量的总和的最大值）。

如果发送者没有遵守约定，接收方就会发送 `FLOW_CONTROL_ERROR` frame，这时候接收方必须关闭连接。

发送方:
- 必须忽略 没有增大限制的 `MAX_STREAM_DATA` frame 和 `MAX_DATA` frame。
- 发送的数据已经达到上限时应该 周期性的 发送 `STREAM_DATA_BLOCKED` 或 `DATA_BLOCKED` frame 来通知接收方自己有更多的数据需要发送。

接收方需要认真的考虑每次增加多少限额已经增加限额的频率，权衡资源承诺（增加很多）和开销（增加很频繁）
- 如果发送方被block收到授权，可能发送大量数据而造成短期拥塞
- 如果发送方没有 宽带延时乘积 的授权额度，则吞吐量将收到流控的限制

**Stream 数量的限制**
接收方会限制进向的Stream能打开的个数的上限，Stream ID 必须小于 `max_stream * 4 + first_stream_id_of_type`。
- 如果发送方收到的传输参数或者 `MAX_STREAMS` frame 大于 2^60，接收方必须马上关闭，报错 `TRANSPORT_PARAMETER_ERROR` 或者 `FRAME_ENCODING_ERROR`
- 如果接收方收到的 Stream ID 超过限制，必须当做 `STREAM_LIMIT_ERROR` 处理
- 如果发送方发现因为本限制而无法创建Stream，应该发送 `STREAMS_BLOCKED` frame。这个更大的作用是用来debug，当前Connection上Stream会被无限期的block

## 3. endpoint通信上下文：Connection
每个连接由一个握手阶段开始，这阶段两个endpoint 使用加密握手协议和应用层协议 建立一个共享密钥。

应用层协议在握手阶段能够有限制的做一些事情：0-RTT 允许客户端发送一些数据。这个牺牲了安全性来减少延迟。

`Connection ID` 是 connection的标识，运行连接迁移到新的路径。 

### 3.1. Connection ID 

每个连接有多个 Connection ID，都可以标识Connection。endpoint挑选 Connection ID 供peer使用。

Connection ID 的主要是用来确保底层协议层(UDP, IP) 的地址发送变化不会影响到 QUIC connection 的 packet 交付。
- 包含长header的packet包括 Source Connection ID 和 Destination Connection ID，用于设置新connection的 Connection ID
- 包含短header的packet仅仅包括 Destination Connection ID，endpoint可以用它来做简单的负载均衡
- Version Negotiation packet 回显客户端挑选的 connection IDs 

Connection ID 在两个时间点提出：
- 在握手期间，endpoint在 长header 的 Source Connection ID 中提出。默认的是0，如果发送了 preferred_address 参数，则是1
- 当peer发送了 NEW_CONNECTION_ID frame，新的connection ID 会加1的被提出

endpoint提出的connection ID，如果peer没有 通过 RETRIED_CONNECTION_ID frame 过期，则必须在连接期间都有效（能够接收携带了这个ID的packet）。

endponit 应该确保有足够多没有使用的 connection ID。endpoint 使用 active_connection_id_limit 传输参数指定自己期望维护的数量，使用 NEW_CONNECTION_ID 申请新的 connection ID。
- endpoint如果收到超过 active_connection_id_limit 的connection ID，其必须关闭连接，返回 CONNECTION_ID_LIMIT_ERROR
- endpoint如果收到 NEW_CONNECTION_ID frame，可能返回旧的未使用的 connection ID。可能会限制最大ID申请数来减少需要维护的路径状态
- endpoint可以发送 RETIRE_CONNECTION_ID frame 来取消某个ID的提出

### 3.2. 包处理

客户端和服务端在收到packet后都会尽可能的和现有的连接关联上：
- 如果 Destination Connection ID 设置了，使用它关联或者创建一个Connection
- 不然，使用IP+Port进行关联
- endpoint可以对任何 不能关联到connection的packet 发送 Stateless Reset，告诉对端当前的链接不可用。

对于客户来说：
- 如果存在 Destination Connection ID,那么需要确认这个ID是自己挑选的
- 不然使用 本地 IP + Port 关联
- 不然就需要丢弃
- 如果消息内容是使用没有计算的key加密的，客户端可能丢弃，也可能缓存起来等后面用
- 如果包的版本不对，直接丢弃

对于服务端来说：
- 如果收到的包的版本不对：
   - packet 比较大，可以发起 Version Negotiation packet；
   - 不然应该直接丢弃。
- 如果收到的包的版本被支持或者没有版本字段，则使用 connection ID 或者 本地 IP+port去选择连接
   - 连接找到，处理即可
   - 连接没找到
      - 如果服务端拒绝接收新请求，应该发送一个 包含 CONNECTION_CLOSE frame 的 Initial packet，错误码为 CONNECTION_REFUSED
      - 是个 Initial packet，服务端应该开始握手
      - 如果是个 0-RTT packet，服务端可能缓存一定数量的包，开始握手逻辑
      - 不然，中间丢弃

QUIC 也预留了 **版本协商** 的能力，细节本文不展开。


### 3.3. 连接建立

这个和握手强相关，先跳过

TODO 7


### 3.4. 防流量放大攻击


### 3.5. 连接迁移

Section 8 describes address validation and critical denial-of-service mitigations,
Section 9 describes how endpoints migrate a connection to a new network path,

5.2.3  TODO


### 3.6. 连接关闭


## 5. 协议的编码细节

Finally, encoding details of QUIC protocol elements are described in:

Section 15 (versions),
Section 16 (integer encoding),
Section 17 (packet headers),
Section 18 (transport parameters),
Section 19 (frames), and
Section 20 (errors).