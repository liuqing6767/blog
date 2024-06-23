<!--
author: 刘青
date: 2016-03-22
title:  赫夫曼树及其应用
tags: 数据结构 树 赫夫曼树
category: fundation/data_struct
status: publish
summary: 赫夫曼树，又称最优树，是一类带权路径最短的树。
-->
### 什么是赫夫曼树
赫夫曼树，又称最优树，是一类带权路径最短的树。我们先了解几个概念：
> **路径长度：**从树中一个结点到另一个结点中间的分支构成这两个结点的路径，路径上的分支数目。
> **树的路径长度：**从树根到每一结点的路径长度之和。
> **树的带权路径长度：**树中所有叶子结点的带权路径长度之和。
> **最优二叉树|赫夫曼树：**假设有n个权值$\{w_1, w_2,..., w_n\}$，每个结点的带权为$w_i$，其中带权路径长度WPL最小的那块二叉树。

### 赫夫曼树的作用
赫夫曼树可以用于最佳判定算法。比如做一个百分制转五分制的程序：

|分数| 0-59 | 60-69 | 70-79 | 80-89 | 90-100 |
| - | -| - | - | -| - |
| 对应结果 | bad| pass | general | good| excellent |
| 比例数| 0.05 | 0.15 | 0.40| 0.30 | 0.10 |

如表，不同的case顺序效率是不一样的，使用赫夫曼树可以求出最优解。

### 赫夫曼算法
赫夫曼给出了赫夫曼树的算法，称为赫夫曼算法。
> 1. 根据给定的n个权值$\{w_1, w_2,..., w_n\}$构成的n棵二叉树的集合 $F = \{T_1, T_2, ..., T_n\}$，其中每棵二叉树$T_i$中占有一个带权为$w_i$的根节点，左右子树均为空；
> 2. 从 F 中选取两棵树节点的权值最小的书作为左右子树构造一棵新的二叉树，将新的二叉树的根节点的权值为左右子树上根节点的权值之和；
> 3. 在 F 中删除这两棵树，同事将新的二叉树加入到 F中；
> 4. 重复 2 和 3，直到 F 左右一棵树。
 

### 赫夫曼编码
 在电文传送中，比如我们要传送 "ABACCDA"，因为只有四个字符，用两位编码即可。假设 A，B，C，D 分别为 00，01，10，11，则传输数据为 00010010101100。
 有没有什么办法让其短一点呢？使用长短不一的编码可以。假设A，B，C，D分别为 0，00，1，01，则传输数据为 000011010，但是解析有问题。我们观察发现：
 > 若要设计长短不一的编码，则必须保证任一字符的编码不是其他字符编码的前缀，这种编码叫做 **前缀编码**。

如何实现前缀编码呢？二叉树可以实现。如图：
![前缀编码|center|500*500](http://7nliuximu.liuximu.com/data_structure_%E5%89%8D%E7%BC%80%E7%BC%96%E7%A0%81.png)

我们希望最后的电文长度最短。认真分析发现，设计电文总长度最短的二进制前缀编码即为以n种字符出现的频率作权，设计一棵赫夫曼树。
> 二进制前缀编码 == 赫夫曼编码

我们写代码实现赫夫曼编码的求解：
首先定义一个bean，表示结点的结构：
```java
/**
 * 赫夫曼编码中每个节点的数据结构 所有的节点将保留在一个一维数组中，一棵有n个叶子节点的赫夫曼树有2n-1个节点
 */
class HuffmanNode {
	// 权值
	private double weight;
	// 值
	private String value;

	// 构成赫夫曼树后，为求编码需要从叶子结点出发到根结点
	private HuffmanNode parent;

	// 解码需要从根走到叶子
	private HuffmanNode lchild;
	private HuffmanNode rchild;

	// 编码
	private String code;

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public HuffmanNode(double weight, String value) {
		this.setWeight(weight);
		this.setValue(value);
	}

	public double getWeight() {
		return weight;
	}

	public void setWeight(double weight) {
		this.weight = weight;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public HuffmanNode getParent() {
		return parent;
	}

	public void setParent(HuffmanNode parent) {
		this.parent = parent;
	}

	public HuffmanNode getLchild() {
		return lchild;
	}

	public void setLchild(HuffmanNode lchild) {
		this.lchild = lchild;
	}

	public HuffmanNode getRchild() {
		return rchild;
	}

	public void setRchild(HuffmanNode rchild) {
		this.rchild = rchild;
	}
}
```


我们提供如下的元素全集：
|A|B|C|D|E|F|G|H|
|-|-|-|-|-|-|-|-|
|0.1|0.2|0.15|0.25|0.05|0.15|0.03|0.07|

我们再定义一个赫夫曼树类，职责是将元素全集转换为一棵树：
```java
class HuffmanTree {
	private HuffmanNode root;

	public HuffmanNode getRoot() {
		return root;
	}

	public void setRoot(HuffmanNode root) {
		this.root = root;
	}

	LinkedList<HuffmanNode> list;

	public LinkedList<HuffmanNode> getList() {
		return list;
	}

	public void setList(LinkedList<HuffmanNode> list) {
		this.list = list;
	}

	/**
	 * 计算赫夫曼树中的每个叶子节点对应的编码
	 * 
	 * @param root
	 * @return
	 */
	private void setCode(HuffmanNode root, String code) {
		if (root == null) {
			return;
		}

		if (root.getLchild() == null && root.getRchild() == null) {
			root.setCode(code);
			return;
		}
		if (root.getLchild() != null) {
			this.setCode(root.getLchild(), code + "0");
		}
		if (root.getRchild() != null) {
			this.setCode(root.getRchild(), code + "1");
		}
	}

	/**
	 * 从元素集合中构建一棵赫夫曼树
	 * 
	 * @param nodeSet
	 */
	public HuffmanTree(HuffmanNode[] nodeSet) {
		if (nodeSet == null || nodeSet.length == 0) {
			return;
		}

		// 得到我们要处理的数据
		this.list = new LinkedList<>();
		for (int i = 0; i < nodeSet.length; i++) {
			this.list.add(nodeSet[i]);
		}

		while (this.min2To1(list)) {}

		// 找出根节点
		this.setRoot(this.list.getLast());
		
		this.setCode(this.getRoot(), "");
	}

	/**
	 * 找列表中的权值最小的两个，给其添加父节点
	 * 
	 * @param list
	 * @return 返回是否成功
	 */
	private boolean min2To1(LinkedList<HuffmanNode> list) {
		HuffmanNode min_1 = null;

		Iterator<HuffmanNode> it = this.list.iterator();
		while (it.hasNext()) {
			HuffmanNode temp = it.next();
			if (temp.getParent() == null && (min_1 == null || min_1.getWeight() > temp.getWeight())) {
				min_1 = temp;
			}
		}
		if (min_1 == null) {
			return false;
		}

		HuffmanNode min_2 = null;

		Iterator<HuffmanNode> it_1 = this.list.iterator();
		while (it_1.hasNext()) {
			HuffmanNode temp = it_1.next();
			if (temp.getParent() == null && temp != min_1 && (min_2 == null || min_2.getWeight() > temp.getWeight())) {
				min_2 = temp;
			}
		}
		if (min_2 == null) {
			return false;
		}

		HuffmanNode parent = new HuffmanNode(min_1.getWeight() + min_2.getWeight(), null);
		min_1.setParent(parent);
		min_2.setParent(parent);
		parent.setLchild(min_1);
		parent.setRchild(min_2);

		list.add(parent);

		return true;
	}
}
```

构造函数将根据元素全集构造一棵树赫夫曼树为：
![tree|center](http://7nliuximu.liuximu.com/data_structure_tree.jpg)

然后是一个赫夫曼编码类，更多的是工具类的职责：
```java
/**
 * 赫夫曼编码， 提供字符全集及每个字符的全集， 实现对编码字符串的解码和原字符串的编码
 */
public class HuffmanCode {
	private HuffmanTree huffmanTree;

	/**
	 * 从原始元素集合中得到赫夫曼树
	 * 
	 * @param nodeSet
	 */
	public HuffmanCode(HuffmanNode[] nodeSet) {
		this.huffmanTree = new HuffmanTree(nodeSet);
	}

	/**
	 * 编码字符串：实际过程应该是依次找到每个origintext的成员，从他们自身出发找parent。
	 * 若其是parent的左孩子，编码加0，反之加1，如此反复直到parent为root，将编码倒置就是一个元素的编码。
	 * 
	 * @param origintext
	 * @return
	 */
	public String encode(String origintext) {
		String result = "";
		for (int i = 0; i < origintext.length(); i++) {
			String value = this.getCodeByValue(origintext.charAt(i) + "");
			if (value == null) {
				return null;
			}

			result += value;
		}

		return result;
	}

	private String getCodeByValue(String value) {
		Iterator<HuffmanNode> it = this.huffmanTree.getList().iterator();
		while (it.hasNext()) {
			HuffmanNode temp = it.next();
			if (value.equals(temp.getValue())) {
				return temp.getCode();
			}
		}
		return null;
	}

	private String getValueByCode(String code) {
		Iterator<HuffmanNode> it = this.huffmanTree.getList().iterator();
		while (it.hasNext()) {
			HuffmanNode temp = it.next();
			if (code.equals(temp.getCode())) {
				return temp.getValue();
			}
		}
		return null;
	}

	/**
	 * 解码字符串：实际过程应该是依次遍历ciphertext,若为0则从找当前结点的左孩子，反之右孩子。
	 * 若左|右孩子为空，则完成一个元素的解码。如此反复。
	 * @param ciphertext
	 * @return
	 */
	public String decode(String ciphertext) {
		String result = "";
		int begin_index = 0, end_index = 1;
		while(end_index <= ciphertext.length()){
			String target = ciphertext.substring(begin_index, end_index);
			String value = this.getValueByCode(target);
			if(value == null){
				end_index++;
			}else{
				begin_index = end_index;
				end_index++;
				result += value;
			}
		}
		
		if(begin_index != ciphertext.length()){
			return null;
		}

		return result;
	}
}
```
在编码类中，我们进行了数据缓存，每个元素进行追加此处了code，这样遍历一维数组就可以得到我们要的结果。请注意查看decode 和 encode 的注解。

我们看测试代码：
```java
	@Test
	public void test() {
		HuffmanNode[] nodeSet = {new HuffmanNode(0.1, "A"), new HuffmanNode(0.2, "B"),
				new HuffmanNode(0.15, "C"), new HuffmanNode(0.25, "D"), 
				new HuffmanNode(0.05, "E"), new HuffmanNode(0.15, "F"), 
				new HuffmanNode(0.03, "G"), new HuffmanNode(0.07, "H")};
		
		HuffmanCode  hc = new HuffmanCode(nodeSet);
		
		//String ciphertext = hc.encode("ABCD");
		//System.out.println(ciphertext);
		
		String plaintext = hc.decode("1000010101");
		System.out.println(plaintext);
	}
```

