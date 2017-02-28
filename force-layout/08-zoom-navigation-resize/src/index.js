import { select, event } from 'd3-selection';
import { forceSimulation, forceLink, forceCollide, forceManyBody } from 'd3-force';
import { zoom } from 'd3-zoom';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { hierarchy } from 'd3-hierarchy';
import { v4 as uuid } from 'uuid';
import data from './data';
import { flatten } from './utils';
import { debounce } from 'lodash';

let lastNodeId = 0;
let rootData = hierarchy(data); // constructs a root node using d3 hierarchy (https://github.com/d3/d3-hierarchy)
let nodesData = flatten(rootData, lastNodeId); // Flatten the rood node to make the nodes
let linksData = rootData.links(); // Extract links from the root node

let link, node;

// Create a new transition
const trans = transition().duration(750).ease(easeLinear);

// The dimensions we'll use for our SVG
const dimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
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

const mainLayer = svg.append('g'); // Create a main layer

const linkGroup = mainLayer
  .append('g')
  .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`);

const nodeGroup = mainLayer
  .append('g')
  .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`);

link = createLink(linkGroup, linksData);
node = createNode(nodeGroup, nodesData);

// Create a new zoom
const svgZoom = zoom()
  .scaleExtent([0.5, 3]) // Allow zoom from x0.5 to x3
  .on('zoom', () => {
    mainLayer.attr('transform', event.transform); // Transform the main layer with the zoom / pan zettings
  });

svg.call(svgZoom); // Apply the zoom to the SVG node

const resize = debounce(() => { // On resize
  dimensions.width = window.innerWidth;
  dimensions.height = window.innerHeight; // Update width and height

  svg.attr('width', dimensions.width);
  svg.attr('height', dimensions.height); // Apply new width / height to SVG element

  linkGroup
    .transition()
    .duration(300)
    .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`); // Translate the nodes and links (with transition)
  nodeGroup
    .transition()
    .duration(300)
    .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`); // Translate the nodes and links (with transition)
}, 200);

select(window).on('resize', resize); // Bind the resize event to the window

/*
 Defines a 'force' (of type link) for us to use in the simulation.
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
    return 30; // Short distance between clusters nodes
  })
  .strength(.5);

/*
 Defines a 'force' (of type ManyBody)
 Takes a positive or negative integer as parameter
 Defines if the nodes are drawn to each other (positive number) or apart (negative number)
 */
const manyBodyForce = forceManyBody()
  .strength(-50)
  .distanceMax(250);

/*
 Defines a 'force' (of type collide)
 Takes a radius as arguments
 The nodes acts like they have the defined radius, and can't overlap.
 */
const collideForce = forceCollide(13);

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
