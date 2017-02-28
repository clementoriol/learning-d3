import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceCollide, forceManyBody } from 'd3-force';
import { hierarchy } from 'd3-hierarchy';
import { dispatch } from 'd3-dispatch';
import {timer} from 'd3-timer'
import { d3adaptor } from 'webcola';
import { v4 as uuid } from 'uuid';
import data from './data';
import { flatten } from './utils';

const d3 = {
  forceSimulation,
  forceLink,
  forceCollide,
  forceManyBody,
  hierarchy,
  select,
  timer,
  dispatch, // needed for cola.js
};

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
  simulation
    .nodes(nodesData)
    .links(linksData)
    .start();
};

const svg = select('body')
  .append('svg')
  .attr('width', dimensions.width)
  .attr('height', dimensions.height);

const linkGroup = svg.append('g').attr('transform', 'translate(640, 480)');
const nodeGroup = svg.append('g').attr('transform', 'translate(640, 480)');

link = createLink(linkGroup, linksData);
node = createNode(nodeGroup, nodesData);

const simulation = d3adaptor(d3) // Create the simulation using the cola.js + its d3 adapter
  .jaccardLinkLengths(40, .7) // compute an ideal length for each link based on the graph structure around that link.
  .avoidOverlaps(true) // avoid collisions
  .on('tick', () => { // On tick (on every frame), update the links and node params
    updateLink();
    updateNode();
  });

restartSimulation(simulation);

const addRandomChildren = (Node) => {
  if (Node.isOpen) return;

  const randomQuantity = Math.ceil(Math.random() * 30); // Get a number between 1 and 8;
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

restartSimulation(simulation);
