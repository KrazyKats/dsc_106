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

// Sample data
let data = [1, 2, 3, 4, 5, 5];

// Create arc generator
let arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

// Create pie slice generator
let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);

// Generate paths
let arcs = arcData.map(d => arcGenerator(d));

// Set up color scale using D3's built-in color palette
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Append paths to the SVG
arcs.forEach((arc, idx) => {
  d3.select('#projects-pie-plot')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(idx));
});
