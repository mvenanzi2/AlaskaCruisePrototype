const STORAGE_KEY = 'engineer_shift_planner_v1';

const DEFAULT_DATA = {
  engineers: [
    {
      id: 'eng-alice',
      name: 'Alice Johnson',
      role: 'Frontend Engineer',
      skills: ['React', 'TypeScript', 'Design Systems'],
      capacity: 40,
    },
    {
      id: 'eng-marcus',
      name: 'Marcus Chen',
      role: 'Data Engineer',
      skills: ['Python', 'Dagster', 'BigQuery'],
      capacity: 38,
    },
    {
      id: 'eng-priya',
      name: 'Priya Patel',
      role: 'Backend Engineer',
      skills: ['Go', 'gRPC', 'Kubernetes'],
      capacity: 42,
    },
    {
      id: 'eng-lucas',
      name: 'Lucas Fernández',
      role: 'QA Automation',
      skills: ['Cypress', 'Playwright', 'CI/CD'],
      capacity: 36,
    },
  ],
  projects: [
    {
      id: 'proj-atlas',
      name: 'Atlas Refactor',
      client: 'Core Platform',
      startDate: '2025-10-06',
      endDate: '2025-12-19',
    },
    {
      id: 'proj-signal',
      name: 'Signal Insight',
      client: 'Data Science',
      startDate: '2025-09-29',
      endDate: '2025-11-28',
    },
    {
      id: 'proj-mercury',
      name: 'Mercury Launchpad',
      client: 'Growth',
      startDate: '2025-10-13',
      endDate: '2026-01-23',
    },
  ],
  assignments: [
    {
      id: 'asg-001',
      engineerId: 'eng-alice',
      projectId: 'proj-atlas',
      date: '2025-11-03',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Remote',
      status: 'Confirmed',
      notes: 'Sprint planning + UI audit',
    },
    {
      id: 'asg-002',
      engineerId: 'eng-priya',
      projectId: 'proj-atlas',
      date: '2025-11-04',
      startTime: '10:00',
      endTime: '18:00',
      location: 'HQ - 4F',
      status: 'Tentative',
      notes: 'API contract workshop',
    },
    {
      id: 'asg-003',
      engineerId: 'eng-marcus',
      projectId: 'proj-signal',
      date: '2025-11-05',
      startTime: '08:30',
      endTime: '16:30',
      location: 'Remote',
      status: 'Confirmed',
      notes: 'Pipeline deployment',
    },
    {
      id: 'asg-004',
      engineerId: 'eng-lucas',
      projectId: 'proj-mercury',
      date: '2025-11-06',
      startTime: '11:00',
      endTime: '19:00',
      location: 'Remote',
      status: 'Confirmed',
      notes: 'Regression suite run',
    },
    {
      id: 'asg-005',
      engineerId: 'eng-alice',
      projectId: 'proj-mercury',
      date: '2025-11-07',
      startTime: '09:30',
      endTime: '15:30',
      location: 'HQ - 5F',
      status: 'On Hold',
      notes: 'Marketing launch storyboard',
    },
  ],
};

const STATUS_STYLES = {
  Confirmed: {
    label: 'Confirmed',
    color: 'rgba(52, 211, 153, 0.35)',
    accent: 'rgba(52, 211, 153, 0.75)',
  },
  Tentative: {
    label: 'Tentative',
    color: 'rgba(251, 191, 36, 0.35)',
    accent: 'rgba(251, 191, 36, 0.75)',
  },
  'On Hold': {
    label: 'On Hold',
    color: 'rgba(248, 113, 113, 0.35)',
    accent: 'rgba(248, 113, 113, 0.75)',
  },
};

const state = {
  data: loadData(),
  selectedEngineerId: null,
  engineerWeeks: 4,
  dashboardWeek: getCurrentWeekId(),
  plannerWeek: getCurrentWeekId(),
};

const ui = {
  viewToggleButtons: document.querySelectorAll('.view-toggle__btn'),
  dashboardWeekInput: document.getElementById('dashboard-week'),
  dashboardMetrics: document.getElementById('dashboard-metrics'),
  upcomingShifts: document.getElementById('upcoming-shifts'),
  projectBurndown: document.getElementById('project-burndown'),
  utilizationHeatmap: document.getElementById('utilization-heatmap'),
  engineerView: document.getElementById('engineer-view'),
  plannerView: document.getElementById('planner-view'),
  engineerSelect: document.getElementById('engineer-select'),
  engineerWeeksSelect: document.getElementById('engineer-weeks'),
  engineerSchedule: document.getElementById('engineer-schedule'),
  engineerWeeklyTotals: document.getElementById('engineer-weekly-totals'),
  engineerAssignments: document.getElementById('engineer-assignments'),
  plannerWeekInput: document.getElementById('planner-week'),
  plannerScheduleBody: document.getElementById('planner-schedule-body'),
  plannerUtilization: document.getElementById('planner-utilization'),
  statusLegend: document.getElementById('status-legend'),
  addEngineerForm: document.getElementById('add-engineer-form'),
  addProjectForm: document.getElementById('add-project-form'),
  addAssignmentForm: document.getElementById('add-assignment-form'),
  resetDataButton: document.getElementById('reset-data'),
  exportButton: document.getElementById('export-data'),
  exportModal: document.getElementById('export-modal'),
  exportOutput: document.getElementById('export-output'),
  copyExportButton: document.getElementById('copy-export'),
  assignmentRowTemplate: document.getElementById('assignment-row-template'),
};

initialize();

function initialize() {
  if (!state.selectedEngineerId) {
    state.selectedEngineerId = state.data.engineers[0]?.id ?? null;
  }

  ui.dashboardWeekInput.value = state.dashboardWeek;
  ui.plannerWeekInput.value = state.plannerWeek;

  bindEventListeners();
  populateSelects();
  renderStatusLegend();
  renderDashboard();
  renderEngineerPortal();
  renderPlannerWorkspace();
}

function bindEventListeners() {
  ui.viewToggleButtons.forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.target));
  });

  ui.dashboardWeekInput.addEventListener('change', (event) => {
    state.dashboardWeek = event.target.value || getCurrentWeekId();
    renderDashboard();
  });

  ui.engineerSelect.addEventListener('change', (event) => {
    state.selectedEngineerId = event.target.value;
    renderEngineerPortal();
  });

  ui.engineerWeeksSelect.addEventListener('change', (event) => {
    state.engineerWeeks = Number(event.target.value);
    renderEngineerPortal();
  });

  ui.plannerWeekInput.addEventListener('change', (event) => {
    state.plannerWeek = event.target.value || getCurrentWeekId();
    renderPlannerWorkspace();
  });

  ui.addEngineerForm.addEventListener('submit', handleAddEngineer);
  ui.addProjectForm.addEventListener('submit', handleAddProject);
  ui.addAssignmentForm.addEventListener('submit', handleAddAssignment);

  ui.resetDataButton.addEventListener('click', handleResetData);
  ui.exportButton.addEventListener('click', handleExport);

  ui.copyExportButton.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(ui.exportOutput.value);
      ui.copyExportButton.textContent = 'Copied!';
      setTimeout(() => {
        ui.copyExportButton.textContent = 'Copy';
      }, 1600);
    } catch (error) {
      console.error('Clipboard error', error);
    }
  });

  ui.exportModal?.addEventListener('close', () => {
    ui.copyExportButton.textContent = 'Copy';
  });
}

function switchView(targetId) {
  ui.viewToggleButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === targetId);
  });

  const isEngineerView = targetId === 'engineer-view';
  ui.engineerView.classList.toggle('hidden', !isEngineerView);
  ui.plannerView.classList.toggle('hidden', isEngineerView);
}

function handleAddEngineer(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const engineer = {
    id: generateId('eng'),
    name: formData.get('name').trim(),
    role: formData.get('role').trim(),
    skills: formData
      .get('skills')
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean),
    capacity: Number(formData.get('capacity')) || 40,
  };

  if (!engineer.name) {
    return;
  }

  state.data.engineers.push(engineer);
  saveData();
  event.target.reset();
  populateSelects();
  if (!state.selectedEngineerId) {
    state.selectedEngineerId = engineer.id;
  }
  renderDashboard();
  renderEngineerPortal();
  renderPlannerWorkspace();
}

function handleAddProject(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const project = {
    id: generateId('proj'),
    name: formData.get('name').trim(),
    client: formData.get('client').trim(),
    startDate: formData.get('start'),
    endDate: formData.get('end'),
  };

  if (!project.name || !project.startDate || !project.endDate) {
    return;
  }

  state.data.projects.push(project);
  saveData();
  event.target.reset();
  populateSelects();
  renderDashboard();
  renderPlannerWorkspace();
}

function handleAddAssignment(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const assignment = {
    id: generateId('asg'),
    projectId: formData.get('project'),
    engineerId: formData.get('engineer'),
    date: formData.get('date'),
    startTime: formData.get('start'),
    endTime: formData.get('end'),
    location: formData.get('location').trim(),
    status: formData.get('status'),
    notes: formData.get('notes').trim(),
  };

  if (!assignment.projectId || !assignment.engineerId || !assignment.date) {
    return;
  }

  state.data.assignments.push(assignment);
  saveData();
  event.target.reset();
  renderDashboard();
  renderEngineerPortal();
  renderPlannerWorkspace();
}

function handleResetData() {
  const confirmReset = window.confirm(
    'Resetting will replace your current schedule with demo data. Continue?'
  );
  if (!confirmReset) {
    return;
  }

  state.data = deepCopy(DEFAULT_DATA);
  state.selectedEngineerId = state.data.engineers[0]?.id ?? null;
  state.dashboardWeek = getCurrentWeekId();
  state.plannerWeek = getCurrentWeekId();
  saveData();
  populateSelects();
  ui.dashboardWeekInput.value = state.dashboardWeek;
  ui.plannerWeekInput.value = state.plannerWeek;
  renderDashboard();
  renderEngineerPortal();
  renderPlannerWorkspace();
}

function handleExport() {
  const exportPayload = {
    generatedAt: new Date().toISOString(),
    ...state.data,
  };

  ui.exportOutput.value = JSON.stringify(exportPayload, null, 2);
  if (typeof ui.exportModal.showModal === 'function') {
    ui.exportModal.showModal();
  } else {
    window.alert('Export dialog not supported in this browser. Copy from console.');
    console.log('Shift Planner Export', exportPayload);
  }
}

function populateSelects() {
  populateEngineerSelect();
  populateAssignmentSelects();
}

function populateEngineerSelect() {
  const fragment = document.createDocumentFragment();
  state.data.engineers.forEach((engineer) => {
    const option = document.createElement('option');
    option.value = engineer.id;
    option.textContent = engineer.name;
    fragment.appendChild(option);
  });

  ui.engineerSelect.innerHTML = '';
  ui.engineerSelect.appendChild(fragment);

  if (state.selectedEngineerId) {
    ui.engineerSelect.value = state.selectedEngineerId;
  }
}

function populateAssignmentSelects() {
  const projectSelect = ui.addAssignmentForm.querySelector("select[name='project']");
  const engineerSelect = ui.addAssignmentForm.querySelector("select[name='engineer']");

  projectSelect.innerHTML = '';
  engineerSelect.innerHTML = '';

  state.data.projects
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((project) => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.name;
      projectSelect.appendChild(option);
    });

  state.data.engineers
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((engineer) => {
      const option = document.createElement('option');
      option.value = engineer.id;
      option.textContent = engineer.name;
      engineerSelect.appendChild(option);
    });
}

function renderStatusLegend() {
  ui.statusLegend.innerHTML = '';
  Object.entries(STATUS_STYLES).forEach(([status, styles]) => {
    const item = document.createElement('span');
    item.className = 'legend__item';
    item.innerHTML = `
      <span class="legend__swatch" style="background:${styles.color}; box-shadow:0 0 0 1px ${styles.accent}"></span>
      ${status}
    `;
    ui.statusLegend.appendChild(item);
  });
}

function renderDashboard() {
  renderDashboardMetrics();
  renderUpcomingShifts();
  renderProjectBurndown();
  renderUtilizationHeatmap();
}

function renderDashboardMetrics() {
  const { engineers, projects } = state.data;
  const assignments = getAssignmentsForWeek(state.dashboardWeek);
  const totalHours = assignments.reduce((acc, assignment) => acc + getAssignmentHours(assignment), 0);
  const totalCapacity = engineers.reduce((acc, eng) => acc + eng.capacity, 0);
  const utilization = totalCapacity ? Math.round((totalHours / totalCapacity) * 100) : 0;

  const metrics = [
    {
      label: 'Engineers Scheduled',
      value: new Set(assignments.map((a) => a.engineerId)).size || 0,
      trend: `${assignments.length} shifts this week`,
    },
    {
      label: 'Active Projects',
      value: projects.filter(isProjectActive).length,
      trend: `${projects.length} total projects`,
    },
    {
      label: 'Hours Allocated',
      value: totalHours.toFixed(1),
      trend: `${utilization}% of team capacity`,
    },
  ];

  ui.dashboardMetrics.innerHTML = '';
  metrics.forEach((metric) => {
    const card = document.createElement('article');
    card.className = 'metric-card';
    card.innerHTML = `
      <span class="metric-card__label">${metric.label}</span>
      <strong class="metric-card__value">${metric.value}</strong>
      <span class="metric-card__trend">${metric.trend}</span>
    `;
    ui.dashboardMetrics.appendChild(card);
  });
}

function renderUpcomingShifts() {
  const upcoming = state.data.assignments
    .slice()
    .filter((assignment) => isUpcoming(assignment.date))
    .sort((a, b) => {
      if (a.date === b.date) {
        return a.startTime.localeCompare(b.startTime);
      }
      return a.date.localeCompare(b.date);
    })
    .slice(0, 6);

  ui.upcomingShifts.innerHTML = '';

  if (!upcoming.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No upcoming shifts scheduled.';
    empty.className = 'shift-feed__empty';
    ui.upcomingShifts.appendChild(empty);
    return;
  }

  upcoming.forEach((assignment) => {
    const engineer = getEngineerById(assignment.engineerId);
    const project = getProjectById(assignment.projectId);
    const item = document.createElement('li');
    item.innerHTML = `
      <div class="shift-feed__meta">
        <span>${formatDate(assignment.date)} · ${formatTimeRange(assignment)}</span>
        <span>${assignment.location || 'Location TBA'}</span>
      </div>
      <div><strong>${project?.name ?? 'Unknown project'}</strong></div>
      <div class="shift-feed__meta">
        <span>${engineer?.name ?? 'Unassigned'}</span>
        <span class="tag">${assignment.status}</span>
      </div>
    `;
    ui.upcomingShifts.appendChild(item);
  });
}

function renderProjectBurndown() {
  const today = new Date();
  ui.projectBurndown.innerHTML = '';

  if (!state.data.projects.length) {
    ui.projectBurndown.textContent = 'Create a project to see burndown progress.';
    return;
  }

  state.data.projects
    .slice()
    .sort((a, b) => a.endDate.localeCompare(b.endDate))
    .forEach((project) => {
      const total = daysBetween(project.startDate, project.endDate) || 1;
      const elapsed = clamp(
        daysBetween(project.startDate, today.toISOString().slice(0, 10)),
        0,
        total
      );
      const percent = Math.round((elapsed / total) * 100);
      const element = document.createElement('div');
      element.className = 'progress-row';
      element.innerHTML = `
        <div class="progress-row__header">
          <strong>${project.name}</strong>
          <span>${formatDate(project.startDate)} → ${formatDate(project.endDate)}</span>
        </div>
        <div class="progress">
          <div class="progress__bar" style="width:${percent}%"></div>
        </div>
        <div class="progress-row__footer">${percent}% of timeline elapsed</div>
      `;
      ui.projectBurndown.appendChild(element);
    });
}

function renderUtilizationHeatmap() {
  const weekAssignments = getAssignmentsForWeek(state.dashboardWeek);
  const weekStart = getWeekStartDate(state.dashboardWeek);
  const heatmap = document.createElement('div');
  heatmap.className = 'heatmap__grid';

  const headerRow = document.createElement('div');
  headerRow.className = 'heatmap__row heatmap__row--header';
  headerRow.innerHTML = `<span>Engineer</span>${createWeekdayHeaders(weekStart)
    .map((day) => `<span>${day}</span>`)
    .join('')}`;
  heatmap.appendChild(headerRow);

  state.data.engineers.forEach((engineer) => {
    const row = document.createElement('div');
    row.className = 'heatmap__row';
    const dailyHours = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      return weekAssignments
        .filter(
          (assignment) =>
            assignment.engineerId === engineer.id && assignment.date === date.toISOString().slice(0, 10)
        )
        .reduce((acc, assignment) => acc + getAssignmentHours(assignment), 0);
    });

    row.innerHTML = `
      <span class="heatmap__label">${engineer.name}</span>
      ${dailyHours
        .map((hours) => {
          const intensity = Math.min(1, hours / (engineer.capacity / 5 || 1));
          return `<span class="heatmap__cell" data-hours="${hours.toFixed(1)}" style="--intensity:${intensity}">${hours ? hours.toFixed(1) : ''}</span>`;
        })
        .join('')}
    `;
    heatmap.appendChild(row);
  });

  ui.utilizationHeatmap.innerHTML = '';
  ui.utilizationHeatmap.appendChild(heatmap);
}

function renderEngineerPortal() {
  if (!state.selectedEngineerId) {
    ui.engineerSchedule.innerHTML = '<p>Select an engineer to view schedule.</p>';
    return;
  }

  const engineer = getEngineerById(state.selectedEngineerId);
  const weeksAhead = state.engineerWeeks;
  const horizonEnd = addDays(new Date(), weeksAhead * 7 - 1);

  const assignments = state.data.assignments
    .filter((assignment) => assignment.engineerId === engineer.id)
    .filter((assignment) => {
      const assignmentDate = new Date(`${assignment.date}T00:00:00`);
      const today = stripTime(new Date());
      return assignmentDate >= today && assignmentDate <= horizonEnd;
    })
    .sort((a, b) => {
      if (a.date === b.date) {
        return a.startTime.localeCompare(b.startTime);
      }
      return a.date.localeCompare(b.date);
    });

  renderEngineerTimeline(assignments);
  renderEngineerWeeklyTotals(assignments, engineer);
  renderEngineerAssignmentsList(assignments, engineer);
}

function renderEngineerTimeline(assignments) {
  ui.engineerSchedule.innerHTML = '';

  if (!assignments.length) {
    ui.engineerSchedule.innerHTML = '<p>No scheduled shifts in the selected window.</p>';
    return;
  }

  assignments.forEach((assignment) => {
    const project = getProjectById(assignment.projectId);
    const item = document.createElement('article');
    item.className = 'timeline__item';
    item.innerHTML = `
      <div class="timeline__header">
        <span class="timeline__date">${formatDate(assignment.date)}</span>
        <span class="timeline__badge">${assignment.status}</span>
      </div>
      <div class="timeline__project">${project?.name ?? 'Project TBD'}</div>
      <div class="timeline__meta">
        ${formatTimeRange(assignment)} · ${assignment.location || 'Location TBA'}
      </div>
      ${assignment.notes ? `<div class="timeline__notes">${assignment.notes}</div>` : ''}
    `;
    ui.engineerSchedule.appendChild(item);
  });
}

function renderEngineerWeeklyTotals(assignments, engineer) {
  ui.engineerWeeklyTotals.innerHTML = '';
  if (!assignments.length) {
    ui.engineerWeeklyTotals.innerHTML = '<p>No hours scheduled.</p>';
    return;
  }

  const totals = new Map();
  assignments.forEach((assignment) => {
    const weekKey = getWeekIdFromDate(assignment.date);
    totals.set(weekKey, (totals.get(weekKey) || 0) + getAssignmentHours(assignment));
  });

  Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([weekId, hours]) => {
      const row = document.createElement('div');
      row.className = 'weekly-totals__row';
      const pct = engineer.capacity ? Math.round((hours / engineer.capacity) * 100) : 0;
      row.innerHTML = `
        <span class="weekly-totals__label">Week ${weekId.split('-W')[1]}</span>
        <span class="weekly-totals__value">${hours.toFixed(1)} hrs (${pct}%)</span>
      `;
      ui.engineerWeeklyTotals.appendChild(row);
    });
}

function renderEngineerAssignmentsList(assignments, engineer) {
  ui.engineerAssignments.innerHTML = '';

  if (!assignments.length) {
    ui.engineerAssignments.innerHTML = '<li>No assignments scheduled.</li>';
    return;
  }

  assignments.forEach((assignment) => {
    const project = getProjectById(assignment.projectId);
    const statusClass = `status--${assignment.status.replace(/\s+/g, '-')}`;
    const item = document.createElement('li');
    item.className = 'assignment-card';
    item.innerHTML = `
      <div class="assignment-card__header">
        <strong>${project?.name ?? 'Project TBD'}</strong>
        <span class="assignment-card__status ${statusClass}">${assignment.status}</span>
      </div>
      <div>${formatDate(assignment.date)} · ${formatTimeRange(assignment)}</div>
      <div class="assignment-card__meta">${assignment.location || 'Location TBA'}</div>
      ${assignment.notes ? `<div class="assignment-card__notes">${assignment.notes}</div>` : ''}
    `;
    ui.engineerAssignments.appendChild(item);
  });
}

function renderPlannerWorkspace() {
  renderPlannerSchedule();
  renderPlannerUtilization();
}

function renderPlannerSchedule() {
  ui.plannerScheduleBody.innerHTML = '';
  const assignments = getAssignmentsForWeek(state.plannerWeek).sort((a, b) => {
    if (a.date === b.date) {
      return a.startTime.localeCompare(b.startTime);
    }
    return a.date.localeCompare(b.date);
  });

  if (!assignments.length) {
    const emptyRow = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 8;
    cell.textContent = 'No assignments scheduled for this week yet.';
    emptyRow.appendChild(cell);
    ui.plannerScheduleBody.appendChild(emptyRow);
    return;
  }

  assignments.forEach((assignment) => {
    const row = ui.assignmentRowTemplate.content.firstElementChild.cloneNode(true);
    const engineer = getEngineerById(assignment.engineerId);
    const project = getProjectById(assignment.projectId);

    row.querySelector('.assignment-date').textContent = formatDate(assignment.date);
    row.querySelector('.assignment-project').textContent = project?.name ?? 'Project TBD';
    row.querySelector('.assignment-engineer').textContent = engineer?.name ?? 'Unassigned';
    row.querySelector('.assignment-time').textContent = formatTimeRange(assignment);

    const statusCell = row.querySelector('.assignment-status');
    const statusSelect = document.createElement('select');
    statusSelect.innerHTML = Object.keys(STATUS_STYLES)
      .map((status) => `<option value="${status}">${status}</option>`)
      .join('');
    statusSelect.value = assignment.status;
    statusSelect.addEventListener('change', () => {
      assignment.status = statusSelect.value;
      saveData();
      renderDashboard();
      renderEngineerPortal();
    });
    statusCell.appendChild(statusSelect);

    row.querySelector('.assignment-location').textContent = assignment.location || '—';
    row.querySelector('.assignment-notes').textContent = assignment.notes || '—';

    const actionsCell = row.querySelector('.assignment-actions');
    actionsCell.innerHTML = '';

    const duplicateBtn = document.createElement('button');
    duplicateBtn.className = 'btn btn--ghost';
    duplicateBtn.type = 'button';
    duplicateBtn.textContent = 'Duplicate';
    duplicateBtn.addEventListener('click', () => duplicateAssignment(assignment));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--secondary';
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Remove';
    deleteBtn.addEventListener('click', () => removeAssignment(assignment.id));

    actionsCell.appendChild(duplicateBtn);
    actionsCell.appendChild(deleteBtn);

    ui.plannerScheduleBody.appendChild(row);
  });
}

function renderPlannerUtilization() {
  ui.plannerUtilization.innerHTML = '';
  const assignments = getAssignmentsForWeek(state.plannerWeek);

  state.data.engineers.forEach((engineer) => {
    const hours = assignments
      .filter((assignment) => assignment.engineerId === engineer.id)
      .reduce((acc, assignment) => acc + getAssignmentHours(assignment), 0);
    const pct = engineer.capacity ? Math.min(100, Math.round((hours / engineer.capacity) * 100)) : 0;

    const row = document.createElement('div');
    row.className = 'utilization__row';
    row.innerHTML = `
      <div class="utilization__header">
        <span>${engineer.name}</span>
        <span>${hours.toFixed(1)} / ${engineer.capacity} hrs</span>
      </div>
      <div class="utilization__bar">
        <div class="utilization__bar-fill" style="width:${pct}%"></div>
      </div>
    `;
    ui.plannerUtilization.appendChild(row);
  });
}

function duplicateAssignment(assignment) {
  const nextDay = addDays(new Date(`${assignment.date}T00:00:00`), 1);
  const clone = {
    ...assignment,
    id: generateId('asg'),
    date: nextDay.toISOString().slice(0, 10),
    status: 'Tentative',
  };
  state.data.assignments.push(clone);
  saveData();
  renderDashboard();
  renderEngineerPortal();
  renderPlannerWorkspace();
}

function removeAssignment(assignmentId) {
  const confirmed = window.confirm('Remove this assignment from the schedule?');
  if (!confirmed) {
    return;
  }
  state.data.assignments = state.data.assignments.filter((assignment) => assignment.id !== assignmentId);
  saveData();
  renderDashboard();
  renderEngineerPortal();
  renderPlannerWorkspace();
}

function getAssignmentsForWeek(weekId) {
  const start = getWeekStartDate(weekId);
  const dates = new Set(
    Array.from({ length: 7 }, (_, i) => addDays(start, i).toISOString().slice(0, 10))
  );
  return state.data.assignments.filter((assignment) => dates.has(assignment.date));
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return deepCopy(DEFAULT_DATA);
    }
    const parsed = JSON.parse(raw);
    return {
      engineers: Array.isArray(parsed.engineers) ? parsed.engineers : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
    };
  } catch (error) {
    console.warn('Failed to load data, using defaults.', error);
    return deepCopy(DEFAULT_DATA);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function getEngineerById(id) {
  return state.data.engineers.find((engineer) => engineer.id === id) || null;
}

function getProjectById(id) {
  return state.data.projects.find((project) => project.id === id) || null;
}

function getAssignmentHours(assignment) {
  const [startHours, startMinutes] = assignment.startTime.split(':').map(Number);
  const [endHours, endMinutes] = assignment.endTime.split(':').map(Number);
  const start = startHours * 60 + startMinutes;
  const end = endHours * 60 + endMinutes;
  const diff = Math.max(0, end - start);
  return diff / 60;
}

function isProjectActive(project) {
  const today = new Date().toISOString().slice(0, 10);
  return project.startDate <= today && project.endDate >= today;
}

function isUpcoming(dateStr) {
  const today = stripTime(new Date());
  const date = stripTime(new Date(`${dateStr}T00:00:00`));
  return date >= today;
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}

function formatTimeRange(assignment) {
  return `${toDisplayTime(assignment.startTime)} – ${toDisplayTime(assignment.endTime)}`;
}

function toDisplayTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function generateId(prefix) {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random.slice(-8)}`;
}

function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

function daysBetween(start, end) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const diff = endDate - startDate;
  return Math.round(diff / 86400000);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getCurrentWeekId() {
  return getWeekIdFromDate(new Date().toISOString().slice(0, 10));
}

function getWeekIdFromDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  const firstThursday = new Date(date.getFullYear(), 0, 1);
  firstThursday.setDate(firstThursday.getDate() + (4 - firstThursday.getDay() || 7));
  const diff = date - firstThursday;
  const week = Math.floor(diff / 604800000) + 1;
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getWeekStartDate(weekId) {
  const [year, weekStr] = weekId.split('-W');
  const week = Number(weekStr);
  const simple = new Date(Date.UTC(Number(year), 0, 1 + (week - 1) * 7));
  const dayOfWeek = simple.getUTCDay();
  const ISOweekStart = simple;
  if (dayOfWeek <= 4) {
    ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  } else {
    ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  }
  return new Date(ISOweekStart.getUTCFullYear(), ISOweekStart.getUTCMonth(), ISOweekStart.getUTCDate());
}

function createWeekdayHeaders(startDate) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(startDate, index);
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  });
}

function daysToISO(date) {
  return date.toISOString().slice(0, 10);
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getWeekId(date) {
  return getWeekIdFromDate(daysToISO(date));
}

function formatWeekRange(weekId) {
  const start = getWeekStartDate(weekId);
  const end = addDays(start, 6);
  return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
}

// These helpers are defined but not currently used. They are retained for
// future enhancements such as exporting summaries or advanced filtering.
void getWeekStart;
void getWeekId;
void formatWeekRange;
