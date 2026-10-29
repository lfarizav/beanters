/* The ink drawing of a Kubernetes cluster, in page units (820 x 1100).
   One source for both renderers: the WebGL scene lifts these strokes into 3D,
   the SVG fallback draws them with stroke-dashoffset.
   Layer order = reading order: 0 basics, 1 admin, 2 dev, 3 security. */
(function () {
  "use strict";
  var W = 820, H = 1100;

  function rect(x0, y0, x1, y1) { return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]; }
  function rrect(x0, y0, x1, y1, r) {
    var p = [], k, a, n = 5;
    var c = [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]];
    c.forEach(function (q) {
      for (k = 0; k <= n; k++) {
        a = (q[2] + (90 * k) / n) * Math.PI / 180;
        p.push([q[0] + r * Math.cos(a), q[1] + r * Math.sin(a)]);
      }
    });
    p.push(p[0].slice());
    return p;
  }
  function circle(cx, cy, r, n) {
    var p = [], k; n = n || 14;
    for (k = 0; k <= n; k++) { var a = (k / n) * Math.PI * 2; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return p;
  }
  function hexagon(cx, cy, r) {
    var p = [], k;
    for (k = 0; k <= 6; k++) { var a = (k / 6) * Math.PI * 2 + Math.PI / 6; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return p;
  }
  /* Split a polyline into dashes, each a 2-point polyline. */
  function dashed(poly, dash, gap) {
    var out = [], i, on = true, left = dash;
    for (i = 0; i < poly.length - 1; i++) {
      var a = poly[i], b = poly[i + 1], dx = b[0] - a[0], dy = b[1] - a[1];
      var len = Math.hypot(dx, dy), t = 0;
      while (t < len) {
        var step = Math.min(left, len - t);
        if (on) out.push([[a[0] + dx * t / len, a[1] + dy * t / len], [a[0] + dx * (t + step) / len, a[1] + dy * (t + step) / len]]);
        t += step; left -= step;
        if (left <= 1e-6) { on = !on; left = on ? dash : gap; }
      }
    }
    return out;
  }
  function shield(cx, cy, s) {
    return [[cx, cy - s], [cx + s * 0.8, cy - s * 0.7], [cx + s * 0.75, cy + s * 0.05],
      [cx + s * 0.45, cy + s * 0.6], [cx, cy + s], [cx - s * 0.45, cy + s * 0.6],
      [cx - s * 0.75, cy + s * 0.05], [cx - s * 0.8, cy - s * 0.7], [cx, cy - s]];
  }
  function fence(x0, y0, x1, y1, step, tick) {
    var out = [rect(x0, y0, x1, y1)], x, y;
    for (x = x0; x <= x1 + 0.1; x += step) { out.push([[x, y0 - tick], [x, y0]]); out.push([[x, y1], [x, y1 + tick]]); }
    for (y = y0 + step; y < y1; y += step) { out.push([[x0 - tick, y], [x0, y]]); out.push([[x1, y], [x1 + tick, y]]); }
    return out;
  }

  var nodesX = [[90, 290], [310, 510], [530, 730]];
  var NODE_Y0 = 640, NODE_Y1 = 1000, BUS_Y = 560;
  var pods = [];
  nodesX.forEach(function (n) { pods.push([n[0] + 55, 780]); pods.push([n[0] + 145, 780]); });

  var L0 = [rrect(40, 40, 780, 1060, 44), [[80, BUS_Y], [740, BUS_Y]]];
  /* the cluster's network: little ports along the bus */
  [140, 300, 460, 620].forEach(function (x) { L0.push([[x, BUS_Y - 10], [x, BUS_Y + 10]]); });

  var L1 = [rect(200, 90, 620, 330)];
  [230, 330, 430, 530].forEach(function (x) { L1.push(rect(x, 170, x + 80, 250)); });
  L1.push([[230, 128], [400, 128]]);                                   /* the control plane's label rule */
  L1.push([[410, 330], [410, BUS_Y]]);
  nodesX.forEach(function (n) {
    L1.push(rect(n[0], NODE_Y0, n[1], NODE_Y1));
    L1.push([[(n[0] + n[1]) / 2, BUS_Y], [(n[0] + n[1]) / 2, NODE_Y0]]);
    L1.push([[n[0] + 20, NODE_Y1 - 40], [n[0] + 90, NODE_Y1 - 40]]); /* kubelet rule */
  });

  var L2 = [];
  pods.forEach(function (p) { L2.push(hexagon(p[0], p[1], 34)); L2.push(circle(p[0], p[1], 12, 10)); });
  /* the Deployment: a dashed frame spanning a pod in every node */
  dashed(rrect(100, 724, 720, 836, 22), 18, 12).forEach(function (d) { L2.push(d); });
  L2.push([[120, 900], [700, 900]]);

  var L3 = [shield(712, 190, 46), [[696, 190], [708, 204], [730, 176]]];
  fence(538, 726, 722, 834, 23, 13).forEach(function (f) { L3.push(f); });
  fence(176, 70, 644, 350, 26, 12).forEach(function (f) { L3.push(f); });

  /* traffic: pod in node 1 to pod in node 3, through the cluster network */
  var packetPath = [[pods[0][0], pods[0][1] - 34], [pods[0][0], BUS_Y], [pods[5][0], BUS_Y], [pods[5][0], pods[5][1] - 34]];

  window.CLUSTER_INK = { W: W, H: H, layers: [L0, L1, L2, L3], packetPath: packetPath };
})();
