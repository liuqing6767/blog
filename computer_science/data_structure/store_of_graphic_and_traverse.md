<!--
author: 刘青
date: 2016-03-23
title:  图的存储结构及遍历
tags: 数据结构 图
category: fundation/data_struct
status: publish
summary:  图是一种比线性表和树更复杂的数据结构。线性表中，数据元素之间仅有线性关系，每个元素只有一个直接前驱和一个直接后继；在树形结构中，数据元素之间有明显的层次关系，并且每一层上的数据元素可能和下一层中多个元素相关，但只能和上一层中一个元素相关；而在图形结构中，结点之间的关系可以是任意的，图中任意两个数据元素之间都可能相关。
-->

### 图的存储结构
有：G = (V, {G})，V = {$v_1, v_2, v_3, v_4$}，G = {$<v_1, v_2>, <v_1, v_3>, <v_3, v_4>, <v_4, v_1>$}
![示例用图|center|400*400](http://7nliuximu.liuximu.com/data_structure_g.jpg)

#### 数组表示法|邻接矩阵
> 用两个数组分别存储数据元素（顶点）的信息和数据元素之间的关系（边|弧）的信息。

G的邻接矩阵为：

|*| v1| v2| v3| v4|
|-| - | - | - |  -|
|v1|0|1|1|0|
|v2|0|0|0|0|
|v3|0|0|0|1|
|v4|1|0|0|0|

用二维数组表示有n个顶点 图时，虚存放n个顶点信息和 $n^2$ 个弧信息。若为无向图，则可以只存储上|下三角。
> 度：
> - 无向图 $v_i$ 的度为邻接矩阵定 i 行|列 元素的和
> - 有向图：第 i 行的元素之和为OD($v_i$)，第 i 列的元素之和为ID($v_i$)。TD = ID + OD

对于网，将元素值替换为权值即可，非连接顶点之间用 ∞ 表示。

#### 邻接表（Adjacency List）
> 对图中每个顶点建立一个单链表，第 i 个单链表中的结点表示依附于顶点 $v_i$ 的边（对有向图是以该顶点为尾的弧）。

对于G，结果是：
![邻接表结果|center|500](http://7nliuximu.liuximu.com/data_structure_ajacencyListResult.jpg)

#### 十字链表
> 对应于有向图中每一条弧有一个结点，对应于每个顶点有一个结点。

#### 邻接多重表表
不详述。


### 图的遍历
> 从图中某一个顶点出发遍历图中其他顶点，每个顶点遍历有且只有一次。

我们使用一个辅助数组visited[0, n-1]，记录某个顶点是否被遍历了。

#### 深度优先遍历
> 从某个结点v出发
>  - 访问此结点
>  - 依次访从v的未被访问的邻接点出发深度优先遍历图，直到图中所有和v有路径相通的顶点都被访问到；
>
>若图中还有结点未被访问，选出其中一个，重复以上步骤。

#### 广度优先遍历
> 从某个结点v出发
>  - 访问此结点
>  - 依次访v的未被访问的邻接点，并保证先被访问的顶点的邻接顶点先于后被访问的顶点的邻接顶点，直到图中所有已访问的顶点的邻接顶点都被访问到；
>
>若图中还有结点未被访问，选出其中一个，重复以上步骤。

我们使用邻接表表示法实现两种遍历：
```java
package graph;

import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentLinkedQueue;

import linear.IHandler;

/**
 * 弧
 */
class AjacencyListArc implements IArc {
	public AjacencyListArc(AjacencyListHeaderVertex tail, AjacencyListHeaderVertex header) {
		this.setTail(tail);
		this.setHeader(header);
	}

	/**
	 * 弧尾
	 */
	private AjacencyListHeaderVertex tail;

	public AjacencyListHeaderVertex getTail() {
		return tail;
	}

	public void setTail(AjacencyListHeaderVertex tail) {
		this.tail = tail;
	}

	/**
	 * 弧头
	 */
	private AjacencyListHeaderVertex header;

	public AjacencyListHeaderVertex getHeader() {
		return header;
	}

	public void setHeader(AjacencyListHeaderVertex header) {
		this.header = header;
	}
}

/**
 * 邻接点
 */
class AjacencyListVertex implements IVertex {
	public AjacencyListVertex(AjacencyListHeaderVertex adjVex, IArc arc) {
		this.setAdjVex(adjVex);
		this.setArc(arc);
	}

	/**
	 * 邻接顶点的下标
	 */
	private AjacencyListHeaderVertex adjVex;

	public AjacencyListHeaderVertex getAdjVex() {
		return adjVex;
	}

	public void setAdjVex(AjacencyListHeaderVertex adjVex) {
		this.adjVex = adjVex;
	}

	/**
	 * 与表头结点之间的弧
	 */
	private IArc arc;

	public IArc getArc() {
		return arc;
	}

	public void setArc(IArc arc) {
		this.arc = arc;
	}
}

/**
 * 头结点
 */
class AjacencyListHeaderVertex implements IVertex {
	public AjacencyListHeaderVertex(String data) {
		this.data = data;
	}

	@Override
	public String toString() {
		// TODO Auto-generated method stub
		return this.getData();
	}

	/**
	 * 该头结点的邻接点的集合
	 */
	private LinkedList<AjacencyListVertex> vertexs;

	public LinkedList<AjacencyListVertex> getVertexs() {
		if (this.vertexs == null) {
			this.vertexs = new LinkedList<AjacencyListVertex>();
		}
		return this.vertexs;
	}

	public void setVertexs(LinkedList<AjacencyListVertex> vertexs) {
		this.vertexs = vertexs;
	}

	/**
	 * 结点的数据，从简
	 */
	private String data;

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}
}

/**
 * 邻接表表示法
 */
public class AdjacencyListGraph implements IGraph {
	private AjacencyListHeaderVertex[] vertexs;
	private AjacencyListArc[] arcs;

	private HashMap<AjacencyListHeaderVertex, Boolean> visitedFlag;

	/**
	 * TODO 会改变入参
	 * 
	 * @param vs
	 * @param as
	 */
	public AdjacencyListGraph(IVertex[] vs, IArc[] as) {
		this.vertexs = (AjacencyListHeaderVertex[]) vs;
		this.arcs = (AjacencyListArc[]) as;

		this.init();
	}

	private void init() {
		this.visitedFlag = new HashMap<AjacencyListHeaderVertex, Boolean>();
		for (int i = 0; i < this.vertexs.length; i++) {
			visitedFlag.put(this.vertexs[i], false);
		}

		for (int i = 0; i < this.vertexs.length; i++) {
			AjacencyListHeaderVertex curVertex = this.vertexs[i];
			// 依次处理每个顶点
			for (int j = 0; j < this.arcs.length; j++) {
				AjacencyListArc curArc = this.arcs[j];
				if (curArc.getTail() == curVertex) {
					AjacencyListVertex oneVertex = new AjacencyListVertex(curArc.getHeader(), curArc);
					curVertex.getVertexs().add(oneVertex);
				}

			}
		}
	}

	private boolean visited(AjacencyListHeaderVertex vertex) {
		return this.visitedFlag.get(vertex);
	}

	@Override
	public boolean DFSTraverse(IHandler handler) {
		for (int i = 0; i < this.vertexs.length; i++) {
			if (!this.visited(this.vertexs[i])) {
				this.DFSTraverseOneVertex(this.vertexs[i], handler);
			}
		}

		return true;
	}

	public boolean DFSTraverseOneVertex(AjacencyListHeaderVertex vertex, IHandler handler) {
		if (this.visited(vertex)) {
			return false;
		}

		handler.handle(vertex);
		this.visitedFlag.replace(vertex, true);

		LinkedList<AjacencyListVertex> vertexsOnHeader = vertex.getVertexs();
		Iterator<AjacencyListVertex> iterator = vertexsOnHeader.iterator();
		while (iterator.hasNext()) {
			AjacencyListHeaderVertex nextVertex = iterator.next().getAdjVex();
			if (nextVertex != null) {
				this.DFSTraverseOneVertex(nextVertex, handler);
			}
		}

		return true;
	}

	@Override
	public boolean BFSTraverse(IHandler handler) {
		for (int i = 0; i < this.vertexs.length; i++) {
			if (!this.visited(this.vertexs[i])) {
				this.BFSTraverseOneVertex(this.vertexs[i], handler);
			}
		}

		return true;
	}

	public boolean BFSTraverseOneVertex(AjacencyListHeaderVertex vertex, IHandler handler) {
		ConcurrentLinkedQueue<AjacencyListHeaderVertex> nodes = 
				new ConcurrentLinkedQueue<AjacencyListHeaderVertex>();

		if (this.visited(vertex)) {
			return false;
		}

		handler.handle(vertex);
		this.visitedFlag.replace(vertex, true);
		nodes.add(vertex);

		while (!nodes.isEmpty()) {
			AjacencyListHeaderVertex nextVertex = nodes.poll();
			// 找到它的所有的邻接点，处理
			LinkedList<AjacencyListVertex> vertexsOnHeader = nextVertex.getVertexs();
			Iterator<AjacencyListVertex> iterator = vertexsOnHeader.iterator();
			while (iterator.hasNext()) {
				AjacencyListHeaderVertex oneVertex = iterator.next().getAdjVex();
				if (oneVertex != null && !this.visited(oneVertex)) {
					handler.handle(oneVertex);
					this.visitedFlag.replace(oneVertex, true);
					nodes.add(oneVertex);
				}
			}
		}

		return true;
	}


	/*
	 * 其他操作
	 */
}
```

测试代码为：
```java

	@Test
	public void test() {

		AjacencyListHeaderVertex v1 = new AjacencyListHeaderVertex("v1");
		AjacencyListHeaderVertex v2 = new AjacencyListHeaderVertex("v2");
		AjacencyListHeaderVertex v3 = new AjacencyListHeaderVertex("v3");
		AjacencyListHeaderVertex v4 = new AjacencyListHeaderVertex("v4");
		AjacencyListHeaderVertex v5 = new AjacencyListHeaderVertex("v5");
		AjacencyListHeaderVertex v6 = new AjacencyListHeaderVertex("v6");
		AjacencyListHeaderVertex v7 = new AjacencyListHeaderVertex("v7");
		AjacencyListHeaderVertex v8 = new AjacencyListHeaderVertex("v8");
		
		AjacencyListHeaderVertex[] vs = {v1, v2, v3, v4, v5, v6, v7, v8};
		
		AjacencyListArc[] as = {
				new AjacencyListArc(v1, v2),
				new AjacencyListArc(v1, v3),
				new AjacencyListArc(v2, v4),
				new AjacencyListArc(v2, v5),
				new AjacencyListArc(v4, v8),
				new AjacencyListArc(v5, v8),
				new AjacencyListArc(v3, v6),
				new AjacencyListArc(v3, v7)
		};
		
		AdjacencyListGraph g = new AdjacencyListGraph(vs, as);

		//g.DFSTraverse(new PrintHandler());
		g.BFSTraverse(new PrintHandler());
	}
```
