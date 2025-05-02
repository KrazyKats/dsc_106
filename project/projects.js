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

let selectedIndex = -1;

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
});

function renderPieChart(projectsGiven) {
  const newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const newData = newRolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  const newSliceGenerator = d3.pie().value(d => d.value);
  const newArcData = newSliceGenerator(newData);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  const newSVG = d3.select('#projects-pie-plot');
  newSVG.selectAll('*').remove();

  const legend = d3.select('.legend');
  legend.selectAll('*').remove();

  const group = newSVG.append('g');

  group.selectAll('path')
    .data(newArcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, i) => colors(i))
    .attr('class', (_, i) => selectedIndex === i ? 'selected' : '')
    .style('cursor', 'pointer')
    .on('click', function(_, i) {
      selectedIndex = selectedIndex === i ? -1 : i;

      // Update paths
      newSVG.selectAll('path')
        .attr('class', (_, idx) => selectedIndex === idx ? 'selected' : '');

      // Update legend
      legend.selectAll('li')
        .attr('class', (_, idx) => selectedIndex === idx ? 'legend-item selected' : 'legend-item');
    });

  legend.selectAll('li')
    .data(newData)
    .enter()
    .append('li')
    .attr('class', (d, i) => selectedIndex === i ? 'legend-item selected' : 'legend-item')
    .attr('style', (d, i) => `--color:${colors(i)}`)
    .html((d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .on('click', function(_, i) {
      selectedIndex = selectedIndex === i ? -1 : i;

      // Update paths
      newSVG.selectAll('path')
        .attr('class', (_, idx) => selectedIndex === idx ? 'selected' : '');

      // Update legend
      legend.selectAll('li')
        .attr('class', (_, idx) => selectedIndex === idx ? 'legend-item selected' : 'legend-item');
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
