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

// Fetch and display GitHub stats
const profileStats = document.querySelector('#profile-stats');
if (profileStats) {
  const githubData = await fetchGitHubData('your-github-username'); // Replace with your GitHub username
  profileStats.innerHTML = `
    <h2>GitHub Profile Stats</h2>
    <dl class="stats-grid">
      <dt>Public Repos</dt><dd>${githubData.public_repos}</dd>
      <dt>Public Gists</dt><dd>${githubData.public_gists}</dd>
      <dt>Followers</dt><dd>${githubData.followers}</dd>
      <dt>Following</dt><dd>${githubData.following}</dd>
    </dl>
  `;
}