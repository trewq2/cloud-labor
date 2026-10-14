# CloudLab – javított Redis/Compose változat

## 1. Menj abba a mappába, ahol ez a compose.yaml található

```bash
ls -la
```

A listában legyen:
- app.py
- Dockerfile
- requirements.txt
- compose.yaml

## 2. Régi, önálló CloudLab container eltávolítása

```bash
docker compose down --remove-orphans
docker rm -f cloudlab 2>/dev/null || true
```

## 3. Ellenőrizd, foglalt-e a 8080-as port

```bash
docker ps --filter publish=8080
```

Itt a tiszta újraindítás előtt ne maradjon régi `cloudlab` container.

## 4. Compose rendszer felépítése

```bash
docker compose up -d --build --force-recreate
```

## 5. Állapot

```bash
docker compose ps
```

A `redis` legyen `(healthy)`, a `web` pedig `Up`.

## 6. Redis teszt

```bash
docker compose exec -T redis redis-cli ping
```

Elvárt:
`PONG`

## 7. Web → Redis DNS és környezeti változó

```bash
docker compose exec -T web sh -lc 'echo "REDIS_HOST=$REDIS_HOST"; getent hosts redis'
```

Elvárt:
- `REDIS_HOST=redis`
- egy Docker belső IP + `redis`

## 8. Közvetlen Python kapcsolat, 5 másodperces külső időkorláttal

```bash
timeout 5 docker compose exec -T web python -c "import redis; r=redis.Redis(host='redis',port=6379,socket_connect_timeout=2,socket_timeout=2); print(r.ping())"
```

Elvárt:
`True`

## 9. API ellenőrzés

```bash
curl http://127.0.0.1:8080/api/info
```

Elvárt:
- `"redis":true`
- `"redis_host":"redis"`
- `"version":"compose-1.0"`

## 10. Főoldal

Nyisd meg a 8080-as portot.
A főoldalon:
- `Redis állapot: Kapcsolódva`
- `Látogatásszámláló: 1`

F5 után 2, majd 3, 4...

## Volume teszt

Jegyezd meg a számlálót, majd:

```bash
docker compose down
docker volume ls
docker compose up -d
```

A számláló nem 1-ről indul újra.

FONTOS: ne használd a `docker compose down -v` parancsot, mert az törli a volume-ot.
