<!--
author: 刘青
date: 2016-07-03
title: 微信聊天记录备份还原
tags:  wechat_record
category: journal
status: publish
summary: 详细描述微信记录导入导出，微信聊天记录数据库获取和解码，微信聊天记录备份。
-->

可能换手机，这两天突然想把微信的聊天信息保留下来。腾讯的QQ有云端聊天记录，但是需要收费。而微信好像压根就不提供云端聊天记录，当手机换了，聊天记录也没有了。研究了两天，现将两天的结果总结。

在网上已经有很多的帖子讲微信信息备份，方法归类大致有：
1. 通过工具软件将数据从手机导出到电脑，再导回去
2. 将微信的在手机上的数据库保存再放回去，对应的数据包括图片和音频


其实方法一是方法二的封装版，本质上方法一也要读取微信的本地数据库，将数据进行关联和格式化后导出成文本形式。我们娓娓道来。

---------
## 软件方式实现导出导入
相应的软件其实很多，大多数是想包办管理事务的电脑管家或者是想包办手机管理事务的手机管家|刷机工具。我试了几个。

### QQ电脑管家
QQ电脑管家可以实现：
- 将微信聊天记录保存到电脑
- 将保存到电脑的聊天记录恢复到手机

![enter image description here|center|600x0](http://7nliuximu.liuximu.com/others_QQ_Manager.png)

它的优点是傻瓜式操作，在换手机或者刷机之前点几下进行备份，在另外一台手机或者刷机以后点进行进行恢复就万事大吉了。

![enter image description here|center|600x0](http://7nliuximu.liuximu.com/others_QQ_Manager_Recovery.png)

但是其缺点：
- 只支持安卓。这个问题其实非常的严重。但是因为其他的方法也不能解决这个问题，所以当做其不存在吧
- 语音不能使用了，可能是没有保存语音文件夹
- 图片聊天记录消失
- 聊天记录被加密保存了，所以除了恢复到手机，你是不可能看到任何数据的
- 其他的备份文件大时间长神马的都不是问题

> more：我装了QQ管家，我的虚拟机中的Win7就经常没网，得重启Mac才恢复正常。是的，我要黑任何一款电脑管家。它还偷偷的帮我装了应用宝和腾讯时间助手，用完以后将微信数据备份了就卸载，即便是虚拟机。

### 同步助手
![enter image description here|center|600x0](http://7nliuximu.liuximu.com/others_tongbu_helpers.png)

要是iPhone用户想进行备份，这个是唯一选择，它有Mac版，其实我也不确定iPhone是不是可以。下载地址在：[同步助手官网](http://www.tongbusj.com/?s=pinzhuan) 

它的优点是：
- 傻瓜操作
- 将文件可以导出为excel或者txt，你可以看到你和其他人的聊天信息，当然，只有文字。

![enter image description here|center|600x0](http://7nliuximu.liuximu.com/others_tongbu_software.png)

缺点是：
- 你需要Root。对于普通手机用户来说，root是一个很高深的概念。

> Root原因：任何有权限管理的系统都需要处理谁可以做什么，谁不可以做什么。而即便是普通用户，手机的拥有者，很多事情也是不能做的，比如卸载拨号软件。而其他的软件也只能是在一定范围内做事情，比如应用A不能修改应用B的数据。而Root就算让某个应用（人）拥有做任何事情的能力。这样，同步助手就可以去访问微信的数据文件了。而QQ管家为什么不需要Root呢？因为他们是同一家公司的产品，微信留接口给QQ管家就好了，数据的读取微信来做，而不是直接去拿数据库数据。

- 它不能用于恢复到手机。

你要是Root失败了，或者不想Root，放弃这款软件吧。其实我也挺讨厌它的，手机上来了几个应用，电脑上也装了几款软件。咯：

![enter image description here|center|600x0](http://7nliuximu.liuximu.com/others_Mobile1.jpg)

----------
## 直接拿微信的数据文件
其实前面的尝试，我要得到的：将数据在电脑上保存并可浏览，将数据还原到手机上都已经实现了。但是，我想更彻底一点，我能不能把微信的数据库拿到，这样，我想干嘛就干嘛。

对了，强调一遍，这个方法是Android，对于iOS应该是另外一套体系的事情。

网上有解决方案，步骤为：
- Root，是的，你拿数据得有权限。其实上面的KingRoot对我的手机没有什么用，大家要是真的想用，有一款叫 `刷机精灵` 的软件，亲测有用。
- 安装 RE文件管理器，并获取Root权限，这样就可以接近我们要的数据了：将/data/data/com.tencent.mm/xxxxxxx/EnMicroMsg.db 文件 复制到其他文件夹，将手机连到电脑上就可以复制到电脑上。其中xxxx指的是一串很长的字符串，好像乱码。而文件名网上有的是MicroMsg.db，应该大同小异吧。如图：
![enter image description here|center|600x0](http://7nliuximu.liuximu.com/others_Mobile2.jpg)

终于拿到数据库文件了，可以使用一款绿色（不需要安装）数据库软件 [sqlcipher](http://7nliuximu.liuximu.com/others_sqlcipher.exe) 打开。咦，需要密码！
	
  > 直接使用SQLite打开时直接出错，也不提示输入密码。

找了很久，终于找到了密码的生成方式：
- 得到 手机IMEI：手机拨号盘输入 *#06# 就可以看到
- 得到 微信uin：打开 https://wx.qq.com/  登陆后右击页面选择检查然后搜索 uid，会有看到 script 标签的一个元素中有uid属性
- 将两者拼接，进行md5，可以在 [MD5在线](http://www.cmd5.com/hash.aspx) 进行生成，取前7位就是密码。

![enter image description here|center|600x0](http://7nliuximu.liuximu.com/others_md5.png)

然后就可以看到数据库表了，程序员的最爱。其中最重要的表是 message。我们来小试牛刀。

![enter image description here|center|600x0](http://7nliuximu.liuximu.com/others_sql_result.png)

上图表示我的记录里面一共有5万多条数据，包括发送和接收。我和一个id为 281 的交谈者聊天数最多，一万条出头。我们还可以查看更多的信息。是不是很爽！！！

> 关于聊天语音和图片，因为我没有关注，就不写出来误人子弟了。

--------
总结一下：

|  方式 |支持iOS|在电脑上查看|还原到手机|需要Root|进行数据统计|保留语音|保留图片|
|-----|-----|-----|-----|---|---|---|---|
| QQ管家| 否 |否|是|否|否|否|否|
|同步助手|是|是|否|是|很难|否|否|
|拿数据库文件|未知|是|是|是|是|有可能|有可能|

我更喜欢拿数据库，底层原始未封装，可以做很多事情，也可以永久保存。
