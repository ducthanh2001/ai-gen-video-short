// Shared (browser + node): compile SHOTS (sentence-anchored) into absolute times using SENT (voice timing).
(function (g) {
  const sid = {}; g.SENT.forEach((s, i) => { sid[s.id] = i; });
  function compile(SHOTS) {
    const out = [];
    SHOTS.forEach(sh => {
      const a = sid[sh.a]; if (a === undefined) throw new Error('unknown sentence ' + sh.a);
      const b = sid[sh.b || sh.a]; if (b === undefined) throw new Error('unknown sentence ' + sh.b);
      out.push(Object.assign({}, sh, { _a: a, _b: b }));
    });
    // group shots that share the same (a,b) span, then split that span equally (or by weights)
    const res = []; let i = 0;
    while (i < out.length) {
      let j = i; while (j + 1 < out.length && out[j + 1]._a === out[i]._a && out[j + 1]._b === out[i]._b && out[j + 1].split) j++;
      const grp = out.slice(i, j + 1);
      const t0 = g.SENT[grp[0]._a].s, endSent = g.SENT[grp[0]._b];
      const nextStart = (grp[0]._b + 1 < g.SENT.length) ? g.SENT[grp[0]._b + 1].s : g.END;
      const t1 = nextStart; // the gap after the sentence belongs to this shot
      const wsum = grp.reduce((n, x) => n + (x.w || 1), 0); let acc = t0;
      grp.forEach(x => { const d = (t1 - t0) * (x.w || 1) / wsum; x.t0 = acc; x.t1 = acc + d; acc += d; res.push(x); });
      i = j + 1;
    }
    // first shot must begin at 0 and be contiguous; extend the first shot to 0
    if (res.length) res[0].t0 = 0;
    for (let k = 1; k < res.length; k++) if (Math.abs(res[k].t0 - res[k - 1].t1) > 1e-6) res[k - 1].t1 = res[k].t0;
    res[res.length - 1].t1 = g.END;
    return res;
  }
  g.compileShots = compile;
})(typeof window !== 'undefined' ? window : globalThis);
