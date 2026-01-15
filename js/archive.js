// Time Machine Archive Functionality
let versions = [];
let currentVersionIndex = 0;

// DOM Elements
const slider = document.getElementById('timeline-slider');
const currentDateEl = document.getElementById('current-date');
const versionTitleEl = document.getElementById('version-title');
const timelineLabelsEl = document.getElementById('timeline-labels');
const versionPreview = document.getElementById('version-preview');
const returnBtn = document.getElementById('return-btn');

// Load versions from JSON
async function loadVersions() {
  try {
    const response = await fetch('archive/versions.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    versions = await response.json();

    // Add "Current" version at the end
    versions.push({
      date: 'Current',
      title: 'Latest Version',
      description: 'The current live version of the website',
      file: 'index.html',
      interactive: true
    });

    initializeTimeline();

    // Start at the latest version (current)
    currentVersionIndex = versions.length - 1;
    updateVersion(currentVersionIndex);
  } catch (error) {
    console.error('Error loading versions:', error);
    currentDateEl.textContent = 'Error loading archive';
  }
}

// Initialize timeline UI
function initializeTimeline() {
  // Set slider range
  slider.max = versions.length - 1;
  slider.value = versions.length - 1;

  // Create timeline labels
  timelineLabelsEl.innerHTML = '';
  versions.forEach((version, index) => {
    const label = document.createElement('span');
    label.className = 'timeline-label';
    label.textContent = version.date;
    label.addEventListener('click', () => {
      currentVersionIndex = index;
      slider.value = index;
      updateVersion(index);
    });
    timelineLabelsEl.appendChild(label);
  });
}

// Update displayed version
function updateVersion(index) {
  const version = versions[index];

  // Update info display
  currentDateEl.textContent = version.date;
  versionTitleEl.textContent = version.title;

  // Update active label
  const labels = timelineLabelsEl.querySelectorAll('.timeline-label');
  labels.forEach((label, i) => {
    label.classList.toggle('active', i === index);
  });

  // Load version in iframe
  loadVersionPreview(version);
}

// Load version in preview iframe
function loadVersionPreview(version) {
  versionPreview.classList.remove('loaded');

  // Construct the correct path
  let path = version.file;
  if (version.date !== 'Current' && !version.file.startsWith('archive/')) {
    path = 'archive/' + version.file;
  }

  versionPreview.src = path;

  // Fade in when loaded
  versionPreview.onload = () => {
    setTimeout(() => {
      versionPreview.classList.add('loaded');
    }, 100);
  };
}

// Event Listeners
slider.addEventListener('input', (e) => {
  currentVersionIndex = parseInt(e.target.value);
  updateVersion(currentVersionIndex);
});

returnBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      if (currentVersionIndex > 0) {
        currentVersionIndex--;
        slider.value = currentVersionIndex;
        updateVersion(currentVersionIndex);
      }
      break;

    case 'ArrowRight':
      e.preventDefault();
      if (currentVersionIndex < versions.length - 1) {
        currentVersionIndex++;
        slider.value = currentVersionIndex;
        updateVersion(currentVersionIndex);
      }
      break;

    case 'Escape':
      e.preventDefault();
      window.location.href = 'index.html';
      break;
  }
});

// Initialize on load
loadVersions();
