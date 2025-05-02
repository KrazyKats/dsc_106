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

  const pie = d3.pie().value(d => d.value);
  const arcData = pie(newData);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  const svg = d3.select('#projects-pie-plot');
  svg.selectAll('*').remove();
  const group = svg.append('g');

  const legend = d3.select('.legend');
  legend.selectAll('*').remove();

  // Draw wedges using forEach
  const paths = [];
  arcData.forEach((arc, i) => {
    const path = group
      .append('path')
      .attr('d', arcGenerator(arc))
      .style('--color', colors(i))
      .attr('class', selectedIndex === i ? 'selected' : '')
      .style('cursor', 'pointer')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        // Update classes
        paths.forEach((p, idx) => {
          p.attr('class', selectedIndex === idx ? 'selected' : '');
        });

        legend.selectAll('li')
          .attr('class', (_, idx) => selectedIndex === idx ? 'legend-item selected' : 'legend-item');

        // Determine project list
        let filtered = projects;

        if (selectedIndex !== -1) {
          const selectedYear = newData[selectedIndex].label;
          filtered = filtered.filter(p => p.year === selectedYear);
        }

        if (query.trim() !== '') {
          filtered = filtered.filter(p => {
            const values = Object.values(p).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
          });
        }

        renderProjects(filtered, projectsContainer, 'h2');
      });

    paths.push(path);
  });

  // Draw legend using forEach
  newData.forEach((d, i) => {
    const item = legend
      .append('li')
      .attr('class', selectedIndex === i ? 'legend-item selected' : 'legend-item')
      .style('--color', colors(i))
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        // Update slices
        paths.forEach((p, idx) => {
          p.attr('class', selectedIndex === idx ? 'selected' : '');
        });

        // Update legend
        legend.selectAll('li')
          .attr('class', (_, idx) => selectedIndex === idx ? 'legend-item selected' : 'legend-item');
      });
  });
}


renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  // Reset selection
  selectedIndex = -1;

  // Filter by search query
  let filteredProjects = projects.filter(project => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  // Re-render
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects); // Pass filteredProjects to chart
});