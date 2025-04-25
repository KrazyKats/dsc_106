import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

export function renderProjects(project, containerElement, headingLevel = 'h2') {
    // Validate headingLevel to ensure it's a valid heading tag
    const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (!validHeadingLevels.includes(headingLevel)) {
        console.warn(`Invalid heading level "${headingLevel}". Defaulting to "h2".`);
        headingLevel = 'h2';
    }

    containerElement.innerHTML = '';

    const article = document.createElement('article');

    article.innerHTML = `
        <${headingLevel}>${project.title}</${headingLevel}>
        <img src="${project.image}" alt="${project.title}">
        <p>${project.description}</p>
    `;

    containerElement.appendChild(article);
}

renderProjects(projects, projectsContainer, 'h2');