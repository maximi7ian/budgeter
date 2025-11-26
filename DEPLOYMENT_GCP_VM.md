# Deploying 'Budgeter' on GCP Compute Engine (Always-On VM)

This guide covers deploying Budgeter on a **single GCP VM** using the free tier. This approach is specifically designed for **personal, single-user use** where you want the built-in cron scheduling to work without external Cloud Scheduler or serverless complexity.

**Why use a VM instead of Cloud Run?**
- The app's `node-cron` scheduler just works when the process runs 24/7
- No need for Cloud Scheduler, volume mounts, or cold-start handling
- Simpler secrets management (`.env` on disk vs Secret Manager)
- Lower cognitive load for a personal project

**Prerequisites:**
- You've completed the main [README.md](README.md) local setup
- You have a GCP account with billing enabled (free tier is sufficient)
- You've created `.env` and `gcp-service-account.json` locally with your real credentials

---

## Table of Contents

1. [Create the VM (Compute Engine)](#1-create-the-vm-compute-engine)
2. [Install Node.js and Clone the Repository](#2-install-nodejs-and-clone-the-repository)
3. [Transfer Configuration & Secrets](#3-transfer-configuration--secrets)
4. [Build and Start the Application](#4-build-and-start-the-application)
5. [Monitoring & Alerts (Free Tier)](#5-monitoring--alerts-free-tier)
6. [Optional: Nginx Reverse Proxy + HTTPS](#6-optional-nginx-reverse-proxy--https)
7. [Maintenance & Updates](#7-maintenance--updates)
8. [Security & Future Hardening](#8-security--future-hardening)

---

## 1. Create the VM (Compute Engine)

### 1.1 Choose a Free Tier Region

GCP offers an **f1-micro** (or **e2-micro** in some regions) instance for free in the following regions:
- `us-west1` (Oregon)
- `us-central1` (Iowa)
- `us-east1` (South Carolina)

Check the [current free tier documentation](https://cloud.google.com/free/docs/free-cloud-features#compute) for the latest eligible SKUs and regions.

### 1.2 Create the VM via gcloud CLI

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create an e2-micro VM in a free tier region
gcloud compute instances create budgeter-vm \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-standard \
  --tags=http-server \
  --metadata=startup-script='#!/bin/bash; apt-get update -y'
```

**Notes:**
- **Machine type**: Use `e2-micro` or `f1-micro` (check your region's free tier eligibility)
- **Disk**: 20GB is sufficient for Node.js + dependencies (30GB is the free tier limit)
- **Image**: Ubuntu 22.04 LTS (or Debian 11+ if you prefer)
- **Tags**: `http-server` tag allows HTTP traffic (we'll configure firewall next)

### 1.3 Configure Firewall Rules

Allow HTTP traffic to port 3000 (or 80 if using Nginx):

```bash
# Allow traffic on port 3000 (Node.js app)
gcloud compute firewall-rules create allow-budgeter \
  --allow=tcp:3000 \
  --target-tags=http-server \
  --description="Allow traffic to Budgeter app on port 3000"

# Optional: Allow port 80 if using Nginx
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --target-tags=http-server \
  --description="Allow HTTP traffic"

# Optional: Allow port 443 for HTTPS
gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 \
  --target-tags=http-server \
  --description="Allow HTTPS traffic"
```

### 1.4 Get the VM's External IP

```bash
gcloud compute instances describe budgeter-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

Save this IP address - you'll use it to access the app and transfer files.

---

## 2. Install Node.js and Clone the Repository

### 2.1 SSH into the VM

```bash
gcloud compute ssh budgeter-vm --zone=us-central1-a
```

### 2.2 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Install Node.js 18+ (via NodeSource)

```bash
# Download and run NodeSource setup script for Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x or higher
npm --version
```

### 2.4 Install Git and PM2

```bash
# Install git
sudo apt install -y git

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Verify PM2 installation
pm2 --version
```

### 2.5 Clone the Budgeter Repository

```bash
cd ~
git clone https://github.com/maximi7ian/budgeter.git
cd budgeter
```

### 2.6 Install Dependencies and Build

```bash
# Install npm dependencies
npm install

# Build TypeScript to JavaScript (creates dist/ folder)
npm run build

# Verify build succeeded
ls -la dist/
```

You should see `dist/server.js` and other compiled files.

---

## 3. Transfer Configuration & Secrets

**⚠️ SECURITY NOTE**: This approach involves copying secrets directly to the VM via `scp`. This is **acceptable only for personal, single-user projects** where:
- The repo's `.gitignore` prevents secrets from being committed (already configured)
- You control the VM and understand the security implications
- This is not a team project or public service

**For anything beyond personal use**, switch to:
- GCP Secret Manager + Workload Identity
- SSH key-only access (disable password auth)
- Encrypted environment variables + IAM policies

### 3.1 Prepare Secrets Locally

On your **local machine** (not the VM), ensure you have:

1. **`.env`** - Based on [.env.example](.env.example), with real values

2. **`gcp-service-account.json`** - Your Google Cloud service account key (if using Sheets)

3. **Update `TL_REDIRECT_URI`**: Replace `YOUR_VM_IP` with the external IP from Step 1.4

   **⚠️ IMPORTANT**: You must also update this redirect URI in the [TrueLayer Console](https://console.truelayer.com/) under your app's settings!

### 3.2 Copy Files to VM

From your **local machine** terminal (not SSH session):

```bash
# Set variables
VM_IP="YOUR_VM_EXTERNAL_IP"  # From Step 1.4
VM_USER="YOUR_GCP_USERNAME"  # Usually your Gmail username

# Copy .env
scp .env ${VM_USER}@${VM_IP}:~/budgeter/.env

# Copy Google service account key (if using Sheets)
scp gcp-service-account.json ${VM_USER}@${VM_IP}:~/budgeter/gcp-service-account.json

# If you have a custom financial-advisor-prompt.txt
scp financial-advisor-prompt.txt ${VM_USER}@${VM_IP}:~/budgeter/financial-advisor-prompt.txt
```

**Example**:
```bash
scp .env myemail@35.123.45.67:~/budgeter/.env
scp gcp-service-account.json myemail@35.123.45.67:~/budgeter/gcp-service-account.json
```

### 3.3 Secure File Permissions

Back in your SSH session on the VM:

```bash
cd ~/budgeter

# Restrict permissions on sensitive files
chmod 600 .env
chmod 600 gcp-service-account.json

# Verify
ls -la .env gcp-service-account.json
```

You should see `-rw-------` (owner read/write only).

---

## 4. Build and Start the Application

### 4.1 Test the App Manually

```bash
cd ~/budgeter

# Quick test in production mode
npm start
```

You should see:
```
🔐 Authentication enabled
   Admin email: your@email.com

============================================================
🚀 TrueLayer Transaction Aggregator
============================================================

🌐 Server: http://localhost:3000
📦 Mode: LIVE
🌍 Timezone: Europe/London

✅ Weekly alerts scheduled: 0 9 * * 1
✅ Monthly alerts scheduled: 0 9 1 * *
```

**Test the app**:
1. Open `http://YOUR_VM_IP:3000` in a browser
2. Log in with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. Verify the homepage loads

**Stop the test** (Ctrl+C) - we'll use PM2 to keep it running permanently.

### 4.2 Start with PM2 (Production)

PM2 will:
- Keep the app running 24/7
- Auto-restart on crashes
- Auto-start on VM reboot
- Provide logs and monitoring

```bash
cd ~/budgeter

# Start the app with PM2
pm2 start dist/server.js --name budgeter

# View status
pm2 status

# View logs
pm2 logs budgeter --lines 50

# Save PM2 process list (so it persists across reboots)
pm2 save

# Generate startup script (runs PM2 on boot)
pm2 startup

# ⚠️ IMPORTANT: The above command will print a command like:
#   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u yourusername --hp /home/yourusername
# Copy and run that exact command!
```

**Example output**:
```
[PM2] Spawning PM2 daemon
[PM2] PM2 Successfully daemonized
┌────┬────────────┬─────────┬─────────┬──────────┐
│ id │ name       │ status  │ restart │ uptime   │
├────┼────────────┼─────────┼─────────┼──────────┤
│ 0  │ budgeter   │ online  │ 0       │ 0s       │
└────┴────────────┴─────────┴─────────┴──────────┘
```

### 4.3 Verify Cron Scheduling

Check the logs to confirm cron jobs are scheduled:

```bash
pm2 logs budgeter --lines 100 | grep -i "scheduled"
```

You should see:
```
✅ Weekly alerts scheduled: 0 9 * * 1
✅ Monthly alerts scheduled: 0 9 1 * *
```

**What happens now:**
- Every Monday at 9:00 AM (UK time), the app will fetch transactions and send a weekly email
- Every 1st of the month at 9:00 AM, it will send a monthly email
- The app will keep running continuously, handling OAuth token refreshes automatically

### 4.4 Test Email Alerts Manually (Optional)

You can trigger an immediate alert without waiting for the cron schedule:

```bash
# From your local machine or VM terminal
curl -X POST http://YOUR_VM_IP:3000/send-alert/weekly \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

Or use the Settings page in the web UI:
1. Navigate to `http://YOUR_VM_IP:3000/settings`
2. Click **"Send Weekly Summary Now"** or **"Send Monthly Summary Now"**

---

## 5. Monitoring & Alerts (Free Tier)

Set up **free** alerting for cost overruns and runtime errors.

### 5.1 Cost / Free Tier Alerts (GCP Budgets)

Protect against unexpected charges by setting a low budget threshold.

**Steps:**

1. Go to [GCP Console → Billing → Budgets & alerts](https://console.cloud.google.com/billing/budgets)
2. Click **"CREATE BUDGET"**
3. Configure:
   - **Scope**: Select your project
   - **Budget type**: "Specified amount"
   - **Budget amount**: £1.00 or $1.00 (low threshold to catch any charges)
   - **Thresholds**: Set alerts at 50%, 75%, 90%, 100%
   - **Notifications**:
     - ✅ Email alerts to: your@email.com
     - Optionally configure Pub/Sub for programmatic handling
4. Click **"FINISH"**

**What this does**:
- If your VM or other resources exceed the free tier (e.g., egress bandwidth, persistent disk snapshots), you'll get an email warning
- Budgets & alerts themselves are **free** (no charge for using this feature)

### 5.2 Runtime Health Alerts

Choose **one** of these approaches (both are free at this scale):

#### Option A: Uptime Check (Recommended)

Monitor if the app is responding to HTTP requests.

**Steps:**

1. Go to [Cloud Monitoring → Uptime checks](https://console.cloud.google.com/monitoring/uptime)
2. Click **"CREATE UPTIME CHECK"**
3. Configure:
   - **Title**: "Budgeter App Health"
   - **Check type**: HTTP
   - **Resource type**: URL
   - **Hostname**: `YOUR_VM_IP` (or domain if using Nginx + DNS)
   - **Path**: `/login` (a simple page that should always respond)
   - **Port**: `3000` (or `80` if using Nginx)
   - **Check frequency**: Every 5 minutes
4. Click **"CONTINUE"**
5. Click **"CREATE ALERT"** in the "Alert & Notification" section:
   - **Condition**: Uptime check fails
   - **Threshold**: 2 consecutive failures (to avoid false positives)
   - **Notifications**: Add your email
6. Click **"SAVE"** and **"CREATE"**

**What this does**:
- Every 5 minutes, Google pings your app
- If it fails to respond 2 times in a row (10 minutes offline), you get an email
- Catches: VM crashes, PM2 failures, out-of-memory errors

#### Option B: Log-Based Error Metric

Monitor application logs for errors.

**Steps:**

1. Ensure your VM is sending logs to Cloud Logging:
   ```bash
   # Install the Cloud Logging agent (optional, for system logs)
   curl -sSO https://dl.google.com/cloudagents/add-logging-agent-repo.sh
   sudo bash add-logging-agent-repo.sh
   sudo apt-get update
   sudo apt-get install -y google-fluentd
   ```

2. Go to [Logs Explorer](https://console.cloud.google.com/logs/query)
3. Create a log-based metric:
   - Logs Explorer → **"CREATE METRIC"**
   - **Metric type**: Counter
   - **Filter**:
     ```
     resource.type="gce_instance"
     resource.labels.instance_id="YOUR_INSTANCE_ID"
     severity="ERROR"
     ```
   - **Metric name**: `budgeter_error_count`
4. Create an alerting policy:
   - Go to [Monitoring → Alerting](https://console.cloud.google.com/monitoring/alerting)
   - **"CREATE POLICY"**
   - **Select a metric**: `logging/user/budgeter_error_count`
   - **Condition**: Count > 1 for 5 minutes
   - **Notifications**: Email
5. Click **"SAVE"**

**What this does**:
- If your app logs any ERROR-level messages (e.g., uncaught exceptions), you get an email
- More granular than uptime checks, but requires proper error logging in your app

**💡 Recommendation**: Start with **Option A (Uptime Check)** - it's simpler and catches the most common failure modes.

### 5.3 Monitoring Dashboard (Optional)

Create a simple dashboard to visualize VM metrics:

1. Go to [Monitoring → Dashboards](https://console.cloud.google.com/monitoring/dashboards)
2. Click **"CREATE DASHBOARD"**
3. Add charts:
   - **VM CPU utilization**: `compute.googleapis.com/instance/cpu/utilization`
   - **VM memory usage**: `compute.googleapis.com/instance/memory/percent_used`
   - **Disk usage**: `compute.googleapis.com/instance/disk/percent_used`
   - **Network traffic**: `compute.googleapis.com/instance/network/sent_bytes_count`

---

## 6. Optional: Nginx Reverse Proxy + HTTPS

If you want to:
- Run the app on standard HTTP port 80 (instead of `:3000`)
- Add HTTPS with a free Let's Encrypt certificate
- Use a custom domain name

### 6.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 6.2 Configure Nginx Reverse Proxy

Create a new site configuration:

```bash
sudo nano /etc/nginx/sites-available/budgeter
```

Add this content:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Proxy all requests to Node.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/budgeter /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

Now you can access the app at `http://YOUR_VM_IP` (port 80).

### 6.3 Add HTTPS with Let's Encrypt (Optional)

**Prerequisites**: You need a **domain name** pointed at your VM's IP address.

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and configure SSL certificate
sudo certbot --nginx -d yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to ToS
# - Choose "Redirect HTTP to HTTPS" (option 2)

# Test automatic renewal
sudo certbot renew --dry-run
```

Certbot will:
- Obtain a free SSL certificate from Let's Encrypt
- Automatically configure Nginx for HTTPS
- Set up auto-renewal (certificates expire every 90 days)

**Update `.env`**:

```env
TL_REDIRECT_URI=https://yourdomain.com/callback
```

Don't forget to update this in the TrueLayer Console too!

---

## 7. Maintenance & Updates

### 7.1 Update the Application

When you make changes to the code:

```bash
# SSH into the VM
gcloud compute ssh budgeter-vm --zone=us-central1-a

cd ~/budgeter

# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart budgeter

# View logs to confirm restart
pm2 logs budgeter --lines 50
```

### 7.2 View Application Logs

```bash
# Real-time logs
pm2 logs budgeter

# Last 100 lines
pm2 logs budgeter --lines 100

# Filter for errors
pm2 logs budgeter --err

# Log file locations
ls ~/.pm2/logs/
```

### 7.3 Monitor PM2 Status

```bash
pm2 status
pm2 monit  # Interactive monitoring dashboard
```

### 7.4 Update Node.js Version

```bash
# If using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# If using nvm
nvm install 20
nvm use 20
nvm alias default 20

# Rebuild and restart
cd ~/budgeter
npm install
npm run build
pm2 restart budgeter
```

### 7.5 Backup Important Files

Periodically back up your configuration:

```bash
# From your local machine
VM_IP="YOUR_VM_IP"
VM_USER="YOUR_GCP_USERNAME"

# Backup config files
scp ${VM_USER}@${VM_IP}:~/budgeter/config.json ./backups/config.json.$(date +%Y%m%d)
scp ${VM_USER}@${VM_IP}:~/budgeter/.env ./backups/.env.$(date +%Y%m%d)

# Backup tokens (if needed)
scp -r ${VM_USER}@${VM_IP}:~/budgeter/tokens ./backups/tokens.$(date +%Y%m%d)
```

---

## 8. Security & Future Hardening

**Current Security Posture (Acceptable for Personal Use):**
- ✅ Secrets stored on VM disk with `chmod 600` permissions
- ✅ All sensitive files excluded from git (`.gitignore`)
- ✅ Password-protected web interface (`ADMIN_PASSWORD`)
- ✅ TrueLayer OAuth tokens auto-refresh and encrypt connections
- ✅ Free tier usage monitoring via GCP Budgets

**If you ever scale this beyond personal use, implement:**

### 8.1 Secret Management

**Instead of `.env` on disk:**
- Use [GCP Secret Manager](https://cloud.google.com/secret-manager)
- Store `TL_CLIENT_SECRET`, `SMTP_PASS`, `OPENAI_API_KEY` as secrets
- Grant VM service account read access via IAM
- Update code to read from Secret Manager at runtime:
  ```typescript
  import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({
    name: 'projects/PROJECT_ID/secrets/TL_CLIENT_SECRET/versions/latest',
  });
  const secret = version.payload?.data?.toString();
  ```

### 8.2 SSH Access

**Lock down SSH:**
```bash
# Disable password authentication (key-only)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd

# Use GCP OS Login for centralized SSH key management
gcloud compute project-info add-metadata \
  --metadata enable-oslogin=TRUE
```

### 8.3 Firewall Restrictions

**Restrict access to specific IPs:**
```bash
# Only allow your home/office IP to access the app
gcloud compute firewall-rules update allow-budgeter \
  --source-ranges="YOUR_HOME_IP/32"
```

### 8.4 Enable Automated Security Patching

```bash
# Install unattended-upgrades for automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 8.5 Use a Managed Identity (Service Account)

Instead of `gcp-service-account.json` on disk:
1. Create a GCP service account for the VM
2. Grant it `roles/sheets.editor` (if using Sheets)
3. Attach the service account to the VM
4. Remove `GOOGLE_APPLICATION_CREDENTIALS` from `.env`
5. The Google Sheets client will automatically use the VM's attached service account

### 8.6 Enable Cloud Armor (DDoS Protection)

If exposing the app publicly:
- Use Cloud Armor to rate-limit requests
- Configure allowlists/denylists
- Protect against common web attacks (SQL injection, XSS, etc.)

### 8.7 Implement HTTPS Everywhere

- Force HTTPS redirects in Nginx (Certbot does this automatically)
- Set `NODE_ENV=production` to enable secure cookies
- Add HSTS headers in Nginx:
  ```nginx
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  ```

### 8.8 Monitor for Anomalies

- Set up alerts for unusual traffic patterns (GCP Cloud Monitoring)
- Enable VPC Flow Logs to audit network traffic
- Use Cloud Logging to detect failed login attempts

---

## Troubleshooting

### VM not accessible
```bash
# Check VM is running
gcloud compute instances list

# Check firewall rules
gcloud compute firewall-rules list

# Check if app is running on VM
gcloud compute ssh budgeter-vm --zone=us-central1-a
pm2 status
pm2 logs budgeter
```

### App crashes or errors
```bash
# View logs
pm2 logs budgeter --lines 200

# Restart app
pm2 restart budgeter

# Check disk space
df -h

# Check memory
free -h
```

### Cron jobs not running
```bash
# Check cron expressions are valid
pm2 logs budgeter | grep -i "scheduled"

# Verify timezone is correct
timedatectl
cat /etc/timezone

# Test alert manually
curl -X POST http://localhost:3000/send-alert/weekly
```

### TrueLayer OAuth redirect mismatch
- Ensure `TL_REDIRECT_URI` in `.env` matches your VM IP: `http://YOUR_VM_IP:3000/callback`
- Update the same URL in [TrueLayer Console](https://console.truelayer.com/) under "Redirect URIs"

### Out of disk space
```bash
# Check disk usage
df -h

# Clear PM2 logs
pm2 flush

# Clear system logs
sudo journalctl --vacuum-time=7d

# If still an issue, expand the boot disk:
gcloud compute disks resize budgeter-vm --size=20GB --zone=us-central1-a
# Then resize the filesystem:
sudo resize2fs /dev/sda1
```

---

## Estimated Costs

**GCP Free Tier (per month):**
- `e2-micro` VM: **FREE** (in eligible regions)
- 30 GB standard persistent disk: **FREE** (10 GB used)
- 1 GB egress to most regions: **FREE** (likely sufficient for personal use)
- Cloud Monitoring (basic): **FREE** (up to 150 MB logs/day)
- Cloud Logging: **FREE** (up to 50 GB/month)

**Likely charges beyond free tier:**
- Additional egress traffic: ~$0.12/GB (if you exceed 1 GB/month)
- Snapshots/backups: ~$0.026/GB/month (if you create disk snapshots)

**Expected total cost**: **£0-2/month** for typical personal use.

**To minimize costs:**
- Don't create unnecessary disk snapshots
- Monitor egress with GCP Budgets (set alert at $1)
- Stop the VM when not in use (if you don't need 24/7 alerts):
  ```bash
  gcloud compute instances stop budgeter-vm --zone=us-central1-a
  gcloud compute instances start budgeter-vm --zone=us-central1-a
  ```

---

## Summary

You now have:
- ✅ A free-tier GCP VM running Budgeter 24/7
- ✅ Built-in cron scheduling for weekly/monthly email alerts
- ✅ PM2 process management with auto-restart and boot persistence
- ✅ Free cost and uptime monitoring
- ✅ Simple deployment workflow (`git pull → npm build → pm2 restart`)

**Access your app**: `http://YOUR_VM_IP:3000`

**Next steps**:
- Test weekly/monthly alerts by clicking "Send Now" in Settings
- Wait for the cron schedule to trigger automatically
- Monitor logs: `pm2 logs budgeter`
- Check GCP Budgets dashboard weekly to confirm free tier usage

Enjoy your personal finance dashboard! 🎉
