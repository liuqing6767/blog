<!--
author: 刘青
date: 2016-03-21
title:  树的存储
tags: 数据结构 树 二叉树
category: fundation/data_struct
status: publish
summary: 特殊的树——二叉树
-->


### 树的存储
我们了解了树和二叉树的概念。深入的了解了二叉树的概念，现在看看树的存储。树的存储方式有很多，各有优劣，这里举例说明。
#### 双亲表示法
> 使用一组连续空间存储树，每个节点中附设一个指示器表面其双亲节点的下标。

伪代码为：
```java
class ParentFlagTree{
	//根节点所在下标
	int rootIndex;
	//节点总树
	int nodeCount;
	//节点列表 
	ParentFlagNode[] nodes;
}

class ParentFlagNode{
	String data;
	//双亲节点位置
	int parent_index;
}
```
![|center| 400*400](http://7nliuximu.liuximu.com/data_structure_%E5%8F%8C%E4%BA%B2%E8%A1%A8%E7%A4%BA%E6%B3%95.jpg)

缺点和明显，要是要找子节点，得遍历整个结构。

#### 孩子表示法
> 使用多重链表，每个节点有多个指针域，每个指针域指向一棵子树的根节点。

```java
class ChildFlagTree{
	String data;
	
	//根节点所在下标
	int rootIndex;
	//节点总树
	int nodeCount;
	//节点列表 
	ChildFlagTree[] nodes;
}
```
它的缺点是不适合查找的双亲节点。

#### 孩子兄弟表示法
> 使用二次链表做存储结构，两个指针分别指向该节点的第一个孩子和下一个兄弟节点。

```java
class CSTree{
	String data;
	
	CSTree firstChild;
	CSTree nextSibling;
}
```
找某个节点的第i个子节点：firtChild的第i-1个nextSibling。我们再加个parent域，双亲节点也很容易找了。
