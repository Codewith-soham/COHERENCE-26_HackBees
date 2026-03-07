import { useState, useEffect, useRef } from 'react';
import { FileText, FileSpreadsheet, Download, RotateCcw, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const API = 'http://localhost:5000/api';

const INDIA_STATES_DISTRICTS = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Thane", "Kolhapur"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Shahdara", "South Delhi"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Kalaburagi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Noida"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Hisar"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh"],
};

const DEPARTMENTS = [
  "Health", "Education", "Infrastructure", "Agriculture",
  "Water Resources", "Finance", "Transport", "Housing", "Energy", "Defence"
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const escCSV = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

const toCSV = (headers, rows) => {
  const head = headers.map(escCSV).join(',');
  const body = rows.map(r => r.map(escCSV).join(',')).join('\n');
  return `${head}\n${body}`;
};

const downloadFile = (content, filename, mime) => {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Minimal PDF built with raw PDF syntax — no library needed
const buildPDF = (title, subtitle, tableHeaders, tableRows, summaryLines) => {
  const lines = [];
  const objs  = [];
  let offset  = 0;

  const enc = (s) => s
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?');

  const addObj = (content) => {
    objs.push(offset);
    const chunk = content + '\n';
    lines.push(chunk);
    offset += chunk.length;
    return objs.length;
  };

  // Header comment
  const hdr = '%PDF-1.4\n';
  lines.push(hdr);
  offset += hdr.length;

  // ── Page content stream ──
  const pageW = 595, pageH = 842;
  const margin = 50;
  let y = pageH - margin;

  const ops = [];

  // Title
  ops.push('BT');
  ops.push('/F1 18 Tf');
  ops.push(`${margin} ${y} Td`);
  ops.push(`(${enc(title)}) Tj`);
  ops.push('ET');
  y -= 26;

  // Subtitle
  ops.push('BT');
  ops.push('/F2 11 Tf');
  ops.push(`${margin} ${y} Td`);
  ops.push(`(${enc(subtitle)}) Tj`);
  ops.push('ET');
  y -= 20;

  // Date line
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
  ops.push('BT');
  ops.push('/F2 9 Tf');
  ops.push(`${margin} ${y} Td`);
  ops.push(`(Generated: ${enc(now)}) Tj`);
  ops.push('ET');
  y -= 24;

  // Divider line
  ops.push(`${margin} ${y} m`);
  ops.push(`${pageW - margin} ${y} l`);
  ops.push('0.6 w S');
  y -= 16;

  // Summary lines
  if (summaryLines.length > 0) {
    ops.push('BT');
    ops.push('/F1 10 Tf');
    ops.push(`${margin} ${y} Td`);
    ops.push('(SUMMARY) Tj');
    ops.push('ET');
    y -= 14;

    summaryLines.forEach(line => {
      ops.push('BT');
      ops.push('/F2 9 Tf');
      ops.push(`${margin} ${y} Td`);
      ops.push(`(${enc(line)}) Tj`);
      ops.push('ET');
      y -= 13;
    });
    y -= 8;
  }

  // Table header background
  ops.push('0.22 0.24 0.49 rg');
  ops.push(`${margin} ${y - 14} ${pageW - margin * 2} 18 re f`);
  ops.push('1 1 1 rg');

  // Table headers
  const colW = (pageW - margin * 2) / tableHeaders.length;
  ops.push('BT');
  ops.push('/F1 8 Tf');
  tableHeaders.forEach((h, i) => {
    ops.push(`${margin + i * colW + 4} ${y - 10} Td`.replace('Td', 'Td'));
    // reset position each time
  });
  ops.push('ET');

  // Write headers one by one
  tableHeaders.forEach((h, i) => {
    ops.push('BT');
    ops.push('/F1 8 Tf');
    ops.push(`${margin + i * colW + 3} ${y - 10} Td`);
    ops.push(`(${enc(String(h).slice(0, 18))}) Tj`);
    ops.push('ET');
  });
  ops.push('0 0 0 rg');
  y -= 18;

  // Table rows
  tableRows.forEach((row, ri) => {
    if (y < 80) return; // skip if out of page
    // Alternating row bg
    if (ri % 2 === 0) {
      ops.push('0.95 0.95 0.97 rg');
      ops.push(`${margin} ${y - 12} ${pageW - margin * 2} 16 re f`);
      ops.push('0 0 0 rg');
    }
    row.forEach((cell, ci) => {
      ops.push('BT');
      ops.push('/F2 8 Tf');
      ops.push(`${margin + ci * colW + 3} ${y - 9} Td`);
      ops.push(`(${enc(String(cell ?? '').slice(0, 20))}) Tj`);
      ops.push('ET');
    });
    // Row bottom border
    ops.push('0.85 0.85 0.85 rg');
    ops.push(`${margin} ${y - 13} ${pageW - margin * 2} 0.5 re f`);
    ops.push('0 0 0 rg');
    y -= 16;
  });

  // Footer
  ops.push('BT');
  ops.push('/F2 8 Tf');
  ops.push(`${margin} 30 Td`);
  ops.push(`(BudgetSetu - Government Budget Monitoring System | Confidential) Tj`);
  ops.push('ET');

  const stream = ops.join('\n');

  // Object 1 — content stream
  const streamObj = `1 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  lines.push(streamObj);
  objs.push(offset);
  offset += streamObj.length;

  // Object 2 — page
  const pageObj = `2 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 ${pageW} ${pageH}]\n   /Contents 1 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>\nendobj\n`;
  lines.push(pageObj);
  objs.push(offset);
  offset += pageObj.length;

  // Object 3 — pages
  const pagesObj = `3 0 obj\n<< /Type /Pages /Kids [2 0 R] /Count 1 >>\nendobj\n`;
  lines.push(pagesObj);
  objs.push(offset);
  offset += pagesObj.length;

  // Object 4 — font Helvetica-Bold
  const font1Obj = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;
  lines.push(font1Obj);
  objs.push(offset);
  offset += font1Obj.length;

  // Object 5 — font Helvetica
  const font2Obj = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  lines.push(font2Obj);
  objs.push(offset);
  offset += font2Obj.length;

  // Object 6 — catalog
  const catObj = `6 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n`;
  lines.push(catObj);
  objs.push(offset);
  offset += catObj.length;

  // xref + trailer
  const xrefOffset = offset;
  const xref = `xref\n0 7\n0000000000 65535 f \n${objs.map(o => String(o).padStart(10, '0') + ' 00000 n ').join('\n')}\n`;
  lines.push(xref);
  lines.push(`trailer\n<< /Size 7 /Root 6 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return lines.join('');
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function Reports() {
  const [filterState,      setFilterState]      = useState('');
  const [filterDistrict,   setFilterDistrict]   = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [stateSearch,      setStateSearch]      = useState('');
  const [showStateDropdown,setShowStateDropdown] = useState(false);
  const stateDropdownRef = useRef(null);

  const [budgets,     setBudgets]     = useState([]);
  const [anomalies,   setAnomalies]   = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [generating,  setGenerating]  = useState('');  // which report is generating
  const [toast,       setToast]       = useState('');

  // ── Fetch all data once ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bRes, aRes, pRes] = await Promise.all([
          fetch(`${API}/budget/all`),
          fetch(`${API}/anomaly/all`),
          fetch(`${API}/prediction/all`),
        ]);
        const [bJson, aJson, pJson] = await Promise.all([bRes.json(), aRes.json(), pRes.json()]);
        setBudgets(bJson.data     || []);
        setAnomalies(aJson.data   || []);
        setPredictions(pJson.data || []);
      } catch (e) {
        console.error('Reports fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target))
        setShowStateDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setFilterDistrict(''); }, [filterState]);

  // ── Filter helpers ──
  const applyFilters = (rows) => rows.filter(row => {
    if (filterState      && row.state      !== filterState)      return false;
    if (filterDistrict   && row.district   !== filterDistrict)   return false;
    if (filterDepartment && row.department !== filterDepartment) return false;
    return true;
  });

  const filteredBudgets     = applyFilters(budgets);
  const filteredAnomalies   = applyFilters(anomalies);
  const filteredPredictions = applyFilters(predictions);

  const filterLabel = [
    filterState      || 'All States',
    filterDistrict   ? `/ ${filterDistrict}` : '',
    filterDepartment ? `/ ${filterDepartment}` : '/ All Departments',
  ].join(' ');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Download handlers ──

  const downloadBudgetCSV = () => {
    setGenerating('budget-csv');
    const headers = ['Department','State','District','Month','Financial Year','Allocated (Cr)','Spent (Cr)','Utilization %'];
    const rows = filteredBudgets.map(b => [
      b.department, b.state, b.district, b.month, b.financial_year,
      Number(b.allocated_amount || 0).toFixed(2),
      Number(b.spent_amount || 0).toFixed(2),
      `${Number(b.utilization_percentage || 0).toFixed(1)}%`,
    ]);
    if (rows.length === 0) { showToast('No budget data matches your filters.'); setGenerating(''); return; }
    downloadFile(toCSV(headers, rows), `BudgetSetu_Budget_${Date.now()}.csv`, 'text/csv');
    showToast(`✓ Downloaded ${rows.length} budget records as CSV`);
    setGenerating('');
  };

  const downloadAnomalyCSV = () => {
    setGenerating('anomaly-csv');
    const headers = ['Department','State','District','Anomaly Detected','Score (0-100)','Severity','Explanation'];
    const rows = filteredAnomalies.map(a => [
      a.department, a.state, a.district,
      a.anomaly_detected ? 'YES' : 'NO',
      Math.round((a.anomaly_score || 0) * 100),
      a.severity,
      a.explanation,
    ]);
    if (rows.length === 0) { showToast('No anomaly data matches your filters.'); setGenerating(''); return; }
    downloadFile(toCSV(headers, rows), `BudgetSetu_Anomalies_${Date.now()}.csv`, 'text/csv');
    showToast(`✓ Downloaded ${rows.length} anomaly records as CSV`);
    setGenerating('');
  };

  const downloadPredictionCSV = () => {
    setGenerating('prediction-csv');
    const headers = ['Department','State','District','Financial Year','Allocated (Cr)','Projected (Cr)','Unused (Cr)','Risk Level','Suggestion'];
    const rows = filteredPredictions.map(p => [
      p.department, p.state, p.district, p.financial_year,
      p.allocated_amount, p.projected_spending, p.predicted_unused,
      p.risk_level, p.reallocation_suggestion,
    ]);
    if (rows.length === 0) { showToast('No prediction data matches your filters.'); setGenerating(''); return; }
    downloadFile(toCSV(headers, rows), `BudgetSetu_Predictions_${Date.now()}.csv`, 'text/csv');
    showToast(`✓ Downloaded ${rows.length} prediction records as CSV`);
    setGenerating('');
  };

  const downloadBudgetPDF = () => {
    setGenerating('budget-pdf');
    if (filteredBudgets.length === 0) { showToast('No budget data matches your filters.'); setGenerating(''); return; }

    const totalAlloc = filteredBudgets.reduce((s, b) => s + (Number(b.allocated_amount) || 0), 0);
    const totalSpent = filteredBudgets.reduce((s, b) => s + (Number(b.spent_amount)     || 0), 0);
    const avgUtil    = filteredBudgets.length
      ? (filteredBudgets.reduce((s, b) => s + (Number(b.utilization_percentage) || 0), 0) / filteredBudgets.length).toFixed(1)
      : 0;

    const summary = [
      `Total Records : ${filteredBudgets.length}`,
      `Total Allocated : Rs. ${totalAlloc.toFixed(1)} Cr`,
      `Total Spent     : Rs. ${totalSpent.toFixed(1)} Cr`,
      `Avg Utilization : ${avgUtil}%`,
      `Filter Applied  : ${filterLabel}`,
    ];

    const headers = ['Dept', 'State', 'District', 'Allocated Cr', 'Spent Cr', 'Util %', 'FY'];
    const rows = filteredBudgets.slice(0, 40).map(b => [
      b.department, b.state, b.district,
      Number(b.allocated_amount || 0).toFixed(1),
      Number(b.spent_amount || 0).toFixed(1),
      `${Number(b.utilization_percentage || 0).toFixed(1)}%`, b.financial_year,
    ]);

    const pdf = buildPDF('National Budget Summary Report', filterLabel, headers, rows, summary);
    downloadFile(pdf, `BudgetSetu_Budget_${Date.now()}.pdf`, 'application/pdf');
    showToast(`✓ Downloaded Budget PDF (${filteredBudgets.length} records)`);
    setGenerating('');
  };

  const downloadFullReportPDF = () => {
    setGenerating('full-pdf');
    const data = filteredBudgets.length > 0 ? filteredBudgets : budgets;
    if (data.length === 0) { showToast('No data available to generate report.'); setGenerating(''); return; }

    const totalAlloc  = data.reduce((s, b) => s + (Number(b.allocated_amount) || 0), 0);
    const totalSpent  = data.reduce((s, b) => s + (Number(b.spent_amount)     || 0), 0);
    const highAnomaly = (filteredAnomalies.length > 0 ? filteredAnomalies : anomalies)
      .filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL').length;
    const highRiskPred = (filteredPredictions.length > 0 ? filteredPredictions : predictions)
      .filter(p => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL').length;
    const totalUnused = (filteredPredictions.length > 0 ? filteredPredictions : predictions)
      .reduce((s, p) => s + (Number(p.predicted_unused) || 0), 0);

    const summary = [
      `Filter Applied        : ${filterLabel}`,
      `Budget Records        : ${data.length}`,
      `Total Allocated       : Rs. ${totalAlloc.toFixed(1)} Cr`,
      `Total Spent           : Rs. ${totalSpent.toFixed(1)} Cr`,
      `High/Critical Anomalies: ${highAnomaly}`,
      `High Risk Predictions : ${highRiskPred}`,
      `Total Predicted Unused: Rs. ${totalUnused.toFixed(1)} Cr`,
    ];

    const headers = ['Dept', 'State', 'District', 'Allocated', 'Spent', 'Util%', 'FY'];
    const rows = data.slice(0, 40).map(b => [
      b.department, b.state, b.district,
      `Rs.${Number(b.allocated_amount || 0).toFixed(1)}Cr`,
      `Rs.${Number(b.spent_amount || 0).toFixed(1)}Cr`,
      `${Number(b.utilization_percentage || 0).toFixed(1)}%`, b.financial_year,
    ]);

    const pdf = buildPDF('BudgetSetu — Full Financial Intelligence Report', filterLabel, headers, rows, summary);
    downloadFile(pdf, `BudgetSetu_FullReport_${Date.now()}.pdf`, 'application/pdf');
    showToast(`✓ Full report downloaded`);
    setGenerating('');
  };

  // ── UI helpers ──
  const filteredStates = Object.keys(INDIA_STATES_DISTRICTS)
    .filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));

  const resetFilters = () => {
    setFilterState(''); setFilterDistrict('');
    setFilterDepartment(''); setStateSearch('');
  };

  const statLabel = (n, label) => `${n} ${label}${n !== 1 ? 's' : ''}`;

  const reportCards = [
    {
      id:       'budget-pdf',
      title:    'Budget Summary Report',
      desc:     'Allocated vs spent overview with utilization rates. Filtered by your selection.',
      type:     'pdf',
      count:    filteredBudgets.length,
      onClick:  downloadBudgetPDF,
    },
    {
      id:       'budget-csv',
      title:    'Budget Data Export',
      desc:     'Raw budget records as CSV — import into Excel or any analytics tool.',
      type:     'csv',
      count:    filteredBudgets.length,
      onClick:  downloadBudgetCSV,
    },
    {
      id:       'anomaly-csv',
      title:    'AI Anomaly Log',
      desc:     'All anomaly detections with risk scores and severity levels as CSV.',
      type:     'csv',
      count:    filteredAnomalies.length,
      onClick:  downloadAnomalyCSV,
    },
    {
      id:       'prediction-csv',
      title:    'Lapse Prediction Export',
      desc:     'Fund lapse predictions with risk levels and reallocation suggestions as CSV.',
      type:     'csv',
      count:    filteredPredictions.length,
      onClick:  downloadPredictionCSV,
    },
  ];

  // ── Render ──
  return (
    <div className="page-container animate-fade-in">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: '#1a3d7c', color: '#fff', borderRadius: 10,
          padding: '12px 20px', fontSize: 14, fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div className="page-header mb-6">
        <h2 className="text-primary">Financial Reports</h2>
        <p className="text-muted">Generate and export official documentation filtered by state, district, and department.</p>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────── */}
      <Card className="mb-6">
        <div className="flex items-end gap-4" style={{ flexWrap: 'wrap' }}>

          {/* Searchable State */}
          <div style={{ flex: '1 1 200px', position: 'relative' }} ref={stateDropdownRef}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              State
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search state…"
                value={filterState || stateSearch}
                onChange={(e) => { setStateSearch(e.target.value); setFilterState(''); setShowStateDropdown(true); }}
                onFocus={() => setShowStateDropdown(true)}
                style={{ width: '100%', padding: '0.6rem 2rem 0.6rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', backgroundColor: 'var(--bg-main)', outline: 'none', boxSizing: 'border-box' }}
              />
              {filterState && (
                <button type="button" onClick={() => { setFilterState(''); setFilterDistrict(''); setStateSearch(''); }}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}>
                  ✕
                </button>
              )}
            </div>
            {showStateDropdown && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 200, overflowY: 'auto', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 100, margin: '2px 0 0', padding: 0, listStyle: 'none' }}>
                <li onClick={() => { setFilterState(''); setStateSearch(''); setShowStateDropdown(false); }}
                  style={{ padding: '0.55rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  All States
                </li>
                {filteredStates.map(state => (
                  <li key={state}
                    onClick={() => { setFilterState(state); setStateSearch(''); setShowStateDropdown(false); }}
                    style={{ padding: '0.55rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {state}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* District */}
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              District
            </label>
            <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} disabled={!filterState}
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', backgroundColor: filterState ? 'var(--bg-main)' : 'var(--bg-secondary)', outline: 'none', opacity: filterState ? 1 : 0.6 }}>
              <option value="">All Districts</option>
              {(INDIA_STATES_DISTRICTS[filterState] || []).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Department
            </label>
            <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', backgroundColor: 'var(--bg-main)', outline: 'none' }}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <Button variant="outline" onClick={resetFilters} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <RotateCcw size={15} /> Reset
          </Button>
        </div>

        {/* Active filter summary */}
        <div style={{ marginTop: 14, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>Active filter: </span>
          <strong>{filterLabel}</strong>
          <span style={{ marginLeft: 16, color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${statLabel(filteredBudgets.length, 'budget')} · ${statLabel(filteredAnomalies.length, 'anomaly')} · ${statLabel(filteredPredictions.length, 'prediction')}`}
          </span>
        </div>
      </Card>

      {/* ── Full Report Generator ─────────────────────────── */}
      <Card title="Full Intelligence Report (PDF)" className="mb-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="text-sm text-muted" style={{ marginBottom: 4 }}>
              Combines budget summary, anomaly stats, and lapse predictions into one PDF.
            </p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {loading ? 'Loading data…' : `${filteredBudgets.length || budgets.length} budget records · ${filteredAnomalies.length || anomalies.length} anomalies · ${filteredPredictions.length || predictions.length} predictions`}
            </p>
          </div>
          <Button variant="primary" onClick={downloadFullReportPDF} disabled={loading || generating === 'full-pdf'}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={16} />
            {generating === 'full-pdf' ? 'Generating…' : 'Download Full Report PDF'}
          </Button>
        </div>
      </Card>

      {/* ── Report Cards ──────────────────────────────────── */}
      <h3 className="text-lg mb-4" style={{ fontWeight: 600 }}>Individual Exports</h3>
      <div className="grid grid-cols-2 gap-6">
        {reportCards.map((rep) => (
          <Card key={rep.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className={`icon-wrapper ${rep.type === 'pdf' ? 'bg-alert-transparent text-alert' : 'bg-success-transparent text-success'}`}>
                  {rep.type === 'pdf' ? <FileText size={22} /> : <FileSpreadsheet size={22} />}
                </div>
                <div>
                  <h4 style={{ marginBottom: 4, fontSize: '0.95rem' }}>{rep.title}</h4>
                  <p className="text-sm text-muted" style={{ marginBottom: 6 }}>{rep.desc}</p>
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 999,
                    fontSize: 12, fontWeight: 600,
                    background: rep.count > 0 ? 'rgba(26,61,124,0.1)' : 'rgba(0,0,0,0.06)',
                    color: rep.count > 0 ? 'var(--primary)' : 'var(--text-muted)',
                  }}>
                    {loading ? '…' : `${rep.count} record${rep.count !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={rep.onClick}
                disabled={loading || generating === rep.id || rep.count === 0}
                style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
                <Download size={14} />
                {generating === rep.id ? 'Generating…' : rep.type.toUpperCase()}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}