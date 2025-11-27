# Deploying Budgeter on GCP Compute Engine (Always-On VM)

This guide covers deploying Budgeter on a **single GCP VM** using the free tier. This approach is specifically designed for **personal, single-user use** where you want the built-in cron scheduling to work without external Cloud Scheduler or serverless complexity.

**Why use a VM instead of Cloud Run?**
- The app's `node-cron` scheduler just works when the process runs 24/7
- No need for Cloud Scheduler, volume mounts, or cold-start handling
- Simpler secrets management (`.env` on disk vs Secret Manager)
- Lower cognitive load for a personal project

**Prerequisites:**
- You've completed the main [README.md](README.md) local setup
- You have a GCP account with billing enabled (free tier is sufficient)
- **gcloud CLI installed and configured** ([Install instructions](https://cloud.google.com/sdk/docs/install))
  - Run `gcloud init` to authenticate and set your default project
- You've created `.env` and `gcp-service-account.json` locally with your real credentials
- **Build the app locally first**: Run `npm run build` on your machine (we'll copy `dist/` to avoid memory issues on the micro VM)

---

## Table of Contents

1. [Initial gcloud Setup](#1-initial-gcloud-setup)
2. [Create the VM (Compute Engine)](#2-create-the-vm-compute-engine)
3. [Install Node.js and Setup Repository](#3-install-nodejs-and-setup-repository)
4. [Transfer Built Application & Secrets](#4-transfer-built-application--secrets)
5. [Start the Application with PM2](#5-start-the-application-with-pm2)
6. [Monitoring & Alerts (Free Tier)](#6-monitoring--alerts-free-tier)
7. [Optional: Nginx Reverse Proxy + HTTPS](#7-optional-nginx-reverse-proxy--https)
8. [Maintenance & Updates](#8-maintenance--updates)
9. [Security & Future Hardening](#9-security--future-hardening)

---

## 1. Initial gcloud Setup

### 1.1 Install gcloud CLI

If you haven't already, install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).

### 1.2 Initialize gcloud

```bash
# Authenticate and set default project
gcloud init

# Follow prompts to:
# 1. Log in with your Google account
# 2. Select or create a GCP project
# 3. Set a default compute region/zone
```

### 1.3 Enable Required APIs

```bash
# Enable Compute Engine API (required for VM creation)
gcloud services enable compute.googleapis.com

# This may take a minute on first use
```

### 1.4 Set Default Zone

```bash
# Choose a free-tier eligible zone
# Options: us-west1-b, us-central1-a, us-east1-b
gcloud config set compute/zone us-central1-a

# Verify your settings
gcloud config list
```

**Note**: Replace `us-central1-a` with your preferred free-tier zone throughout this guide. Using `gcloud config set` means you won't need `--zone` flags on every command.

---

## 2. Create the VM (Compute Engine)

### 2.1 Choose a Free Tier Region & Zone

GCP offers an **e2-micro** instance for free in these zones:
- `us-west1-b` (Oregon)
- `us-central1-a` (Iowa)
- `us-east1-b` (South Carolina)

Check the [current free tier documentation](https://cloud.google.com/free/docs/free-cloud-features#compute) for the latest eligible SKUs and zones.

### 2.2 Create the VM

```bash
# Create an e2-micro VM (uses your default zone from step 1.4)
gcloud compute instances create budgeter-vm \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-standard \
  --tags=http-server \
  --metadata=startup-script='#!/bin/bash
apt-get update -y'
```

**Notes:**
- **Machine type**: `e2-micro` is free-tier eligible (1GB RAM, 2 vCPUs)
- **Disk**: 20GB is sufficient (30GB is the free tier limit, but 20GB keeps you comfortably below)
- **Image**: Ubuntu 22.04 LTS is stable and well-supported
- **Tags**: `http-server` tag is used for firewall rules

### 2.3 Configure Firewall Rules

```bash
# Allow traffic on port 3000 (Node.js app)
gcloud compute firewall-rules create allow-budgeter \
  --allow=tcp:3000 \
  --target-tags=http-server \
  --description="Allow traffic to Budgeter app on port 3000"

# Optional: Allow port 80 if using Nginx later
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

### 2.4 Get the VM's External IP

```bash
gcloud compute instances describe budgeter-vm \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Save this IP** - you'll use it to access the app and update TrueLayer redirect URIs.

Example output: `35.123.45.67`

---

## 3. Install Node.js and Setup Repository

### 3.1 SSH into the VM

```bash
# Connect via gcloud (automatically uses your default zone)
gcloud compute ssh budgeter-vm
```

### 3.2 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 3.3 Install Node.js 20 (via NodeSource)

```bash
# Download and run NodeSource setup script for Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x or higher
npm --version
```

**Why Node 20?** It's the current LTS version with better performance and security than Node 18.

### 3.4 Install Git and PM2

```bash
# Install git
sudo apt install -y git

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Verify PM2 installation
pm2 --version
```

### 3.5 Clone the Budgeter Repository

```bash
cd ~
git clone https://github.com/maximi7ian/budgeter.git
cd budgeter
```

### 3.6 Install Dependencies (NO BUILD YET)

```bash
# Install npm dependencies
npm install
```

**⚠️ DO NOT RUN `npm run build` ON THE VM YET**

The e2-micro instance has only 1GB RAM. Running TypeScript compilation can hit memory limits and fail with:

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solution**: We'll build locally and copy `dist/` in the next step.

---

## 4. Transfer Built Application & Secrets

### 4.1 Build Locally (On Your Machine)

On your **local machine** (not the VM), ensure you've built the app:

```bash
cd ~/path/to/budgeter  # Your local repo
npm install
npm run build

# Verify dist/ exists
ls -la dist/
```

You should see `dist/server.js` and other compiled JavaScript files.

### 4.2 Prepare Configuration Files

On your **local machine**, ensure you have:

1. **`.env`** - Based on [.env.example](.env.example), with real values

2. **`gcp-service-account.json`** - Your Google Cloud service account key (if using Sheets)

3. **`.truelayer-token.json`** - Your TrueLayer OAuth token (if you've already connected banks locally)

4. **`tokens/`** directory - Multi-account token files (if they exist)

5. **`financial-advisor-prompt.txt`** - Your custom AI prompt (if customized)

**⚠️ CRITICAL**: Update `TL_REDIRECT_URI` in `.env` with your VM's external IP:
- Replace `YOUR_VM_IP` with the actual IP (e.g., `35.123.45.67`)
- Example: `TL_REDIRECT_URI=http://35.123.45.67:3000/callback`
- **Also update this URI** in the [TrueLayer Console](https://console.truelayer.com/) under your app's "Redirect URIs" settings!

### 4.3 Copy Everything to VM (One Command)

From your **local machine** (in the budgeter project directory):

```bash
# Copy built app + secrets (uses your default zone from step 1.4)
gcloud compute scp --recurse \
  dist \
  .env \
  gcp-service-account.json \
  financial-advisor-prompt.txt \
  budgeter-vm:~/budgeter/

# If you have existing tokens, copy those too
gcloud compute scp --recurse \
  .truelayer-token.json \
  tokens \
  budgeter-vm:~/budgeter/
```

**Why `gcloud compute scp` instead of regular `scp`?**
- Automatically handles SSH keys and authentication
- Works with GCP's OS Login and IAM-based access
- No need to manage `~/.ssh/config` or remember VM IPs
- Consistent with other gcloud commands

**Alternative: Copy files individually**

If the above fails or you only need specific files:

```bash
# Copy dist/ folder
gcloud compute scp --recurse dist budgeter-vm:~/budgeter/

# Copy secrets
gcloud compute scp .env budgeter-vm:~/budgeter/
gcloud compute scp gcp-service-account.json budgeter-vm:~/budgeter/

# Copy tokens (if they exist)
gcloud compute scp .truelayer-token.json budgeter-vm:~/budgeter/
gcloud compute scp --recurse tokens budgeter-vm:~/budgeter/

# Copy custom prompt
gcloud compute scp financial-advisor-prompt.txt budgeter-vm:~/budgeter/
```

### 4.4 Secure File Permissions on VM

SSH back into the VM and restrict permissions:

```bash
# Connect to VM
gcloud compute ssh budgeter-vm

cd ~/budgeter

# Restrict permissions on sensitive files
chmod 600 .env
chmod 600 gcp-service-account.json
chmod 600 .truelayer-token.json 2>/dev/null || true
chmod -R 600 tokens/ 2>/dev/null || true

# Verify
ls -la .env gcp-service-account.json
```

You should see `-rw-------` (owner read/write only).

---

## 5. Start the Application with PM2

### 5.1 Test the App Manually

```bash
cd ~/budgeter

# Quick test in production mode
npm start
```

Expected output:

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

### 5.2 Start with PM2 (Production)

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

# View logs (check for "Weekly alerts scheduled" message)
pm2 logs budgeter --lines 50

# Save PM2 process list (persists across reboots)
pm2 save

# Generate startup script (runs PM2 on boot)
pm2 startup

# ⚠️ IMPORTANT: The above command prints a command like:
#   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u yourusername --hp /home/yourusername
# Copy and run that exact command!
```

**Example PM2 output**:

```
[PM2] Spawning PM2 daemon
[PM2] PM2 Successfully daemonized
┌────┬────────────┬─────────┬─────────┬──────────┐
│ id │ name       │ status  │ restart │ uptime   │
├────┼────────────┼─────────┼─────────┼──────────┤
│ 0  │ budgeter   │ online  │ 0       │ 5s       │
└────┴────────────┴─────────┴─────────┴──────────┘
```

### 5.3 Verify Cron Scheduling

Check the logs to confirm cron jobs are scheduled:

```bash
pm2 logs budgeter --lines 100 | grep -i "scheduled"
```

Expected output:

```
✅ Weekly alerts scheduled: 0 9 * * 1
✅ Monthly alerts scheduled: 0 9 1 * *
```

**What happens now:**
- Every Monday at 9:00 AM (UK time), the app fetches transactions and sends a weekly email
- Every 1st of the month at 9:00 AM, it sends a monthly email
- The app runs continuously, handling OAuth token refreshes automatically
- PM2 restarts the app if it crashes
- PM2 starts the app on VM reboot

### 5.4 Test Email Alerts Manually (Optional)

Trigger an immediate alert to verify SMTP works:

From the web UI:
1. Navigate to `http://YOUR_VM_IP:3000/settings`
2. Click **"Send Weekly Summary Now"** or **"Send Monthly Summary Now"**
3. Check your email inbox

---

## 6. Monitoring & Alerts (Free Tier)

Set up **free** alerting for cost overruns and runtime errors.

### 6.1 Cost / Free Tier Alerts (GCP Budgets)

Protect against unexpected charges with a budget alert.

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
- If your VM or other resources exceed the free tier (e.g., egress bandwidth, disk snapshots), you get an email
- Budgets & alerts are **free** (no charge for using this feature)

### 6.2 Runtime Health Alerts (Uptime Check)

Monitor if the app is responding to HTTP requests.

**Steps:**

1. Go to [Cloud Monitoring → Uptime checks](https://console.cloud.google.com/monitoring/uptime)
2. Click **"CREATE UPTIME CHECK"**
3. Configure:
   - **Title**: "Budgeter App Health"
   - **Check type**: HTTP
   - **Resource type**: URL
   - **Hostname**: `YOUR_VM_IP` (or domain if using Nginx + DNS later)
   - **Path**: `/login`
   - **Port**: `3000`
   - **Check frequency**: Every 5 minutes
4. Click **"CONTINUE"**
5. In the "Alert & Notification" section, click **"CREATE ALERT"**:
   - **Condition**: Uptime check fails
   - **Threshold**: 2 consecutive failures (avoids false positives)
   - **Notifications**: Add your email
6. Click **"SAVE"** then **"CREATE"**

**What this does**:
- Every 5 minutes, GCP pings your app
- If it fails to respond 2 times in a row (10 minutes offline), you get an email
- Catches: VM crashes, PM2 failures, out-of-memory errors

**Cost**: Uptime checks are **free** for the first 100 checks per month (you'll use ~8,640 checks/month with 5-minute intervals, but basic monitoring is within free tier).

---

## 7. Optional: Nginx Reverse Proxy + HTTPS

If you want to:
- Run the app on standard HTTP port 80 (instead of `:3000`)
- Add HTTPS with a free Let's Encrypt certificate
- Use a custom domain name

### 7.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 7.2 Configure Nginx Reverse Proxy

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

Now access the app at `http://YOUR_VM_IP` (port 80).

### 7.3 Add HTTPS with Let's Encrypt (Optional)

**Prerequisites**: You need a **domain name** pointed at your VM's IP.

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and configure SSL certificate
sudo certbot --nginx -d yourdomain.com

# Follow prompts:
# - Enter your email
# - Agree to ToS
# - Choose "Redirect HTTP to HTTPS" (option 2)

# Test automatic renewal
sudo certbot renew --dry-run
```

**Update `.env` and TrueLayer Console**:

```env
TL_REDIRECT_URI=https://yourdomain.com/callback
```

Update this in the [TrueLayer Console](https://console.truelayer.com/) too!

---

## 8. Maintenance & Updates

### 8.1 Update the Application

When you make changes locally:

```bash
# On your LOCAL machine
cd ~/path/to/budgeter
git pull origin main
npm install
npm run build

# Copy new dist/ to VM
gcloud compute scp --recurse dist budgeter-vm:~/budgeter/

# SSH to VM and restart
gcloud compute ssh budgeter-vm
cd ~/budgeter
pm2 restart budgeter
pm2 logs budgeter --lines 50
```

### 8.2 View Application Logs

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

### 8.3 Backup Important Files

From your **local machine**:

```bash
# Backup config and tokens
gcloud compute scp budgeter-vm:~/budgeter/config.json ./backups/config.json.$(date +%Y%m%d)
gcloud compute scp budgeter-vm:~/budgeter/.env ./backups/.env.$(date +%Y%m%d)
gcloud compute scp --recurse budgeter-vm:~/budgeter/tokens ./backups/tokens.$(date +%Y%m%d)
```

---

## 9. Security & Future Hardening

**Current Security Posture (Acceptable for Personal Use):**
- ✅ Secrets stored on VM disk with `chmod 600` permissions
- ✅ All sensitive files excluded from git (`.gitignore`)
- ✅ Password-protected web interface (`ADMIN_PASSWORD`)
- ✅ TrueLayer OAuth tokens auto-refresh and encrypt connections
- ✅ Free tier usage monitoring via GCP Budgets

**If you ever scale this beyond personal use, implement:**

### 9.1 Secret Management

**Instead of `.env` on disk:**
- Use [GCP Secret Manager](https://cloud.google.com/secret-manager)
- Store `TL_CLIENT_SECRET`, `SMTP_PASS`, `OPENAI_API_KEY` as secrets
- Grant VM service account read access via IAM
- Update code to read from Secret Manager at runtime

### 9.2 SSH Access

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

### 9.3 Firewall Restrictions

```bash
# Only allow your home/office IP to access the app
gcloud compute firewall-rules update allow-budgeter \
  --source-ranges="YOUR_HOME_IP/32"
```

### 9.4 Enable Automated Security Patching

```bash
# Install unattended-upgrades for automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Troubleshooting

### Build fails with "JavaScript heap out of memory"

**Symptom**: Running `npm run build` on the VM fails with:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solution**: Build locally and copy `dist/` to the VM (as described in Section 4).

**Why**: The e2-micro instance has only 1GB RAM, insufficient for TypeScript compilation of larger projects.

### VM not accessible

```bash
# Check VM is running
gcloud compute instances list

# Check firewall rules
gcloud compute firewall-rules list | grep budgeter

# SSH and check app
gcloud compute ssh budgeter-vm
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
# Verify cron is scheduled
pm2 logs budgeter | grep -i "scheduled"

# Check timezone
timedatectl
cat /etc/timezone

# Test alert manually
curl -X POST http://localhost:3000/send-alert/weekly
```

### TrueLayer OAuth redirect mismatch

- Ensure `TL_REDIRECT_URI` in `.env` matches your VM IP: `http://YOUR_VM_IP:3000/callback`
- Update the same URL in [TrueLayer Console](https://console.truelayer.com/)

### File transfer fails with gcloud scp

```bash
# Ensure gcloud is authenticated
gcloud auth list
gcloud auth login  # If needed

# Verify VM exists and is running
gcloud compute instances list

# Check zone is correct
gcloud config get-value compute/zone

# Try with explicit zone
gcloud compute scp --zone=us-central1-a dist budgeter-vm:~/budgeter/ --recurse
```

---

## Estimated Costs

**GCP Free Tier (per month):**
- `e2-micro` VM: **FREE** (in eligible regions)
- 30 GB standard persistent disk: **FREE** (20 GB used)
- 1 GB egress to most regions: **FREE** (likely sufficient for personal use)
- Cloud Monitoring: **FREE** (up to 150 MB logs/day)
- Cloud Logging: **FREE** (up to 50 GB/month)

**Likely charges beyond free tier:**
- Additional egress traffic: ~$0.12/GB (only if you exceed 1 GB/month)
- Snapshots/backups: ~$0.026/GB/month (only if you create disk snapshots)

**Expected total cost**: **£0-2/month** for typical personal use.

---

## Summary

You now have:
- ✅ A free-tier GCP VM running Budgeter 24/7
- ✅ Built-in cron scheduling for weekly/monthly email alerts
- ✅ PM2 process management with auto-restart and boot persistence
- ✅ Free cost and uptime monitoring
- ✅ Optimized build workflow (build locally, copy `dist/` to VM)

**Access your app**: `http://YOUR_VM_IP:3000`

**Next steps**:
- Test weekly/monthly alerts by clicking "Send Now" in Settings
- Wait for the cron schedule to trigger automatically
- Monitor logs: `pm2 logs budgeter`
- Check GCP Budgets dashboard weekly to confirm free tier usage

**Deployment workflow for updates**:
```bash
# Local machine
npm run build
gcloud compute scp --recurse dist budgeter-vm:~/budgeter/

# VM
gcloud compute ssh budgeter-vm
pm2 restart budgeter
```

---

## Clean Reset (Troubleshooting)

If PM2 gets into a bad state or you need a fresh start:

```bash
# On the VM
pm2 delete budgeter
pm2 start dist/server.js --name budgeter
pm2 save
```

This completely removes the old PM2 process, starts fresh, and saves the new configuration.

---

Enjoy your personal finance dashboard! 🎉
