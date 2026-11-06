import type { Store } from './store';
import { esc, fDur, fMoney, fNum, fUT } from './format';

/**
 * Program board: career state parsed read-only from the active save. This is the 2D preview of
 * the Program Office (design §4.2). Data is as fresh as KSP's last save.
 */
export function programHtml(store: Store): string {
  if (!store.career) {
    return `<header><div><div class="pos">PROGRAM</div><div class="ptitle">Program Office</div></div><div class="lamp nodata">NO DATA</div></header>
      <p class="muted">${esc(store.careerError ?? 'Loading career save…')}</p>
      <p class="muted">The bridge reads <code>saves/&lt;career&gt;/persistent.sfs</code> under <code>KSP_ROOT</code>, read-only.</p>`;
  }
  const { save, summary: c } = store.career;
  const ut = c.ut ?? 0;
  const contract = (k: (typeof c.contracts.active)[number]) => {
    const due = k.dueUT !== null ? k.dueUT - ut : null;
    const dueCls = due !== null && due < 30 * 86400 ? 'caution' : '';
    return `<div class="contract">
      <div class="ct">${esc(k.title)}</div>
      <div class="cm"><span>${esc(k.agent ?? '')}</span><span>adv ${fMoney(k.fundsAdvance)} · done ${fMoney(k.fundsCompletion)}${k.science ? ` · ${fNum(k.science)} sci` : ''}</span><span class="${dueCls}">${k.state === 'Active' ? 'due' : 'offer ends'} ${due === null ? '—' : due < 0 ? 'past' : 'in ' + fDur(due)}</span></div>
    </div>`;
  };
  const crewAvail = c.crew.filter((k) => k.type === 'Crew' && k.state === 'Available').length;
  const crewAssigned = c.crew.filter((k) => k.type === 'Crew' && k.state === 'Assigned').length;
  const applicants = c.crew.filter((k) => k.type === 'Applicant').length;
  const facilities = c.facilities.map((f) => `<div class="fac"><span>${esc(f.id.replace(/([a-z])([A-Z])/g, '$1 $2'))}</span><b>${f.level === null ? '—' : `L${Math.round(f.level * 2) + 1}`}</b></div>`).join('');
  return `<header><div><div class="pos">PROGRAM</div><div class="ptitle">${esc(c.title ?? save)}</div></div><div class="lamp nominal">${esc(c.mode ?? '')}</div></header>
    <div class="kpis">
      <div><span>Funds</span><b>${fMoney(c.funds)}</b></div>
      <div><span>Science</span><b>${fNum(c.science, 1)}</b></div>
      <div><span>Reputation</span><b>${fNum(c.reputation, 0)}</b></div>
      <div><span>Game date</span><b class="small">${esc(fUT(c.ut).slice(0, 10))}</b></div>
    </div>
    <h3>Active contracts (${c.contracts.active.length})</h3>
    ${c.contracts.active.map(contract).join('') || '<div class="muted">None</div>'}
    <h3>Offered (${c.contracts.offered.length})</h3>
    ${c.contracts.offered.slice(0, 8).map(contract).join('')}${c.contracts.offered.length > 8 ? `<div class="muted">+${c.contracts.offered.length - 8} more</div>` : ''}
    <h3>Record</h3>
    <div class="row"><span class="k">Completed / failed</span><span class="v">${c.contracts.completedCount} / ${c.contracts.failedCount}</span></div>
    <div class="row"><span class="k">Astronauts available / assigned</span><span class="v">${crewAvail} / ${crewAssigned}</span></div>
    <div class="row"><span class="k">Applicants</span><span class="v">${applicants}</span></div>
    <div class="row"><span class="k">Tracked vessels</span><span class="v">${c.vessels.filter((v) => v.type !== 'Debris').length} (+${c.vessels.filter((v) => v.type === 'Debris').length} debris)</span></div>
    <h3>Facilities</h3><div class="facs">${facilities}</div>
    <p class="muted foot">Save <code>${esc(save)}</code>, written ${esc(c.savedAt?.slice(0, 19).replace('T', ' ') ?? '?')} UTC. Updates when KSP saves.</p>`;
}
