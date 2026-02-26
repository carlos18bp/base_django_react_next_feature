# Systemd Services Installation

These are **template** service files. Before installing, edit the placeholders:

- `[user]` — system user running the service
- `[group]` — system group
- `/path/to/project` — absolute path to the project root
- `/path/to/venv` — absolute path to the Python virtual environment

---

## Huey Task Queue

Huey handles background tasks: automated backups, Silk garbage collection, and weekly query reports.

### Installation

1. Copy service file:
   ```bash
   sudo cp scripts/systemd/huey.service /etc/systemd/system/base_feature_project-huey.service
   ```

2. Edit paths and user/group in the copied file:
   ```bash
   sudo nano /etc/systemd/system/base_feature_project-huey.service
   ```

3. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable base_feature_project-huey
   sudo systemctl start base_feature_project-huey
   ```

4. Verify:
   ```bash
   sudo systemctl status base_feature_project-huey
   journalctl -u base_feature_project-huey -f
   ```

### Prerequisites

- **Redis** must be running (`sudo systemctl status redis`)
- **Python venv** must have all dependencies installed
- **`backend/.env`** must exist with production values
