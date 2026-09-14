'use client'

import { useState, useMemo } from 'react'

type CategoryNode = {
  id: string
  name: string
  parentId: string | null
  children: CategoryNode[]
}

function buildTree(
  categories: {
    id: string
    name: string
    parentId: string | null
  }[],
): CategoryNode[] {
  const map = new Map<string, CategoryNode>()

  categories.forEach((category) => {
    map.set(category.id, {
      ...category,
      children: [],
    })
  })

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
  return [
    node.id,
    ...node.children.flatMap(collectDescendantIds),
  ]
}

function findNode(
  nodes: CategoryNode[],
  id: string,
): CategoryNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }

    const found = findNode(node.children, id)

    if (found) {
      return found
    }
  }

  return null
}

function totalCount(
  node: CategoryNode,
  productCounts: Record<string, number>,
): number {
  const own = productCounts[node.id] ?? 0

  return (
    own +
    node.children.reduce(
      (sum, child) =>
        sum + totalCount(child, productCounts),
      0,
    )
  )
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
        className={`flex cursor-pointer items-center gap-1 rounded-lg py-1.5 text-xs transition ${
          isSelected
            ? 'bg-[#28394c] font-medium text-white'
            : 'text-[#68727e] hover:bg-[#f4f5f7] hover:text-[#28313d]'
        }`}
        style={{
          paddingLeft: 8 + depth * 16,
          paddingRight: 8,
        }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleExpand(node.id)
            }}
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] ${
              isSelected
                ? 'text-white/70 hover:text-white'
                : 'text-[#9aa2ac] hover:text-[#28394c]'
            }`}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}

        <span className="min-w-0 flex-1 truncate">
          {node.name}
        </span>

        <span
          className={`shrink-0 text-[10px] ${
            isSelected
              ? 'text-white/60'
              : 'text-[#a0a7b0]'
          }`}
        >
          {count}
        </span>
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
  productCounts = {},
}: {
  categories: {
    id: string
    name: string
    parentId: string | null
  }[]
  selectedId: string | null
  onSelect: (
    id: string | null,
    descendantIds: string[] | null,
  ) => void
  productCounts?: Record<string, number>
}) {
  const tree = useMemo(
    () => buildTree(categories),
    [categories],
  )

  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(),
  )

  const allCount = useMemo(
    () =>
      Object.values(productCounts).reduce(
        (sum, count) => sum + count,
        0,
      ),
    [productCounts],
  )

  function toggleExpand(id: string) {
    setExpanded((previous) => {
      const next = new Set(previous)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  function handleSelect(id: string) {
    if (selectedId === id) {
      onSelect(null, null)
      return
    }

    const node = findNode(tree, id)

    const descendantIds = node
      ? collectDescendantIds(node)
      : [id]

    onSelect(id, descendantIds)
  }

  return (
    <nav className="text-sm">
      <div
        className={`mb-1 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
          selectedId === null
            ? 'bg-[#28394c] font-medium text-white'
            : 'text-[#68727e] hover:bg-[#f4f5f7] hover:text-[#28313d]'
        }`}
        onClick={() => onSelect(null, null)}
      >
        <span className="min-w-0 flex-1 truncate">
          Все категории
        </span>

        <span
          className={`shrink-0 text-[10px] ${
            selectedId === null
              ? 'text-white/60'
              : 'text-[#a0a7b0]'
          }`}
        >
          {allCount}
        </span>
      </div>

      <div className="space-y-0.5">
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
      </div>
    </nav>
  )
}
