# CloudLab starter
## Python
```bash
pip install -r requirements.txt
python app.py
```
## Docker
```bash
docker build -t cloudlab:1.0 .
docker run --rm -p 8080:8080 cloudlab:1.0
```
## Compose
```bash
docker compose up -d --build
docker compose ps
```
## Kubernetes
A k8s.yaml fájlban cseréld ki a DOCKERHUB_FELHASZNALO részt.
