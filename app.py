from flask import Flask, jsonify
import os
import socket

app = Flask(__name__)

def redis_status(increment=False):
    host = os.getenv("REDIS_HOST", "")
    if not host:
        return {
            "connected": False,
            "count": None,
            "error": "A REDIS_HOST környezeti változó nincs beállítva."
        }

    try:
        import redis
        client = redis.Redis(
            host=host,
            port=6379,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2
        )
        client.ping()
        count = client.incr("cloudlab_visits") if increment else client.get("cloudlab_visits")
        return {
            "connected": True,
            "count": int(count) if count is not None else 0,
            "error": None
        }
    except Exception as exc:
        return {
            "connected": False,
            "count": None,
            "error": f"{type(exc).__name__}: {exc}"
        }

@app.get("/")
def index():
    status = redis_status(increment=True)

    if status["connected"]:
        counter_text = str(status["count"])
        redis_text = "Kapcsolódva"
        diagnostic = ""
    else:
        counter_text = "Redis nincs csatlakoztatva"
        redis_text = "NINCS KAPCSOLAT"
        diagnostic = f"""
        <div class="error">
          <strong>Redis diagnosztika:</strong><br>
          REDIS_HOST = <code>{os.getenv("REDIS_HOST", "(nincs beállítva)")}</code><br>
          Hiba: <code>{status["error"]}</code>
        </div>
        """

    return f"""<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<title>CloudLab</title>
<style>
body{{font-family:Arial,sans-serif;background:#eef4f7;margin:40px;color:#17324d}}
main{{max-width:760px;margin:auto;background:white;padding:28px;border-radius:16px}}
code{{background:#eaf1f5;padding:3px 6px;border-radius:5px}}
.ok{{color:#0f766e;font-weight:bold}}
.error{{margin-top:20px;padding:14px;background:#fff0ef;border-left:5px solid #b42318;border-radius:8px}}
</style>
</head>
<body>
<main>
<h1>CloudLab alkalmazás</h1>
<p class="ok">Az alkalmazás működik.</p>
<p>Host: <code>{socket.gethostname()}</code></p>
<p>Redis állapot: <code>{redis_text}</code></p>
<p>Látogatásszámláló: <code>{counter_text}</code></p>
<p>Health endpoint: <code>/health</code></p>
<p>Info endpoint: <code>/api/info</code></p>
{diagnostic}
</main>
</body>
</html>"""

@app.get("/health")
def health():
    return jsonify(status="ok"), 200

@app.get("/api/info")
def info():
    status = redis_status(increment=False)
    return jsonify(
        app="cloudlab",
        version=os.getenv("APP_VERSION", "1.0"),
        hostname=socket.gethostname(),
        redis=status["connected"],
        redis_host=os.getenv("REDIS_HOST"),
        redis_error=status["error"]
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
