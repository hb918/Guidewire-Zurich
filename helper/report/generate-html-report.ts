/**
 * generate-html-report.ts
 *
 * Post-run utility that creates  reports/HTML Reports/html-reports-index.html
 * listing every per-scenario HTML report that HTMLReporter generated.
 *
 * Run with: npm run report:html
 * Or via npm script:  npm run report:html
 */

const fs   = require('fs');
const path = require('path');

function generateHTMLReportIndex() {
  const htmlReportsDir = path.resolve(process.cwd(), 'reports', 'HTML Reports');

  if (!fs.existsSync(htmlReportsDir)) {
    console.log('[report-index] HTML Reports directory not found – nothing to index.');
    fs.mkdirSync(htmlReportsDir, { recursive: true });
    return;
  }

  const htmlReports = fs.readdirSync(htmlReportsDir)
    .filter(f => f.endsWith('.html') && f !== 'html-reports-index.html')
    .map(f => ({
      name: f,
      href: f,                                                  // same directory
      time: fs.statSync(path.join(htmlReportsDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  const cardsHtml = htmlReports.length === 0
    ? '<p class="no-reports">No reports found yet. Run your tests first.</p>'
    : htmlReports.map(r => {
        const date        = new Date(r.time).toLocaleString();
        const displayName = r.name.replace('.html', '');
        return `
      <div class="report-card">
        <a href="${r.href}" class="report-link">${displayName}</a>
        <div class="report-date">Generated: ${date}</div>
      </div>`;
      }).join('');

  const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>HTML Test Reports – Index</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; }
    h1   { color: #1a365d; margin-bottom: 20px; }
    .reports-container { display: flex; flex-direction: column; gap: 10px; }
    .report-card {
      background: #fff; border-radius: 4px; padding: 14px 18px;
      box-shadow: 0 1px 3px rgba(0,0,0,.1); transition: transform .15s;
    }
    .report-card:hover { transform: translateY(-2px); box-shadow: 0 3px 6px rgba(0,0,0,.15); }
    .report-link  { color: #007bff; text-decoration: none; font-size: 15px; display: block; }
    .report-link:hover { text-decoration: underline; }
    .report-date  { color: #666; font-size: 13px; margin-top: 4px; }
    .no-reports   { color: #888; font-style: italic; }
  </style>
</head>
<body>
  <h1>HTML Test Reports</h1>
  <div class="reports-container">
    ${cardsHtml}
  </div>
</body>
</html>`;

  const indexPath = path.join(htmlReportsDir, 'html-reports-index.html');
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`[report-index] Index written → ${indexPath}  (${htmlReports.length} report(s) listed)`);
}

generateHTMLReportIndex();
