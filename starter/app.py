from flask import Flask, jsonify
import os
import socket

app = Flask(__name__)

def redis_counter():
    host = os.getenv("REDIS_HOST")
    if not host:
        return None
    try:
        import redis
        client = redis.Redis(host=host, port=6379, decode_responses=True, socket_connect_timeout=1)
        return client.incr("cloudlab_visits")
    except Exception:
        return None

@app.get("/")
def index():
    count = redis_counter()
    counter_text = str(count) if count is not None else "Redis nincs csatlakoztatva"
    return f"""<!doctype html>
<html lang="hu"><head><meta charset="utf-8"><title>CloudLab</title>
<style>body{{font-family:Arial;background:#eef4f7;margin:40px;color:#17324d}}
main{{max-width:760px;margin:auto;background:white;padding:28px;border-radius:16px}}
code{{background:#eaf1f5;padding:3px 6px;border-radius:5px}}.ok{{color:#0f766e;font-weight:bold}}</style></head>
<body><main><h1>CloudLab alkalmazás</h1><p class="ok">Az alkalmazás működik.</p>
<p>Host: <code>{socket.gethostname()}</code></p><p>Látogatásszámláló: <code>{counter_text}</code></p>
<p>Health endpoint: <code>/health</code></p><p>Info endpoint: <code>/api/info</code></p></main></body></html>"""

@app.get("/health")
def health():
    return jsonify(status="ok"), 200

@app.get("/api/info")
def info():
    return jsonify(app="cloudlab", version=os.getenv("APP_VERSION", "1.0"),
                   hostname=socket.gethostname(), redis=bool(os.getenv("REDIS_HOST")))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
