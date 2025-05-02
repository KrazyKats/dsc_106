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

d3.json('../lib/projects.json').then((projects) => {
  // 1. Group and convert data
  let rolledData = d3.rollups(projects, v => v.length, d => d.year);
  let data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  // 2. Slice + arc generation
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3.pie().value(d => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map(d => arcGenerator(d));

  // 3. Color palette
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // 4. Draw slices
  arcs.forEach((arc, idx) => {
    d3.select('#projects-pie-plot')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
  });

  // 5. Create legend
  let legend = d3.select('.legend');
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
});


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
  // Step 1: Group and convert data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );
  let newData = newRolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  // Step 2: Generate slices and arcs
  let newSliceGenerator = d3.pie().value(d => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let newArcs = newArcData.map(d => arcGenerator(d));

  // Step 3: Clear old paths and legends
  d3.select('#projects-pie-plot').selectAll('*').remove();
  d3.select('.legend').selectAll('*').remove();

  // Step 4: Draw new arcs
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let svg = d3.select('#projects-pie-plot');
  let group = svg.append('g')
    .attr('transform', `translate(75, 75)`); // center the pie in a 150x150 SVG

  newArcs.forEach((arc, idx) => {
    group.append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
  });

  // Step 5: Create new legend
  let legend = d3.select('.legend');
  newData.forEach((d, idx) => {
    legend.append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
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
