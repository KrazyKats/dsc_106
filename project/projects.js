import { fetchJSON, renderProjects } from '../global.js';

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

const projects = await fetchJSON('../lib/projects.json');
renderProjects(projects, projectsContainer, 'h2');

// Step 1.6 - Count Projects
if (projectsTitle && Array.isArray(projects)) {
  projectsTitle.textContent = `Projects (${projects.length})`;
}


import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Updated labeled data
let data = [
  { value: 1, label: 'Apples' },
  { value: 2, label: 'Oranges' },
  { value: 3, label: 'Mangos' },
  { value: 4, label: 'Pears' },
  { value: 5, label: 'Limes' },
  { value: 5, label: 'Cherries' },
];

// Arc and slice generators
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie().value(d => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map(d => arcGenerator(d));

// Color scale
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Append arcs to SVG
arcs.forEach((arc, idx) => {
  d3.select('#projects-pie-plot')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(idx));
});

// Build legend
let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend.append('li')
    .attr('class', 'legend-item')
    .attr('style', `--color:${colors(idx)}`)
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});
