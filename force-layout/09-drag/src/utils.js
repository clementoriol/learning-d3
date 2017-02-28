import { v4 as uuid } from 'uuid';

export const flatten = (data) => {
  // hierarchical data to flat data for force layout
  const nodes = [];

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = uuid();
    nodes.push(node);
  }
  recurse(data);
  return nodes;
}
