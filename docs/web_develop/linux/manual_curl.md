<!--
author: 刘青
date: 2016-06-01
title: Curl学习笔记
tags: linux
category: linux
status: publish
summary: curl-常用选项
-->

本文档是 $man\ curl$ 的阅读笔记。

### 名称
> Curl： transfer a URL.

### 描述
Curl的名称已经说得很清楚了。它是一个支持多种协议、将数据从一台服务器传输到另一台服务器上的工具。
curl极其的方便，他提供了许多呆了，可以使用各种代理：授权，FTP上传，HTTP post，SSL连接，cookies等等。

### 语法
curl [options] [URL...]

#### URL
URL其实有非常多种形式，curl也支持多连接。这里不展开讲。因为我的实际应用场景用不到，用最普通的就可以了：
```
http://www.test.com
```
#### 进度表
curl默认将传输的数据、速度、剩余时间这些进度表信息输出到控制台。可以使用shell 重定向（>），-o [file] 等方式进行重定向。

#### 选项
> liunx 命令参数：参数是指1|2 - 个开头的选项，其后可以加额外的值。
> - -：额外的值与选项之间的空格可以省略，$-d\ val1$和 $-dval1$是等价的；要是多个短参数且没有额外信息，可以进行简写，$-d \ -c$ 和 $-dc$ 是等价的。
> - --：额外的值和选项之间的空格不可省略。

选项其实非常的多，这里记录常用的。

*-o， --output file*：将数据存到指定位置。
```
ubuntu@10-10-7-179:~$ curl -o a.html www.baidu .com
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   133    0   133    0     0   1033      0 --:--:-- --:--:-- --:--:--  2607
```

*-#, --progress-bar*:显示简易的进程，而不是标准的输出
```
ubuntu@10-10-7-179:~$ curl -# -o a.html www.baidu .com
######################################################################## 100.0%
```

*指定协议*： -0|--http1.0, --http1.1, --http2, -1|--tlsv1, -2|--sslv2, -3|--sslv3, -4|--ipv4, -6|--ipv6

*-b, --cookie name=data*：设置cookie，要是有多个，应该使用引号括起来，形如："NAME1=VALUE1; NAME2=VALUE2"
*-c,--cookie-jar file_name*：将服务器是cookie信息写入到指定文件

*--connect-timeout second*：连接建立最大时间
*--keepalive-time seconds*
*-m, --max-time seconds*

*-d, --data data*：通过post方式给服务器发送数据，Content-Type 是 application/x-www-form-urlencoded
```
#指定数据
ubuntu@10-10-7-179:~$ curl -d 'wd=curl&rsv_spt=1' www.baidu .com
#指定数据实在文件夹
ubuntu@10-10-7-179:~$ curl -d @post_data.txt www.baidu .com
```

*-F，--form name=content*：和 -d 类似，Content-Type 是 multipart/form-data

*-G, --get*：将-d的数据通过get方式提交

*-H, --header header*：在请求中添加额外的头

*-S, -show-error*：要是失败了，展示错误


### 总结
记录就这么多吧。常用的：发送get|post请求，加cookie，最常用的就是这么多。
