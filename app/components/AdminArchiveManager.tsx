'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { ArchiveItem, ArchiveStatus } from '../../db/schema';

const categoryLabels: Record<string, string> = {
  teams: 'Teams & players', matches: 'Match days',
  'club-life': 'Club life', documents: 'Programmes & documents',
};

type QueuedArchiveFile = { id: string; file: File; title: string; altText: string };
const permittedUploadTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
const maxUploadSize = 12 * 1024 * 1024;
const maxBatchSize = 20;

function titleFromFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function displayFileSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AdminArchiveManager() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [queuedFiles, setQueuedFiles] = useState<QueuedArchiveFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/archive', { cache: 'no-store' });
    const data = await response.json() as { items?: ArchiveItem[]; error?: string };
    setItems(data.items ?? []);
    if (!response.ok) setMessage(data.error ?? 'The archive could not be loaded.');
    setLoading(false);
  }, []);

  useEffect(() => { void loadItems(); }, [loadItems]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) return;
    const form = event.currentTarget;
    if (queuedFiles.length === 0) { setMessage('Choose at least one photograph or document to upload.'); return; }
    const missingDetails = queuedFiles.find((item) => !item.title.trim() || (item.file.type.startsWith('image/') && !item.altText.trim()));
    if (missingDetails) { setMessage(`Add a title${missingDetails.file.type.startsWith('image/') ? ' and image description' : ''} for ${missingDetails.file.name}.`); return; }

    const shared = new FormData(form);
    const category = String(shared.get('category') ?? '');
    const year = String(shared.get('year') ?? '');
    const description = String(shared.get('description') ?? '');
    setUploading(true);
    setMessage(`Uploading 1 of ${queuedFiles.length}…`);
    const failed: QueuedArchiveFile[] = [];
    const failures: string[] = [];

    for (let index = 0; index < queuedFiles.length; index += 1) {
      const item = queuedFiles[index];
      setMessage(`Uploading ${index + 1} of ${queuedFiles.length}: ${item.file.name}`);
      const payload = new FormData();
      payload.set('file', item.file);
      payload.set('title', item.title.trim());
      payload.set('altText', item.altText.trim());
      payload.set('category', category);
      payload.set('year', year);
      payload.set('description', description);
      try {
        const response = await fetch('/api/archive', { method: 'POST', body: payload });
        const data = await response.json() as { error?: string };
        if (!response.ok) throw new Error(data.error ?? 'The file could not be uploaded.');
      } catch (error) {
        failed.push(item);
        failures.push(`${item.file.name}: ${error instanceof Error ? error.message : 'upload failed'}`);
      }
    }

    const uploaded = queuedFiles.length - failed.length;
    setUploading(false);
    if (uploaded > 0) await loadItems();
    if (failed.length === 0) {
      form.reset();
      setQueuedFiles([]);
      setMessage(`${uploaded} archive ${uploaded === 1 ? 'item was' : 'items were'} uploaded to the review queue. Nothing is public yet.`);
    } else {
      setQueuedFiles(failed);
      setMessage(`${uploaded} uploaded; ${failed.length} could not be uploaded and remain selected. ${failures.join(' ')}`);
    }
  }

  function chooseFiles(files: FileList | null) {
    if (!files?.length) return;
    const existing = new Set(queuedFiles.map((item) => item.id));
    const additions: QueuedArchiveFile[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      if (existing.has(id)) continue;
      if (!permittedUploadTypes.has(file.type)) { rejected.push(`${file.name} is not a supported file type.`); continue; }
      if (file.size < 1 || file.size > maxUploadSize) { rejected.push(`${file.name} must be no larger than 12 MB.`); continue; }
      existing.add(id);
      additions.push({ id, file, title: titleFromFilename(file.name), altText: '' });
    }
    const available = Math.max(0, maxBatchSize - queuedFiles.length);
    const accepted = additions.slice(0, available);
    if (additions.length > available) rejected.push(`A maximum of ${maxBatchSize} files can be uploaded together.`);
    setQueuedFiles((current) => [...current, ...accepted]);
    if (rejected.length) setMessage(rejected.join(' '));
    else if (accepted.length) setMessage(`${accepted.length} ${accepted.length === 1 ? 'file is' : 'files are'} ready. Check each title and describe every photograph before uploading.`);
  }

  function updateQueuedFile(id: string, field: 'title' | 'altText', value: string) {
    setQueuedFiles((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  async function changeStatus(id: string, status: ArchiveStatus) {
    setMessage('Saving…');
    const response = await fetch(`/api/archive/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await response.json() as { error?: string };
    setMessage(response.ok ? (status === 'published' ? 'Published to the public archive.' : 'Archive status updated.') : (data.error ?? 'The update failed.'));
    if (response.ok) await loadItems();
  }

  async function saveMetadata(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setMessage('Saving archive details…');
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/archive/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.get('title'), category: form.get('category'), year: form.get('year'), description: form.get('description'), altText: form.get('altText') }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setMessage(data.error ?? 'The archive details could not be saved.'); return; }
    setEditingId(null);
    setMessage('Archive details saved.');
    await loadItems();
  }

  async function removeItem(id: string, title: string) {
    if (!window.confirm(`Permanently delete “${title}” and its uploaded file?`)) return;
    const response = await fetch(`/api/archive/${id}`, { method: 'DELETE' });
    setMessage(response.ok ? 'Archive item deleted.' : 'The item could not be deleted.');
    if (response.ok) await loadItems();
  }


  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${item.title} ${item.description ?? ''} ${item.year ?? ''} ${categoryLabels[item.category] ?? ''}`.toLowerCase().includes(query);
    return matchesSearch && (statusFilter === 'all' || item.status === statusFilter) && (categoryFilter === 'all' || item.category === categoryFilter);
  });

  return <>
    <section className="admin-archive-backup">
      <div><p className="eyebrow blue">Backup &amp; handover</p><h2>Keep an independent archive record.</h2><p>Download the archive register regularly and keep it with the club&rsquo;s own records. The register contains every item&rsquo;s title, year, category, description, publication status and original filename.</p></div>
      <div className="admin-archive-backup-actions"><a href="/api/archive/export?format=csv" download>Download spreadsheet register <span>↓</span></a><a href="/api/archive/export?format=json" download>Download technical backup <span>↓</span></a><small>The register records the collection. Use <strong>Download original</strong> beside each item to retain a separate copy of its photograph or document.</small></div>
    </section>
    <section className="admin-upload-card">
      <div className="admin-section-heading"><div><p className="eyebrow blue">Add to the collection</p><h2>Upload archive items.</h2></div><p>Select one file or a complete batch. Every item enters the review queue separately so its title, permissions and safeguarding can be checked before publication.</p></div>
      {message && <p className="admin-message" role="status">{message}</p>}
      <form className="archive-upload-form" onSubmit={upload}>
        <fieldset className="admin-upload-step"><legend><span>1</span><strong>Set the details for this batch</strong></legend><p className="admin-upload-step-copy">The category, year and shared description below will be added to every file you select in step 2.</p><div className="admin-upload-step-fields"><label>Category <span>*</span><select name="category" required defaultValue=""><option value="" disabled>Select a category</option><option value="teams">Teams & players</option><option value="matches">Match days</option><option value="club-life">Club life</option><option value="documents">Programmes & documents</option></select></label><label>Year or decade<input name="year" inputMode="numeric" placeholder="For example: 1994 or 1990s" pattern="\d{4}(s)?" /></label><label className="admin-form-wide">Description for the whole batch<textarea name="description" rows={4} maxLength={1200} placeholder="Optional context shared by every selected item, such as the team, occasion or event." /></label></div><aside><strong>Are the files from different years or categories?</strong><span>Upload them as separate batches so the public archive remains accurate and easy to search.</span></aside></fieldset>
        <fieldset className="admin-upload-step"><legend><span>2</span><strong>Choose one or several files</strong></legend><p className="admin-upload-step-copy">You can select up to 20 photographs or documents together. On a computer, use Ctrl, Command or Shift in the file window to select more than one.</p><label className="admin-file-field">Select photographs or documents <span>*</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" disabled={uploading} onChange={(event) => { chooseFiles(event.target.files); event.currentTarget.value = ''; }} /><small>JPG, PNG, WebP, GIF or PDF. Maximum 12 MB per file.</small></label></fieldset>
        {queuedFiles.length > 0 && <section className="admin-upload-step admin-upload-review-step"><header className="admin-upload-step-title"><span>3</span><div><strong>Review every selected item</strong><small>Correct each title and describe every photograph before uploading.</small></div></header><div className="admin-upload-batch"><header><div><strong>{queuedFiles.length} {queuedFiles.length === 1 ? 'item' : 'items'} ready</strong><small>Each file will become its own private archive entry.</small></div><button type="button" disabled={uploading} onClick={() => setQueuedFiles([])}>Clear selection</button></header><div>{queuedFiles.map((item, index) => <article key={item.id}><div className="admin-upload-file-summary"><span>{item.file.type === 'application/pdf' ? 'PDF' : 'IMG'}</span><p><strong>{item.file.name}</strong><small>{displayFileSize(item.file.size)} · item {index + 1}</small></p><button type="button" disabled={uploading} onClick={() => setQueuedFiles((current) => current.filter((selected) => selected.id !== item.id))}>Remove</button></div><label>Archive title <span>*</span><input value={item.title} maxLength={160} disabled={uploading} onChange={(event) => updateQueuedFile(item.id, 'title', event.target.value)} /></label>{item.file.type.startsWith('image/') && <label>Describe this photograph <span>*</span><textarea rows={2} maxLength={300} value={item.altText} disabled={uploading} placeholder="Who or what is shown? Include the occasion where known." onChange={(event) => updateQueuedFile(item.id, 'altText', event.target.value)} /></label>}</article>)}</div></div></section>}
        <button className="button button-yellow" type="submit" disabled={uploading || queuedFiles.length === 0}>{uploading ? 'Uploading…' : `Upload ${queuedFiles.length || ''} ${queuedFiles.length === 1 ? 'item' : 'items'} for review`} <span>→</span></button>
      </form>
    </section>
    <section className="admin-queue">
      <div className="admin-section-heading"><div><p className="eyebrow blue">Approval workflow</p><h2>Archive review queue.</h2></div><p>Pending and rejected items remain private. Published items appear immediately on the public Archive page.</p></div>
      {!loading && items.length > 0 && <div className="admin-archive-filters"><label>Search archive<input type="search" value={search} placeholder="Title, year or description" onChange={(event) => setSearch(event.target.value)} /></label><label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending review</option><option value="published">Published</option><option value="rejected">Rejected</option></select></label><label>Category<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">All categories</option><option value="teams">Teams &amp; players</option><option value="matches">Match days</option><option value="club-life">Club life</option><option value="documents">Programmes &amp; documents</option></select></label></div>}
      {loading ? <p>Loading archive…</p> : items.length === 0 ? <div className="admin-empty"><h3>No uploads yet.</h3><p>The first item uploaded above will appear here for review.</p></div> : filteredItems.length === 0 ? <div className="admin-empty"><h3>No matching archive items.</h3><p>Change the search or filters to see more items.</p></div> : <div className="admin-archive-list">{filteredItems.map((item) => <article key={item.id}>
        <div className="admin-archive-preview">{item.content_type.startsWith('image/') ? <img src={`/api/archive/files/${item.id}`} alt={item.alt_text ?? ''} /> : <span>PDF</span>}</div>
        <div className="admin-archive-copy">{editingId === item.id ? <form className="admin-archive-edit" onSubmit={(event) => void saveMetadata(event, item.id)}><label>Title<input name="title" required maxLength={160} defaultValue={item.title} /></label><label>Category<select name="category" defaultValue={item.category}><option value="teams">Teams &amp; players</option><option value="matches">Match days</option><option value="club-life">Club life</option><option value="documents">Programmes &amp; documents</option></select></label><label>Year or decade<input name="year" pattern="\d{4}(s)?" defaultValue={item.year ?? ''} /></label><label className="wide">Description<textarea name="description" rows={3} maxLength={1200} defaultValue={item.description ?? ''} /></label>{item.content_type.startsWith('image/') && <label className="wide">Alternative text<textarea name="altText" rows={2} required maxLength={300} defaultValue={item.alt_text ?? ''} /></label>}{item.status === 'published' && <small className="wide">This item is public. Saving these details will update the Archive page immediately.</small>}<div className="admin-archive-edit-actions"><button type="submit">Save details</button><button type="button" onClick={() => setEditingId(null)}>Cancel</button></div></form> : <><div><span className={`admin-status status-${item.status}`}>{item.status}</span><small>{categoryLabels[item.category]}{item.year ? ` · ${item.year}` : ''}</small></div><h3>{item.title}</h3><p>{item.description || 'No description supplied.'}</p><small>Uploaded by {item.created_by}</small></>}</div>
        <div className="admin-archive-actions">
          <button type="button" onClick={() => setEditingId(editingId === item.id ? null : item.id)}>{editingId === item.id ? 'Close editor' : 'Edit details'}</button>
          {editingId !== item.id && <>{item.status !== 'published' && <button type="button" onClick={() => changeStatus(item.id, 'published')}>Publish</button>}{item.status === 'published' && <button type="button" onClick={() => changeStatus(item.id, 'pending')}>Return to review</button>}{item.status !== 'rejected' && <button type="button" onClick={() => changeStatus(item.id, 'rejected')}>Reject</button>}</>}
          <a href={`/api/archive/files/${item.id}`} target="_blank" rel="noreferrer">Preview</a>
          <a href={`/api/archive/files/${item.id}?download=1`} download>Download original</a>
          <button className="admin-delete" type="button" onClick={() => removeItem(item.id, item.title)}>Delete</button>
        </div>
      </article>)}</div>}
    </section>
  </>;
}
