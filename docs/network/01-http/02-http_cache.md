# HTTP Cache

HTTP缓存的目标是 通过复用先前的响应，来减少未来等价的请求的 响应数据和网络带宽、提高性能。

本文描述 HTTP Cache 的规范，相关RFC在 [HTTP Caching](https://datatracker.ietf.org/doc/html/rfc9111)。主要内容为：
- Cache的基本概念
- HTTP中处理Cache的基本框架
- HTTP中处理Cache的具体协议
- 相关安全问题

## 1. 基本概念
`HTTP缓存` 是指将HTTP的响应的一个本地存 和 控制、检索、删除消息的子系统。

`共享缓存` 是被多个用户复用的缓存，通常作为中间节点部署；`私有缓存` 是被单个用户使用的，通常部署为用户代理的一部分。

`Cache Key` 是用来挑选响应的信息，最少有由请求的方法和目标URI组成。

## 2. 基本框架
除非如下情况，响应一定不能缓存：
- 请求Method被理解 （一般为 GET，所谓的安全的）
- 响应码是最终响应码
- 如果响应码是206/304，或者必须理解的缓存指令出现：缓存理解响应码
- 响应中没有 no-store 缓存指令
- 缓存是共享的：私有响应增量没有出现或者允许共享缓存来储存一个被修改后的响应
- 缓存是共享的：Authorization Header 没在请求头中出现，或者响应头中出现了确切的可以共享的指令
- 响应至少包含：
    - 一个 public 响应指令
    - 一个私有的响应指令，如果缓存不共享
    - 有 Expires Header
    - 如果缓存是共享的：有 s-maxage 响应指令
    - 存在允许被缓存的扩展
    - 被定义为明确可缓存的状态码

缓存必须包括收到的私有的响应Header和 Trailer 字段，包括未识别的，以确保新的HTTP Header能够被成功的部署，除非：
- Connection Header相关的字段，应该在转发在前被移除，可能发生在缓存储存前
- 类似的在转发在前会被移除掉的字段
- no-cache 和 private 缓存指令，可以分别具有防止所有缓存和共享缓存存储头字段的参数。


## 3. 具体协议
这个事情其实一共包括如下几步：
1. 根据请求 计算本次请求的 Cache Key，尝试得到 Cache。
    1. 没有的话就请求转发请求，去得到响应
1. 验证 Cache 是否能用
    1. 新鲜度是否还能用
    1. 特殊的Header
    1. 不能用就请求转发请求，去得到响应
1. （可选）转发请求，得到响应
    1. （可选）将响应处理好存储下来供后续使用


### 3.1. 计算 Cache Key

Cache Key 需要包括如下元素：
- 目标URI
- 请求方法
- Header：语义一致就可以，也就是：移除空白字符、对齐大小写、忽略顺序

### 3.2 验证Cache是否能用

`Ccache-Control` Header 来枚举一系列指令，语法为：
```
  Cache-Control   = #cache-directive

  cache-directive = token [ "=" ( token / quoted-string ) ]
```
请求相关的指令有：
- max-age：客户端希望的内容最大的age，不接收新鲜度过期的响应
- max-stale：客户端可以接收过期一段时间的响应
- min-fresh：客户端希望收到响应的新鲜度还能保持 min-fresh时长
- no-cache：不要将请求或响应存储在非易失性的存储器中
- no-tranform：客户端要求不要转换内容
- only-if-cached：客户端要求只获取到已经存储的响应。

1. 如果响应的 Header 中包括了 `Vary`：
- 如果值是 `*`，一定不能用
- 不然，看Vary对应的字段的值是否和请求的Header匹配，不然延不能用


2. 进一步验证新鲜度。服务端会响应其期望的多久之后不要再使用本次响应的信息。
- 如果出现，优先使用 响应中的 `s-maxage` 指令
- 如果出现，优先使用 响应中的 `max-age` 指令
- 如果出现，优先使用 响应中的 `Expires` 指令

3. 不然，尝试启发式的计算过期时间。RFC没有提供具体的算法。
- 如果出现，使用相应中的 `Last-Modified` Header

### 3.3. 转发请求得到响应
Cache 节点可能存储了响应，但是过期了。这时候它可以发送有条件的验证请求。
- 如果正在验证的响应中提供了实体标签，必须发送相关的实体标签(If-Match, If-None-Match, If-Range)
- 如果不是针对子范围的请求，应该发送 Last-Modified 值(使用If-Modified-Since)
- 如果是子范围的请求，可能发送 Last-Modified 值（使用 If-Unmodified-Since 或者 If-Range）


收到响应后要么更新缓存的元数据，要么更新响应内容。然后进行响应：
- 304(Not Modified) Status Code 表示数据没有修改，可以继续使用
- 服务端处理正常，将完整的响应返回
- 服务端处理异常，可以重新转发请求，也可以返回过期数据。

1. 响应中的 Header **`Age`** 表明 内容能够当做缓存使用的最长时间。
```
  Age = delta-seconds
```
如果新鲜度验证失败，但是服务端断连了或者 客户端/服务端明确授权了，缓存组件也可以返回过期了的Cache。

2. 响应中也可以有 `Cache-Control` Header，指令有：
- max-age：响应还多久过期
- must-revalidate：如果响应过期，必须进行验证，而不能返回给客户端
- proxy-revalidate：同上。本指令不能用于私有缓存
- must-understand：缓存节点需要理解和符合响应的状态码
- no-cache：如果是没有参数的形式，表示所有的请求都应该转发而不使用缓存；如果是有参数的形式，表示列出的Header已经从后续的响应中排除
- no-store：同请求类型
- no-transform：中间节点不能转换响应
- private：如果是没有参数的形式，表示不能存储这个响应；如果是有参数的形式，表示列出的Header对单个用户限制
- public：可以缓存，即便被禁止
- s-maxage：对于共享缓存，本指令优先级更高

3. 响应中还可以有 `Expires` Header。表明过期的那刻的时间戳。

## 4. 安全问题
缓存机制暴露了额外的攻击面，因为缓存内容是恶意利用的攻击目标。

缓存内容在请求结束后还会长期存在，因此需要对敏感内容进行保护。

**缓存中毒** 是指 在缓存中存储恶意内容，可以扩展攻击者的影响范围从而影响多个用户。当攻击者使用实现缺陷、提升特权或其他技术将响应插入缓存时，就会发生这种“缓存中毒”攻击。当使用共享缓存向许多客户机分发恶意内容时，这一点尤其有效。 缓存中毒的一个常见攻击向量是利用代理和用户代理在消息解析上的差异。

**定时攻击** 缓存可能会“泄漏”曾经访问的资源的信息。例如用户访问一个站点，他们的浏览器缓存了一些响应，然后导航到第二个站点，该站点可以尝试加载它知道存在于第一个站点上的响应。如果它们加载得很快，就可以假定用户访问了该站点，甚至是其中的特定页面。将引用站点的信息加入cache key 中可以缓解这个问题。

**缓存私密数据** 因为实现和部署的缺陷，可能导致隐私数据被缓存。