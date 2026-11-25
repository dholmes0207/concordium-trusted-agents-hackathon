import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { VerificationRequestV1 } from '@concordium/web-sdk';

// Approval page client: shows the held action, asks the engineer's Concordium Browser Wallet for a
// Verify & Access V1 presentation of the anchored request, and posts it back to the gateway.
// The wallet does not display the context, so this page shows what is being approved.
const id = location.pathname.split('/').filter(Boolean).pop()!;
const salt = new URLSearchParams(location.hash.slice(1)).get('salt') ?? undefined;
const $ = (s: string) => document.querySelector(s) as HTMLElement;

async function load() {
  const r = await fetch(`/approvals/${id}/data`);
  if (!r.ok) { $('#status').textContent = 'Unknown approval.'; return null; }
  const d = await r.json();
  $('#consent').textContent = d.consent;
  $('#fields').textContent = JSON.stringify({ subject: d.subject, params: d.params, digest: d.digest, vraTx: d.vraTx }, null, 2);
  $('#status').textContent = d.status === 'pending' ? `Waiting for approval (expires ${new Date(d.subject.expiresAt * 1000).toLocaleTimeString()}).` : `Status: ${d.status}${d.reason ? ` (${d.reason})` : ''}`;
  if (d.vraTx) ($('#vra') as HTMLAnchorElement).href = `https://ccdexplorer.io/testnet/transaction/${d.vraTx}`;
  ($('#approve') as HTMLButtonElement).disabled = d.status !== 'pending';
  ($('#reject') as HTMLButtonElement).disabled = d.status !== 'pending';
  if (salt === undefined && d.needsSalt) $('#warn').textContent = 'This work order names a specific approver: open the link that includes #salt=…';
  return d;
}

async function approve() {
  const d = await load();
  if (!d || d.status !== 'pending') return;
  $('#status').textContent = 'Opening the wallet…';
  try {
    const provider = await detectConcordiumProvider().catch(() => {
      throw new Error('Concordium Browser Wallet not found. Install it, switch it to Testnet, and reload this page.');
    });
    await provider.connect?.();
    const request = VerificationRequestV1.fromJSON(d.request);
    const pres = await provider.requestVerifiablePresentationV1(request);
    const json = typeof (pres as any).toJSON === 'function' ? (pres as any).toJSON() : pres;
    $('#status').textContent = 'Verifying on chain…';
    const resp = await fetch(`/approvals/${id}/presentation`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ presentation: json, salt }),
    });
    const out = await resp.json();
    $('#status').textContent = out.status === 'approved' ? `Approved by ${out.approver?.credentialId}` : `Not approved: ${out.reason ?? out.status}`;
    await load();
    $('#status').textContent = out.status === 'approved' ? `Approved by ${out.approver?.credentialId}` : `Not approved: ${out.reason ?? out.status}`;
    if (out.vaaTx) { const a = $('#vaa') as HTMLAnchorElement; a.href = `https://ccdexplorer.io/testnet/transaction/${out.vaaTx}`; a.hidden = false; }
  } catch (e) {
    $('#status').textContent = `Wallet error: ${e instanceof Error ? e.message : String(e ?? 'request declined')}`;
  }
}

async function reject() {
  const resp = await fetch(`/approvals/${id}/reject`, { method: 'POST' });
  await resp.json();
  await load();
}

$('#approve').addEventListener('click', approve);
$('#reject').addEventListener('click', reject);
load();
