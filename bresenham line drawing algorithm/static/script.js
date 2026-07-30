const form = document.getElementById("line-form");
const errorBox = document.getElementById("error-box");
const logEl = document.getElementById("log");
const pointCountEl = document.getElementById("point-count");
const tableBody = document.getElementById("step-table-body");

function renderLog(log) {
  if (!log.length) {
    logEl.innerHTML = '<p class="log-empty">Straight horizontal, vertical, or exact-diagonal lines need no decision steps.</p>';
    return;
  }
  logEl.innerHTML = log
    .map(line => {
      const isPos = line.startsWith("p >= 0");
      const [tag, val] = line.split("|");
      return `<div class="log-line">
                <span class="log-tag ${isPos ? "pos" : "neg"}">${tag.trim()}</span>
                <span>${val.trim()}</span>
              </div>`;
    })
    .join("");
}

function renderTable(steps, points) {
  if (!steps.length) {
    tableBody.innerHTML = '<tr><td colspan="4" class="table-empty">No decision steps for this line.</td></tr>';
    pointCountEl.textContent = points.length ? `${points.length} pixels` : "";
    return;
  }

  const rows = steps.map((step) => {
    const currentXY = step.current ? `(${step.current[0]}, ${step.current[1]})` : "—";
    const nextXY = step.next ? `(${step.next[0]}, ${step.next[1]})` : "—";
    const isPos = step.decision === "p >= 0";

    return `<tr>
      <td>${step.step}</td>
      <td>${currentXY}</td>
      <td><span class="step-p ${isPos ? "pos" : "neg"}">${step.p}</span></td>
      <td>${nextXY}</td>
    </tr>`;
  });

  tableBody.innerHTML = rows.join("");
  pointCountEl.textContent = `${points.length} pixels`;
}

function showError(msg) {
  errorBox.hidden = false;
  errorBox.textContent = msg;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = "";
}

async function plotLine(x1, y1, x2, y2) {
  clearError();
  try {
    const res = await fetch("/api/line", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x1, y1, x2, y2 }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Something went wrong.");
      return;
    }

    renderLog(data.log);
    renderTable(Array.isArray(data.steps) ? data.steps : [], data.points);
  } catch (err) {
    showError("Could not reach the server. Is Flask running?");
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const x1 = document.getElementById("x1").value;
  const y1 = document.getElementById("y1").value;
  const x2 = document.getElementById("x2").value;
  const y2 = document.getElementById("y2").value;
  plotLine(x1, y1, x2, y2);
});

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const [x1, y1, x2, y2] = btn.dataset.vals.split(",").map(Number);
    document.getElementById("x1").value = x1;
    document.getElementById("y1").value = y1;
    document.getElementById("x2").value = x2;
    document.getElementById("y2").value = y2;
    plotLine(x1, y1, x2, y2);
  });
});

renderTable([], []);
