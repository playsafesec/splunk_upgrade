# GitHub Pages Deployment

This repository is configured to automatically deploy the Splunk Upgrade Dashboard to GitHub Pages.

## 🌐 Dashboard URL

Once deployed, your dashboard will be available at:
```
https://playsafesec.github.io/splunk_upgrade/
```

## 🚀 Automatic Deployment

The dashboard is automatically deployed to GitHub Pages when:
- You push changes to the `dashboard/` folder
- You push new logs to the `logs/` folder
- You manually trigger the workflow

## 📝 Setup Instructions

### 1. Enable GitHub Pages (One-Time Setup)

1. Go to your repository on GitHub: `https://github.com/playsafesec/splunk_upgrade`
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Click **Save**

### 2. Trigger First Deployment

After enabling GitHub Pages, trigger the deployment:

**Option A: Push to main** (automatic)
```bash
git add .github/workflows/deploy-dashboard.yml
git commit -m "Add GitHub Pages deployment workflow"
git push
```

**Option B: Manual trigger**
1. Go to **Actions** tab
2. Click **Deploy Dashboard to GitHub Pages**
3. Click **Run workflow** → **Run workflow**

### 3. Access Your Dashboard

After deployment completes (usually 1-2 minutes):
- Visit: `https://playsafesec.github.io/splunk_upgrade/`
- Bookmark it for easy access!

## 🔄 How It Works

1. **Trigger**: Workflow runs on push to `main` branch
2. **Build**: Copies `dashboard/` and `logs/` to deployment directory
3. **Deploy**: Publishes to GitHub Pages
4. **Live**: Dashboard is accessible at the GitHub Pages URL

## 📊 What Gets Deployed

- `dashboard/index.html` - Main dashboard page
- `dashboard/dashboard.css` - Styling
- `dashboard/dashboard.js` - Functionality
- `logs/*.json` - All workflow run logs

## ⚡ Live Updates

Every time you commit:
- New workflow logs are automatically deployed
- Dashboard updates with latest run data
- No manual deployment needed!

## 🔍 Monitoring Deployment

1. Go to **Actions** tab in your repository
2. Click on the latest **Deploy Dashboard to GitHub Pages** workflow
3. Check deployment status and URL in the job output

## 🎯 Best Practices

1. **Keep logs clean**: Archive old logs periodically
2. **Test locally first**: Use `python3 -m http.server` to test changes
3. **Monitor deployments**: Check Actions tab if dashboard doesn't update
4. **Use custom domain**: Optional - configure in Settings → Pages

## 🐛 Troubleshooting

### Dashboard not updating
- Check Actions tab for deployment status
- Ensure GitHub Pages is enabled in Settings
- Clear browser cache and hard reload (Ctrl+Shift+R)

### 404 Error
- Verify GitHub Pages source is set to "GitHub Actions"
- Wait 1-2 minutes after first deployment
- Check repository is public or you have access

### Logs not appearing
- Ensure logs are committed to the repository
- Check `logs/` directory contains `.json` files
- Verify workflow logs are being generated

## 📞 Support

For issues or questions:
1. Check workflow logs in Actions tab
2. Review this documentation
3. Check GitHub Pages settings
