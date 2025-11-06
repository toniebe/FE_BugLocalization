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

  // 1) Node QUERY
  els.push({ data: { id: "query", type: "query", title: data.query } });

  // 2) BUG nodes + edges query->bug
  for (const b of data.bugs || []) {
    const bugId = `bug:${b.id}`;
    els.push({
      data: {
        id: bugId,
        type: "bug",
        bug_id: String(b.id),
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

  // 3) Hanya dev yang benar-benar “connected”
  const allDevEmails = new Set(
    (data.developers || []).map((d) => norm(d.developer))
  );
  const connectedDevEmails = new Set();
  for (const b of data.bugs || []) {
    const assignee = norm(b.assigned_to);
    if (assignee && allDevEmails.has(assignee))
      connectedDevEmails.add(assignee);
  }

  // 4) Dev nodes
  for (const d of data.developers || []) {
    const email = norm(d.developer);
    if (!connectedDevEmails.has(email)) continue;

    const devId = `dev:${email}`;
    els.push({
      data: { id: devId, type: "dev", email, freq: d.freq, score: d.score },
    });

  }

  // 5) Edge dev->bug (tetap dipertahankan)
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

function placeDevelopersAroundBugs(cy) {
  //mapping bug -> dev nodes
  const bugToDevs = new Map();
  cy.edges('[rel = "assigned_to"]').forEach((e) => {
    const dev = e.source();
    const bug = e.target();
    if (bug.data("type") !== "bug" || dev.data("type") !== "dev") return;
    const key = bug.id();
    if (!bugToDevs.has(key)) bugToDevs.set(key, []);
    bugToDevs.get(key).push(dev);
  });

  const willCollide = (x, y, selfId, padding = 6) => {
    let collide = false;
    cy.nodes().forEach((n) => {
      if (n.id() === selfId) return;
      const p = n.position();
      const rSelf = 28; // ~ radius dev
      const rOther =
        n.data("type") === "bug" ? 30 : n.data("type") === "query" ? 30 : 28;
      const minDist = rSelf + rOther + padding;
      const dx = x - p.x;
      const dy = y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < minDist) collide = true;
    });
    return collide;
  };

  cy.batch(() => {
    let bugIndex = 0;
    bugToDevs.forEach((devNodes, bugId) => {
      const bug = cy.getElementById(bugId);
      const bp = bug.position();

      const baseRadius = 110;
      let radius = baseRadius;

      let startAngle = (bugIndex % 8) * (Math.PI / 4); // 0,45°,90°,... (rad)
      bugIndex++;

      const n = devNodes.length;
      const angleStep = (Math.PI * 2) / Math.max(6, n);

      // cari posisi aman untuk tiap dev
      devNodes.forEach((d, i) => {
        let placed = false;
        let tries = 0;
        const jitter = (i % 3) * 0.08;

        while (!placed && tries < 20) {
          const theta = startAngle + i * angleStep + jitter + tries * 0.07;
          const x = bp.x + radius * Math.cos(theta);
          const y = bp.y + radius * Math.sin(theta);

          if (!willCollide(x, y, d.id(), 6)) {
            d.position({ x, y });
            d.lock();
            placed = true;
          } else {
            radius += 10;
            tries++;
          }
        }

        if (!placed) {
          d.position({ x: bp.x + (radius + 20), y: bp.y });
          d.lock();
        }
      });
    });
  });
}

function resolveDevCollisions(cy) {
  const DEV_RADIUS = 28;
  const BUG_RADIUS = 28;

  const devs = cy.nodes('node[type = "dev"]');
  const others = cy.nodes(
    'node[type = "bug"], node[type = "dev"], node[type = "query"]'
  );

  for (let iter = 0; iter < 8; iter++) {
    let moved = false;

    devs.forEach((d) => {
      const dp = d.position();
      let shiftX = 0;
      let shiftY = 0;

      others.forEach((o) => {
        if (o.id() === d.id()) return;
        const op = o.position();

        const dx = dp.x - op.x;
        const dy = dp.y - op.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const minDist =
          (o.data("type") === "bug" ? BUG_RADIUS : DEV_RADIUS) + DEV_RADIUS + 6;

        if (dist < minDist) {
          // dorong menjauh
          const push = (minDist - dist) * 0.6;
          shiftX += (dx / dist) * push;
          shiftY += (dy / dist) * push;
        }
      });

      if (Math.abs(shiftX) > 0.5 || Math.abs(shiftY) > 0.5) {
        d.position({ x: dp.x + shiftX, y: dp.y + shiftY });
        d.lock();
        moved = true;
      }
    });

    if (!moved) break;
  }
}

export default function EasyfixBugGraph({ data }) {
  const elements = useMemo(() => buildElements(data), [data]);
  const cyRef = useRef(null);

  const layout = {
    name: "concentric",
    fit: false,
    avoidOverlap: true,
    minNodeSpacing: 60,
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
    // Node default
    {
      selector: "node",
      style: {
        shape: "ellipse",
        width: 56,
        height: 56,
        "background-color": "#1f2937",
        "border-width": 3,
        "border-color": "#e5e7eb",
        label: "",
        "font-size": 11,
        color: "#0f172a",
        "text-background-color": "#ffffff",
        "text-background-opacity": 0.95,
        "text-background-padding": 2,
        "text-halign": "center",
        "text-wrap": "none",
        "overlay-opacity": 0,
        "z-index-compare": "auto",
      },
    },
    // Query (tanpa label)
    {
      selector: 'node[type = "query"]',
      style: {
        "background-color": "#C58B22",
        "border-color": "#E8BE72",
        label: "",
      },
    },
    // Bug: label = ID
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
    // Dev
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

    // Edge
    {
      selector: "edge",
      style: {
        "curve-style": "unbundled-bezier",
        "control-point-step-size": 30,
        "line-color": "#64748b",
        "line-opacity": 0.95,
        "target-arrow-shape": "none",
        "source-arrow-shape": "none",
        width: 2.5,
        "z-index-compare": "auto",
      },
    },
    // Edge query->bug (matches)
    {
      selector: 'edge[rel = "matches"]',
      style: {
        width: "mapData(weight, 1, 5, 3, 7.5)",
        "line-color": "#334155",
      },
    },
    // Edge dev->bug (assigned_to)
    {
      selector: 'edge[rel = "assigned_to"]',
      style: {
        "line-color": "#9333ea",
        width: 3,
        "line-opacity": 0.9,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "unbundled-bezier",
        "control-point-step-size": 30,
        "line-color": "#64748b",
        "line-opacity": 0.95,
        "target-arrow-shape": "none",
        "source-arrow-shape": "none",
        width: 2.5,
      },
    },
    // query -> bug
    {
      selector: 'edge[rel = "matches"]',
      style: {
        width: "mapData(weight, 1, 5, 3, 7.5)",
        "line-color": "#334155",
      },
    },
    // dev -> bug
    {
      selector: 'edge[rel = "assigned_to"]',
      style: {
        "line-color": "#9333ea",
        width: 3,
        "line-opacity": 0.9,
      },
    },
    // query -> dev
    {
      selector: 'edge[rel = "q_dev"]',
      style: {
        "line-color": "#0ea5e9", // biru-cyan
        "line-style": "dashed",
        width: "mapData(weight, 1, 10, 2, 5)", // opsional: tebal berdasar score/freq
        "line-opacity": 0.9,
      },
    },
  ];

  return (
    <div className="w-full h-full">
      <CytoscapeComponent
        cy={(cy) => {
          cyRef.current = cy;

          cy.nodes('node[type = "dev"]').lock();
          cy.layout(layout).run();

          placeDevelopersAroundBugs(cy);
          resolveDevCollisions(cy);

          // sentris & zoom
          cy.fit(undefined, 40);
          cy.center();

          // Klik BUG => buka Bugzilla
          cy.on("tap", "node", (evt) => {
            const id = evt.target.id();
            if (id.startsWith("bug:")) {
              const bugNum = id.split(":")[1];
              window.open(
                `https://bugzilla.mozilla.org/show_bug.cgi?id=${bugNum}`,
                "_blank"
              );
            }
          });
        }}
        elements={elements}
        layout={layout}
        stylesheet={stylesheet}
        style={{ width: "100%", height: "100%" }}
        wheelSensitivity={0.3}
        minZoom={0.3}
        maxZoom={3}
      />
    </div>
  );
}
