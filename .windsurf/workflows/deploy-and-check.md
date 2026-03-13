---
description: Deploy latest branch to production server for this project
---

# Deploy and Check

> **Adapt this template** after forking: replace all `<PLACEHOLDERS>` with actual values.

## Project Parameters

| Parameter | Value |
|-----------|-------|
| **Branch** | `<main or master>` |
| **Gunicorn service** | `<project_name>.service` |
| **Huey service** | `<project-slug>-huey.service` |
| **Venv activation** | `source /home/ryzepeck/webapps/<project>/backend/venv/bin/activate` |
| **Requirements** | `/home/ryzepeck/webapps/<project>/backend/requirements.txt` |
| **Has frontend?** | `<yes/no>` |
| **Frontend build** | `<npm ci && npm run build>` |
| **Domain** | `<domain.com>` |
| **Settings module** | `<project_module>.settings_prod` |

---

## Steps

### 1. Pull latest code
```bash
cd /home/ryzepeck/webapps/<project>
git pull origin <branch>
```

### 2. Backend dependencies
```bash
source /home/ryzepeck/webapps/<project>/backend/venv/bin/activate
pip install -r /home/ryzepeck/webapps/<project>/backend/requirements.txt
```

### 3. Django migrations + collectstatic
```bash
cd /home/ryzepeck/webapps/<project>/backend
DJANGO_SETTINGS_MODULE=<project_module>.settings_prod python manage.py migrate
DJANGO_SETTINGS_MODULE=<project_module>.settings_prod python manage.py collectstatic --noinput
```

### 4. Frontend build (if applicable)
```bash
cd /home/ryzepeck/webapps/<project>/frontend
<npm ci && npm run build>
```

### 5. Restart services
```bash
sudo systemctl restart <project_name>.service <project-slug>-huey.service
```

### 6. Verify
```bash
# Service status
systemctl is-active <project_name>.service
systemctl is-active <project-slug>-huey.service

# Health check
curl -s https://<domain>/api/health/

# Check for errors in journal
journalctl -u <project_name>.service --since "5 minutes ago" --no-pager -n 20

# Run post-deploy check
bash ~/scripts/post-deploy-check.sh <project>
```

### 7. Resource limits verification
```bash
systemctl show <project_name>.service --property=MemoryMax,CPUQuota,TasksMax
```
