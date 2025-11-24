"use client";

import React, { useMemo, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { useRouter } from "next/navigation";

// register layout sekali di browser
if (typeof window !== "undefined" && !window.__easyfixDagreRegistered) {
  cytoscape.use(dagre);
  window.__easyfixDagreRegistered = true;
}

function buildElements(raw) {
  const data = raw || {};

  const els = [];
  const nodeIds = new Set();
  const edgeIds = new Set();

  const bugs = Array.isArray(data.bugs) ? data.bugs : [];
  const developers = Array.isArray(data.developers) ? data.developers : [];
  const commits = Array.isArray(data.commits) ? data.commits : [];
  const relEdges = Array.isArray(data.edges) ? data.edges : [];

  const norm = (s) => (s || "").trim().toLowerCase();

  // 1) Node QUERY
  els.push({
    data: {
      id: "query",
      type: "query",
      title: data.query || "",
    },
  });
  nodeIds.add("query");

  // index dev & commit by id
  const devMap = new Map();
  developers.forEach((d) => {
    const key = String(d.developer_id ?? d.id ?? d.email ?? d.name);
    devMap.set(key, d);
  });

  const commitMap = new Map();
  commits.forEach((c) => {
    const key = String(c.commit_id ?? c.id ?? c.hash);
    commitMap.set(key, c);
  });

  const bugMap = new Map();

  const ensureBugNode = (bugId, bugObj = null) => {
    const key = String(bugId);
    if (bugMap.has(key)) return bugMap.get(key);

    const cyId = `bug:${key}`;
    if (!nodeIds.has(cyId)) {
      els.push({
        data: {
          id: cyId,
          type: "bug",
          bug_id: key,
          summary: bugObj?.summary || bugObj?.title || "",
          status: bugObj?.status || "",
          resolution: bugObj?.resolution || "",
          topic_label: bugObj?.topic_label || "",
          topic_score: bugObj?.topic_score ?? bugObj?.score ?? 0,
          created_at: bugObj?.created_at || "",
        },
      });
      nodeIds.add(cyId);
    }
    bugMap.set(key, cyId);
    return cyId;
  };

  const ensureDevNode = (devId) => {
    if (!devId) return null;
    const key = String(devId);
    const cyId = `dev:${key}`;
    if (nodeIds.has(cyId)) return cyId;

    const d = devMap.get(key);
    const label = d?.email || d?.name || key;
    els.push({
      data: {
        id: cyId,
        type: "dev",
        developer_id: key,
        email: label,
        name: d?.name || "",
        bug_ids: d?.bug_ids || [],
      },
    });
    nodeIds.add(cyId);
    return cyId;
  };

  const ensureCommitNode = (commitId) => {
    if (!commitId) return null;
    const key = String(commitId);
    const cyId = `commit:${key}`;
    if (nodeIds.has(cyId)) return cyId;

    const c = commitMap.get(key);
    els.push({
      data: {
        id: cyId,
        type: "commit",
        commit_id: key,
        hash: c?.hash || key,
        message: c?.message || "",
        repository: c?.repository || "",
        bug_ids: c?.bug_ids || [],
      },
    });
    nodeIds.add(cyId);
    return cyId;
  };

  // 2) BUG nodes + edge query->bug
  for (const b of bugs) {
    const bid = String(b.id ?? b.bug_id ?? b.bugId);
    const bugCyId = ensureBugNode(bid, b);

    const score =
      typeof b.topic_score === "number"
        ? b.topic_score
        : typeof b.score === "number"
        ? b.score
        : 0;

    const weight = Math.max(1, Math.round(score * 5)) || 1;

    const edgeId = `query->${bugCyId}`;
    if (!edgeIds.has(edgeId)) {
      els.push({
        data: {
          id: edgeId,
          source: "query",
          target: bugCyId,
          rel: "matches",
          weight,
        },
      });
      edgeIds.add(edgeId);
    }
  }

  // 3) Edges dari payload (bug-dev, bug-commit, dll.)
  for (const e of relEdges) {
    const sourceType = norm(e.source_type);
    const targetType = norm(e.target_type);
    const relType = norm(e.relation_type);

    let srcCyId = null;
    let tgtCyId = null;

    if (sourceType === "bug") {
      srcCyId = ensureBugNode(e.source_id);
    } else if (sourceType === "developer") {
      srcCyId = ensureDevNode(e.source_id);
    } else if (sourceType === "commit") {
      srcCyId = ensureCommitNode(e.source_id);
    }

    if (targetType === "bug") {
      tgtCyId = ensureBugNode(e.target_id);
    } else if (targetType === "developer") {
      tgtCyId = ensureDevNode(e.target_id);
    } else if (targetType === "commit") {
      tgtCyId = ensureCommitNode(e.target_id);
    }

    if (!srcCyId || !tgtCyId) continue;

    let rel = relType;
    if (relType === "assigned_to") rel = "assigned_to";
    else if (relType === "fixed_in") rel = "fixed_in";

    const edgeId = `${srcCyId}->${tgtCyId}:${rel}`;
    if (!edgeIds.has(edgeId)) {
      els.push({
        data: {
          id: edgeId,
          source: srcCyId,
          target: tgtCyId,
          rel,
        },
      });
      edgeIds.add(edgeId);
    }
  }

  return els;
}

// Fungsi kecil untuk “merenggangkan” commit yang terlalu mepet
function separateCommits(cy) {
  const commits = cy.nodes('node[type = "commit"]');
  const ITER = 8;
  const MIN_DIST = 60; // jarak minimal antar commit

  for (let k = 0; k < ITER; k++) {
    let moved = false;

    commits.forEach((n1, i) => {
      const p1 = n1.position();
      commits.forEach((n2, j) => {
        if (j <= i) return;
        const p2 = n2.position();

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy) || 1;

        if (dist < MIN_DIST) {
          const push = (MIN_DIST - dist) / 2;
          const ux = dx / dist;
          const uy = dy / dist;

          n1.position({ x: p1.x - ux * push, y: p1.y - uy * push });
          n2.position({ x: p2.x + ux * push, y: p2.y + uy * push });
          moved = true;
        }
      });
    });

    if (!moved) break;
  }
}

export default function EasyfixBugGraph({ data }) {
  const router = useRouter();
  const elements = useMemo(() => buildElements(data || {}), [data]);
  const cyRef = useRef(null);

  const layout = {
    name: "cose",
    fit: true,
    padding: 30,
    animate: true,
    animationDuration: 600,
    nodeRepulsion: (node) => {
      const t = node.data("type");
      if (t === "commit") return 3500;
      if (t === "dev") return 2500;
      if (t === "bug") return 2600;
      return 2600; // query
    },
    idealEdgeLength: (edge) => {
      const rel = edge.data("rel");
      if (rel === "assigned_to") return 70;
      if (rel === "fixed_in") return 80;
      return 90;
    },
    edgeElasticity: 250,
    gravity: 40,
  };

  const stylesheet = [
    {
      selector: "node",
      style: {
        shape: "ellipse", // circle (width == height)
        "background-color": "#1f2937",
        "border-width": 2,
        "border-color": "#e5e7eb",
        width: 46,
        height: 46,
        label: "",
        "font-size": 10,
        color: "#0f172a",
        "text-background-color": "#ffffff",
        "text-background-opacity": 0.95,
        "text-background-padding": 3,
        "text-wrap": "wrap",
        "text-max-width": 80,
        "text-halign": "center",
        "text-valign": "center",
        "overlay-opacity": 0,
      },
    },
    {
      selector: 'node[type = "query"]',
      style: {
        "background-color": "#f97316",
        "border-color": "#fed7aa",
        width: 54,
        height: 54,
        label: "data(title)",
        "font-weight": "bold",
        "font-size": 11,
        color: "#111827",
        "text-max-width": 120,
      },
    },
    {
      selector: 'node[type = "bug"]',
      style: {
        "background-color": "#ec4899",
        "border-color": "#f9a8d4",
        width: 50,
        height: 50,
        label: "data(bug_id)",
        "font-weight": "bold",
        "text-valign": "bottom",
        "text-margin-y": 8,
      },
    },
    {
      selector: 'node[type = "dev"]',
      style: {
        "background-color": "#2563eb",
        "border-color": "#bfdbfe",
        width: 48,
        height: 48,
        label: "data(email)",
        "font-size": 9,
        "text-valign": "center",
      },
    },
    {
      selector: 'node[type = "commit"]',
      style: {
        "background-color": "#059669",
        "border-color": "#6ee7b7",
        width: 44,
        height: 44,
        label: "data(hash)",
        "font-size": 8,
        "text-valign": "top",
        "text-margin-y": -8,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "unbundled-bezier",
        "control-point-step-size": 25,
        "line-color": "#cbd5f5",
        "line-opacity": 0.9,
        "target-arrow-shape": "triangle",
        "target-arrow-color": "#cbd5f5",
        width: 1.3,
      },
    },
    {
      selector: 'edge[rel = "matches"]',
      style: {
        "line-color": "#64748b",
        "target-arrow-color": "#64748b",
        width: "mapData(weight, 1, 5, 1.5, 3.5)",
      },
    },
    {
      selector: 'edge[rel = "assigned_to"]',
      style: {
        "line-color": "#a855f7",
        "target-arrow-color": "#a855f7",
        "line-style": "dashed",
        width: 2,
      },
    },
    {
      selector: 'edge[rel = "fixed_in"]',
      style: {
        "line-color": "#22c55e",
        "target-arrow-color": "#22c55e",
        width: 2,
      },
    },
  ];

  return (
    <div className="w-full h-full">
      <CytoscapeComponent
        cy={(cy) => {
          cyRef.current = cy;

          cy.layout(layout).run();
          separateCommits(cy);
          cy.fit(undefined, 30);

          cy.on("tap", "node", (evt) => {
            const id = evt.target.id();
            if (id.startsWith("bug:")) {
              const bugNum = id.split(":")[1];
              if (bugNum) window.open(`/bugs/${bugNum}`, "_blank");
            } else if (id.startsWith("dev:")) {
              const devKey = id.split(":")[1];
              if (devKey) window.open(`/developers/${encodeURIComponent(devKey)}`, "_blank");
            }
          });
        }}
        elements={elements}
        layout={layout}
        stylesheet={stylesheet}
        style={{ width: "100%", height: "100%" }}
        wheelSensitivity={0.3}
        minZoom={0.4}
        maxZoom={3}
      />
    </div>
  );
}
