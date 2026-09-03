'use client'

import { useState, useMemo } from 'react'

type CategoryNode = {
  id: string
  name: string
  parentId: string | null
  children: CategoryNode[]
}

function buildTree(categories: { id: string; name: string; parentId: string | null }[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>()
  categories.forEach((c) => map.set(c.id, { ...c, children: [] }))
  const roots: CategoryNode[] = []
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

function collectDescendantIds(node: CategoryNode): string[] {
  return [node.id, ...node.children.flatMap(collectDescendantIds)]
}

function findNode(nodes: CategoryNode[], id: string): CategoryNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = findNode(n.children, id)
    if (found) return found
  }
  return null
}

function totalCount(node: CategoryNode, productCounts: Record<string, number>): number {
  const own = productCounts[node.id] ?? 0
  return own + node.children.reduce((sum, child) => sum + totalCount(child, productCounts), 0)
}

function TreeNode({
  node,
  selectedId,
  expanded,
  onToggleExpand,
  onSelect,
  depth,
  productCounts,
}: {
  node: CategoryNode
  selectedId: string | null
  expanded: Set<string>
  onToggleExpand: (id: string) => void
  onSelect: (id: string) => void
  depth: number
  productCounts: Record<string, number>
}) {
  const hasChildren = node.children.length > 0
  const isExpanded = expanded.has(node.id)
  const isSelected = selectedId === node.id
  const count = totalCount(node, productCounts)

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 rounded cursor-pointer text-sm ${
          isSelected ? 'bg-blue-100 text-blue-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.id)
            }}
            className="w-4 h-4 shrink-0 flex items-center justify-center text-gray-400"
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}
        <span className="truncate flex-1">{node.name}</span>
        <span className="text-xs text-gray-400 shrink-0 pr-1">{count}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              depth={depth + 1}
              productCounts={productCounts}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoryTree({
  categories,
  selectedId,
  onSelect,
  productCounts,
}: {
  categories: { id: string; name: string; parentId: string | null }[]
  selectedId: string | null
  onSelect: (id: string | null, descendantIds: string[] | null) => void
  productCounts: Record<string, number>
}) {
  const tree = useMemo(() => buildTree(categories), [categories])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const allCount = useMemo(
    () => Object.values(productCounts).reduce((sum, n) => sum + n, 0),
    [productCounts]
  )

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSelect(id: string) {
    if (selectedId === id) {
      onSelect(null, null)
      return
    }
    const node = findNode(tree, id)
    const descendantIds = node ? collectDescendantIds(node) : [id]
    onSelect(id, descendantIds)
  }

  return (
    <nav className="text-sm">
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer ${
          selectedId === null ? 'bg-blue-100 text-blue-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
        }`}
        onClick={() => onSelect(null, null)}
      >
        <span className="flex-1">Все категории</span>
        <span className="text-xs text-gray-400 shrink-0">{allCount}</span>
      </div>
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          onSelect={handleSelect}
          depth={0}
          productCounts={productCounts}
        />
      ))}
    </nav>
  )
}