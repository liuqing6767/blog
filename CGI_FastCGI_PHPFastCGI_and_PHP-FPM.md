<!--
author: 刘青
date: 2016-03-31
title: CGI、FastCGI、PHPFastCGI和PHP-FPM
tags: CGI FastCGI PHPFastCGI PHP-FPM
category: php
status: publish
summary:  
-->
也做了一段时间的PHP了，但是发现其实对PHP的一些名词不理解。好像平时可以做出一点东西给别人用，但对PHP运行环境相关的概念很不清晰。
不明白没有关系啊，搞明白就好了。不理解没有关系啊，先死记硬背，慢慢就理解了。看官方文档，恐怕是最权威的。

### CGI
> Common Gateway Interface：公共网关接口。web服务器 与 安装在服务器上的用来生成动态网页的可执行程序 的交互方式。它是一套协议|标准。 —— [wiki](https://en.wikipedia.org/wiki/Common_Gateway_Interface)

我们再看看[RFC](https://tools.ietf.org/html/rfc3875)的定义：

> The Common Gateway Interface (CGI) [22] allows an HTTP [1], [4] server and a CGI script to share responsibility for responding to client requests.  The client request comprises a Uniform Resource Identifier (URI) [11], a request method and various ancillary information about the request provided by the transport protocol.
> 公共网关接口允许 HTTP服务器 和 CGI 脚本 共同承担相应客户端请求的职责。客户端请求包括一个URI，一个请求方法和一系列由传输协议提供的与之相关的信息。
>
> The CGI defines the abstract parameters, known as meta-variables, which describe a client's request.  Together with a concrete programmer interface this specifies a platform-independent interface between the script and the HTTP server.
> CGI 定义了一系列的描述客户端请求的元数据作为抽象参数。同时也指定了一系列的HTTP服务器与脚本之间的平台独立的具体的编程接口。
>
> The server is responsible for managing connection, data transfer, transport and network issues related to the client request, whereas the CGI script handles the application issues, such as data access and document processing.
> HTTP服务器负责管理连接，数据转换传输和与客户端相关的网络问题。而脚本处理应用程序的问题，别人数据访问和文档处理。

>一些术语的解释：
> - 'meta-variable':A named parameter which carries information from the server to the  script.  It is not necessarily a variable in the operating system's environment, although that is the most common implementation.
> 「元数据」：将信息从服务器传输到脚本的一系列被命名的参数。不一定是操作系统的环境变量，但是大多数都包括。

>- 'script':The software that is invoked by the server according to this interface.  It need not be a standalone program, but could be a dynamically-loaded or shared library, or even a subroutine in the server.  It might be a set of statements interpreted at run-time, as the term 'script' is frequently understood, but that is not a requirement and within the context of this specification the term has the broader definition stated.
> 「脚本」：服务器根据CGI调用的软件。它不需要是一个独立的程序，设置可以是一个子程序，只要它能动态的加载或者分享类库。它可能是「脚本」这个名词的通常的理解——一系列的在运行时被解析的语句，但这不是强制要求的，在这篇说明文档中，「脚本」有更宽泛的定义。

> - 'server':The application program that invokes the script in order to service requests from the client.
> 「服务器」：调用脚本来处理客户端发送的请求的应用程序。

所以我们基本上对CGI有整体的认识了：一套标准。有点ODBC的感觉。

### FastCGI
> 一个连接Web服务器和交互程序的二进制协议，是CGI的一个变种。FastCGI的目的减小Web服务器和交互程序的连接的开销，让服务器可以同时处理更多的网页请求。 —— [wiki](https://en.wikipedia.org/wiki/FastCGI)

哦，FastCGI是CGI的增强版。

### PHP FastCGI
是FastCGI针对PHP语言的一个实现。

### PHP-FPM
> PHP-FPM(FastCGI Process Manager for PHP)：一个简单健壮的 PHP FastCGI 进程管理器。一个附加了一些有用特性的 、适用任意规模网站的 PHP FastCGI 实现。—— [php-fpm.org](http://php-fpm.org/)

可见 PHP-FPM 是一个 PHP FastCGI 的增强。

-------
总结一下：CGI是一个很低效的协议，所以FastCGI对它进行了改良，它们的本质都是联系Web 服务器和交互程序。前两者都是协议，而PHP FastCGI是对FastCGI的实现。FPM的话则是用于替换PHP FastCGI的大部分附加功能，对高负载网站非常有用。
一个客户端请求过来，Web服务器先接受，然后按照CGI的协定交给交互程序处理，得到结果后再响应客户端。

