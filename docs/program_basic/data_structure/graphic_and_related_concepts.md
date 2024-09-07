<!--
author: 刘青
date: 2016-03-23
title:  图及相关概念
tags: 数据结构 图
category: fundation/data_struct
status: publish
summary:  图是一种比线性表和树更复杂的数据结构。线性表中，数据元素之间仅有线性关系，每个元素只有一个直接前驱和一个直接后继；在树形结构中，数据元素之间有明显的层次关系，并且每一层上的数据元素可能和下一层中多个元素相关，但只能和上一层中一个元素相关；而在图形结构中，结点之间的关系可以是任意的，图中任意两个数据元素之间都可能相关。
-->
图是一种比线性表和树更复杂的数据结构。线性表中，数据元素之间仅有线性关系，每个元素只有一个直接前驱和一个直接后继；在树形结构中，数据元素之间有明显的层次关系，并且每一层上的数据元素可能和下一层中多个元素相关，但只能和上一层中一个元素相关；而在图形结构中，结点之间的关系可以是任意的，图中任意两个数据元素之间都可能相关。

### 图的定义和术语
> 顶点 Vertex： 图中的数据元素。
> 
> V 是顶点的有穷非空集合。
> 
> VR 是两个顶点之间的关系的集合。
> 
> 弧 Arc：$`<`v, w`>`  \in VR$ 表示 一条从v到w的弧，w为弧头|始结点，v为弧尾|终结点。
> 
> 有向图|无向图：若`<`v, w`>`必定存在`<`w, v`>`，则使用 (v, w)表示，此时图为无向图。反之有向图。
> 
> 完全图：一个图中有n个顶点，e条弧（不包括自身到自身的），e = $\dfrac`{`1`}``{`2`}`n(n-1)$的无向图。
> 
> 有向完全图：e = n(n-1)的有向图。
> 
> 边：无向图的弧。
> 
> 稀疏图|稠密图：有很少的变的图为稀疏图，反之稠密图。
> 
> 权：与图的边|弧相关的数。
> 
> 网：带权的图。
> 
> 子图：G = (V, `{`E`}`)，G' = (V', `{`A'`}`)，若 $V' \in V$且 $E' \in E$，则 G' 为 G 的子图。
>
> **邻接点**：无向图 G = (V, `{`A`}`)，如果边$(v, v') \in E$ ，则v 和 v' 互为 邻接点。
> 
> 度：与某个顶点相关联的边的数量，记作TD(V)。
> 
> 出度|入度：以顶点v为头的弧的数量为入度，记作ID(v)，以顶点v为尾的弧的数量为入度，记作OD(v)。
> 
> 路径：无向图 G = (V, `{`E`}`) 中从顶点v到顶点v' 经过的顶点序列(v = v1, ...., vi = v' )。
> 
> 回路|环：第一个顶点和最后一个顶点为同一个顶点的路径。
> 
> 简单路径：序列中顶点不重复出现的路径。
> 
> 简单回路|简单环：第一个顶点和最后一个顶点为同一个顶点的简单路径。
> 
> 连通：若从 v 到 v' 有路径，则 v 和 v' 是连通的。
> 
> 连通图：无向图中任意两个顶点都是连通的。
> 
> 连通分量：无向图中的极大连通子图。
> 
> 强连通图：有向图中任意两个顶点都是连通的，v 到 v'，v' 到 v。
> 
> 强连通分量：有向图中的极大连通子图。
> 
> 生成树：包含图中全部结点，但只有足以构成一棵树的n-1条边的绩效连通子图。
> 
> 有向树：只有一个顶点入度为0，其余顶点入度为1的有向图。
> 
> 生成森林：若干棵互不相交的有向树集合。这些有向树含有图中全部顶点，但只有足以构成若干棵不相交的有向树的弧。  


我们看看树的ADT：
```java
package graph;

import linear.IHandler;

/**
 * 图，是结点和边|弧的集合
 */
interface IGraph `{`
	/** 根据顶点集合和弧集合创建图
	 * @param vs
	 * @param as
	 * @return
	 */
	IGraph create(IVertex[] vs, IArc[] as);
	boolean destory();
	
	/**
	 * 定位顶点
	 * @param v
	 * @return
	 */
	IVertex loactVex(IVertex v);
	
	/**
	 * 获取顶点的值
	 * @param v
	 * @return
	 */
	IVertex getVex(IVertex v);
	
	/**
	 * 找到顶点v并赋值
	 * @param v
	 * @return
	 */
	boolean putVex(IVertex v);

	/**
	 * 获取v的第一个邻接顶点
	 * @param v
	 * @return
	 */
	IVertex getFirstAdjVex(IVertex v);
	
	/**
	 * 获取v的第一个邻接顶点v1的邻接顶点
	 * @param v
	 * @return
	 */
	IVertex getNextAdjVex(IVertex v, IVertex v1);

	/**
	 * 添加顶点到图
	 * @param v
	 * @return
	 */
	boolean insertVex(IVertex v);
	
	/**
	 * 删除顶点及相关的弧
	 * @param v
	 * @return
	 */
	boolean deleteVex(IVertex v);

	/**
	 * 添加弧到图，需要注意是否是有向图
	 * @param v
	 * @return
	 */
	boolean insertArc(IVertex v, IVertex v1);

	/**
	 * 删除弧，需要注意是否是有向图
	 * @param v
	 * @return
	 */
	boolean deleteArc(IVertex v, IVertex v1);

	/**
	 * 深度优先遍历树
	 * @param handler
	 * @return
	 */
	boolean DFSTraverse(IHandler handler);
	

	/**
	 * 广度优先遍历树
	 * @param handler
	 * @return
	 */
	boolean BFSTraverse(IHandler handler);
`}`
```

