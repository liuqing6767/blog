<!--
author: 刘青
date: 2016-03-18
title:  树及相关概念
tags: 数据结构 树
category: fundation/data_struct
status: publish
summary: 树的相关概念
-->

前面的文章将的都是线性数据结构，元素和元素是一对一的。我们现在要讨论树，一种一对多的结构。想象一颗倒置的树，它的一个节点连接更多子节点。我们给出树的定义：
> 树是n(n>=0)个结点的有限集。它：
> - 有且仅有一个特定的根(Root)结点；
> - 当n>1时，其余结点可分为m(m>0)个互不相交的有限集合T1,T2,...,Tm，每个集合本身又是一棵树，称为根的子树(SubTree)。

可见，树的定义是递归的。
我们看一些名词的定义：
> 结点：包含一个数据元素及若干指向其子树的分支。
> 结点的度：结点拥有的子树数。
> 叶子|终端结点：度为0的结点。
> 非终端|分支结点：度不为0的结点。
> 树的度：树内各个结点度的最大值。
> 孩子：结点的子树的根为该结点的孩子。
> 双亲：
> 兄弟：同一个双亲的结点互称兄弟。
> 祖先：
> 子孙：
> 层次：结点的层次从根开始定义，为第一层，孩子为第二层。
> 堂兄弟：双亲在同一层的结点互称堂兄弟。
> 深度：最大的层次。
> 有序树：树的结点从左至右是有次序的。
> 无序树：
> 森林：m(m>=1)棵互不相交的树的集合

我们看树的ATD：
```java
package tree;

import linear.IHandler;

public interface ITree {

	/**
	 * 构造一棵空树
	 * @return
	 */
	ITree init();
	
	/**
	 * 销毁一棵树
	 * @return
	 */
	boolean destroy();
	
	/**
	 * 根据一系列树的定义创建一棵树
	 * @param defines
	 * @return
	 */
	ITree create(ITree[] defines);

	/**
	 * 判断树是否为空
	 * @return
	 */
	boolean isEmpty();
	
	/**
	 * 清空二叉树
	 * @return
	 */
	boolean clear();
	
	/**
	 * 返回一棵树的深度
	 * @return
	 */
	int depath();
	
	/** 
	 * 返回树的根节点
	 * @return
	 */
	ITree getRoot();
	
	/**
	 * 获取本结点的值
	 * @return
	 */
	String getValue();
	
	/**
	 * 对本结点赋值
	 * @return
	 */
	boolean assignTree(ITree tree);

	/**
	 * 获取一棵树的父结点
	 * @return
	 */
	ITree getParent();
	
	/**
	 * 获取一棵树某个结点的最左孩子
	 * @return
	 */
	ITree getLeftChild();

	/**
	 * 获取一棵树的某个结点的右兄弟
	 * @return
	 */
	ITree getRightSibiling();
	
	/**
	 * 添加new_tree为本结点的第index棵子结点
	 * @param new_tree
	 * @param index
	 * @return
	 */
	boolean insertChild(ITree new_tree, int index);

	/**
	 * 删除本树中第index棵子结点
	 * @param index
	 * @return
	 */
	boolean deleteChild(int index);
	
	/**
	 * 为所有的结点执行事件
	 * @param handler
	 * @return
	 */
	boolean traverse(IHandler handler);
}
```

