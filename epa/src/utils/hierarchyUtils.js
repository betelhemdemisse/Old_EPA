export function filterNonRegionalTreeAllowRoot(nodes = [], isRoot = true) {
  return nodes
    .filter(node => isRoot || node.isRegional === false)
    .map(node => ({
      ...node,
      children: filterNonRegionalTreeAllowRoot(node.children || [], false),
    }));
}
export function getChildrenByDepth(node, depth, isRegionalMode) {
  if (!node?.children) return [];

  // Root → no filtering
  if (depth === 0) {
    return node.children;
  }

  // Below root → apply rule
  return node.children.filter(c =>
    isRegionalMode ? c.isRegional === true : c.isRegional === false
  );
}

export function filterRegionalTreeAllowRoot(nodes = [], isRoot = true) {
  return nodes
    .filter(node => isRoot || node.isRegional === true)
    .map(node => ({
      ...node,
      children: filterRegionalTreeAllowRoot(node.children || [], false),
    }));
}
export function findNodeByIdAllRoots(roots = [], id) {
  for (const node of roots) {
    if (node.organization_hierarchy_id === id) return node;
    if (node.children) {
      const found = findNodeByIdAllRoots(node.children, id);
      if (found) return found;
    }
  }
  return null;
}
  