// Peer falso usando BroadcastChannel (só pra testar o online sem internet)
(() => {
  const bc = new BroadcastChannel('peer-mock');
  const peers = {};   // ids locais
  const ouvintes = [];
  bc.onmessage = e => ouvintes.forEach(f => f(e.data));
  const post = bc.postMessage.bind(bc); bc.postMessage = d => { post(d); const c = JSON.parse(JSON.stringify(d)); setTimeout(() => ouvintes.forEach(f => f(c)), 0); };
  const ev = () => { const h = {}; return { on(n, f) { (h[n] = h[n] || []).push(f); return this; }, emit(n, ...a) { (h[n] || []).forEach(f => f(...a)); } }; };
  window.Peer = function (id, opts) {
    if (typeof id === 'object' || id === undefined) id = 'p' + Math.random().toString(36).slice(2, 9);
    const self = Object.assign(ev(), { id, open: false, destroyed: false, disconnected: false, conns: {} });
    // checa se o id já existe em outra página
    let dono = false; const chk = Math.random();
    bc.postMessage({ t: 'quem', id, chk });
    const resp = d => { if (d.t === 'eu' && d.id === id && d.chk === chk) dono = true; };
    ouvintes.push(resp);
    setTimeout(() => {
      if (dono) { self.emit('error', { type: 'unavailable-id', message: 'id taken' }); return; }
      peers[id] = self; self.open = true; self.emit('open', id);
    }, 150);
    ouvintes.push(d => {
      if (d.t === 'quem' && peers[d.id] === self) bc.postMessage({ t: 'eu', id: d.id, chk: d.chk });
      if (d.t === 'conn' && d.para === id && peers[id] === self) {
        const c = mkConn(self, d.de, d.cid); self.conns[d.cid] = c; self.emit('connection', c);
        bc.postMessage({ t: 'aceito', para: d.de, cid: d.cid });
        setTimeout(() => { c.open = true; c.emit('open'); }, 20);
      }
      if (d.t === 'aceito' && d.para === id) { const c = self.conns[d.cid]; if (c) { c.aceito = true; c.open = true; c.emit('open'); } }
      if (d.t === 'msg' && self.conns[d.cid] && d.para === id) self.conns[d.cid].emit('data', d.data);
      if (d.t === 'fecha' && self.conns[d.cid] && d.para === id) { const c = self.conns[d.cid]; c.open = false; c.emit('close'); delete self.conns[d.cid]; }
    });
    self.connect = (outro, o) => {
      const cid = Math.random().toString(36).slice(2), c = mkConn(self, outro, cid); self.conns[cid] = c;
      bc.postMessage({ t: 'conn', de: id, para: outro, cid });
      setTimeout(() => { if (!c.aceito) self.emit('error', { type: 'peer-unavailable', message: 'Could not connect to peer ' + outro }); }, 800);
      return c;
    };
    self.destroy = () => { self.destroyed = true; delete peers[id]; };
    self.reconnect = () => { };
    return self;
  };
  function mkConn(dono, outro, cid) {
    const c = Object.assign(ev(), { peer: outro, open: false });
    c.send = data => bc.postMessage({ t: 'msg', para: outro, cid, data: JSON.parse(JSON.stringify(data)) });
    c.close = () => { bc.postMessage({ t: 'fecha', para: outro, cid }); c.open = false; };
    return c;
  }
})();
