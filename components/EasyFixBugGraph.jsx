"use client";

import React, { useMemo, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";

// register layout sekali di browser
if (typeof window !== "undefined" && !window.__easyfixDagreRegistered) {
  cytoscape.use(dagre);
  window.__easyfixDagreRegistered = true;
}

function buildElements(data) {
  const els = [];
  const norm = (s) => (s || "").trim().toLowerCase();

  // 1) Node pusat (QUERY)
  els.push({ data: { id: "query", type: "query", title: data.query } });

  // 2) BUG nodes + edges query->bug
  for (const b of data.bugs || []) {
    const bugId = `bug:${b.id}`;
    els.push({
      data: {
        id: bugId,
        type: "bug",
        bug_id: String(b.id),        // <-- untuk label bug di bawah
        summary: b.summary,
        status: b.status,
        resolution: b.resolution ?? "",
        topic_label: b.topic_label ?? "",
        topic_score: b.topic_score ?? 0,
      },
    });

    const weight = Math.max(1, Math.round((b.topic_score ?? 0) * 5));
    els.push({
      data: {
        id: `query->${bugId}`,
        source: "query",
        target: bugId,
        rel: "matches",
        weight,
      },
    });
  }

  // 3) DEV nodes yang TERHUBUNG SAJA (filter)
  const allDevEmails = new Set((data.developers || []).map((d) => norm(d.developer)));
  const connectedDevEmails = new Set();
  for (const b of data.bugs || []) {
    const assignee = norm(b.assigned_to);
    if (assignee && allDevEmails.has(assignee)) connectedDevEmails.add(assignee);
  }

  for (const d of data.developers || []) {
    const email = norm(d.developer);
    if (!connectedDevEmails.has(email)) continue; // hide dev tanpa hubungan
    els.push({
      data: {
        id: `dev:${email}`,
        type: "dev",
        email,                      // <-- untuk label dev di atas
        freq: d.freq,
        score: d.score,
      },
    });
  }

  // 4) edges dev->bug untuk dev yang connected
  for (const b of data.bugs || []) {
    const assignee = norm(b.assigned_to);
    if (!assignee || !connectedDevEmails.has(assignee)) continue;
    els.push({
      data: {
        id: `dev:${assignee}->bug:${b.id}`,
        source: `dev:${assignee}`,
        target: `bug:${b.id}`,
        rel: "assigned_to",
      },
    });
  }

  return els;
}

// --- posisikan dev tepat di atas bug terkait ---
function placeDevelopersAboveBugs(cy) {
  const bugToDevs = new Map();

  cy.edges('[rel = "assigned_to"]').forEach((e) => {
    const dev = e.source();
    const bug = e.target();
    if (bug.data("type") !== "bug" || dev.data("type") !== "dev") return;
    const key = bug.id();
    if (!bugToDevs.has(key)) bugToDevs.set(key, []);
    bugToDevs.get(key).push(dev);
  });

  const VERTICAL_OFFSET = 90; // jarak dev di atas bug
  const H_SPREAD = 28;        // sebar horizontal bila >1 dev

  cy.batch(() => {
    bugToDevs.forEach((devNodes, bugId) => {
      const bug = cy.getElementById(bugId);
      const bp = bug.position();

      if (devNodes.length === 1) {
        const d = devNodes[0];
        d.position({ x: bp.x, y: bp.y - VERTICAL_OFFSET });
        d.lock(); // kunci posisi agar tidak acak
      } else {
        const n = devNodes.length;
        const total = (n - 1) * H_SPREAD;
        devNodes.forEach((d, i) => {
          d.position({ x: bp.x - total / 2 + i * H_SPREAD, y: bp.y - VERTICAL_OFFSET });
          d.lock();
        });
      }
    });
  });
}

export default function EasyfixBugGraph({ data }) {
  const elements = useMemo(() => buildElements(data), [data]);
  const cyRef = useRef(null);

  // Layout melingkar berlapis (query pusat, bug ring tengah, dev ring luar)
  const layout = {
    name: "concentric",
    fit: false,
    avoidOverlap: true,
    minNodeSpacing: 40,
    startAngle: Math.PI / 2,
    concentric: (node) => {
      const t = node.data("type");
      if (t === "query") return 3;
      if (t === "bug") return 2;
      return 1;
    },
    levelWidth: () => 1,
  };

  const stylesheet = [
    // Node bulat - base
    {
      selector: "node",
      style: {
        shape: "ellipse",
        width: 56,
        height: 56,
        "background-color": "#1f2937",
        "border-width": 3,
        "border-color": "#e5e7eb",
        label: "",                  // default kosong
        "font-size": 10,
        color: "#111827",
        "text-background-color": "#ffffff",
        "text-background-opacity": 0.9,
        "text-background-padding": 2,
        "text-wrap": "none",
        "text-halign": "center",
      },
    },
    // Query (tanpa label)
    { selector: 'node[type = "query"]', style: { "background-color": "#C58B22", "border-color": "#E8BE72", label: "" } },
    // Bug: label = ID, tampil di bawah node
    {
      selector: 'node[type = "bug"]',
      style: {
        "background-color": "#C3249E",
        "border-color": "#F08FD7",
        label: "data(bug_id)",
        "text-valign": "bottom",
        "text-margin-y": 12,
      },
    },
    // Dev: label = email, tampil di atas node
    {
      selector: 'node[type = "dev"]',
      style: {
        "background-color": "#2E6FD3",
        "border-color": "#99B9F7",
        label: "data(email)",
        "text-valign": "top",
        "text-margin-y": -12,
      },
    },

    // Edges: garis tanpa panah
    {
      selector: "edge",
      style: {
        "curve-style": "straight",
        "line-color": "#94a3b8",
        "target-arrow-shape": "none",
        "source-arrow-shape": "none",
        width: 2,
      },
    },
    {
      selector: 'edge[rel = "matches"]',
      style: {
        width: "mapData(weight, 1, 5, 2, 6)",
        "line-color": "#8b8b8b",
      },
    },
    {
      selector: 'edge[rel = "assigned_to"]',
      style: { "line-color": "#c084fc" },
    },
  ];

  return (
    <div className="w-full h-[72vh] rounded-lg" style={{ background: "#d1d5db" }}>
      <CytoscapeComponent
        cy={(cy) => {
          cyRef.current = cy;
          // 1) Jalankan layout global
          cy.layout(layout).run();

          // 2) Tempatkan dev tepat di atas bug yang terkait
          placeDevelopersAboveBugs(cy);

          // 3) Zoom awal 100% & center
          cy.zoom(1);
          cy.center();

          // Klik BUG => buka Bugzilla (opsional)
          cy.on("tap", "node", (evt) => {
            const id = evt.target.id();
            if (id.startsWith("bug:")) {
              const bugNum = id.split(":")[1];
              window.open(`https://bugzilla.mozilla.org/show_bug.cgi?id=${bugNum}`, "_blank");
            }
          });
        }}
        elements={elements}
        layout={layout}
        stylesheet={stylesheet}
        style={{ width: "100%", height: "100%", display: "block" }}
        wheelSensitivity={0.3}
        minZoom={0.3}
        maxZoom={3}
      />
    </div>
  );
}
