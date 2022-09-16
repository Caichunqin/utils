/**
 * 获取树中某节点的完整路径
 * @param {string | number} id 节点ID
 * @param {array} tree 树
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 */
function getNodePathFromTree(id, tree = [], idKey = 'id', childrenKey = 'children') {
  const path = []
  const findPath = nodes => {
    for(let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i]
      if (node[idKey] === id) {
        path.push(node)
        return true
      } else {
        const children = node[childrenKey]
        if (children && children.length) {
          path.push(node)
          const hasFind = findPath(children)
          if (!hasFind) {
            path.pop()
          } else {
            return true
          }
        }
      }
    }
  }
  findPath(tree)
  return path
}
  
/**
 * 获取树中某节点
 * @param {string | number} id 节点ID
 * @param {array} tree 树
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 */
function getNodeFromTree(id, tree = [], idKey = 'id', childrenKey = 'children') {
  return tree.reduce((acc, cur) => {
    return acc
      || (cur[idKey] === id && cur)
      || getNodeFromTree(id, cur[childrenKey], idKey, childrenKey)
  }, null)
}
  
/**
 * 获取树中所有叶子节点
 * @param {array} tree 树
 * @param {string} childrenKey 子节点字段名
 */
function getLeavesFromTree(tree = [], childrenKey = 'children') {
  return tree.reduce((acc, cur) => {
    return acc.concat(
      cur[childrenKey] && cur[childrenKey].length
        ? getLeavesFromTree(cur[childrenKey], childrenKey)
        : cur
    )
  }, [])
}

/**
 * 树结构转一维数组
 * @param {array} tree 树
 * @param {string} childrenKey 子节点字段名
 */
function treeToFlat(tree = [], childrenKey = 'children') {
  return tree.reduce((acc, cur) => {
    return acc.concat(
      cur,
      cur[childrenKey] ? treeToFlat(cur[childrenKey], childrenKey) : []
    )
  }, [])
}

/**
 * 一维数组转树结构
 * @param {array} flat 一维数组
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 * @param {string} parentKey 父节点字段名
 */
function flatToTree(flat = [], idKey = 'id', childrenKey = 'children', parentKey = 'parentId') {
  let tree = flat.filter(i => !i[parentKey])
  let rest = flat.filter(i => i[parentKey])
  const toTree = (tree = []) => {
    tree.forEach(i => {
      const children = rest.filter(restItem => restItem[parentKey] === i[idKey])
      rest = rest.filter(restItem => restItem[parentKey] !== i[idKey])
      if (children.length) {
        i[childrenKey] = children
        toTree(children)
      }
    })
  }
  toTree(tree)
  return tree
}

/**
 * 一维数组转树结构,已知根节点pid
 * @param {array} arr 一维数组
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 * @param {string} pid 父节点字段名
 */
function arrayToTree(arr = [], idKey = 'id', childrenKey = 'children', parentKey = 'parentId') {
  return arr.reduce((res, current) => {
    if (current[parentKey] === pid) {
      current[childrenKey] = this.arrayToTree(arr, current[idKey])
      return res.concat(current)
    }
    return res
  }, [])
}

/**
 * 过滤树
 * @param {array} tree 树
 * @param {string} idKey id字段名
 * @param {function} filterFn 过滤方法
 * @param {function} onDelete 过滤节点时的附带操作
 * @param {string} childrenKey 子节点字段名
 */
function treeShake(config = {}) {
  const { tree = [], filterFn, onDelete, idKey = 'id', childrenKey = 'children' } = config
  if (typeof filterFn !== 'function') {
    throw new Error(`请设置正确的过滤回调函数`)
  }
  const root = {
    [idKey]: Symbol('rootId'),
    [childrenKey]: tree
  }
  // 深度优先遍历
  const hasFlag = (root) => {
    const stack = [root]
    while (stack.length) {
      const item = stack.pop()
      if (filterFn(item)) {
        return true
      }
      const children = item[childrenKey] || []
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i])
      }
    }
    return false
  }

  // 广度优先遍历
  const queue = [root]
  while (queue.length) {
    const item = queue.shift()

    const itemChildren = item[childrenKey] || []
    const children = []
    itemChildren.forEach(i => {
      if (hasFlag(i)) {
        children.push(i)
      } else if (typeof onDelete === 'function') {
        onDelete(i)
      }
    })

    if (children.length) {
      item[childrenKey] = children
    } else {
      delete item[childrenKey]
    }

    children.forEach(i => queue.push(i))
  }

  return root[childrenKey] || []
}
// this.treeShake({
//   tree: this.newTreeData,
//   filterFn: i => i.type === 'iPaddresses',
//   onDelete: i => this.deleteChildStatus([i])
// })

export {
  getNodePathFromTree,
  getNodeFromTree,
  getLeavesFromTree,
  treeToFlat,
  flatToTree,
  arrayToTree,
  treeShake
}