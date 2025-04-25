import { fetchJSON, renderProjects } from './global.js';

const projectsContainer = document.querySelector('.projects');

if (projectsContainer) {
  const projects = await fetchJSON('./lib/projects.json');
  const latestProjects = projects.slice(0, 3); // get first 3
  renderProjects(latestProjects, projectsContainer, 'h2');
}

if (!projectsContainer) {
    console.warn('Projects container not found in the DOM.');
  } else {
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3);
    renderProjects(latestProjects, projectsContainer, 'h2');
  }