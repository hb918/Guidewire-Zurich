const fs   = require('fs');
const path = require('path');

type StepStatus = 'PASSED' | 'FAILED';

interface ReportStep {
  name: string;
  status: StepStatus;
  timestamp: string;
  value: string;
  screenshotData: string;
  comment: string;
}

/**
 * HTMLReporter – builds a clean per-scenario HTML execution report.
 *
 * Usage (inside Cucumber hooks):
 *   const reporter = new HTMLReporter('features/001-PolicyCenter.feature');
 *   reporter.setScenarioName(scenario.pickle.name);
 *   reporter.setFeatureName('Create a Zurich Engineering submission');
 *   reporter.setStartTime(new Date());
 *   // … run steps …
 *   reporter.setEndTime(new Date());
 *   await reporter.saveReport();
 */
class HTMLReporter {
  steps: ReportStep[];
  scenarioName: string;
  featureName: string;
  startTime: Date;
  endTime: Date;
  recordingPath: string;
  featureFileName: string;
  reportPath: string;

  constructor(featureFilePath = '') {
    this.steps        = [];
    this.scenarioName = '';
    this.featureName  = '';
    this.startTime    = new Date();
    this.endTime      = new Date();
    this.recordingPath = '';

    // Derive file name → reports/HTML Reports/<feature>.html
    if (featureFilePath) {
      const parts    = featureFilePath.split(/[/\\]/);
      const fileName = parts[parts.length - 1].replace(/\.feature$/, '');
      this.featureFileName = fileName;
    } else {
      this.featureFileName = 'report';
    }

    this.reportPath = path.join('reports', 'HTML Reports', `${this.featureFileName}.html`);
    this._trySetLatestVideo();
  }

  // ── Setters ───────────────────────────────────────────────────────────────

  setScenarioName(name: string)   { this.scenarioName  = name; }
  setFeatureName(name: string)    { this.featureName   = name; }
  setStartTime(time: Date)        { this.startTime     = time; }
  setEndTime(time: Date)          { this.endTime       = time; }

  setRecordingPath(videoPath: string) {
    try {
      if (videoPath && videoPath.trim()) {
        this.recordingPath = path.resolve(videoPath);
      } else {
        this._trySetLatestVideo();
      }
    } catch (e) {
      console.error('Error setting video path:', e);
    }
  }

  // ── Step recording ────────────────────────────────────────────────────────

  /**
   * Add a step result to the report.
   * @param {string} stepName
   * @param {'PASSED'|'FAILED'} status
   * @param {string} [action]       - kept for API compat, not shown in table
   * @param {string} [value]        - data value extracted from step
   * @param {string} [comment]      - inline comment / error message
   * @param {string} [screenshotData] - base64 PNG
   */
  addStep(
    stepName: string,
    status: StepStatus,
    action = '',
    value = '',
    comment = '',
    screenshotData = ''
  ) {
    if (status !== 'PASSED' && status !== 'FAILED') return;
    this.steps.push({
      name:           stepName  || '',
      status,
      timestamp:      new Date().toLocaleTimeString('en-US', { hour12: false }),
      value:          value     || '',
      comment:        comment   || '',
      screenshotData: screenshotData || ''
    });
  }

  /** Attach base64 screenshot to the most-recently added step */
  addScreenshotToLastStep(screenshotData: string) {
    if (this.steps.length > 0) {
      this.steps[this.steps.length - 1].screenshotData = screenshotData;
    }
  }

  /** Append a logger message to the most-recently added step's comment */
  addCommentToLastStep(comment: string) {
    if (this.steps.length > 0) {
      const last = this.steps[this.steps.length - 1];
      last.comment = last.comment ? `${last.comment}\n${comment}` : comment;
    }
  }

  /** Replace the description of the most-recently added step */
  updateLastStepName(name: string) {
    if (this.steps.length > 0 && name) {
      this.steps[this.steps.length - 1].name = name;
    }
  }

  // ── Report generation ─────────────────────────────────────────────────────

  _getOverallStatus(): StepStatus {
    return this.steps.some(s => s.status === 'FAILED') ? 'FAILED' : 'PASSED';
  }

  _trySetLatestVideo(): void {
    try {
      const videosDir = path.resolve(process.cwd(), 'reports', 'videos');
      if (!fs.existsSync(videosDir)) return;
      const files = fs.readdirSync(videosDir)
        .filter(f => f.endsWith('.webm'))
        .map(f => ({ name: f, time: fs.statSync(path.join(videosDir, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);
      if (files.length > 0) {
        this.recordingPath = path.join(videosDir, files[0].name);
      }
    } catch (e) { /* ignore */ }
  }

  generateReport(): string {
    const overallStatus      = this._getOverallStatus();
    const executionDate      = this.startTime.toISOString().split('T')[0];
    const executionStartTime = this.startTime.toLocaleTimeString('en-US', { hour12: false });
    const duration           = Math.ceil((this.endTime.getTime() - this.startTime.getTime()) / 1000);

    const stepsHtml = this.steps.map((step, i) => {
      const commentClass = step.status === 'FAILED' ? 'failed-comment' : '';
      const screenshotCell = step.screenshotData
        ? `<a class="view-image-link" href="javascript:void(0)"
             onclick="showScreenshot('data:image/png;base64,${step.screenshotData}')">View Screenshot</a>`
        : 'N/A';
      const valueDisplay = step.value
        ? step.value.toString().replace(/\n/g, '<br>')
        : '-';
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(step.name)}</td>
          <td class="value-cell">${valueDisplay}</td>
          <td><span class="status-badge ${step.status.toLowerCase()}">${step.status}</span></td>
          <td>${screenshotCell}</td>
          <td class="comments-cell ${commentClass}">${escapeHtml(step.comment) || 'NA'}</td>
          <td>${step.timestamp}</td>
        </tr>`;
    }).join('');

    const videoSection = this.recordingPath
      ? `<div class="recording-section">
           <video width="640" height="360" controls>
             <source src="../videos/${path.basename(this.recordingPath)}" type="video/webm">
             Your browser does not support the video tag.
           </video>
           <br/>
           <a href="../videos/${path.basename(this.recordingPath)}" class="recording-link" target="_blank">
             ▶ Download Test Recording
           </a>
         </div>`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Test Execution Report – ${escapeHtml(this.featureFileName)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body  { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    /* ── Header ── */
    .header { background: #1a365d; color: #fff; padding: 20px; margin: -20px -20px 20px; }
    .header h1 { margin: 0 0 16px; font-size: 22px; font-weight: normal; text-align: center; }
    .execution-info { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
    .execution-badge { padding: 4px 10px; border-radius: 3px; font-size: 12px; }
    .date-badge { background: #4CAF50; }
    .time-badge { background: #f44336; }
    .test-details { background: rgba(255,255,255,.1); border-radius: 4px; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
    .detail-item  { display: flex; align-items: center; gap: 10px; }
    .detail-label { font-weight: 500; min-width: 110px; }
    /* ── Status badges ── */
    .status-badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: 600; }
    .passed { background: #4CAF50; color: #fff; }
    .failed { background: #f44336; color: #fff; }
    /* ── Table ── */
    .step-table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.1); margin-top: 4px; }
    .step-table th, .step-table td { padding: 10px 12px; text-align: left; border: 1px solid #ddd; font-size: 13px; }
    .step-table th { background: #f8f9fa; font-weight: 600; }
    .step-table tr:nth-child(even) { background: #fafafa; }
    .value-cell    { max-width: 250px; white-space: pre-wrap; word-break: break-word; }
    .comments-cell { max-width: 300px; color: #555; white-space: pre-wrap; }
    .failed-comment { color: #c62828; }
    /* ── Screenshot modal ── */
    .view-image-link { color: #007bff; text-decoration: none; cursor: pointer; }
    .view-image-link:hover { text-decoration: underline; }
    #screenshot-modal { display: none; position: fixed; z-index: 1000; inset: 0; background: rgba(0,0,0,.88); }
    .modal-content   { display: block; max-width: 90%; max-height: 90%; position: relative; top: 50%; left: 50%; transform: translate(-50%,-50%); }
    .modal-close     { position: absolute; right: 20px; top: 8px; color: #fff; font-size: 38px; font-weight: bold; cursor: pointer; line-height: 1; }
    /* ── Footer ── */
    .executed-info    { margin-top: 18px; text-align: center; color: #555; font-size: 13px; }
    .execution-summary { margin-bottom: 10px; }
    .summary-item  { font-weight: 500; color: #333; }
    .separator     { margin: 0 10px; color: #999; }
    .recording-section { margin-top: 14px; }
    .recording-link { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;
                      background: #007bff; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 500; margin-top: 8px; }
    .recording-link:hover { background: #0056b3; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Test Execution Report</h1>
    <div class="execution-info">
      <span class="execution-badge date-badge">Execution date: ${executionDate}</span>
      <span class="execution-badge time-badge">Execution start time: ${executionStartTime}</span>
    </div>
    <div class="test-details">
      <div class="detail-item">
        <span class="detail-label">Status:</span>
        <span class="status-badge ${overallStatus.toLowerCase()}">${overallStatus}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Feature file:</span>
        <span>${escapeHtml(this.featureName)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Scenario:</span>
        <span>${escapeHtml(this.scenarioName)}</span>
      </div>
    </div>
  </div>

  <table class="step-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>Value</th>
        <th>Status</th>
        <th>Screenshot</th>
        <th>Comments</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      ${stepsHtml}
    </tbody>
  </table>

  <div class="executed-info">
    <div class="execution-summary">
      <span class="summary-item">Executed steps: ${this.steps.length}</span>
      <span class="separator">|</span>
      <span class="summary-item">Test duration: ${duration}s</span>
    </div>
    ${videoSection}
  </div>

  <!-- Screenshot modal -->
  <div id="screenshot-modal" onclick="if(event.target===this)closeModal()">
    <span class="modal-close" onclick="closeModal()">&times;</span>
    <img class="modal-content" id="modal-img" src="" alt="screenshot"/>
  </div>

  <script>
    function showScreenshot(src) {
      document.getElementById('modal-img').src = src;
      document.getElementById('screenshot-modal').style.display = 'block';
    }
    function closeModal() {
      document.getElementById('screenshot-modal').style.display = 'none';
    }
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });
  </script>
</body>
</html>`;
  }

  async saveReport(): Promise<void> {
    try {
      const dir = path.dirname(this.reportPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Refresh video reference right before saving
      this._trySetLatestVideo();

      fs.writeFileSync(this.reportPath, this.generateReport(), 'utf8');
      console.log(`[HTMLReporter] Report saved → ${this.reportPath}`);
    } catch (err) {
      console.error('[HTMLReporter] Failed to save report:', err);
    }
  }
}

// ── tiny HTML-escape helper ────────────────────────────────────────────────
function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

module.exports = { HTMLReporter };
