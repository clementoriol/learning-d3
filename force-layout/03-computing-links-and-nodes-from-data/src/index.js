import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceCenter, forceCollide, forceManyBody } from 'd3-force';
import { hierarchy } from 'd3-hierarchy';
import data from './data';
import { flatten } from './utils';

const rootData = hierarchy(data); // constructs a root node using d3 hierarchy (https://github.com/d3/d3-hierarchy)
const nodesData = flatten(rootData); // Flatten the rood node to make the nodes
const linksData = rootData.links(); // Extract links from the root node

/*
  The nodesData is an array of nodes :
  [
    { <- [Node]
      data: {
        id: 4,
        name: 'Martin',
        children: [],
      },
      depth: 3,
      height: 0,
      parent: [Node],
      id: 1,
    },
    ...
  ]
*/

/*
  The linksData is an array of links :
  [
    {
      source: [Node],
      target: [Node],
    },
    ...
  ]
*/

// The dimensions we'll use for our SVG
const dimensions = {
  width: 640,
  height: 480,
};

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
    .attr('r', 10)
    .attr('cx', d => {
      return d.x
    })
    .attr('cy', d => {
      return d.y
    });
}

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
  .id(d => d.id) // Specify the node key used as an id
  .distance(() => 50); // Pass it a distance (the distance between the nodes)

/*
  Defines a "force" (of type center)
  Takes x and y coordinates as arguments
  Defines where the nodes are pulled to.
 */
const centerForce = forceCenter(dimensions.width / 2, dimensions.height / 2);

/*
 Defines a "force" (of type collide)
 Takes a radius as arguments
 The nodes acts like they have the defined radius, and can't overlap.
 */
const collideForce = forceCollide(50);

const simulation = forceSimulation(nodesData) // Create a new simulation. NOTE : the simulation is immediately run
  .force('link', linkForce) // Pass it forces
  .force('center', centerForce)
  .force('collide', collideForce)
  .force('charge', forceManyBody())
  .on('tick', () => { // On tick (on every frame), update the links and node params
    updateLink(link);
    updateNode(node);
  });

