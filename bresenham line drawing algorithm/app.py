from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


def bresenham_line(x1, y1, x2, y2):
    """Returns list of (x, y) points, a log of decision-parameter steps, and a table-ready step history."""
    points = [(x1, y1)]
    steps_log = []
    steps = []

    dx_raw = x2 - x1
    dy_raw = y2 - y1

    step_x = 1 if dx_raw >= 0 else -1
    step_y = 1 if dy_raw >= 0 else -1

    dx = abs(dx_raw)
    dy = abs(dy_raw)

    x, y = x1, y1

    if dx == 0:  # vertical line
        steps.append({"step": 0, "current": [x, y], "p": 0, "next": [x, y], "decision": "initial"})
        while y != y2:
            y += step_y
            points.append((x, y))

    elif dy == 0:  # horizontal line
        steps.append({"step": 0, "current": [x, y], "p": 0, "next": [x, y], "decision": "initial"})
        while x != x2:
            x += step_x
            points.append((x, y))

    elif dx >= dy:  # slope magnitude <= 1
        p = 2 * dy - dx
        while x != x2:
            current_x, current_y = x, y
            p_before = p
            x += step_x
            if p >= 0:
                y += step_y
                p += 2 * dy - 2 * dx
                decision = "p >= 0"
                steps_log.append(f"p >= 0 | {p}")
            else:
                p += 2 * dy
                decision = "p < 0"
                steps_log.append(f"p < 0 | {p}")
            points.append((x, y))
            steps.append({
                "step": len(steps),
                "current": [current_x, current_y],
                "p": p_before,
                "next": [x, y],
                "decision": decision,
            })

    else:  # slope magnitude > 1
        p = 2 * dx - dy
        while y != y2:
            current_x, current_y = x, y
            p_before = p
            y += step_y
            if p >= 0:
                x += step_x
                p += 2 * dx - 2 * dy
                decision = "p >= 0"
                steps_log.append(f"p >= 0 | {p}")
            else:
                p += 2 * dx
                decision = "p < 0"
                steps_log.append(f"p < 0 | {p}")
            points.append((x, y))
            steps.append({
                "step": len(steps),
                "current": [current_x, current_y],
                "p": p_before,
                "next": [x, y],
                "decision": decision,
            })

    return points, steps_log, steps


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/line", methods=["POST"])
def api_line():
    data = request.get_json()

    try:
        x1 = int(data["x1"])
        y1 = int(data["y1"])
        x2 = int(data["x2"])
        y2 = int(data["y2"])
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "Please provide valid integer coordinates."}), 400

    points, steps_log, steps = bresenham_line(x1, y1, x2, y2)

    return jsonify({
        "points": [{"x": p[0], "y": p[1]} for p in points],
        "log": steps_log,
        "steps": steps,
    })


if __name__ == "__main__":
    app.run(debug=True)
