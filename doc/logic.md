@{{
@[ 程序运作逻辑 ]{_unbroken_doc_385f148fa_}

}}@

* 首先, 使用模块的 init 方法进行 @[ unbroken-doc 初始化 ]{_unbroken_doc_c067c8957_}
    * 初始化的默认配置文件 @[ 配置文件 ]{_unbroken_doc_e8ecfc779_}
* 然后暴露出 tasks 的接口, tasks有两个:
    * gulp doc @[ doc 项目监控处理程序 ]{_unbroken_doc_0e9af2478_}
    * gulp validate @[ 校对cache中的文件路径 ]{_unbroken_doc_236ad77f4_}

gulp doc 任务逻辑:

* 首先, 根据配置, 对项目文件进行监视 @[ 监视文件更改 ]{_unbroken_doc_d5b774c32_}
* 如果有任何改动的文件 'add' 或 'change', 则 @[ 加入批处理队列 ]{_unbroken_doc_da5379fc3_}
* 最后, 在一个200ms周期的隔时处理中, 处理队列 @[ 隔时批量索引项目内容 ]{_unbroken_doc_0e5174551_}

gulp validate 任务逻辑:

* @[ 校对cache中的文件路径 ]{_unbroken_doc_236ad77f4_}
* @[ 校对cache中的标记keys ]{_unbroken_doc_4fb26dc65_}


