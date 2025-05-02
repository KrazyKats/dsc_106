import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Select DOM elements
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');
const svg = d3.select('#projects-pie-plot');
const legend = d3.select('.legend');

// Global variables
let projects = await fetchJSON('../lib/projects.json');
let query = '';

// Initial rendering
renderProjects(projects, projectsContainer, 'h2');
updateProjectsTitle(projects.length);
renderPieChart(projects);

// Utility Functions
function updateProjectsTitle(count) {
  if (projectsTitle) {
    projectsTitle.textContent = `Projects (${count})`;
  }
}

function filterProjects(query) {
  return projects.filter(project => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

// Pie Chart Rendering Function
function renderPieChart(projectsData) {
  // Clear previous chart and legend
  svg.selectAll('*').remove();
  legend.selectAll('*').remove();

  if (projectsData.length === 0) return; // Prevent drawing an empty chart

  // Group and process data
  const rolledData = d3.rollups(projectsData, v => v.length, d => d.year);
  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  // Set up generators and colors
  const radius = 50;
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);
  const pieGenerator = d3.pie().value(d => d.value);
  const arcs = pieGenerator(data);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Draw pie slices
  svg
    .selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, i) => colors(i))
    .attr('transform', `translate(${radius}, ${radius})`);

  // Draw legend
  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Event handler for search input
searchInput.addEventListener('input', event => {
  query = event.target.value;
  const filteredProjects = filterProjects(query);

  renderProjects(filteredProjects, projectsContainer, 'h2');
  updateProjectsTitle(filteredProjects.length);
  renderPieChart(filteredProjects);
});

// Project Management Module
if (projectsTitle && Array.isArray(projects)) {
  projectsTitle.textContent = `Projects (${projects.length})`;
}