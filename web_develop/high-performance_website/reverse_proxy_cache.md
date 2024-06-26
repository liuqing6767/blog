<!--
author: 刘青
date: 2016-04-15
title: 反向代理缓存
tags: 高性能Web站点 反向代理缓存
category: web/高性能Web站点
status: publish 
summary: 我们可以使用代理服务器为我们缓存一些数据。
-->

### 传统代理
> 代理服务器：将用户请求转发到最终服务器上的服务器。

有一些网站因为种种原因无法直接访问，我们可以先访问代理服务器，代理服务器将请求转发给最终服务器。

### 反向代理
传统代理服务器将用户隐藏在代理服务器之后，反向代理服务器将Web服务器隐藏在代理服务器之后。
> 前端服务器|反向代理服务器：实现反向代理机制的服务器。因为放到真正服务器之前，所以又叫前端服务器。
> 后端服务器：真正的服务器。

### 使用反向代理缓存数据
不同的web服务器的配置方式是不一样的。
比如我们配置nginx，它负责静态资源缓存，而动态资源交给其他服务器。
```bash
#加载静态资源
try_files $uri $uri/ /index.php?q=\$uri&\$args;
#设置缓存时间
location~ \.(gif|jpg|jpeg|png|bmp|ico)$ {
   expires 30d;
}

#动态资源交个其他程序
location ~\.php${
	proxy_pass localhost:80;
}
```

