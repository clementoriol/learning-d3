import { select } from 'd3-selection';
import { interval } from 'd3-timer';
import { shuffle } from 'd3-array';

const alphabet = ['a', 'b', 'c']; // Our data

const dimensions = {
  height: 500,
  width: 960,
};

// Creating the svg element
const svg = select('body')
  .append('svg')
  .attr('width', dimensions.width)
  .attr('height', dimensions.height);

// Creating a container (group) for the letters
const letters = svg
  .append('g');

const update = (data) => {
  // Lost about update / enter / exit stuff ? Read https://bost.ocks.org/mike/join/)

  const text = letters.selectAll('text')
    .data(data, d => d); // Join data with selection. Returns a new selection containing the updated elements (UPDATE)
    // Note, the data takes a function as a second argument returning the value to use as id (defaults to (d, i) => i))

  text.attr('class', 'update'); // Set the updating element classname

  text
    .enter() // Returns the entering elements (ENTER)
    .append('text') // Appends them
    .attr('class', 'enter') // Set the entering element classname
    .attr('y', d => 50) // Set their y position
    .text(d => d)
    .merge(text) // merges the enter and update elements (ENTER + UPDATE)
    .attr('x', (d, i) => i * 32); // Set their x position

  text
    .exit()
    .remove(); // Remove exiting nodes (EXIT)
};

const randomData = () => shuffle(alphabet).slice(0, Math.ceil(Math.random() * alphabet.length)); // Generate random data

update(randomData()); // Draw once

interval(() => { // Re-draw with new data every 1500ms
  update(randomData());
}, 1500);
