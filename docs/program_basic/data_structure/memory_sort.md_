<!--
author: 刘青
date: 2016-03-28
title:  内部排序
tags: 数据结构
category: fundation/data_struct
status: publish
summary:   排序：将一个数据元素的任意序列，重新排列成一个按关键字有序的序列。
-->

> **排序**：将含有n个记录的序列排列成对应的关键字有序的序列的过程。
> 
> 排序前有：$R_i < R_j$，若在排序后依旧有：$R_i < R_j$，则说**排序方法是稳定的**，反之，**排序方法不是稳定的**。

> 按照存储器进行分类：
> - 内部排序：所有的待排序记录存放在计算机随机存储器中进行的排序过程
> - 外部排序：部分的待排序记录存放在计算机随机存储器中、其他的在外存中进行的排序过程

> 排序的两个基本操作：
> -  比较两个关键字的大小
> - 移动元素位置

> 按排序过程中依据的不同原则对内部排序进行分类：
> - 插入排序
> - 交换排序
> - 选择排序
> - 归并排序
> - 基数排序

### 插入排序
#### 直接插入排序[Straight Insertion Sort]
> 思想：将一个记录插入到已排好序的有序表中，从而得到一个新的、记录数加1的有序表。
> 具体的操作：两个相邻的位置为p，p+1 的元素一一比较，要是V(p) > V(p+1)：
> - V(p) 放到 位置p+1；
> - V(p+1) 放到前面已经排好序的队列x位置，使得V(x-1) < V(p+1) < V(x)；
> - 将原列表中 x 到 p-1 区间的元素依次后移一位。

我们看代码实现：
```java
	@Override
	public void sort(ISTable table) {
		ListTable list = (ListTable) table;
		int[] elements = list.getElements();

		int j = 0;
		//依次遍历每一个元素
		for (int i = 0; i < elements.length - 1; i++) {
			
			//要是后一个元素比当前元素小
			if (elements[i] > elements[i + 1]) {
				//将后一个（小）的元素暂存
				int temp = elements[i + 1];
				//当前元素保存到后一个元素的位置，这一轮比较，它确定是最大的
				elements[i + 1] = elements[i];
				//从当前元素开始往前查找
				for (j = i; j > 0; j--) {
					if(elements[j - 1] < temp){
						break;
					}
					//要是当前元素以前的元素还有比后一个元素还小的，这些元素依次往后移
					elements[j] = elements[j - 1];
				}//end for
				//将较小元素存放到当前元素以前第一个比他大的元素的后面
				elements[j] = temp;
			}// end if
		}// end for
	}
	
	//测试代码
	public static void main(String[] args) {
		int[] elements = {4, 2, 8, 9, 3, 7, 11, 32, 77, 33};
		ListTable table = new ListTable(elements);
		
		InsertSort is = new InsertSort();
		is.sort(table);
		System.out.println(table.toString());
	}
```

优化：
> 折半插入法：直接插入法是在查找 x 的位置一位一比较[和替换]的的。我们可以使用折半查找法减少查找次数。

#### 希尔排序 [Shell Sort]
> 思想：先将整个待排记录序列分割为若干子序列分别进行总结插入排序，待整个序列中的记录"基本有序"时，再对全体记录进行一次直接插入排序。
>  
>  具体操作：对待排序序列进行n趟直接排序，每一趟相邻元素的间距递减，最后一趟间距为1。因为前面n-1趟排序将把待排序进行了大致排序，所以移动的元素越来越少。

如图：
![希尔排序示意图|center|600](http://7nliuximu.liuximu.com/data_structure_%E5%B8%8C%E5%B0%94%E6%8E%92%E5%BA%8F.jpg)
```java
	@Override
	public void sort(ISTable table) {
		int[] dlta = {5,3,1};
		for(int i = 0; i < dlta.length; i++){
			this.sort(table, dlta[i]);
		}
	}

	public void sort(ISTable table, int dk) {
		ListTable list = (ListTable) table;
		int[] elements = list.getElements();

		int j = 0;
		//依次遍历每一个元素
		for (int i = 0; i < elements.length - dk; i++) {		
			//要是后一个元素比当前元素小
			if (elements[i] > elements[i + dk]) {
				//将后一个（小）的元素暂存
				int temp = elements[i + dk];
				//当前元素保存到后一个元素的位置，这一轮比较，它确定是最大的
				elements[i + dk] = elements[i];
				//从当前元素开始往前查找
				for (j = i; j > dk - 1; j = j-dk) {
					if(elements[j - dk] < temp){
						break;
					}
					//要是当前元素以前的元素还有比后一个元素还小的，这些元素依次往后移
					elements[j] = elements[j - dk];
				}//end for
				//将较小元素存放到当前元素以前第一个比他大的元素的后面
				elements[j] = temp;
			}// end if
		}// end for
	}

	public static void main(String[] args) {
		int[] elements = {49, 38, 65, 97, 76, 13, 27, 49, 55, 4};
		ListTable table = new ListTable(elements);
		
		ShellSort is = new ShellSort();
		is.sort(table);
		System.out.println(table.toString());
	}
```

### 交换排序
借助"交换"进行元素排序。
#### 冒泡排序 [Bubble Sort]
> 思想：每一趟冒泡，将最小|大的元素移动到最左|右边。对剩下的元素继续进行冒泡。

```java
	@Override
	public void sort(ISTable table) {
		ListTable list = (ListTable) table;
		int[] elements = list.getElements();

		for (int i = 0; i < elements.length - 1; i++) {
			for(int j = i; j < elements.length - 1; j++ ){
				if(elements[j] > elements[j+1]){
					int temp = elements[j+1];
					elements[j+1] = elements[j];
					elements[j] = temp;
				}
			}
		}
	}
	

	public static void main(String[] args) {
		int[] elements = {4, 2, 8, 9, 3, 7, 11, 32, 77, 33};
		ListTable table = new ListTable(elements);
		
		InsertSort is = new InsertSort();
		is.sort(table);
		System.out.println(table.toString());
	}
```

#### 快速排序[Quick Sort]
是对冒泡排序的改进。
> 思想：每一趟排序，将待排序列分割成独立的两部分，其中一部分记录的关键字均大于另外一部分。
> 
> 具体操作：一趟排序会对序列 `{` r[s], r[s+1], ... ,r[t] `}`进行排序，先任选一个元素r[s]作为$支点$，将剩余元素中大的放到支点以后，小的放到支点以前。递归对支点左右的序列进行排序。

```java
	@Override
	public void sort(ISTable table) {
		ListTable list = (ListTable) table;
		int[] elements = list.getElements();
		
		this.sort(elements, 0, elements.length-1);
	}
	
	private void sort(int[] elements, int begin, int end){
		if(begin < end){
			//将当前序列进行左右划分
			int pivotloc = elements[begin];
			int low = begin;
			int high = end;

			int temp = 0;
			while(low < high){
				while(low < high && elements[high] >= pivotloc){
					high--;
				}
				temp = elements[high];
				elements[high] = elements[low];
				elements[low] = temp;
				
				while(low < high && elements[low] <= pivotloc){
					low++;
				}
				temp = elements[high];
				elements[high] = elements[low];
				elements[low] = temp;
				
				elements[low] = pivotloc;
			}

			//对左序列进行递归处理
			this.sort(elements, begin, low -1);
			//对右序列进行递归处理
			this.sort(elements, low + 1, end);
		}
	}
	

	public static void main(String[] args) {
		int[] elements = {4, 2, 8, 9, 3, 7, 11, 32, 77, 33};
		ListTable table = new ListTable(elements);
		
		QuickSort is = new QuickSort();
		is.sort(table);
		System.out.println(table.toString());
	}
```

### 选择排序
> 基本思想：每一趟在 n-i+1 个记录中选取关键字最小的记录作为有序序列中第i个记录。

#### 简单选择排序 Simple Selection Sort
> 一趟简单选择排序通过 n-i 次关键字间的比较从 n-i+1 个记录中选择关键字最小的记录，并和第 i 个元素交换。

```java
	@Override
	public void sort(ISTable table) {
		ListTable list = (ListTable) table;
		int[] elements = list.getElements();

		for (int i = 0; i < elements.length; i++) {
			//从[i, element.legth]中找到最小的元素
			int min_index = i;
			for(int j = i; j < elements.length; j++ ){
				min_index = elements[min_index] > elements[j] ? j : min_index;
			}
			
			int temp = elements[i];
			elements[i] = elements[min_index];
			elements[min_index] = temp;
			
		}
	}
	

	public static void main(String[] args) {
		int[] elements = {4, 2, 8, 9, 3, 7, 11, 32, 77, 33};
		ListTable table = new ListTable(elements);
		
		SimpleSelectionSort is = new SimpleSelectionSort();
		is.sort(table);
		System.out.println(table.toString());
	}
```
#### 树形选择排序 [Tree Selection Sort]
可以通过减少比较次数来提高效率。
> 思想：又称锦标赛排序，使用了锦标赛的思想。首先对 n 个记录的关键字进行两两比较，然后在其中 $\frac{n}{2}$个较小者之间在进行两两比较，直到找到最小关键字的记录。
>  
>  具体做法：将待排序元素作为二叉树叶子节点，两两的父节点为其较小值，直到根节点为最小元素。对比是视情况选择左右子节点直到叶子节点。

#### 堆排序[Heap Sort]
树形选择排序的辅助空间过大，且需要和最大值进行比较。
> 堆：n 个元素的序列$`{`k_1, k_2, ..., k_n`}`$，当且仅当满足：$$k_i ≥ k_`{`2i`}` \ \&\&\  k_i ≥ k_`{`2i+1`}`$$或者：$$k_i ≤ k_`{2i`} \ \&\&\  k_i ≤ k_`{`2i+1`}`$$ 称之为堆。

将这样的一维数组看成一个完全二叉树，则树种所有非终端节点的值均不大于|小于其左右孩子结点的值，二叉树的根节点一定是最大|小值。如图。
![heap|center|600](http://7nliuximu.liuximu.com/data_structure_heap.png)

> 堆排序：每次得到堆顶的元素后将剩余元素又组成一个堆，如此反复就可以得到一个有序序列。 

可见，堆排序有首次创建堆和以后的堆调整。
> 堆调整：在输出第一个元素后，最后一个元素将其进行替代。此时，左右子树都是堆，仅需要自上而下进行调整：若根节点和左|右子树的根节点破坏了堆，进行替换，反复进行即可。如图。

![adjust|center|600](http://7nliuximu.liuximu.com/data_structure_adjust_heap.jpg)

> 堆创建：选中最大的元素并与序列中最后一个记录交换作为一个"大堆顶"，对剩下的前 n - 1 的记录进行筛选，重新将它调整为一个"大堆顶"。反复进行。

![create|center|600](http://7nliuximu.liuximu.com/data_structure_create_heap.jpg)

### 归并排序[Merging Sort]
> 思想：将两个或以上的有序表组合成一个新的有序列表。
> 
> 具体操作：将初始的 n 个记录切分为 n 个子序列，每个子序列元素为个数为 1。两两归并，得到 n/2 个长度小于等于2的子序列。对剩下的子序列进行两两归并，依次进行直到只有一个子序列。

![merge|center|600](http://7nliuximu.liuximu.com/data_structure_merge.jpg)

### 基数排序
此处不进行讨论。
