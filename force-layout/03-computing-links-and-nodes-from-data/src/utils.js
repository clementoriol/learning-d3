export const flatten = (data) => {
  // hierarchical data to flat data for force layout
  const nodes = [];
  let i = 0;

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    else ++i;
    nodes.push(node);
  }
  recurse(data);
  return nodes;
}
