'use strict';

// Оболочка страниц AI-расшифровок (тёмная тема HR PRO AI).
// Дизайн перенесён из claude.ai/design «HR PRO AI - Decode Kowalska»:
// плоский амбиентный фон (сетка + свечения), hero с аватаром кандидата и статус-пиллем,
// семантически-цветной спектр, блоки «Суть», «At a glance», framework быть/делать/иметь,
// нотация, структурированные фасеты точек, портрет, вердикт, перспектива.
// AI отдаёт только контент секций (по этим классам); спектр и hero рисует сервер.

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Общий CSS дизайн-системы.
const CSS = `
:root{
  --t1:#f4f6ff; --t2:#d4dbf0; --t3:#aab2ce; --tm:#8b93ad; --tf:#6b7291;
  --accent:#b3a4ff; --accent2:#8b6cff; --blue:#6f97ff;
  --paper:#0a0c1a; --card:#0d1022; --card2:#0e1226;
  --bd:rgba(255,255,255,.1); --bd2:rgba(255,255,255,.07); --bd3:rgba(255,255,255,.05);
  --line:rgba(255,255,255,.12); --dot:rgba(255,255,255,.3); --dotbg:#0b0e20;
  --grid:rgba(120,130,190,.05); --zoneMid:rgba(255,255,255,.05);
  --zVLow:#e0555b; --zLow:#ff8a6a; --zMid:#e0a83a; --zHigh:#43e0a0; --zVHigh:#6f97ff;
  --coral:#ff7a5c; --green:#43e0a0; --amber:#e6b84e; --red:#ff6b6b;
  --r:16px; --r-s:12px;
  --serif:'Manrope',system-ui,sans-serif;
  --sans:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  --mono:'JetBrains Mono','SFMono-Regular',Menlo,monospace;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;color:var(--t2);font-family:var(--sans);font-size:14.5px;line-height:1.62;
  -webkit-font-smoothing:antialiased;
  background:linear-gradient(180deg,#0c0f22,var(--paper) 46%,#0b0e20);}
b,strong{font-weight:700;color:var(--t1)}
p{margin:0 0 11px}
a{color:#8b9bff;text-decoration:none}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
@keyframes dk-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes dk-pulse{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes docfade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
/* ambient background */
.bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);
  background-size:56px 56px}
.bg-glow{position:fixed;z-index:0;pointer-events:none;border-radius:50%}
.bg-glow.g1{top:-160px;left:50%;transform:translateX(-50%);width:1200px;height:620px;
  background:radial-gradient(ellipse at center,rgba(103,90,224,.24),transparent 66%)}
.bg-glow.g2{top:900px;right:-240px;width:640px;height:640px;
  background:radial-gradient(circle at center,rgba(139,108,255,.08),transparent 64%)}
.bg-glow.g3{top:2200px;left:-260px;width:660px;height:660px;
  background:radial-gradient(circle at center,rgba(111,151,255,.07),transparent 64%)}
.page{position:relative;z-index:1;max-width:980px;margin:0 auto;padding:0 40px;animation:docfade .5s ease both}

/* ============ HERO ============ */
.hero{padding:40px 0 30px}
.hero-top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:40px}
.brand{display:flex;align-items:center;gap:12px}
.brand-tx{line-height:1.15}
.brand-tx b{display:block;font-family:var(--serif);font-weight:800;letter-spacing:.04em;font-size:15px;color:#fff}
.brand-tx span{font-size:11px;color:var(--tm)}
.toolbar{display:flex;align-items:center;gap:10px}
.tbtn{display:inline-flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--bd);
  color:var(--t2);font-family:var(--sans);font-weight:600;font-size:13px;padding:10px 16px;border-radius:12px;cursor:pointer;text-decoration:none}
.tbtn:hover{border-color:var(--accent2)}
.tbtn.primary{border:none;background:linear-gradient(135deg,#7b5cff,#4f78e6);color:#fff;font-weight:700;box-shadow:0 8px 20px rgba(123,108,255,.35)}
.eyebrow{font-family:var(--mono);font-weight:700;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
.hero-title{font-family:var(--serif);font-weight:800;letter-spacing:-.02em;font-size:44px;line-height:1.05;margin:0 0 14px;color:var(--t1)}
.hero-sub{font-size:15px;line-height:1.6;color:var(--t3);margin:0 0 26px;max-width:56ch}
.hero-meta{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.hero-cand{display:flex;align-items:center;gap:14px}
.avatar{width:56px;height:56px;flex:none;border-radius:16px;background:linear-gradient(135deg,#6f6ae0,#4f78e6);
  display:grid;place-items:center;font-family:var(--serif);font-weight:800;font-size:20px;color:#fff;box-shadow:0 10px 26px rgba(79,120,230,.4)}
.cand-name{font-family:var(--serif);font-weight:800;font-size:19px;color:var(--t1)}
.cand-role{font-size:13px;color:var(--t3);margin-top:2px}
.status-pill{display:inline-flex;align-items:center;gap:10px;border-radius:999px;padding:9px 16px;
  font-family:var(--serif);font-weight:700;font-size:13px}
.status-pill .sd{width:8px;height:8px;border-radius:50%;animation:dk-pulse 2.4s ease-in-out infinite}
.status-pill.ok{background:rgba(67,224,160,.1);border:1px solid rgba(67,224,160,.32);color:#7fe9bf}
.status-pill.ok .sd{background:#43e0a0;box-shadow:0 0 10px #43e0a0}
.status-pill.mid{background:rgba(224,168,58,.12);border:1px solid rgba(224,168,58,.34);color:#f0c96a}
.status-pill.mid .sd{background:#e6b84e;box-shadow:0 0 10px #e6b84e}
.status-pill.risk{background:rgba(224,85,91,.12);border:1px solid rgba(224,85,91,.34);color:#ff9a9a}
.status-pill.risk .sd{background:#ff6b6b;box-shadow:0 0 10px #ff6b6b}
.hero-spacer{flex:1}

/* ============ AT A GLANCE ============ */
.glance{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:8px}
.gcard{background:rgba(255,255,255,.025);border:1px solid var(--bd);border-radius:16px;padding:16px}
.gcard .gk{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--tm);font-weight:700}
.gcard .gv{font-family:var(--serif);font-weight:800;font-size:24px;color:var(--t1);margin-top:9px;line-height:1}
.gcard .gv.good{color:var(--green)}.gcard .gv.warn{color:var(--zLow)}.gcard .gv.bad{color:var(--zVLow)}.gcard .gv.hi{color:var(--blue)}
.gcard .gs{font-size:11.5px;line-height:1.4;color:var(--t3);margin-top:7px}

/* ============ ESSENCE ============ */
.essence{position:relative;margin-top:14px;border-radius:18px;padding:22px 24px;overflow:hidden;
  background:radial-gradient(120% 160% at 0% 0%,rgba(139,108,255,.16),var(--card2) 66%);border:1px solid rgba(139,108,255,.26)}
.ess-eyebrow{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:9px}
.ess-line{font-family:var(--serif);font-weight:700;font-size:19px;line-height:1.45;color:var(--t1);letter-spacing:-.01em}
.ess-split{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
.ess-good,.ess-bad{border-radius:13px;padding:13px 14px}
.ess-good{background:rgba(67,224,160,.08);border:1px solid rgba(67,224,160,.24)}
.ess-bad{background:rgba(224,85,91,.08);border:1px solid rgba(224,85,91,.24)}
.ess-good .el,.ess-bad .el{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px}
.ess-good .el{color:#43e0a0}.ess-bad .el{color:#ff8a8a}
.ess-good .et,.ess-bad .et{font-size:12.5px;line-height:1.5;color:var(--t2)}

/* ============ SPECTRUM ============ */
.spectrum{margin-top:40px}
.spectrum-head{display:flex;align-items:baseline;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:14px}
.spectrum-head h2{font-family:var(--serif);font-weight:800;font-size:22px;letter-spacing:-.01em;color:var(--t1);margin:0}
.zonekey{display:flex;flex-wrap:wrap;gap:14px}
.zonekey span{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--tm)}
.zonekey .k{width:10px;height:10px;border-radius:3px}
.complegend{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--coral);font-weight:600}
.complegend .cdot{width:9px;height:9px;border-radius:50%;background:var(--coral);box-shadow:0 0 0 3px rgba(255,122,92,.18),0 0 8px rgba(255,122,92,.6)}
.spectrum-body{background:var(--card);border:1px solid var(--bd);border-radius:20px;padding:18px 24px 10px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.srow{display:grid;grid-template-columns:200px 1fr 108px;align-items:center;gap:16px;padding:8px 0}
.slabel{display:flex;align-items:center;gap:11px;min-width:0}
.slabel .sk{width:30px;height:30px;flex:none;border-radius:9px;display:grid;place-items:center;
  font-family:var(--mono);font-weight:800;font-size:14px}
.slabel .sn{min-width:0}
.slabel .snm{font-size:13px;font-weight:600;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.slabel .scomp{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:.05em;color:#ffb27a}
.strack{position:relative;height:24px}
.zoneband{position:absolute;inset:6px 0;border-radius:6px;
  background:linear-gradient(90deg,rgba(224,85,91,.26) 0 16%,rgba(255,138,106,.2) 16% 34%,var(--zoneMid) 34% 66%,rgba(67,224,160,.2) 66% 84%,rgba(111,151,255,.26) 84% 100%)}
.gzero{position:absolute;left:50%;top:3px;bottom:3px;width:1.5px;background:var(--dot)}
.sbar{position:absolute;top:7px;height:9px;border-radius:6px;transform-origin:left;animation:dk-grow .9s cubic-bezier(.22,.68,.24,1) both}
.sdot{position:absolute;top:2px;width:15px;height:15px;border-radius:50%;background:var(--dotbg);transform:translateX(-7px)}
.sval{text-align:right}
.sval .num{display:block;font-family:var(--mono);font-weight:800;font-size:16px;line-height:1}
.sval .zlab{font-size:10px;color:var(--tm);text-transform:uppercase;letter-spacing:.03em}
.saxis{display:grid;grid-template-columns:200px 1fr 108px;gap:16px;padding:8px 0 4px}
.saxis .ax{position:relative;height:14px}
.saxis .ax span{position:absolute;transform:translateX(-50%);font-family:var(--mono);font-size:9.5px;color:var(--tm)}
.saxis .ax span.z{color:var(--t1);font-weight:700}
/* zone color helpers */
.z-vlow{color:var(--zVLow)} .z-low{color:var(--zLow)} .z-mid{color:var(--zMid)} .z-high{color:var(--zHigh)} .z-vhigh{color:var(--zVHigh)}
.kb-vlow{background:var(--zVLow)} .kb-low{background:var(--zLow)} .kb-mid{background:var(--zMid)} .kb-high{background:var(--zHigh)} .kb-vhigh{background:var(--zVHigh)}

/* ===== КАБИНЕТНАЯ ГРАФИКА (спектр «из кабинета» + синдромы) ===== */
.ocachart{border:1px solid var(--bd);border-radius:20px;padding:16px 22px 12px;background:var(--card);box-shadow:0 20px 60px rgba(0,0,0,.3)}
.oca-row{display:grid;grid-template-columns:202px 78px 1fr 116px;align-items:center;gap:14px;padding:8px 0}
.oca-row.zc{padding:0 0 9px;margin-bottom:5px;border-bottom:1px dashed var(--line)}
.zc-head{position:relative;height:14px;font-size:11px;color:var(--tm);font-weight:700}
.zc-head span{position:absolute;transform:translateX(-50%);white-space:nowrap}
.oca-name b{font-family:var(--serif);font-weight:800;color:var(--accent)}
.oca-name>span{font-weight:650;font-size:13.5px;color:var(--t1)}
.oca-name i{display:block;font-style:normal;font-size:11px;color:var(--tm);margin-top:1px}
.oca-val{display:flex;align-items:center;justify-content:flex-end;gap:6px;font-family:var(--mono);font-weight:800;font-size:15.5px}
.oca-val .oca-num{text-align:right}
.ptmarks{display:inline-flex;align-items:center;gap:4px}
.ptmark{display:inline-flex;align-items:center;justify-content:center;line-height:1}
.ptmark.comp{color:var(--coral);font-weight:900;font-size:16px}
.ptmark.bolt{color:#e8932a}
.oca-val.zn0{color:#e0555b}.oca-val.zn1{color:#ff8a6a}.oca-val.zn2{color:#e0a83a}.oca-val.zn3{color:#6f97ff}.oca-val.zn4{color:#43e0a0}
.oca-track{position:relative;height:22px;background:#182136;border-radius:7px}
.oca-bar{position:absolute;left:0;top:0;bottom:0;border-radius:7px;min-width:5px;z-index:1;box-shadow:0 1px 3px rgba(0,0,0,.3);transform-origin:left center;animation:dk-grow .7s cubic-bezier(.22,.68,.24,1) both}
.oca-track .gl{position:absolute;top:-2px;bottom:-2px;width:0;z-index:2;border-left:1.5px dashed rgba(210,222,248,.32)}
.oca-bar.g1{background:#3d6cd1}.oca-bar.g2{background:#1fa8c9}.oca-bar.g3{background:#e8932a}.oca-bar.g4{background:#1f9d6b}
.oca-bar.comp{box-shadow:inset 0 0 0 2px var(--coral),0 0 0 2px rgba(255,122,92,.28)}
.oca-bar.comp::after{content:"";position:absolute;right:-3px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:var(--coral);border:2px solid var(--card);z-index:3}
.oca-zlab{font-size:10px;text-transform:uppercase;letter-spacing:.03em;font-weight:700;text-align:right}
.oca-zlab.zn0{color:#e0555b}.oca-zlab.zn1{color:#ff8a6a}.oca-zlab.zn2{color:#e0a83a}.oca-zlab.zn3{color:#6f97ff}.oca-zlab.zn4{color:#43e0a0}
.oca-row.axis{padding:6px 0 0}
.oca-axis{position:relative;height:16px;border-top:1px solid var(--bd)}
.oca-axis i{position:absolute;top:4px;transform:translateX(-50%);font-family:var(--mono);font-size:11px;font-weight:600;color:var(--tm)}
.oca-axis i:first-child{transform:translateX(-15%)}.oca-axis i:last-child{transform:translateX(-85%)}
.oca-legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:14px;font-size:11.5px;color:var(--tm);font-weight:600}
.oca-legend span{display:inline-flex;align-items:center;gap:6px}
.oca-legend i{width:12px;height:12px;border-radius:3px;display:inline-block}
.oca-legend .lg-comp{color:var(--coral);font-weight:900;font-size:14px;margin-right:2px}
.oca-legend .lg-bolt{display:inline-flex;color:#e8932a;margin-right:3px}
/* синдромы «из кабинета» */
.syn-leg{display:flex;flex-wrap:wrap;gap:8px 14px;padding:11px 15px;margin:0 0 16px;background:var(--card);border:1px solid var(--bd);border-radius:13px;font-size:12px;color:var(--tm)}
.syn-leg span{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.syn-leg b{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;border-radius:6px;font-size:12px;font-weight:800;padding:0 4px}
.syn-leg b.up{background:rgba(47,158,95,.2);color:#43e0a0}
.syn-leg b.down{background:rgba(200,60,60,.2);color:#ff8a8a}
.syn-leg b.comp{background:rgba(90,110,230,.24);color:#8ea2ff}
.syn-leg b.float{background:rgba(232,147,42,.24);color:#e8b45a}
.syn-leg b.op{background:rgba(150,162,196,.18);color:#c3cbe4}
.syn-f{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.syn-pt{position:relative;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;font-family:var(--mono);font-weight:800;font-size:13px;color:#fff;flex:0 0 auto}
.syn-pt.up{background:#2f9e5f}.syn-pt.down{background:#a13b3b}.syn-pt.comp{background:#4b5bd6}.syn-pt.float{background:#b8862b}
.syn-pt i{position:absolute;top:-7px;right:-7px;font-style:normal;font-size:10px;line-height:1;background:var(--dotbg);border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 1px var(--bd);color:var(--t1)}
.syn-op{color:var(--tm);font-weight:800;font-size:15px;padding:0 1px}
.synd-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin:0}
.synd{background:var(--card);border:1px solid var(--bd);border-left:3px solid var(--accent2);border-radius:14px;padding:16px 18px;font-size:13.2px;line-height:1.6;color:var(--t2);break-inside:avoid}
.synd b{display:block;margin-bottom:6px;font-family:var(--serif);font-weight:700;font-size:14.5px;color:var(--t1)}
@media(max-width:720px){.oca-row{grid-template-columns:104px 60px 1fr;gap:9px}.oca-zlab{display:none}.oca-name i{display:none}.oca-row.axis{grid-template-columns:104px 60px 1fr}.synd-grid{grid-template-columns:1fr}.syn-leg{flex-wrap:nowrap;overflow-x:auto}}

/* ============ SECTION HEADS ============ */
.sec{margin:44px 0 0}
.sec-head{display:flex;align-items:center;gap:14px;margin-bottom:18px}
.sec-num{flex:none;font-family:var(--mono);font-weight:800;font-size:13px;color:#fff;
  background:linear-gradient(135deg,#5b6ef0,#8b6cff);border-radius:10px;width:32px;height:32px;
  display:inline-flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(139,108,255,.4)}
.sec-head h2{font-family:var(--serif);font-weight:800;font-size:22px;letter-spacing:-.01em;margin:0;color:var(--t1)}
.sec-head .rule{flex:1;height:1px;background:linear-gradient(90deg,var(--line),transparent)}
h3.subh{font-family:var(--serif);font-weight:700;font-size:15.5px;margin:18px 0 8px;color:var(--accent)}

/* ============ FRAMEWORK быть/делать/иметь ============ */
.fw{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.fw-card{background:var(--card);border:1px solid var(--bd);border-radius:15px;padding:15px 16px}
.fw-card.be{border-color:rgba(111,151,255,.3)}
.fw-card.do{border-color:rgba(139,108,255,.3)}
.fw-card.have{border-color:rgba(67,224,160,.3)}
.fw-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.fw-zone{font-family:var(--serif);font-weight:800;font-size:14px;letter-spacing:.02em}
.fw-card.be .fw-zone,.fw-card.be .fw-tag{color:var(--blue)}
.fw-card.do .fw-zone,.fw-card.do .fw-tag{color:var(--accent)}
.fw-card.have .fw-zone,.fw-card.have .fw-tag{color:var(--green)}
.fw-tag{font-family:var(--mono);font-size:10px;font-weight:700;text-transform:uppercase}
.fw-pts{font-family:var(--mono);font-size:12px;color:var(--t2);margin-top:9px;letter-spacing:.02em}
.fw-note{font-size:12px;line-height:1.5;color:var(--tm);margin-top:8px}

/* ============ NOTATION ============ */
.notation{display:flex;gap:8px 18px;flex-wrap:wrap;margin-top:22px;padding:12px 16px;background:var(--card);border:1px solid var(--bd2);border-radius:13px}
.notation span{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;color:var(--t2)}
.notation .sym{font-family:var(--mono);font-weight:800;font-size:13px;color:var(--accent);min-width:16px;text-align:center}

/* ============ SYNDROMES (variant-классы для manual/presentation; базовая .synd-grid/.synd — в кабинетном блоке ниже) ============ */
.synd.yes{border:1px solid rgba(67,224,160,.28);background:linear-gradient(180deg,rgba(67,224,160,.07),rgba(255,255,255,.01))}
.synd.no{border:1px solid var(--bd);background:rgba(255,255,255,.015)}
.synd-h{display:flex;align-items:center;gap:9px;margin-bottom:13px}
.synd-ic{flex:none;width:22px;height:22px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:13px}
.synd.yes .synd-ic{background:#43e0a0;color:#052015}
.synd.no .synd-ic{background:#4b5470;color:#c3cbe4}
.synd-h b{font-family:var(--serif);font-weight:700;font-size:14.5px;color:var(--t1)}
.synd-tags{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:11px;min-height:34px}
.synd-tag{position:relative;display:inline-grid;place-items:center;width:34px;height:34px;border-radius:10px;
  background:rgba(139,108,255,.14);border:1.5px solid rgba(139,108,255,.4);font-family:var(--mono);font-weight:800;font-size:14px;color:var(--accent)}
.synd-tag.hi{background:rgba(111,151,255,.14);border-color:rgba(111,151,255,.42);color:var(--blue)}
.synd-tag.lo{background:rgba(255,138,106,.13);border-color:rgba(255,138,106,.4);color:var(--zLow)}
.synd-tag .dir{position:absolute;top:-7px;right:-7px;width:17px;height:17px;border-radius:50%;background:var(--dotbg);
  border:1.5px solid currentColor;display:grid;place-items:center;font-size:10px;font-weight:800;line-height:1}
.synd-op{font-family:var(--mono);font-weight:800;font-size:16px;color:var(--tm)}
.synd-trig{font-family:var(--mono);font-size:10px;color:var(--accent);background:rgba(139,108,255,.12);border-radius:6px;padding:4px 8px;display:inline-block;margin-bottom:10px}
.synd.no .synd-trig{color:var(--tm);background:rgba(255,255,255,.05)}
.synd-mean{font-size:12.5px;line-height:1.55;color:var(--t3)}
.synd-mean b{color:var(--t1)}

/* ============ POINT CARDS ============ */
.pgrid{display:flex;flex-direction:column;gap:14px}
.pcard{position:relative;border:1px solid var(--bd);border-radius:18px;background:rgba(255,255,255,.02);overflow:hidden;break-inside:avoid}
.pcard.comp{border-color:rgba(255,122,92,.3);background:linear-gradient(180deg,rgba(255,122,92,.05),rgba(255,255,255,.01))}
.pcard::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--accent2)}
.pcard.comp::before{background:var(--coral)}
.pcard .strip{display:none}
.pc-head{display:flex;align-items:center;gap:16px;padding:18px 22px 16px;border-bottom:1px solid var(--bd2)}
.pc-letter{width:46px;height:46px;flex:none;border-radius:13px;display:grid;place-items:center;
  font-family:var(--serif);font-weight:800;font-size:22px;
  color:var(--accent);background:rgba(139,108,255,.12);border:1px solid rgba(139,108,255,.28)}
.pcard.comp .pc-letter{color:var(--coral);background:rgba(255,122,92,.12);border-color:rgba(255,122,92,.3)}
.pc-mid{flex:1;min-width:0}
.pc-name{font-family:var(--serif);font-weight:800;font-size:18px;color:var(--t1);display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.pc-comp{font-family:var(--mono);font-size:9px;font-weight:800;color:#ffb27a;background:rgba(255,122,92,.14);
  border:1px solid rgba(255,122,92,.34);border-radius:999px;padding:2px 8px;letter-spacing:.04em}
.pc-mini{position:relative;height:6px;margin-top:9px;border-radius:4px;background:var(--bd2);max-width:280px}
.pc-mini .z{position:absolute;left:50%;top:-2px;bottom:-2px;width:1.5px;background:var(--dot)}
.pc-mini .b{position:absolute;top:0;height:6px;border-radius:4px}
.pc-val{text-align:right;flex:none}
.pc-num{display:block;font-family:var(--mono);font-weight:800;font-size:24px;line-height:1}
.pc-zone{display:inline-block;margin-top:6px;font-size:10px;text-transform:uppercase;letter-spacing:.04em;padding:2px 9px;border-radius:999px;border:1px solid currentColor}
.pc-facets{padding:8px 22px 16px}
.facet{display:grid;grid-template-columns:132px 1fr;gap:16px;padding:10px 0;border-bottom:1px solid var(--bd3)}
.facet:last-child{border-bottom:none}
.facet-l{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);padding-top:2px}
.facet-t{font-size:13.5px;line-height:1.58;color:var(--t2)}
.facet-t b{color:var(--t1)}
/* legacy point-card layout (prose body) — совместимость с текущим выводом ИИ */
.pc-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:16px 20px 0}
.pc-id{display:flex;align-items:center;gap:14px}
.pc-body{padding:10px 20px 16px;font-size:13.7px;line-height:1.6;color:var(--t2)}
.pc-body b{color:var(--t1)}
.pc-num.comp{color:var(--coral)}
.pc-zone.z-low,.pc-zone.z-vlow{color:var(--zLow)}
.pc-zone.z-mid{color:var(--zMid)}
.pc-zone.z-high{color:var(--zHigh)}
.pc-zone.z-vhigh{color:var(--zVHigh)}

/* ============ PORTRAIT ============ */
.portrait{display:flex;flex-direction:column;gap:14px}
.pr-card{background:var(--card);border:1px solid var(--bd2);border-radius:16px;padding:20px 22px}
.pr-card h3{font-family:var(--serif);font-weight:800;font-size:16px;margin:0 0 10px;color:var(--t1)}
.pr-body{font-size:13.5px;line-height:1.68;color:var(--t2)}
.pr-body b{color:var(--t1)}
.pr-bullets{display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;margin-top:14px}
.pr-bul{display:flex;gap:9px;font-size:12.5px;line-height:1.5;color:var(--t3)}
.pr-bul .mk{color:#8b6cff;flex:none;font-weight:800}
.pr-bul b{color:var(--t1);font-weight:700}

/* ============ VERDICT ============ */
.verdict{border-radius:20px;overflow:hidden;margin:34px 0 16px;border:1px solid rgba(224,168,58,.3);box-shadow:0 20px 60px rgba(0,0,0,.3);break-inside:avoid}
.verdict-h{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:18px 24px;color:#fff;background:linear-gradient(135deg,#8a5a12,#d89a2a)}
.verdict.ok{border-color:rgba(67,224,160,.32)}
.verdict.ok .verdict-h{background:linear-gradient(135deg,#1f7a52,#43e0a0)}
.verdict.risk{border-color:rgba(224,85,91,.34)}
.verdict.risk .verdict-h{background:linear-gradient(135deg,#a62b2b,#ff6b6b)}
.verdict-badge{font-family:var(--mono);font-weight:700;font-size:11px;letter-spacing:.05em;text-transform:uppercase;flex:none;
  background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:6px 14px}
.verdict-h h3{font-family:var(--serif);font-weight:800;font-size:18px;margin:0;color:#fff}
.verdict-body{padding:20px 24px;background:linear-gradient(180deg,rgba(224,168,58,.07),rgba(255,255,255,.01))}
.verdict.ok .verdict-body{background:linear-gradient(180deg,rgba(67,224,160,.06),rgba(255,255,255,.01))}
.verdict.risk .verdict-body{background:linear-gradient(180deg,rgba(224,85,91,.06),rgba(255,255,255,.01))}
.verdict-lead{font-size:14px;line-height:1.65;color:var(--t2);margin-bottom:16px}
.verdict-lead b{color:var(--t1)}
.vcols{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.vcol h4{font-family:var(--mono);font-size:11px;margin:0 0 10px;text-transform:uppercase;letter-spacing:.06em}
.vcol.ok h4{color:#43e0a0}.vcol.risk h4{color:#ff8a6a}
.vitem{display:flex;gap:10px;font-size:13px;line-height:1.5;color:var(--t2);margin-bottom:8px}
.vitem .mk{flex:none;font-weight:800}
.vcol.ok .mk{color:#43e0a0}.vcol.risk .mk{color:#ff8a6a}
/* legacy verdict list markup */
.vcol h4{font-family:var(--mono);font-size:11px;margin:0 0 10px;text-transform:uppercase;letter-spacing:.06em;color:var(--tm)}
.vcol ul{margin:0;padding-left:18px}.vcol ul li{margin-bottom:5px;color:var(--t2)}.vcol ul li b{color:var(--t1)}
/* legacy do/don't chips */
.chiprow{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}
.chip{display:flex;align-items:flex-start;gap:9px;border-radius:10px;padding:10px 13px;font-size:13px;line-height:1.5;border:1px solid var(--bd);color:var(--t2)}
.chip::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;margin-top:7px}
.chip.do{background:rgba(67,224,160,.1);border-color:rgba(67,224,160,.28)}
.chip.do::before{background:var(--green);box-shadow:0 0 8px rgba(67,224,160,.6)}
.chip.dont{background:rgba(255,107,107,.1);border-color:rgba(255,107,107,.28)}
.chip.dont::before{background:var(--red);box-shadow:0 0 8px rgba(255,107,107,.6)}

/* ============ PERSPECTIVE ============ */
.persp{display:flex;gap:14px;align-items:flex-start;background:rgba(224,168,58,.06);border:1px solid rgba(224,168,58,.26);border-radius:16px;padding:18px 20px;margin-top:14px}
.persp-ic{width:34px;height:34px;flex:none;border-radius:10px;background:rgba(224,168,58,.14);border:1px solid rgba(224,168,58,.36);display:grid;place-items:center}
.persp-h{font-family:var(--serif);font-weight:700;font-size:14.5px;color:var(--amber);margin-bottom:5px}
.persp-b{font-size:13px;line-height:1.62;color:var(--t3)}
.persp-b b{color:var(--t1)}

/* callouts / tables / lists kept for AI flexibility */
.callout{border:1px solid var(--bd);border-left:4px solid var(--accent2);border-radius:var(--r-s);padding:14px 18px;margin:16px 0;background:linear-gradient(120deg,rgba(139,108,255,.07),rgba(255,255,255,.01));break-inside:avoid}
.callout .co-title{font-family:var(--serif);font-weight:700;font-size:14.5px;margin-bottom:5px;color:var(--accent)}
.callout .co-body{font-size:13.7px;color:var(--t2)}
.callout.warn{border-left-color:var(--amber);background:linear-gradient(120deg,rgba(224,169,78,.09),rgba(255,255,255,.01))}
.callout.warn .co-title{color:#e3b45f}
.callout.risk{border-left-color:var(--red);background:linear-gradient(120deg,rgba(255,107,107,.08),rgba(255,255,255,.01))}
.callout.risk .co-title{color:#ff8a8a}
.callout.ok{border-left-color:var(--green);background:linear-gradient(120deg,rgba(67,224,160,.08),rgba(255,255,255,.01))}
.callout.ok .co-title{color:#5fe0b0}
.tw{margin:14px 0;border:1px solid var(--bd);border-radius:var(--r-s);overflow:hidden}
table{width:100%;border-collapse:collapse;font-size:13px}
thead th{background:linear-gradient(135deg,#5b6ef0,#8b6cff);color:#fff;text-align:left;font-weight:700;padding:10px 13px;font-size:12.5px}
tbody td{padding:9px 13px;border-top:1px solid var(--bd);vertical-align:top;color:var(--t2)}
tbody tr:nth-child(even) td{background:rgba(255,255,255,.02)}
tbody td b{color:var(--t1)}
ul.clean{margin:8px 0;padding-left:20px}ul.clean li{margin-bottom:5px;color:var(--t2)}
ul.clean li b{color:var(--t1)}
ol{margin:8px 0;padding-left:22px}ol li{margin-bottom:5px}

.note{font-size:12px;line-height:1.6;color:var(--tf);margin-top:20px;padding-top:16px;border-top:1px solid var(--bd2)}
.foot{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;
  padding:22px 40px;background:rgba(0,0,0,.28);border-top:1px solid var(--bd2);margin-top:30px}
.foot-l{display:flex;align-items:center;gap:11px;font-size:12.5px;color:var(--t2)}
.foot-r{font-family:var(--serif);font-weight:800;letter-spacing:.05em;font-size:13px;color:var(--tm)}

/* ===== Модалка «Поделиться» ===== */
.sh-overlay{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
.sh-bg{position:absolute;inset:0;background:rgba(4,5,12,.68);backdrop-filter:blur(5px)}
.sh-panel{position:relative;width:460px;max-width:100%;background:linear-gradient(180deg,#14182f,#0d1022);border:1px solid var(--bd);border-radius:22px;padding:26px 26px 24px;box-shadow:0 40px 100px rgba(0,0,0,.6),0 0 60px rgba(123,108,255,.14)}
.sh-x{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:10px;border:1px solid var(--bd);background:var(--card);color:var(--t2);cursor:pointer;font-size:15px;display:grid;place-items:center}
.sh-x:hover{border-color:var(--accent2)}
.sh-head{display:flex;align-items:center;gap:12px}
.sh-ic{width:44px;height:44px;flex:none;border-radius:13px;background:linear-gradient(135deg,#7b5cff,#4f78e6);display:grid;place-items:center;box-shadow:0 8px 20px rgba(123,108,255,.4)}
.sh-title{font-family:var(--serif);font-weight:800;font-size:18px;color:#fff}
.sh-sub{font-size:12.5px;color:var(--t3);margin-top:2px}
.sh-copy{display:flex;align-items:center;gap:8px;margin-top:20px;background:rgba(255,255,255,.04);border:1px solid var(--bd);border-radius:12px;padding:6px 6px 6px 14px}
.sh-copy input{flex:1;min-width:0;background:transparent;border:none;outline:none;color:var(--t2);font-family:var(--mono);font-size:12.5px}
.sh-copybtn{flex:none;border:none;cursor:pointer;background:linear-gradient(135deg,#7b5cff,#4f78e6);color:#fff;font-family:var(--sans);font-weight:700;font-size:12.5px;padding:9px 15px;border-radius:9px}
.sh-copybtn.ok{background:linear-gradient(135deg,#1f7a52,#43e0a0)}
.sh-div{display:flex;align-items:center;gap:10px;margin:20px 0 14px}
.sh-div i{flex:1;height:1px;background:var(--bd)}
.sh-div span{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--tf)}
.sh-chan{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.sh-ch{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 8px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid var(--bd);text-decoration:none;cursor:pointer}
.sh-ch:hover{border-color:var(--accent2)}
.sh-ch>span:last-child{font-size:11.5px;font-weight:600;color:var(--t2)}
.sh-chic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center}
.sh-chic svg{width:20px;height:20px}
.sh-sms-lbl{font-family:var(--serif);font-weight:700;font-size:14px;color:var(--t1);margin-bottom:10px}
.sh-sms-row{display:flex;gap:8px}
.sh-sms-row input{flex:1;min-width:0;background:rgba(255,255,255,.04);border:1px solid var(--bd);border-radius:11px;padding:11px 14px;color:var(--t1);font-family:var(--sans);font-size:14px;outline:none}
.sh-sms-row input:focus{border-color:var(--accent2)}
.sh-sms-row .sh-copybtn{padding:11px 18px;border-radius:11px}
.sh-sms-msg{min-height:16px;font-size:12.5px;margin-top:9px}
.sh-sms-msg.ok{color:#43e0a0}
.sh-sms-msg.err{color:#ff8a8a}
.sh-sms-back{margin-top:6px;background:none;border:none;color:var(--t3);font-family:var(--sans);font-size:12.5px;cursor:pointer;padding:2px 0}
.sh-sms-back:hover{color:var(--accent)}
.sh-foot{display:flex;align-items:center;gap:8px;margin-top:16px;font-size:11.5px;color:var(--tf)}
.sh-foot svg{width:14px;height:14px;flex:none;stroke:#43e0a0}
@media(max-width:520px){.sh-chan{grid-template-columns:repeat(3,1fr)}}

@media (max-width:720px){
  .page{padding:0 18px}
  .hero{padding:28px 0 22px}.hero-title{font-size:30px}
  .glance{grid-template-columns:1fr 1fr}
  .ess-split,.fw,.synd-grid,.vcols,.pr-bullets{grid-template-columns:1fr}
  .srow,.saxis{grid-template-columns:92px 1fr 76px;gap:10px}
  .slabel .snm{font-size:12px}
  .facet{grid-template-columns:1fr;gap:3px}
  .foot{padding:18px;flex-direction:column;gap:10px;text-align:center}
  .toolbar .tbtn span{display:none}
}
@media print{
  @page{size:A4;margin:10mm}
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .no-print{display:none!important}
  .bg-grid,.bg-glow{position:absolute}
  .page{max-width:none}
  .sec,.pcard,.synd,.verdict,.persp,.tw,.gcard,.fw-card,.pr-card{break-inside:avoid}
  a{color:inherit}
}
`;

const LOGO = (stroke, w) => `<svg width="${w}" height="${w}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M32 4 56 18 56 46 32 60 8 46 8 18Z" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round" opacity="0.9"/>
  <line x1="33" y1="31" x2="22" y2="25" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
  <line x1="33" y1="31" x2="41" y2="21" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
  <line x1="33" y1="31" x2="46" y2="35" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
  <line x1="33" y1="31" x2="29" y2="45" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="22" cy="25" r="3.4" stroke="${stroke}" stroke-width="2" fill="none"/>
  <circle cx="41" cy="21" r="3.6" stroke="${stroke}" stroke-width="2" fill="none"/>
  <circle cx="46" cy="35" r="3.2" stroke="${stroke}" stroke-width="2" fill="none"/>
  <circle cx="29" cy="45" r="3" stroke="${stroke}" stroke-width="2" fill="none"/>
  <circle cx="33" cy="31" r="4.2" fill="#FF7A5C"/>
</svg>`;

// Зона по значению −100..+100 (совпадает со шкалой портала oca.js) + семантический цвет.
function zoneOf(v) {
  if (v >= 68) return { cls: 'z-vhigh', kb: 'kb-vhigh', label: 'очень высокая', col: '#6f97ff' };
  if (v >= 32) return { cls: 'z-high', kb: 'kb-high', label: 'высокая', col: '#43e0a0' };
  if (v > -32) return { cls: 'z-mid', kb: 'kb-mid', label: 'средняя', col: '#e0a83a' };
  if (v > -68) return { cls: 'z-low', kb: 'kb-low', label: 'низкая', col: '#ff8a6a' };
  return { cls: 'z-vlow', kb: 'kb-vlow', label: 'очень низкая', col: '#e0555b' };
}

// Компульсивность точки: точка (кроме D) компульсивна, если её значение выше D хотя бы на 1 при D ≥ +32.
// До +8 над D — «пограничная».
function compInfo(points, order) {
  const dVal = points.D ? points.D.value : -100;
  const on = dVal >= 32;
  const comps = [];
  for (const k of order) {
    if (k === 'D' || !on) continue;
    const v = points[k].value;
    if (v > dVal) comps.push({ key: k, diff: v - dVal, borderline: v - dVal <= 8 });
  }
  return { dVal, on, comps, isComp: k => on && k !== 'D' && points[k].value > dVal,
    borderline: k => { const c = comps.find(x => x.key === k); return c ? c.borderline : false; } };
}

// rgba из hex + alpha
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Спектр в стиле кабинета (перенос из public/js/app.js: barChart/barRow/chartLegend) ──
// Группы точек по цвету бара: A–C внутреннее наполнение (синий), D уверенность (циан),
// E–G эффективность (оранжевый), H–J отношения (зелёный).
const OCA_GRP = { A: 'g1', B: 'g1', C: 'g1', D: 'g2', E: 'g3', F: 'g3', G: 'g3', H: 'g4', I: 'g4', J: 'g4' };
const ZBOUNDS = [16, 34, 66, 84]; // границы 5 зон в % ширины (±68/±32 на шкале −100..+100)
const GLINES = [16, 34, 66, 84];
const AXIS = [['−100', 0], ['−68', 16], ['−32', 34], ['+32', 66], ['+68', 84], ['+100', 100]];
const ICON_BOLT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>';
const SPEC_I18N = {
  ru: { title: 'Спектр · 10 точек личности', zcols: ['Очень низкий', 'Низкий', 'Средний', 'Высокий', 'Очень высокий'],
    g1: 'A–C · внутреннее наполнение', g2: 'D · уверенность', g3: 'E–G · эффективность', g4: 'H–J · отношения',
    comp: 'компульсивная точка', bolt: 'плавающая точка (молния)' },
  pl: { title: 'Spektrum · 10 punktów osobowości', zcols: ['Bardzo niski', 'Niski', 'Średni', 'Wysoki', 'Bardzo wysoki'],
    g1: 'A–C · wnętrze', g2: 'D · pewność', g3: 'E–G · efektywność', g4: 'H–J · relacje',
    comp: 'punkt kompulsywny', bolt: 'punkt pływający' },
  en: { title: 'Spectrum · 10 personality points', zcols: ['Very low', 'Low', 'Medium', 'High', 'Very high'],
    g1: 'A–C · inner make-up', g2: 'D · certainty', g3: 'E–G · effectiveness', g4: 'H–J · relations',
    comp: 'compulsive point', bolt: 'floating point' },
};
const GRP_COL = { g1: '#3d6cd1', g2: '#1fa8c9', g3: '#e8932a', g4: '#1f9d6b' };
function zn(w) { const b = ZBOUNDS; return 'zn' + (w < b[0] ? 0 : w < b[1] ? 1 : w < b[2] ? 2 : w < b[3] ? 3 : 4); }

function spectrum(points, order, lang) {
  const T = SPEC_I18N[lang] || SPEC_I18N.ru;
  const ci = compInfo(points, order);
  const hasComp = order.some(k => ci.isComp(k));
  const hasBolt = order.some(k => points[k].manic);
  // строка-шапка зон
  const b = ZBOUNDS, cc = [b[0] / 2, (b[0] + b[1]) / 2, (b[1] + b[2]) / 2, (b[2] + b[3]) / 2, (b[3] + 100) / 2];
  const zoneHead = `<div class="oca-row zc"><span></span><span></span><div class="zc-head">${T.zcols.map((z, i) => `<span style="left:${cc[i]}%">${esc(z)}</span>`).join('')}</div><span></span></div>`;
  const rows = order.map(k => {
    const pt = points[k];
    const w = Math.max(0, Math.min(100, (pt.value + 100) / 2));
    const grp = OCA_GRP[k] || 'g1';
    const num = pt.value > 0 ? '+' + pt.value : '' + pt.value;
    const z = zn(w);
    const comp = ci.isComp(k);
    const compMark = comp ? '<span class="ptmark comp" aria-label="компульсивная">‼</span>' : '';
    const boltMark = pt.manic ? `<span class="ptmark bolt" aria-label="плавающая">${ICON_BOLT}</span>` : '';
    const marks = (compMark || boltMark) ? `<span class="ptmarks">${compMark}${boltMark}</span>` : '';
    const poles = pt.low ? `<i>${esc(pt.low)} — ${esc(pt.high)}</i>` : '';
    return `<div class="oca-row">
      <div class="oca-name"><b>${k}.</b> <span>${esc(pt.name)}</span>${poles}</div>
      <div class="oca-val ${z}">${marks}<span class="oca-num">${num}</span></div>
      <div class="oca-track"><div class="oca-bar ${grp}${comp ? ' comp' : ''}" style="width:${w.toFixed(1)}%"></div>${GLINES.map(x => `<i class="gl" style="left:${x}%"></i>`).join('')}</div>
      <div class="oca-zlab ${z}">${esc(pt.label || '')}</div></div>`;
  }).join('\n');
  const axis = `<div class="oca-row axis"><span></span><span></span><div class="oca-axis">${AXIS.map(a => `<i style="left:${a[1]}%">${a[0]}</i>`).join('')}</div><span></span></div>`;
  const g = (color, label) => `<span><i style="background:${color}"></i>${esc(label)}</span>`;
  const legend = `<div class="oca-legend">${g(GRP_COL.g1, T.g1)}${g(GRP_COL.g2, T.g2)}${g(GRP_COL.g3, T.g3)}${g(GRP_COL.g4, T.g4)}` +
    (hasComp ? `<span class="lg-mark"><b class="lg-comp">‼</b>${esc(T.comp)}</span>` : '') +
    (hasBolt ? `<span class="lg-mark"><b class="lg-bolt">${ICON_BOLT}</b>${esc(T.bolt)}</span>` : '') + `</div>`;
  return `<div class="spectrum">
      <div class="spectrum-head"><h2>${esc(T.title)}</h2></div>
      <div class="ocachart">${zoneHead}${rows}${axis}</div>
      ${legend}
    </div>`;
}

// ── Синдромы в стиле кабинета (перенос: synFormula/synLegend/synBlock) ──
// Формула вида 'E↑»D↑', 'A↓+C↓+G↓+F↑', 'E‼', 'B⚡' → визуальные плашки точек.
function synFormula(f) {
  if (!f) return '';
  const out = [];
  for (let i = 0; i < f.length; i++) {
    const ch = f[i];
    if (/[A-L]/.test(ch)) {
      const m = f[i + 1]; let cls = '', badge = '';
      if (m === '↑') { cls = 'up'; badge = '↑'; i++; }
      else if (m === '↓') { cls = 'down'; badge = '↓'; i++; }
      else if (m === '‼') { cls = 'comp'; badge = '‼'; i++; }
      else if (m === '⚡') { cls = 'float'; badge = '⚡'; i++; }
      out.push(`<span class="syn-pt ${cls}">${ch}${badge ? `<i>${badge}</i>` : ''}</span>`);
    } else if (ch === '+' || ch === '›' || ch === '»') {
      out.push(`<span class="syn-op">${ch}</span>`);
    }
  }
  return out.length ? `<div class="syn-f">${out.join('')}</div>` : '';
}
const SYN_I18N = {
  ru: { head: 'Синдромы · сочетания и перекосы точек', hi: 'высокая точка', lo: 'низкая точка', reinf: 'усиливают друг друга',
    skew: 'перекос: одна выше другой', skew2: 'сильный перекос', comp: 'компульсивная', float: 'плавающая', none: 'По формальным условиям синдромы не сработали.' },
  pl: { head: 'Syndromy · kombinacje i przechyły punktów', hi: 'wysoki punkt', lo: 'niski punkt', reinf: 'wzmacniają się',
    skew: 'przechył: jeden wyższy', skew2: 'silny przechył', comp: 'kompulsywny', float: 'pływający', none: 'Formalnie żaden syndrom nie zadziałał.' },
  en: { head: 'Syndromes · point combinations & skews', hi: 'high point', lo: 'low point', reinf: 'reinforce each other',
    skew: 'skew: one above the other', skew2: 'strong skew', comp: 'compulsive', float: 'floating', none: 'No syndromes triggered by formal rules.' },
};
function syndromesBlock(result, lang) {
  const T = SYN_I18N[lang] || SYN_I18N.ru;
  const list = (result && result.syndromes) || [];
  const legItems = [['up', '↑', T.hi], ['down', '↓', T.lo], ['op', '+', T.reinf], ['op', '›', T.skew], ['op', '»', T.skew2], ['comp', '‼', T.comp], ['float', '⚡', T.float]];
  const legend = `<div class="syn-leg">${legItems.map(([c, s, l]) => `<span><b class="${c}">${s}</b> ${esc(l)}</span>`).join('')}</div>`;
  const head = `<div class="sec-head"><span class="sec-num">01</span><h2>${esc(T.head)}</h2><div class="rule"></div></div>`;
  if (!list.length) return `<div class="sec">${head}${legend}<div class="callout"><div class="co-body">${esc(T.none)}</div></div></div>`;
  const cards = list.map(s => `<div class="synd">${synFormula(s.f)}<b>${esc(s.title)}</b>${esc(s.text)}</div>`).join('');
  return `<div class="sec">${head}${legend}<div class="synd-grid">${cards}</div></div>`;
}

// Инициалы кандидата для аватара.
function initialsOf(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '•';
  const a = parts[0][0] || '';
  const b = parts.length > 1 ? (parts[parts.length - 1][0] || '') : '';
  return (a + b).toUpperCase();
}

// Локализация «обвязки» страницы (контент секций приходит от ИИ уже на нужном языке).
const UI = {
  back: { ru: 'Вернуться в портал', pl: 'Wróć do portalu', en: 'Back to portal' },
  pdf: { ru: 'Скачать PDF', pl: 'Pobierz PDF', en: 'Download PDF' },
  tagline: { ru: 'технология, которая чувствует людей', pl: 'technologia, która czuje ludzi', en: 'technology that reads people' },
  footTag: { ru: 'Мы раскрываем личность, чтобы вы создавали сильные команды.', pl: 'Odkrywamy osobowość, byś budował silne zespoły.', en: 'We reveal personality so you can build strong teams.' },
  share: { ru: 'Поделиться', pl: 'Udostępnij', en: 'Share' },
  shareT: { ru: 'Поделиться расшифровкой', pl: 'Udostępnij interpretację', en: 'Share the report' },
  shareSub: { ru: 'По ссылке отчёт откроется у любого получателя', pl: 'Link otworzy raport u każdego odbiorcy', en: 'The link opens the report for any recipient' },
  copy: { ru: 'Копировать', pl: 'Kopiuj', en: 'Copy' },
  copied: { ru: 'Скопировано', pl: 'Skopiowano', en: 'Copied' },
  quick: { ru: 'Быстрая отправка', pl: 'Szybkie wysłanie', en: 'Quick send' },
  note30: { ru: 'Ссылка действует 30 дней', pl: 'Link ważny 30 dni', en: 'Link valid for 30 days' },
  smsAsk: { ru: 'Отправить ссылку по SMS', pl: 'Wyślij link przez SMS', en: 'Send the link via SMS' },
  smsPh: { ru: 'Номер получателя, напр. +48600100200', pl: 'Numer odbiorcy, np. +48600100200', en: 'Recipient number, e.g. +48600100200' },
  smsSend: { ru: 'Отправить', pl: 'Wyślij', en: 'Send' },
  smsBack: { ru: 'Назад', pl: 'Wstecz', en: 'Back' },
  smsOk: { ru: 'SMS со ссылкой отправлено на ', pl: 'SMS z linkiem wysłano na ', en: 'SMS with the link sent to ' },
  smsErr: { ru: 'Не удалось отправить SMS', pl: 'Nie udało się wysłać SMS', en: 'Failed to send SMS' },
  shareMsg: { ru: 'Расшифровка теста кандидата — HR PRO AI:', pl: 'Interpretacja testu kandydata — HR PRO AI:', en: 'Candidate test report — HR PRO AI:' },
};
function L(key, lang) { const o = UI[key] || {}; return o[lang] || o.ru || ''; }

// Модалка «Поделиться» (дизайн из claude.ai/design) + логика: публичная ссылка, копирование, каналы, SMS.
function shareModalHtml(share, lang) {
  const T = { copy: L('copy', lang), copied: L('copied', lang), smsAsk: L('smsAsk', lang), smsPh: L('smsPh', lang), smsSend: L('smsSend', lang), smsBack: L('smsBack', lang), smsOk: L('smsOk', lang), smsErr: L('smsErr', lang), msg: L('shareMsg', lang) };
  const ic = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M21.9 4.3 18.6 20c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9-8.1c.4-.3-.1-.5-.6-.2L6.1 13.6l-4.8-1.5c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3Z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6a9 9 0 0 1-3.7-3.3c-.3-.4-.7-1-.7-1.9 0-.9.5-1.3.6-1.5.2-.2.4-.2.6-.2h.4c.2 0 .4 0 .5.4l.7 1.6c0 .2.1.3 0 .5l-.3.4-.3.3c-.1.1-.3.3-.1.5.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4 0 .5-.1l.6-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z"/></svg>',
    viber: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2C7 2 3 5.6 3 10c0 2.3 1.1 4.4 2.9 5.8L5 21l4.2-1.6c.9.2 1.8.3 2.8.3 5 0 9-3.6 9-8s-4-8.7-9-8.7Zm4.5 11.4c-.2.5-1 .9-1.4 1-.4.1-.8.2-2.6-.6-2.2-.9-3.6-3.2-3.7-3.4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.2.6-.2h.4c.1 0 .3 0 .5.4.2.4.6 1.5.7 1.6 0 .1.1.2 0 .4-.3.6-.6.6-.4.9.7 1.2 1.5 1.6 2.6 2.1.2.1.3.1.5-.1l.6-.7c.2-.2.3-.1.5-.1l1.4.7c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z"/></svg>',
    sms: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-11.9 7.8L3 21l1.7-5.1A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>',
  };
  const shareSvg = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
  const linkSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--t3)" stroke-width="2" style="flex:none"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const lockSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="#43e0a0" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  return `<div id="shareModal" class="sh-overlay no-print" style="display:none">
    <div class="sh-bg" onclick="dkShareClose()"></div>
    <div class="sh-panel">
      <button class="sh-x" onclick="dkShareClose()" aria-label="close">✕</button>
      <div class="sh-head"><span class="sh-ic">${shareSvg}</span><div><div class="sh-title">${esc(L('shareT', lang))}</div><div class="sh-sub">${esc(L('shareSub', lang))}</div></div></div>
      <div class="sh-copy">${linkSvg}<input id="shUrl" readonly onfocus="this.select()" value="…"><button id="shCopy" class="sh-copybtn" onclick="dkShareCopy()">${esc(T.copy)}</button></div>
      <div class="sh-div"><i></i><span>${esc(L('quick', lang))}</span><i></i></div>
      <div class="sh-chan" id="shChan"></div>
      <div class="sh-sms" id="shSms" style="display:none">
        <div class="sh-sms-lbl">${esc(L('smsAsk', lang))}</div>
        <div class="sh-sms-row"><input id="shSmsInput" type="tel" inputmode="tel" placeholder="${esc(L('smsPh', lang))}"><button class="sh-copybtn" id="shSmsSend" onclick="dkShareSmsSend()">${esc(L('smsSend', lang))}</button></div>
        <div class="sh-sms-msg" id="shSmsMsg"></div>
        <button class="sh-sms-back" onclick="dkShareSmsBack()">← ${esc(L('smsBack', lang))}</button>
      </div>
      <div class="sh-foot">${lockSvg}${esc(L('note30', lang))}</div>
    </div>
  </div>
  <script>(function(){
    var TID=${JSON.stringify(String(share.testId))},KIND=${JSON.stringify(String(share.kind))},T=${JSON.stringify(T)},ICO=${JSON.stringify(ic)};
    var url='';
    function renderChan(){
      var tx=encodeURIComponent(T.msg),u=encodeURIComponent(url);
      var cs=[['E-mail','#3a6ae0','mail','mailto:?subject='+tx+'&body='+u],['Telegram','#2aabee','tg','https://t.me/share/url?url='+u+'&text='+tx],['WhatsApp','#25d366','wa','https://wa.me/?text='+tx+'%20'+u],['Viber','#7360f2','viber','viber://forward?text='+tx+'%20'+u],['SMS','#1f9d6b','sms','']];
      document.getElementById('shChan').innerHTML=cs.map(function(c){var sms=c[2]==='sms';return '<a class="sh-ch" '+(sms?'href="#" onclick="dkShareSms();return false"':'href="'+c[3]+'" target="_blank" rel="noopener"')+'><span class="sh-chic" style="background:'+c[1]+'">'+ICO[c[2]]+'</span><span>'+c[0]+'</span></a>';}).join('');
    }
    window.dkShareOpen=async function(){
      var m=document.getElementById('shareModal');m.style.display='flex';
      if(!url){try{var r=await fetch('/api/decode/'+TID+'/'+KIND+'/share',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});var d=await r.json();url=d.url||'';}catch(e){}document.getElementById('shUrl').value=url;renderChan();}
    };
    window.dkShareClose=function(){document.getElementById('shareModal').style.display='none';};
    window.dkShareCopy=function(){var i=document.getElementById('shUrl');i.select();try{document.execCommand('copy');}catch(e){}try{navigator.clipboard&&navigator.clipboard.writeText(url);}catch(e){}var b=document.getElementById('shCopy');b.textContent=T.copied;b.classList.add('ok');setTimeout(function(){b.textContent=T.copy;b.classList.remove('ok');},1600);};
    window.dkShareSms=function(){document.getElementById('shChan').style.display='none';document.getElementById('shSms').style.display='block';document.getElementById('shSmsMsg').textContent='';document.getElementById('shSmsMsg').className='sh-sms-msg';var i=document.getElementById('shSmsInput');i.value='';setTimeout(function(){i.focus();},50);};
    window.dkShareSmsBack=function(){document.getElementById('shSms').style.display='none';document.getElementById('shChan').style.display='grid';};
    window.dkShareSmsSend=async function(){
      var i=document.getElementById('shSmsInput'),msg=document.getElementById('shSmsMsg'),btn=document.getElementById('shSmsSend');
      var to=(i.value||'').trim(); if(to.replace(/\\D/g,'').length<9){msg.textContent=T.smsErr;msg.className='sh-sms-msg err';return;}
      btn.disabled=true;msg.textContent='…';msg.className='sh-sms-msg';
      try{var r=await fetch('/api/decode/'+TID+'/'+KIND+'/share/sms',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({to:to})});var d=await r.json();
        if(r.ok&&d.ok){msg.textContent=T.smsOk+to;msg.className='sh-sms-msg ok';i.value='';setTimeout(dkShareSmsBack,2200);}
        else{msg.textContent=T.smsErr+(d.error?': '+d.error:'');msg.className='sh-sms-msg err';}
      }catch(e){msg.textContent=T.smsErr;msg.className='sh-sms-msg err';}
      btn.disabled=false;
    };
  })();</script>`;
}

// Достаёт из тела расшифровки статус пригодности: <... data-fit="ok|mid|risk" data-fit-label="...">
function extractFit(bodyHtml) {
  const s = String(bodyHtml || '');
  const mf = s.match(/data-fit=["'](ok|mid|risk)["']/i);
  const ml = s.match(/data-fit-label=["']([^"']{1,90})["']/i);
  if (!mf) return null;
  return { fit: mf[1].toLowerCase(), label: ml ? ml[1] : '' };
}

// Удаляет сбалансированные <div>-блоки, чьё содержимое проходит тест `contains`.
function removeBlocksMatching(html, openRe, contains) {
  let out = html, from = 0, guard = 0;
  while (guard++ < 60) {
    const rest = out.slice(from); const m = rest.match(openRe);
    if (!m) break;
    const start = from + m.index;
    let depth = 0, end = -1; const re = /<div\b|<\/div>/g; re.lastIndex = start; let mm;
    while ((mm = re.exec(out))) { if (mm[0] === '</div>') { depth--; if (depth === 0) { end = mm.index + 6; break; } } else depth++; }
    if (end < 0) break;
    const block = out.slice(start, end);
    if (contains.test(block)) { out = out.slice(0, start) + out.slice(end); from = start; }
    else { from = end; }
  }
  return out;
}
// Убирает синдромы, написанные ИИ (портал вставляет свои из методики по [[SYNDROMES]]) — во избежание дублей.
function stripAiSyndromes(html) {
  let h = removeBlocksMatching(html, /<div class="sec">/, /class="synd-grid"|class="syn-leg"/);
  h = removeBlocksMatching(h, /<div class="synd-grid"[^>]*>/, /[\s\S]*/);
  h = removeBlocksMatching(h, /<div class="syn-leg"[^>]*>/, /[\s\S]*/);
  return h;
}

// Убирает блок перспективы (.persp …</div></div>) из тела — если должность не руководящая.
function stripPersp(html) {
  const i = html.indexOf('<div class="persp"');
  if (i < 0) return html;
  // находим сбалансированное закрытие div
  let depth = 0; const re = /<div\b|<\/div>/g; re.lastIndex = i; let m, end = -1;
  while ((m = re.exec(html))) { if (m[0] === '</div>') { depth--; if (depth === 0) { end = m.index + 6; break; } } else depth++; }
  return end > i ? (html.slice(0, i) + html.slice(end)) : html;
}

// Полная HTML-страница расшифровки.
// opts: { title, eyebrow, heroTitle, heroSub, candidate, vacancy, spectrumHtml, syndromesHtml, bodyHtml, backUrl, lang, isLead }
function page(opts) {
  const o = opts || {};
  const lang = ['ru', 'pl', 'en'].includes(o.lang) ? o.lang : 'ru';
  const spectrumHtml = o.spectrumHtml || '';
  const syndromesHtml = o.syndromesHtml || '';
  let body = o.bodyHtml || '';
  // Синдромы, если ИИ всё же их написал, — убираем (портал вставит свои из методики).
  if (syndromesHtml) body = stripAiSyndromes(body);
  // Перспектива руководителя — только если должность руководящая; иначе вырезаем блок.
  if (o.isLead === false) body = stripPersp(body);
  // Спектр вставляется на месте маркера [[SPECTRUM]] (после «at a glance»); иначе — перед телом.
  body = body.indexOf('[[SPECTRUM]]') >= 0 ? body.replace('[[SPECTRUM]]', spectrumHtml) : (spectrumHtml + body);
  // Синдромы (секция 01, из методики) — на месте маркера [[SYNDROMES]]; иначе сразу после спектра.
  if (syndromesHtml) {
    body = body.indexOf('[[SYNDROMES]]') >= 0
      ? body.replace('[[SYNDROMES]]', syndromesHtml)
      : (spectrumHtml && body.indexOf(spectrumHtml) >= 0 ? body.replace(spectrumHtml, spectrumHtml + syndromesHtml) : (body + syndromesHtml));
  }

  const fit = extractFit(o.bodyHtml);
  const pill = fit
    ? `<div class="status-pill ${fit.fit}"><span class="sd"></span>${esc(fit.label || (fit.fit === 'ok' ? 'Подходит' : fit.fit === 'risk' ? 'Не рекомендован' : 'Подходит с оговорками'))}</div>`
    : '';
  const candBlock = o.candidate
    ? `<div class="hero-cand">
        <span class="avatar">${esc(initialsOf(o.candidate))}</span>
        <div><div class="cand-name">${esc(o.candidate)}</div>${o.vacancy ? `<div class="cand-role">${esc(o.vacancy)}</div>` : ''}</div>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title || 'HR PRO AI · Расшифровка')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<div class="bg-grid"></div><div class="bg-glow g1"></div><div class="bg-glow g2"></div><div class="bg-glow g3"></div>
<div class="page">
  <header class="hero">
    <div class="hero-top">
      <div class="brand">${LOGO('#ffffff', 40)}<div class="brand-tx"><b>HR PRO AI</b><span>${esc(L('tagline', lang))}</span></div></div>
      <div class="toolbar no-print">
        ${(!o.publicView && o.backUrl) ? `<a class="tbtn" href="${esc(o.backUrl)}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg><span>${esc(L('back', lang))}</span></a>` : ''}
        ${(!o.publicView && o.share) ? `<button class="tbtn" onclick="dkShareOpen()"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg><span>${esc(L('share', lang))}</span></button>` : ''}
        <button class="tbtn primary" onclick="window.print()"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></svg><span>${esc(L('pdf', lang))}</span></button>
      </div>
    </div>
    <div class="eyebrow">${esc(o.eyebrow || '')}</div>
    <h1 class="hero-title">${esc(o.heroTitle || '')}</h1>
    <p class="hero-sub">${esc(o.heroSub || '')}</p>
    <div class="hero-meta">${candBlock}<div class="hero-spacer"></div>${pill}</div>
  </header>
  ${body}
  <div class="note">Документ подготовлен по методике оценки личностных качеств (HR PRO AI). Результаты — основа для анализа продуктивности и потенциала, а не окончательный приговор: взаимосвязи между точками важнее отдельных значений. Рекомендуется сверка с оценщиком и отдельная проверка знаний и мотивации кандидата.</div>
</div>
<footer class="foot">
  <div class="foot-l">${LOGO('#8b9bff', 22)}<span>${esc(L('footTag', lang))}</span></div>
  <div class="foot-r">HR PRO AI</div>
</footer>
${(o.share && !o.publicView) ? shareModalHtml(o.share, lang) : ''}
</body>
</html>`;
}

module.exports = { CSS, page, spectrum, syndromesBlock, zoneOf, compInfo, esc };
