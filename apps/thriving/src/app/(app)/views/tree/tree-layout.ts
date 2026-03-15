export type NodeDepth = 0 | 1 | 2 | 3 | 4

export interface TreeNode {
  id: string
  label: string
  depth: NodeDepth
  pillarId: string | null
  pillarColor: string | null
  status: string | null
  failureCost: string | null
  color: string | null
  children: TreeNode[]
  // Computed by layout
  x: number
  y: number
}

export interface LayoutConfig {
  cardW: number
  cardH: number
  gapX: number
  gapY: number
  pillarGap: number
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  cardW: 130,
  cardH: 56,
  gapX: 180,
  gapY: 68,
  pillarGap: 48,
}

const MAX_DEPTH = 4

function measureSubtreeHeight(node: TreeNode, cfg: LayoutConfig): number {
  if (node.children.length === 0) return cfg.cardH
  const childrenH = node.children.reduce((sum, c, i) => {
    const extra = node.depth === 0 && i > 0 ? cfg.pillarGap : 0
    return sum + extra + measureSubtreeHeight(c, cfg)
  }, 0)
  const gaps = (node.children.length - 1) * cfg.gapY
  return Math.max(cfg.cardH, childrenH + gaps)
}

function positionNode(node: TreeNode, topY: number, cfg: LayoutConfig): void {
  const subtreeH = measureSubtreeHeight(node, cfg)
  node.x = node.depth * cfg.gapX
  node.y = topY + subtreeH / 2 - cfg.cardH / 2

  let curY = topY
  node.children.forEach((child, i) => {
    if (node.depth === 0 && i > 0) curY += cfg.pillarGap
    const childH = measureSubtreeHeight(child, cfg)
    positionNode(child, curY, cfg)
    curY += childH + cfg.gapY
  })
}

export function computeLayout(root: TreeNode, cfg: LayoutConfig = DEFAULT_LAYOUT): TreeNode {
  positionNode(root, 0, cfg)
  return root
}

export function flattenTree(root: TreeNode): TreeNode[] {
  const result: TreeNode[] = []
  function walk(node: TreeNode) {
    result.push(node)
    node.children.forEach(walk)
  }
  walk(root)
  return result
}

export function collectChain(nodeId: string, root: TreeNode): Set<string> {
  const chain = new Set<string>()

  function findAndMark(node: TreeNode, path: TreeNode[]): boolean {
    const newPath = [...path, node]
    if (node.id === nodeId) {
      newPath.forEach((n) => chain.add(n.id))
      function markDesc(n: TreeNode) { chain.add(n.id); n.children.forEach(markDesc) }
      node.children.forEach(markDesc)
      return true
    }
    return node.children.some((c) => findAndMark(c, newPath))
  }

  findAndMark(root, [])
  return chain
}
