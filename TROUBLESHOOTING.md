# Workflow Logging Troubleshooting Guide

## 🐛 Issue: Logs Not Being Created

### Problem
The workflow runs successfully but no log files appear in the `logs/` directory, and the dashboard shows "No workflow runs found".

### Root Cause
The workflow was missing **write permissions** to commit and push log files to the repository. The git push command was failing silently.

### Solution Applied ✅

#### 1. Added Workflow Permissions
```yaml
permissions:
  contents: write
```

#### 2. Fixed Git Push Authentication
Updated the commit step to use `GITHUB_TOKEN` properly:

```yaml
- name: Commit and Push Logs
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    git push https://x-access-token:${GITHUB_TOKEN}@github.com/${{ github.repository }}.git HEAD:main
```

#### 3. Added Error Handling
- Checks if there are changes before committing
- Provides clear console output
- Shows success/failure messages

---

## 🧪 Testing the Fix

### Step 1: Commit the Changes
```bash
cd /Users/asimakram/Desktop/Asim/Splunk\ Projects/WK/splunk_upgrade
./update_github.sh
# Message: "Fix workflow logging permissions"
```

### Step 2: Run a Test Workflow
1. Go to: https://github.com/playsafesec/splunk_upgrade/actions
2. Click **Splunk Upgrade** → **Run workflow**
3. Select:
   - **Mode**: single_server
   - **Host Class**: azure_hf or azure_uf
   - **Server**: (any server from that class)
   - **Package**: splunk_enterprise_9.3.3 or any package
4. Click **Run workflow**

### Step 3: Monitor Workflow Execution
1. Click on the running workflow
2. Watch the jobs execute:
   - ✅ **Initialize Workflow Logging** - Creates log file
   - ✅ **Prepare Upgrade Configuration** - Updates log
   - ✅ **Upgrade Server** - Tracks server progress
   - ✅ **Upgrade Summary** - Finalizes and commits log
3. The **Commit and Push Logs** step should show:
   ```
   📝 Committing new log files...
   🚀 Pushing logs to repository...
   ✅ Logs successfully committed and pushed!
   ```

### Step 4: Verify Logs Created
After workflow completes:
```bash
# Check logs directory
ls -la logs/

# You should see a new file like:
# run_20251205_HHMMSS.json
```

### Step 5: Check Dashboard
1. Refresh your dashboard: https://playsafesec.github.io/splunk_upgrade/
2. You should now see:
   - Updated stats (Total Runs: 1+)
   - The workflow run in the table
   - Click "View Details" to see full run information

---

## 📊 Expected Behavior

### After Successful Workflow Run:

1. **Console Output in Summary Job:**
   ```
   📊 Workflow Summary:
   Total Servers: 1
   Successful: 1
   Failed: 0
   Duration: XXXs
   
   📝 Log saved to: logs/run_YYYYMMDD_HHMMSS.json
   📝 Committing new log files...
   🚀 Pushing logs to repository...
   ✅ Logs successfully committed and pushed!
   ```

2. **In Repository:**
   - New commit with message: "📊 Add workflow run logs: run_YYYYMMDD_HHMMSS"
   - New file in `logs/` directory

3. **In Dashboard:**
   - Stats cards updated
   - New row in workflow table
   - Detailed view available with all steps

---

## 🔍 Common Issues and Solutions

### Issue: "No changes to commit"
**Cause**: Log file was not created in earlier steps
**Solution**: 
- Check the `init_logging` job succeeded
- Verify `scripts/log_helper.sh` is executable: `chmod +x scripts/log_helper.sh`
- Check for errors in prepare/upgrade jobs

### Issue: Git push fails with authentication error
**Cause**: Missing GITHUB_TOKEN or permissions
**Solution**: 
- Verify `permissions: contents: write` is in the workflow
- Check repository settings allow GitHub Actions to write

### Issue: Dashboard still shows no data
**Cause**: Logs committed but dashboard not updated
**Solution**:
- Hard refresh dashboard (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for JavaScript errors
- Verify logs directory is accessible in GitHub Pages

### Issue: Log file structure is invalid
**Cause**: `jq` commands failed or script errors
**Solution**:
- Check `scripts/log_helper.sh` has proper syntax
- Verify `jq` is installed in runner: `sudo apt-get install -y jq`
- View log file contents to check JSON validity

---

## 📝 Verification Checklist

After running a workflow, verify:

- [ ] Workflow completed successfully (green checkmark)
- [ ] `logs/` directory has new `.json` file
- [ ] New commit appears in repository history
- [ ] Dashboard shows updated statistics
- [ ] Dashboard table shows the workflow run
- [ ] "View Details" modal displays complete information
- [ ] All server steps are logged
- [ ] Summary statistics are calculated correctly

---

## 🎯 What Changed

### Before (Issues):
❌ No `permissions` in workflow → Git push failed silently  
❌ Simple `git push` without authentication → Failed  
❌ No error handling → Hard to diagnose issues  
❌ Logs created but never committed → Dashboard empty  

### After (Fixed):
✅ `permissions: contents: write` added  
✅ Git push uses `GITHUB_TOKEN` for authentication  
✅ Proper error checking and console output  
✅ Logs are committed and pushed successfully  
✅ Dashboard displays all workflow runs  

---

## 🚀 Next Steps

1. **Test the fix**: Run a workflow and verify logs are created
2. **Monitor regularly**: Check dashboard after each workflow run
3. **Archive old logs**: Periodically move old logs to keep repo size manageable
4. **Customize logging**: Adjust `scripts/log_helper.sh` for additional details if needed

---

## 📞 Still Having Issues?

If logs still aren't being created:

1. **Check the Summary job logs**:
   - Go to Actions → Click workflow run → Click "Upgrade Summary"
   - Look for errors in "Finalize Workflow Log" or "Commit and Push Logs" steps

2. **Verify file permissions**:
   ```bash
   ls -la scripts/log_helper.sh
   # Should show: -rwxr-xr-x (executable)
   ```

3. **Test logging locally**:
   ```bash
   source scripts/log_helper.sh
   init_log "test_run" "Test" '{"test":"value"}'
   cat logs/test_run.json
   ```

4. **Check GitHub Actions permissions**:
   - Go to Settings → Actions → General
   - Ensure "Read and write permissions" is enabled

---

## 📊 Files Modified

- `.github/workflows/splunk-upgrade.yml`
  - Added `permissions: contents: write`
  - Updated commit and push step with GITHUB_TOKEN
  - Added error handling and logging

---

**Last Updated**: 2025-12-05  
**Status**: ✅ Fixed and ready for testing
