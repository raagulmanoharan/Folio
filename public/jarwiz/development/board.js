(() => {
  'use strict';
  let data = null;
  let scope = 'active';
  let selectedId = null;
  let loading = false;
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const words = value => String(value || '').replaceAll('_', ' ').replaceAll('-', ' ');
  const crewName = id => data.crews.find(crew => crew.id === id)?.name || id;
  const statusName = id => data.columns.find(column => column.id === id)?.label || words(id);
  const priorityOrder = {P0:0, P1:1, P2:2};
  const list = values => `<ul>${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>`;

  function renderSummary() {
    const count = status => data.items.filter(item => item.status === status).length;
    const activeCrews = new Set(data.items.filter(item => item.status === 'in_progress').map(item => item.crewId)).size;
    $('summary').innerHTML = [
      [data.items.length, 'Tracked deliverables', 'Full roadmap and bounded build slices'],
      [count('in_progress'), 'In progress', `${activeCrews} feature crews actively assigned`],
      [count('review'), 'Awaiting review', 'Implementation and evidence to assess'],
      [count('done'), 'Accepted as done', `${count('blocked')} cards have explicit blockers`],
    ].map(([value,title,note]) => `<article class="metric"><p>${escape(title)}</p><strong>${value}</strong><small>${escape(note)}</small></article>`).join('');
    $('launch-state').textContent = data.metadata.launchState === 'ready' ? 'Ready for launch review' : 'Not ready for invitations';
    $('launch-caption').textContent = 'Release gates stay open until verified.';
    $('updated').textContent = `Updated ${data.metadata.updatedAt}`;
    const pending = data.gates.filter(gate => !['done','passed'].includes(gate.status)).length;
    $('gate-count').textContent = `${pending} of ${data.gates.length} open`;
    $('gates').innerHTML = data.gates.map(gate => `<article class="gate"><strong>${escape(gate.title)}</strong><p>${escape(gate.description)}</p><span class="gate-state">${escape(words(gate.status))} · ${gate.itemIds.map(escape).join(', ')}</span></article>`).join('');
  }

  function renderBoard() {
    if (!data) return;
    const query = $('search').value.trim().toLowerCase();
    const crew = $('crew').value;
    const priority = $('priority').value;
    const items = data.items.filter(item =>
      (scope === 'all' || item.releaseScope.startsWith('build_wave_')) &&
      (crew === 'all' || item.crewId === crew) &&
      (priority === 'all' || item.priority === priority) &&
      (!query || `${item.id} ${item.title} ${item.description} ${crewName(item.crewId)} ${item.assignee || ''}`.toLowerCase().includes(query))
    ).sort((a,b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3) || a.id.localeCompare(b.id, undefined, {numeric:true}));
    $('results').textContent = `${items.length} ${items.length === 1 ? 'card' : 'cards'} · ${scope === 'active' ? 'Current build wave' : 'Complete product roadmap'}`;
    $('board').innerHTML = data.columns.map(column => {
      const cards = items.filter(item => item.status === column.id);
      return `<section class="column" data-status="${escape(column.id)}" aria-labelledby="column-${escape(column.id)}"><header class="column-header"><h2 id="column-${escape(column.id)}">${escape(column.label)}</h2><span class="column-count">${cards.length}</span></header><div class="card-list">${cards.length ? cards.map(item => `<button type="button" class="card" data-card="${escape(item.id)}" aria-label="${escape(item.id + ': ' + item.title + '. Open acceptance criteria and evidence.')}"><span class="card-meta"><span>${escape(item.id)}</span><span class="priority ${escape(item.priority)}">${escape(item.priority)}</span></span><span class="card-title">${escape(item.title)}</span><span class="card-description">${escape(item.description)}</span><span class="card-footer"><span class="crew-name" title="${escape(crewName(item.crewId))}">${escape(crewName(item.crewId))}</span><span class="evidence-count">${item.evidence.length ? item.evidence.length + ' refs' : 'No evidence yet'}</span></span></button>`).join('') : '<p class="empty-column">No matching cards</p>'}</div></section>`;
    }).join('');
    $('board').querySelectorAll('[data-card]').forEach(button => button.addEventListener('click', () => showDetail(button.dataset.card)));
  }

  function showDetail(id, reopen = true) {
    const item = data.items.find(candidate => candidate.id === id);
    if (!item) return;
    selectedId = id;
    $('detail-id').textContent = item.id;
    $('detail-content').innerHTML = `<div class="detail-tags"><span class="tag">${escape(statusName(item.status))}</span><span class="tag">${escape(item.priority)}</span><span class="tag">${escape(words(item.releaseScope))}</span></div><h2 id="detail-title">${escape(item.title)}</h2><p class="detail-description">${escape(item.description)}</p><section class="detail-section"><h3>Ownership and next step</h3><p>${escape(crewName(item.crewId))}</p><p class="meta-line">${item.assignee ? 'Assigned to ' + escape(item.assignee) : 'No agent assigned yet'} · ${escape(words(item.implementationStatus))}</p><p class="meta-line">${escape(item.nextAction)}</p></section><section class="detail-section"><h3>Acceptance criteria</h3><ol>${item.acceptanceCriteria.map(criterion => `<li>${escape(criterion)}</li>`).join('')}</ol></section>${item.blockers.length ? `<section class="detail-section blockers"><h3>What is blocked</h3>${list(item.blockers)}</section>` : ''}<section class="detail-section"><h3>Dependencies</h3>${item.dependencies.length ? item.dependencies.map(dep => `<button type="button" class="dependency" data-dependency="${escape(dep)}">${escape(dep)} →</button>`).join('') : '<p>No implementation dependency listed for this slice.</p>'}${item.sourceRoadmapId !== item.id ? `<p class="meta-line">Parent release gate: <button class="dependency" type="button" data-dependency="${escape(item.sourceRoadmapId)}">${escape(item.sourceRoadmapId)} →</button></p>` : ''}</section><section class="detail-section"><h3>Evidence</h3>${item.evidence.length ? item.evidence.map(evidence => `<article class="evidence"><span class="evidence-kind">${escape(words(evidence.kind))}${evidence.date ? ' · ' + escape(evidence.date) : ''}</span><p>${escape(evidence.note || evidence.result || evidence.description || 'Evidence recorded')}</p>${evidence.command ? `<code>${escape(evidence.command)}</code>` : ''}${evidence.path ? `<code>${escape(evidence.path)}</code>` : ''}</article>`).join('') : '<p class="empty-evidence">No implementation or verification evidence recorded for this slice yet. A crew should attach its checks before moving it to review.</p>'}</section>`;
    $('detail-content').querySelectorAll('[data-dependency]').forEach(button => button.addEventListener('click', () => { showDetail(button.dataset.dependency, false); $('detail').scrollTop = 0; }));
    if (reopen && !$('detail').open) $('detail').showModal();
  }

  async function load() {
    if (loading) return;
    loading = true;
    $('refresh').disabled = true;
    try {
      const response = await fetch('kanban.json', {cache:'no-store', signal:AbortSignal.timeout(12000)});
      if (!response.ok) throw new Error(`Board request returned ${response.status}.`);
      const next = await response.json();
      if (!Array.isArray(next.items) || !Array.isArray(next.columns) || !Array.isArray(next.crews)) throw new Error('The board file does not match the expected format.');
      data = next;
      const selectedCrew = $('crew').value;
      $('crew').innerHTML = '<option value="all">All crews</option>' + data.crews.map(crew => `<option value="${escape(crew.id)}">${escape(crew.name)}</option>`).join('');
      if (data.crews.some(crew => crew.id === selectedCrew)) $('crew').value = selectedCrew;
      $('error').hidden = true;
      renderSummary(); renderBoard();
      if (selectedId && $('detail').open) showDetail(selectedId, false);
    } catch (error) {
      $('error').hidden = false;
      $('error').textContent = `Could not refresh the launch board. ${error.message} Serve this folder over HTTP and use Refresh to try again.${data ? ' The last loaded state is still visible.' : ''}`;
      $('updated').textContent = 'Refresh unavailable';
    } finally { loading = false; $('refresh').disabled = false; }
  }

  document.querySelectorAll('[data-scope]').forEach(button => button.addEventListener('click', () => {
    scope = button.dataset.scope;
    document.querySelectorAll('[data-scope]').forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    renderBoard();
  }));
  $('search').addEventListener('input', renderBoard);
  $('crew').addEventListener('change', renderBoard);
  $('priority').addEventListener('change', renderBoard);
  $('refresh').addEventListener('click', load);
  $('gates-toggle').addEventListener('click', () => { const expanded = $('gates-toggle').getAttribute('aria-expanded') === 'true'; $('gates-toggle').setAttribute('aria-expanded', String(!expanded)); $('gates').hidden = expanded; });
  $('close-detail').addEventListener('click', () => $('detail').close());
  $('detail').addEventListener('close', () => { selectedId = null; });
  load();
  setInterval(() => { if (!document.hidden) load(); }, 30000);
})();
