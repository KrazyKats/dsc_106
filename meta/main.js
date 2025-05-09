import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Load and parse CSV
async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

// Process commits from data
function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/KrazyKats/dsc_106/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: false,
        writable: false,
        enumerable: false, // Makes it hidden when logging
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const numFiles = d3.groups(data, d => d.file).length;
  const fileLengths = d3.rollups(data, v => d3.max(v, d => d.line), d => d.file);
  const maxFile = d3.greatest(fileLengths, d => d[1]);
  const avgFileLength = d3.mean(fileLengths, d => d[1]);
  const maxDepth = d3.max(data, d => d.depth);
  const deepestLine = data.find(d => d.depth === maxDepth);

  const stats = document.getElementById('stats');

  stats.innerHTML = `
    <h2>Codebase Summary Stats</h2>
    <dl class="stats-grid">
      <dt>Total <abbr title="Lines of Code">LOC</abbr></dt><dd>${data.length}</dd>
      <dt>Total Commits</dt><dd>${commits.length}</dd>
      <dt>Number of Files</dt><dd>${numFiles}</dd>
      <dt>Longest File</dt><dd>${maxFile[0]} (${maxFile[1]} lines)</dd>
      <dt>Average File Length</dt><dd>${avgFileLength.toFixed(2)}</dd>
      <dt>Deepest Line</dt><dd>${deepestLine.file} (Depth: ${maxDepth})</dd>
    </dl>
  `;
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.datetime?.toLocaleString('en', {
    timeStyle: 'short',
  });
  author.textContent = commit.author;
  document.getElementById('commit-lines').textContent = commit.totalLines;

}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type,
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}

function brushed(event) {
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', (d) =>
    isCommitSelected(selection, d),
  );
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function isCommitSelected(selection, commit) {
  if (!selection) {
    return false;
  }

  const [[x0, y0], [x1, y1]] = selection; // Destructure the brush selection bounds
  const circle = d3.select(`circle[data-id="${commit.id}"]`);
  if (circle.empty()) {
    return false; // No matching circle found
  }

  const cx = +circle.attr('cx'); // Convert to number
  const cy = +circle.attr('cy'); // Convert to number

  // Check if the commit's coordinates are within the selection bounds
  return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
}

function createBrushSelector(svg) {
  // Append a <g> element for the brush
  const brushGroup = svg.append('g').attr('class', 'brush');

  // Initialize the brush and attach event listeners
  brushGroup.call(d3.brush().on('start brush end', brushed));
}


function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 40 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Add hourFrac to each commit for plotting
  commits.forEach((d) => {
    const date = new Date(d.datetime);
    d.hourFrac = date.getHours() + date.getMinutes() / 60;
  });

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  // Sort commits by lines edited (largest first)
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  // Get the min and max total lines edited
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

  // Scale for dot radius based on lines edited
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);


  // Gridlines
  svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickSize(-usableArea.width).tickFormat(''));

  // Dots
  const dots = svg.append('g').attr('class', 'dots');
  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('data-id', (d) => d.id)
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', (d) => {
      const hour = d.hourFrac;
      return d3.interpolateCool(1 - hour / 24); // bluer at night, warmer in day
    })
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', updateTooltipPosition)
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });


    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .call(xAxis);

    // Add Y axis
    svg
      .append('g')
      .attr('transform', `translate(${usableArea.left}, 0)`)
      .call(yAxis);

    createBrushSelector(svg);

    svg.selectAll('.dots, .overlay ~ *').raise();



}





// Run everything
let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits);
renderScatterPlot(data, commits);       // This line must be here

