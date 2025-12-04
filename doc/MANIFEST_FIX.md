# Dashboard Data Loading Fix

## 🔍 Issue
Dashboard deployed to GitHub Pages showed "No workflow runs found" even though log files existed in the repository.

## 🎯 Root Cause
The dashboard JavaScript was trying to read directory listing (`fetch('../logs/')`) which **doesn't work on GitHub Pages** because:
- GitHub Pages doesn't support directory indexing
- Browser cannot parse HTML directory listings from a CDN

## ✅ Solution: Manifest File Approach

Created a manifest-based system similar to how CSV data is handled in other GitHub Pages sites.

### Components Created:

#### 1. **Manifest Generation Script**
[`scripts/generate_manifest.sh`](file:///Users/asimakram/Desktop/Asim/Splunk%20Projects/WK/splunk_upgrade/scripts/generate_manifest.sh)

- Scans `logs/` directory for JSON files
- Creates `dashboard/logs-manifest.json` with list of all log files
- Auto-generated during workflow execution

**Example manifest:**
```json
[
  "run_20251204_155300_sample.json",
  "run_20251204_185500.json",
  "run_20251205_002100.json"
]
```

#### 2. **Updated Dashboard JavaScript**
[`dashboard/dashboard.js`](file:///Users/asimakram/Desktop/Asim/Splunk%20Projects/WK/splunk_upgrade/dashboard/dashboard.js)

**Before (Broken):**
```javascript
// ❌ Doesn't work on GitHub Pages
const response = await fetch('../logs/');
const text = await response.text();
const parser = new DOMParser();
const doc = parser.parseFromString(text, 'text/html');
const links = Array.from(doc.querySelectorAll('a'))...
```

**After (Fixed):**
```javascript
// ✅ Works on GitHub Pages
const manifestResponse = await fetch('logs-manifest.json');
const logFiles = await manifestResponse.json();

const logPromises = logFiles.map(async (file) => {
    const logResponse = await fetch(`../logs/${file}`);
    return await logResponse.json();
});
```

#### 3. **Updated Workflow**
[`.github/workflows/splunk-upgrade.yml`](file:///Users/asimakram/Desktop/Asim/Splunk%20Projects/WK/splunk_upgrade/.github/workflows/splunk-upgrade.yml)

Added manifest generation step:
```yaml
- name: Generate Logs Manifest
  run: |
    echo "📝 Generating logs manifest for dashboard..."
    bash scripts/generate_manifest.sh

- name: Commit and Push Logs
  run: |
    git add logs/
    git add dashboard/logs-manifest.json  # ✅ Include manifest
    git commit -m "📊 Add workflow run logs"
    git push
```

---

## 🧪 Testing Steps

### Local Testing:
```bash
# Generate manifest
./scripts/generate_manifest.sh

# Check manifest created
cat dashboard/logs-manifest.json

# Start local server
cd dashboard
python3 -m http.server 8000

# Open http://localhost:8000
# Dashboard should now show data!
```

### After Deploying:
1. Commit and push changes
2. Run a workflow
3. Check GitHub Pages dashboard
4. Should show all workflow runs!

---

## 📊 How It Works

```mermaid
graph LR
    A[Workflow Runs] --> B[Generate Log JSON]
    B --> C[Run generate_manifest.sh]
    C --> D[Create logs-manifest.json]
    D --> E[Commit Both Files]
    E --> F[Push to GitHub]
    F --> G[GitHub Pages Deploys]
    G --> H[Dashboard Loads]
    H --> I[Fetch manifest]
    I --> J[Fetch each log file]
    J --> K[Display Data]
```

---

## ✅ Benefits

1. **GitHub Pages Compatible**: No directory listing needed
2. **Fast Loading**: Parallel fetch of all log files
3. **Simple**: Just a JSON array of filenames
4. **Automatic**: Regenerated on every workflow run
5. **Scalable**: Works with any number of log files

---

## 🔄 Workflow Changes Summary

| Step | Before | After |
|------|--------|-------|
| **Dashboard Load** | `fetch('../logs/')` directory | `fetch('logs-manifest.json')` |
| **File Discovery** | Parse HTML directory | Read JSON array |
| **File Fetching** | Based on parsed links | Based on manifest list |
| **Workflow** | Commit logs only | Commit logs + manifest |
| **GitHub Pages** | ❌ Broken | ✅ Working |

---

## 📝 Files Modified

1. **Created**: `scripts/generate_manifest.sh`
2. **Modified**: `dashboard/dashboard.js`
3. **Modified**: `.github/workflows/splunk-upgrade.yml`
4. **Auto-Generated**: `dashboard/logs-manifest.json`

---

## 🚀 Next Steps

1. **Commit changes**:
   ```bash
   ./update_github.sh
   # Message: "Fix dashboard loading with manifest file"
   ```

2. **Test locally** (optional):
   ```bash
   cd dashboard
   python3 -m http.server 8000
   # Visit http://localhost:8000
   ```

3. **Deploy and verify**:
   - Changes auto-deploy to GitHub Pages
   - Dashboard should now show all workflow runs!

---

## 💡 Why This Approach?

This is the same pattern used by many static sites on GitHub Pages:
- ✅ CSV data files with index
- ✅ JSON APIs with manifest
- ✅ Static site generators with metadata files

Examples:
- User's other repo: https://github.com/asimchamp/asimchamp.github.io/tree/main/assets
- Common pattern for GitHub Pages data consumption

---

**Status**: ✅ Fixed and ready to deploy!
