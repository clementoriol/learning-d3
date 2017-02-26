import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceCenter, forceCollide, forceManyBody, forceX, forceY } from 'd3-force';
import { hierarchy } from 'd3-hierarchy';
import { v4 as uuid } from 'uuid';
import data from './data';
import { flatten } from './utils';

let lastNodeId = 0;
let rootData = hierarchy(data); // constructs a root node using d3 hierarchy (https://github.com/d3/d3-hierarchy)
let nodesData = flatten(rootData, lastNodeId); // Flatten the rood node to make the nodes
let linksData = rootData.links(); // Extract links from the root node

let link, node;

// The dimensions we'll use for our SVG
const dimensions = {
  width: 1280,
  height: 960,
};

// Create our links from the data, and appends it to container
// Note: on invocation, nothing is visible yet. Links dont have coordinates yet.
const createLink = (container) => {
  return container.selectAll('.link')
    .attr('class', 'link');
};

// Updates
const updateLink = () => {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
};

// Create our notes from the data, and appends it to container
// Note: on invocation, nothing is visible yet. Nodes dont have width and coordinates yet.
const createNode = (container) => {
  return container.selectAll('.node');
};

const updateNode = () => {
  node
    .attr('r', 10)
    .attr('cx', d => {
      return d.x
    })
    .attr('cy', d => {
      return d.y
    });
};

const restartSimulation = (simulation) => {
  // UPDATE
  link = link.data(linksData, d => d.index);

  // EXIT
  link
    .exit()
    .remove();

  // ENTER
  link = link
    .enter()
    .append('line')
    .attr('class', 'link')
    .merge(link);

  // UPDATE
  node = node.data(nodesData, d => d.id);

  // EXIT
  node
    .exit()
    .remove();

  // ENTER
  node = node
    .enter()
    .append('circle')
    .attr('class', 'node')
    .on('click', d => addRandomChildren(d))
    .merge(node);

  // Restart simulation
  simulation.nodes(nodesData);
  simulation.force('link').links(linksData);
  simulation.alpha(1);
  simulation.restart();
};

const svg = select('body')
  .append('svg')
  .attr('width', dimensions.width)
  .attr('height', dimensions.height);

const linkGroup = svg.append('g').attr('transform', 'translate(640, 480)');
const nodeGroup = svg.append('g').attr('transform', 'translate(640, 480)');

link = createLink(linkGroup, linksData);
node = createNode(nodeGroup, nodesData);

/*
 Defines a "force" (of type link) for us to use in the simulation.
 The link force pushes linked nodes together or apart according to the desired link distance.
 The strength of the force is proportional to the difference between the linked nodes’ distance and the target distance,
 similar to a spring force.
 */
const linkForce = forceLink(linksData)
  .id(d => d.id) // Specify the node key used as an id
  .distance(d => {
    if (d.target.isOpen && d.source.isOpen) {
      return 150; // Long distance between clusters
    }
    return 25; // Short distance between clusters nodes
  })
  .strength(.7);

/*
 Defines a "force" (of type ManyBody)
 Takes a positive or negative integer as parameter
 Defines if the nodes are drawn to each other (positive number) or apart (negative number)
 */
const manyBodyForce = forceManyBody()
  .strength(-100);

/*
 Defines a "force" (of type collide)
 Takes a radius as arguments
 The nodes acts like they have the defined radius, and can't overlap.
 */
const collideForce = forceCollide();

const simulation = forceSimulation(nodesData) // Create a new simulation. NOTE : the simulation is immediately run
  .force('link', linkForce) // Pass it forces
  .force('charge', manyBodyForce)
  .force('collide', collideForce)
  .on('tick', () => { // On tick (on every frame), update the links and node params
    updateLink();
    updateNode();
  });

restartSimulation(simulation);

const addRandomChildren = (Node) => {
  if (Node.isOpen) return;

  fixLinks(Node);

  const randomQuantity = Math.ceil(Math.random() * 8); // Get a number between 1 and 8;
  const newNodes = [];

  for (let i = 0; i <= randomQuantity; i++) { // Generate X random nodes
    const newNode = hierarchy({});
    newNode.id = uuid();
    newNode.depth = Node.depth + 1;
    newNode.parent = Node;
    newNodes.push(newNode);
    nodesData.push(newNode);
  }

  Node.children = newNodes; // Adds the generated nodes to the clicked node
  Node.isOpen = true;
  linksData = [...linksData, ...Node.links()]; // Update the links
  restartSimulation(simulation);
};

// Fix every nodes except one
const fixLinks = (excludeNode) => {
  nodesData.forEach(node => {
    if (excludeNode.id !== node.id) {
      node.fx = node.x; // Set .fx and .fy to some coordinates, the point won't move anymore
      node.fy = node.y;
    } else {
      node.fx = undefined;
      node.fy = undefined;
    }
  })
};

restartSimulation(simulation);
