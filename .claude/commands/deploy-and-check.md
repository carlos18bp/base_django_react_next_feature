---
description: Deploy latest master to production server for fernando_aragon_project
---

> Ejecutar estos pasos conectado al servidor de producción vía SSH.
> Ruta base: `/home/ryzepeck/webapps/fernando_aragon_project`
> NO ejecutar en local.

# Deploy fernando_aragon_project to Production

Run these steps on the production server at `/home/ryzepeck/webapps/fernando_aragon_project` to deploy the latest `master` branch.

## Pre-Deploy

1. Quick status snapshot before deploy:
```bash
bash ~/scripts/quick-status.sh
```

## Deploy Steps

2. Pull the latest code from master:
```bash
cd /home/ryzepeck/webapps/fernando_aragon_project && git pull origin master
```

3. Install backend dependencies and run migrations:
```bash
cd /home/ryzepeck/webapps/fernando_aragon_project/backend && source venv/bin/activate && pip install -r requirements.txt && DJANGO_ENV=production python manage.py migrate
```

4. Build the frontend (Vite → dist/):
```bash
cd /home/ryzepeck/webapps/fernando_aragon_project/frontend && npm ci && npm run build
```

5. Collect static files:
```bash
cd /home/ryzepeck/webapps/fernando_aragon_project/backend && source venv/bin/activate && DJANGO_ENV=production python manage.py collectstatic --noinput
```

6. Restart services:
```bash
sudo systemctl restart fernando_aragon_project && sudo systemctl restart fernando-aragon-huey
```

## Post-Deploy Verification

7. Run post-deploy check for fernando_aragon_project:
```bash
bash ~/scripts/post-deploy-check.sh fernando_aragon_project
```
Expected: PASS on all checks, FAIL=0.

8. If something fails, check the logs:
```bash
sudo journalctl -u fernando_aragon_project.service --no-pager -n 30
sudo journalctl -u fernando-aragon-huey.service --no-pager -n 30
sudo tail -20 /var/log/nginx/error.log
```

## Architecture Reference

- **Domain**: `fernandodearagon.projectapp.co` / `www.fernandodearagon.projectapp.co`
- **Backend**: Django (`base_feature_project` module), prod settings activados via `DJANGO_ENV=production`
- **Frontend**: Vite SPA → `npm run build` exporta a `frontend/dist/`, servido directamente por Nginx
- **Services**: `fernando_aragon_project.service` (Gunicorn via socket), `fernando-aragon-huey.service`
- **Nginx**: `/etc/nginx/sites-available/fernando_aragon_project`
- **Socket**: `/home/ryzepeck/webapps/fernando_aragon_project/fernando_aragon_project.sock`
- **Static**: `/home/ryzepeck/webapps/fernando_aragon_project/backend/staticfiles/`
- **Frontend dist**: `/home/ryzepeck/webapps/fernando_aragon_project/frontend/dist/`

## Notes

- `~/scripts` es un symlink a `/home/ryzepeck/webapps/ops/vps/`.
- `DJANGO_ENV=production` debe estar seteado para `migrate` y `collectstatic`.
- El unit de systemd `fernando_aragon_project.service` setea `DJANGO_ENV=production` automáticamente para el servicio en ejecución.
- El frontend es una SPA servida estáticamente por Nginx desde `frontend/dist/`, no por Django.
- Las rutas `/api/`, `/admin/` y `/admin-gallery/` hacen proxy al socket de Gunicorn; el resto (`/`) sirve el frontend.
