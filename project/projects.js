import { fetchJSON, renderProjects } from '../global.js';

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

let query = '';
let projects = [];

// Initial load
d3.json('../lib/project.json').then((loadedProjects) => {
  projects = loadedProjects;
  renderProjects(projects, projectsContainer, 'h2');
  renderPieChart(projects);
});

// Step 1.6 - Count Projects
if (projectsTitle && Array.isArray(projects)) {
  projectsTitle.textContent = `Projects (${projects.length})`;
}

// DOM Elements
let searchInput = document.querySelector('.searchBar');
let svg = d3.select('#projects-pie-plot');
let legend = d3.select('.legend');

// Render pie chart
function renderPieChart(projectsGiven) {
  // Clear previous chart & legend
  svg.selectAll('path').remove();
  legend.selectAll('*').remove();

  // Group and map data
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  // Slice + arc
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Draw chart
  arcs.forEach((arc, idx) => {
    svg.append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
  });

  // Add legend
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Search handler
searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });
  renderProjects(filteredProjects);
  renderPieChart(filteredProjects);
});
