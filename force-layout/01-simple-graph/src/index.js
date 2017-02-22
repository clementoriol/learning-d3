import { select } from 'd3-selection';
import { forceSimulation, forceLink } from 'd3-force';

// The dimensions we'll use for our SVG
const dimensions = {
  width: 640,
  height: 480,
};

// Hardcoded nodes. Later on the X / Y values won't be hardcoded, but derived from the data
// This nodes array are the nodes displayed in our graph
const nodesData = [
  { x: dimensions.width / 3, y: dimensions.height / 2 },
  { x: 2 * dimensions.width / 3, y: dimensions.height / 2 },
];

// The links indicates how our nodes are linked together.
// here we have on link, between the node of index 0 and index 1.
// We're using indexes for now, but it's possible to use ids :
// (https://github.com/d3/d3-force#link_id)
const linksData = [
  { source: 0, target: 1 }
];

// Creates the SVG element, with the proper width / height and appends it to <body>
const createSVG = () => {
  return select('body')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);
};

// Create our links from the data, and appends it to container
// Note: on invocation, nothing is visible yet. Links dont have coordinates yet.
const createLink = (container, data) => {
  return container.selectAll('.link')
    .data(data)
    .enter()
    .append('line')
    .attr('class', 'link');
};

// Updates
const updateLink = (link) => {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
};

// Create our notes from the data, and appends it to container
// Note: on invocation, nothing is visible yet. Nodes dont have width and coordinates yet.
const createNode = (container, data) => {
  return container.selectAll('.node')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'node');
};

const updateNode = (node) => {
  node
    .attr('r', dimensions.width / 25)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);
};

const svg = createSVG();
const link = createLink(svg, linksData);
const node = createNode(svg, nodesData);

/*
 Defines a "force" (of type link) for us to use in the simulation.
 The link force pushes linked nodes together or apart according to the desired link distance.
 The strength of the force is proportional to the difference between the linked nodes’ distance and the target distance,
 similar to a spring force.
 */
const linkForce = forceLink(linksData)
  .distance(() => 100); // Pass it a distance (the distance between the nodes)

const simulation = forceSimulation(nodesData) // Create a new simulation. NOTE : the simulation is immediately run
  .force('link', linkForce) // Pass it forces, here our linkForce.
  .on('end', () => { // On end, update the links and node params
    updateLink(link);
    updateNode(node);
  });
