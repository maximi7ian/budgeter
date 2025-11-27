# GCP Deployment Guide

Deploy Budgeter on Google Cloud Platform using a free-tier VM for personal use.

## Why Use a VM?

- Built-in `node-cron` scheduler works without external services
- No need for Cloud Scheduler or serverless complexity
- Simpler secrets management
- Perfect for personal, single-user applications

## Prerequisites

- GCP account with billing enabled (free tier is sufficient)
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed
- Local setup completed (see [SETUP.md](SETUP.md))
- App built locally: `npm run build`

## 1. Initial gcloud Setup

```bash
# Authenticate and select project
gcloud init

# Enable Compute Engine API
gcloud services enable compute.googleapis.com

# Set default zone (free tier eligible zones)
gcloud config set compute/zone us-central1-a
# Options: us-west1-b, us-central1-a, us-east1-b
```

## 2. Create the VM

```bash
# Create e2-micro VM (free tier)
gcloud compute instances create budgeter-vm \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-standard \
  --tags=http-server \
  --metadata=startup-script='#!/bin/bash
apt-get update -y'

# Configure firewall
gcloud compute firewall-rules create allow-budgeter \
  --allow=tcp:3000 \
  --target-tags=http-server \
  --description="Allow Budgeter app on port 3000"

# Get external IP (save this!)
gcloud compute instances describe budgeter-vm \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Important**: Update `TL_REDIRECT_URI` in your `.env` file with this IP:
```env
TL_REDIRECT_URI=http://YOUR_VM_IP:3000/callback
```

Also update this URI in [TrueLayer Console](https://console.truelayer.com/).

## 3. Install Node.js and Dependencies

```bash
# SSH into VM
gcloud compute ssh budgeter-vm

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git and PM2
sudo apt install -y git
sudo npm install -g pm2

# Clone repository
cd ~
git clone https://github.com/yourusername/budgeter.git
cd budgeter

# Install dependencies (DO NOT build on VM - only 1GB RAM)
npm install
```

## 4. Transfer Built App and Secrets

**On your local machine** (in the project directory):

```bash
# Ensure you've built locally
npm run build

# Update .env with VM IP
# TL_REDIRECT_URI=http://YOUR_VM_IP:3000/callback

# Copy everything to VM
gcloud compute scp --recurse \
  dist \
  .env \
  gcp-service-account.json \
  budgeter-vm:~/budgeter/

# Copy config and tokens if they exist
gcloud compute scp --recurse \
  config \
  tokens \
  .truelayer-token.json \
  budgeter-vm:~/budgeter/
```

**On the VM**, secure file permissions:

```bash
cd ~/budgeter
chmod 600 .env
chmod 600 gcp-service-account.json
chmod 600 .truelayer-token.json 2>/dev/null || true
chmod -R 600 tokens/ 2>/dev/null || true
```

## 5. Start with PM2

```bash
cd ~/budgeter

# Start the app
pm2 start dist/server.js --name budgeter

# View logs
pm2 logs budgeter --lines 50

# Save PM2 process list
pm2 save

# Setup auto-start on boot
pm2 startup
# Run the command it prints!
```

Test the app at `http://YOUR_VM_IP:3000`

## 6. Monitoring (Free Tier)

### Cost Alerts

1. Go to [GCP Billing → Budgets](https://console.cloud.google.com/billing/budgets)
2. Create budget: $1/month with alerts at 50%, 75%, 90%, 100%
3. Add your email for notifications

### Uptime Monitoring

1. Go to [Cloud Monitoring → Uptime checks](https://console.cloud.google.com/monitoring/uptime)
2. Create check:
   - URL: `http://YOUR_VM_IP:3000/login`
   - Check every 5 minutes
   - Alert after 2 consecutive failures
3. Add email notification

## Maintenance

### Update Application

**On local machine**:

```bash
cd ~/path/to/budgeter
git pull
npm install
npm run build

# Copy new dist/ to VM
gcloud compute scp --recurse dist budgeter-vm:~/budgeter/
```

**On VM**:

```bash
cd ~/budgeter
pm2 restart budgeter
pm2 logs budgeter --lines 50
```

### View Logs

```bash
# Real-time logs
pm2 logs budgeter

# Last 100 lines
pm2 logs budgeter --lines 100

# Errors only
pm2 logs budgeter --err
```

### Backup Important Files

**From local machine**:

```bash
# Backup config and tokens
gcloud compute scp budgeter-vm:~/budgeter/config.json ./backups/
gcloud compute scp budgeter-vm:~/budgeter/.env ./backups/
gcloud compute scp --recurse budgeter-vm:~/budgeter/tokens ./backups/
```

## Estimated Costs

**GCP Free Tier (per month)**:
- e2-micro VM: **FREE** (in eligible regions)
- 30 GB disk: **FREE** (using 20 GB)
- 1 GB egress: **FREE**

- ChatGPT API: **~$0.5** (in eligible regions)

**Expected total**: **$$0-1/month** for typical personal use.

Charges only occur if you exceed:
- Network egress (>1 GB/month)
- Disk snapshots (if created)

## Security Hardening

Current security is acceptable for personal use:
- Secrets stored on VM with `chmod 600`
- Password-protected web interface
- OAuth tokens auto-refresh

**For production use, consider**:
- GCP Secret Manager instead of `.env` files
- SSH key-only access (disable password auth)
- IP-restricted firewall rules
- Automated security patching

## Summary

You now have:
- ✅ Free-tier GCP VM running 24/7
- ✅ Built-in cron scheduling for email alerts
- ✅ PM2 auto-restart and boot persistence
- ✅ Free cost and uptime monitoring

**Access**: `http://YOUR_VM_IP:3000`

**Update workflow**:
```bash
# Local machine
npm run build
gcloud compute scp --recurse dist budgeter-vm:~/budgeter/

# VM
gcloud compute ssh budgeter-vm
pm2 restart budgeter
```

Enjoy your personal finance dashboard! 🎉
