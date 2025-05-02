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


let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
});

function renderPieChart(projectsGiven) {
  // Step 1: Roll up the data
  const newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const newData = newRolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  // Step 2: Set up D3 pie layout and arc generator
  const newSliceGenerator = d3.pie().value(d => d.value);
  const newArcData = newSliceGenerator(newData);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Step 3: Clean up old SVG paths and legend items
  const newSVG = d3.select('#projects-pie-plot');
  newSVG.selectAll('*').remove(); // more complete cleanup than just paths

  const legend = d3.select('.legend');
  legend.selectAll('*').remove();

  // Step 4: Draw new paths
  const group = newSVG.append('g')
    .attr('transform', 'translate(75, 75)'); // center in 150x150 SVG

  group.selectAll('path')
    .data(newArcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, i) => colors(i));

  // Step 5: Draw updated legend
  legend.selectAll('li')
    .data(newData)
    .enter()
    .append('li')
    .attr('class', 'legend-item')
    .attr('style', (d, i) => `--color:${colors(i)}`)
    .html((d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  let query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});
