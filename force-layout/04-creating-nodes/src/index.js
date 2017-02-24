import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceCollide, forceManyBody } from 'd3-force';
import { hierarchy } from 'd3-hierarchy';
import data from './data';
import { flatten } from './utils';

let rootData = hierarchy(data); // constructs a root node using d3 hierarchy (https://github.com/d3/d3-hierarchy)
let nodesData = flatten(rootData); // Flatten the rood node to make the nodes
let linksData = rootData.links(); // Extract links from the root node

let link, node;

// The dimensions we'll use for our SVG
const dimensions = {
  width: 640,
  height: 480,
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

const restartSimulation = (simulation, newData) => {
  // Update data
  if (newData) {
    rootData = hierarchy(newData);
    nodesData = flatten(rootData);
    linksData = rootData.links();
  }

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
    .merge(node);

  // Restart simulation
  simulation.nodes(nodesData);
  simulation.force('link').links(linksData); // Set the link force to the new links
  simulation.alpha(.5).restart();
};

const svg = select('body')
  .append('svg')
  .attr('width', dimensions.width)
  .attr('height', dimensions.height);

const linkGroup = svg // Create a group to contain links.
  .append('g')
  .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`); // Center it

const nodeGroup = svg // Create a group to contain nodes.
  .append('g')
  .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`); // Center it

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
  .distance(30);

/*
  Defines a "force" (of type ManyBody)
  Takes a positive or negative integer as parameter
  Defines if the nodes are drawn to each other (positive number) or apart (negative number)
 */
const manyBodyForce = forceManyBody()
  .strength(-500);

/*
 Defines a "force" (of type collide)
 Takes a radius as arguments
 The nodes acts like they have the defined radius, and can't overlap.
 */
const collideForce = forceCollide(20);

const simulation = forceSimulation(nodesData) // Create a new simulation. NOTE : the simulation is immediately run
  .force('link', linkForce) // Pass it forces
  .force('charge', manyBodyForce)
  .force('collide', collideForce)
  .on('tick', () => { // On tick (on every frame), update the links and node params
    updateLink();
    updateNode();
  });

restartSimulation(simulation);

setTimeout(() => {
  const newData = {
    id: 1,
    children: [
      {
        id: 2,
        children: [],
      },
      {
        id: 3,
        children: []
      },
    ],
  };
  restartSimulation(simulation, newData);
}, 2000);

setTimeout(() => {
  const newData = {
    id: 1,
    children: [
      {
        id: 2,
        children: [
          {
            id: 4,
            children: []
          }
        ],
      },
      {
        id: 3,
        children: []
      },
    ],
  };
  restartSimulation(simulation, newData);
}, 4000);

setTimeout(() => {
  const newData = {
    id: 1,
    children: [
      {
        id: 2,
        children: [
          {
            id: 4,
            children: [
              {
                id: 5,
                children: []
              },
              {
                id: 6,
                children: []
              },
              {
                id: 7,
                children: []
              },
            ]
          }
        ],
      },
      {
        id: 3,
        children: []
      },
    ],
  };
  restartSimulation(simulation, newData);
}, 6000);
