from flask import Flask, send_from_directory, jsonify, request
import json
import os
import re

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "services.json"), "r", encoding="utf-8") as f:
    SERVICES = json.load(f)


@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(BASE_DIR, "script.js")


@app.route("/api/services")
def get_services():
    return jsonify(SERVICES)


@app.route("/api/categories")
def get_categories():
    categories = sorted(set(service["category"] for service in SERVICES))
    return jsonify(categories)


def score_service(query, service):
    query = query.lower().strip()

    if not query:
        return 1

    score = 0

    name = service["name"].lower()
    category = service["category"].lower()
    description = service["description"].lower()

    keywords = [keyword.lower() for keyword in service["keywords"]]

    if query in name:
        score += 30

    if query in description:
        score += 10

    if query in category:
        score += 10

    for keyword in keywords:
        if keyword in query:
            score += 20

    words = re.findall(r"[a-zA-Z0-9]+", query)

    for word in words:

        if word in name:
            score += 8

        if word in description:
            score += 3

        if word in category:
            score += 5

        for keyword in keywords:
            if word in keyword:
                score += 6

    return score


@app.route("/api/search")
def search():

    query = request.args.get("q", "")
    category = request.args.get("category", "All")

    results = []

    for service in SERVICES:

        if category != "All" and service["category"] != category:
            continue

        score = score_service(query, service)

        if score > 0:
            result = service.copy()
            result["score"] = score
            results.append(result)

    results.sort(key=lambda x: x["score"], reverse=True)

    return jsonify(results[:20])


@app.route("/api/service/<int:service_id>")
def get_service(service_id):

    for service in SERVICES:

        if service["id"] == service_id:
            return jsonify(service)

    return jsonify({"error": "Service not found"}), 404


@app.route("/api/health")
def health():
    return jsonify({
        "status": "online",
        "project": "INAIVU"
    })


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )
