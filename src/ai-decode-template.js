'use strict';
// Оболочка страниц AI-расшифровок (тёмная тема HR PRO AI).
// CSS/hero/footer перенесены 1-в-1 из дизайна claude.ai/design
// (HR PRO AI - Decode/Manual Kowalska). AI отдаёт только контент секций,
// используя эти же классы; спектр рисуется сервером по реальным значениям точек.

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Общий CSS дизайн-системы (идентичен в обоих макетах).
const CSS = `
:root{
  --ink:#ffffff; --ink2:#c3cbe4; --muted:#8b93ad;
  --blue:#6f97ff; --blue-d:#8b6cff; --indigo:#0d1024;
  --sky:rgba(139,108,255,.14); --paper:#04050c; --card:#0b0d18;
  --coral:#ff7a5c; --coral-s:rgba(255,122,92,.12);
  --green:#43e0a0; --green-s:rgba(67,224,160,.1);
  --red:#ff6b6b; --red-s:rgba(255,107,107,.1);
  --amber:#e0a94e; --amber-s:rgba(224,169,78,.12);
  --line:rgba(255,255,255,.09); --line2:rgba(255,255,255,.16);
  --shadow:0 1px 2px rgba(0,0,0,.4),0 18px 50px rgba(0,0,0,.5);
  --shadow-s:0 1px 2px rgba(0,0,0,.35);
  --r:16px; --r-s:11px;
  --serif:'Manrope',system-ui,sans-serif;
  --sans:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  --mono:'JetBrains Mono','SFMono-Regular',Menlo,monospace;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:
  radial-gradient(1100px 600px at 82% -6%,rgba(139,108,255,.09),transparent 60%),
  radial-gradient(900px 600px at -8% 110%,rgba(111,151,255,.07),transparent 60%),
  var(--paper);
  color:var(--ink2);font-family:var(--sans);
  font-size:14.5px;line-height:1.62;-webkit-font-smoothing:antialiased;}
.wrap{max-width:880px;margin:34px auto;background:
  linear-gradient(180deg,rgba(255,255,255,.018),transparent 240px),var(--card);
  border:1px solid var(--line);border-radius:22px;overflow:hidden;
  box-shadow:0 40px 120px rgba(0,0,0,.6);animation:docfade .5s ease both}
@keyframes docfade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes hnode{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
@keyframes hgrid{from{background-position:0 0}to{background-position:34px 34px}}
b,strong{font-weight:700;color:var(--ink)}
p{margin:0 0 10px}
a{color:#b3a4ff}
.hero{position:relative;color:#fff;overflow:hidden;padding:48px 52px 44px;background:#070813}
.hero-bg{position:absolute;inset:0;background:
  radial-gradient(900px 400px at 88% -12%,rgba(139,108,255,.32),transparent 60%),
  radial-gradient(620px 340px at 6% 128%,rgba(255,122,92,.24),transparent 60%),
  linear-gradient(135deg,#090b1a 0%,#0d1024 55%,#121738 100%);}
.hero-bg::after{content:"";position:absolute;inset:0;opacity:.14;
  background-image:linear-gradient(rgba(139,108,255,.55) 1px,transparent 1px),
  linear-gradient(90deg,rgba(139,108,255,.55) 1px,transparent 1px);
  background-size:34px 34px;animation:hgrid 6s linear infinite;
  -webkit-mask:radial-gradient(720px 420px at 82% 0%,#000,transparent 70%);
          mask:radial-gradient(720px 420px at 82% 0%,#000,transparent 70%);}
.hnet{position:absolute;inset:0;pointer-events:none;opacity:.7}
.hnet circle{fill:#8b6cff}
.hero-inner{position:relative}
.brand{display:flex;align-items:center;gap:13px;margin-bottom:30px}
.brand-tx{display:flex;flex-direction:column;line-height:1.15}
.brand-tx b{font-family:var(--serif);font-weight:800;letter-spacing:.04em;font-size:17px;color:#fff}
.brand-tx span{font-size:11.5px;color:#a3abc6;letter-spacing:.01em}
.eyebrow{font-family:var(--mono);font-weight:500;font-size:11.5px;letter-spacing:.22em;
  text-transform:uppercase;color:#b3a4ff;margin-bottom:12px}
.hero-title{font-family:var(--serif);font-weight:800;letter-spacing:-.02em;
  font-size:38px;line-height:1.08;margin:0 0 12px;color:#fff}
.hero-sub{font-size:15px;max-width:60ch;color:#c3cbe4;margin:0 0 24px}
.hchips{display:flex;flex-wrap:wrap;gap:8px}
.hchip{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:6px 13px;font-size:12.5px;
  color:#dbe0f0;backdrop-filter:blur(4px)}
.hchip i{font-style:normal;color:#8b93ad;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
.content{padding:34px 52px 12px}
.lead{font-size:15px;color:var(--ink2)}
.kvcard{display:grid;grid-template-columns:1fr;gap:0;border:1px solid var(--line);
  border-radius:var(--r);overflow:hidden;background:rgba(255,255,255,.02);margin:6px 0 22px}
.kv{display:grid;grid-template-columns:170px 1fr;gap:14px;padding:11px 18px;border-bottom:1px solid var(--line)}
.kv:last-child{border-bottom:none}
.kk{color:var(--muted);font-size:12.5px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;align-self:center}
.vv{font-weight:500;color:var(--ink2)}
.spectrum{border:1px solid var(--line);border-radius:var(--r);padding:18px 20px 12px;
  background:linear-gradient(180deg,rgba(139,108,255,.05),rgba(255,255,255,.01));box-shadow:var(--shadow-s);margin:4px 0 24px}
.spectrum-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;
  padding-bottom:14px;margin-bottom:6px;border-bottom:1px dashed var(--line2)}
.zonekey{display:flex;flex-wrap:wrap;gap:13px;font-size:11.5px;color:var(--muted)}
.zonekey span{display:inline-flex;align-items:center;gap:6px}
.zonekey .k{width:11px;height:11px;border-radius:3px;display:inline-block}
.complegend{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;color:var(--coral);font-weight:600}
.complegend .cdot{width:9px;height:9px;border-radius:50%;background:var(--coral);
  box-shadow:0 0 0 3px var(--coral-s),0 0 10px rgba(255,122,92,.6)}
.z-vlow{background:rgba(255,255,255,.07)}.z-low{background:rgba(255,255,255,.12)}.z-mid{background:rgba(255,255,255,.18)}
.z-high{background:rgba(139,108,255,.42)}.z-vhigh{background:rgba(139,108,255,.72)}
.srow{display:grid;grid-template-columns:150px 1fr 132px;align-items:center;gap:12px;padding:7px 0}
.srow.is-comp .slabel b{color:var(--coral)}
.slabel{display:flex;align-items:baseline;gap:9px;min-width:0}
.slabel b{font-family:var(--serif);font-weight:800;font-size:16px;width:14px;flex:none;color:#b3a4ff}
.slabel span{font-size:12.5px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.strack{position:relative;height:22px}
.zoneband{position:absolute;inset:5px 0;border-radius:6px;
  background:linear-gradient(90deg,rgba(255,255,255,.04) 0 16%,rgba(255,255,255,.06) 16% 34%,rgba(255,255,255,.08) 34% 66%,rgba(139,108,255,.16) 66% 84%,rgba(139,108,255,.28) 84% 100%);opacity:1}
.gline{position:absolute;top:2px;bottom:2px;width:1px;background:rgba(255,255,255,.08)}
.gline.zero{background:rgba(255,255,255,.3);width:1.5px}
.bar{position:absolute;top:6px;height:10px;border-radius:6px;
  background:linear-gradient(90deg,#8b6cff,#6f97ff);box-shadow:0 0 12px rgba(139,108,255,.5)}
.bar.comp{background:linear-gradient(90deg,#ff7a5c,#ff9575);box-shadow:0 0 12px rgba(255,122,92,.55)}
.bardot{position:absolute;top:4px;width:14px;height:14px;border-radius:50%;background:#0b0d18;
  border:3px solid #8b6cff;transform:translateX(-7px);box-shadow:0 0 10px rgba(139,108,255,.6)}
.bardot.comp{border-color:var(--coral);box-shadow:0 0 10px rgba(255,122,92,.6)}
.sval{display:flex;flex-direction:column;align-items:flex-end;gap:1px;text-align:right}
.num{font-family:var(--mono);font-weight:700;font-size:15px;color:var(--ink)}
.num.comp{color:var(--coral)}
.zlab{font-size:10px;line-height:1.2;color:var(--muted);text-transform:uppercase;letter-spacing:.02em}
.ctag{font-family:var(--mono);font-size:9.5px;color:var(--coral);font-weight:700;letter-spacing:.04em;margin-top:1px}
.srow.scale .axis{position:relative;height:14px}
.axis span{position:absolute;transform:translateX(-50%);font-family:var(--mono);font-size:10px;color:var(--muted);top:0}
.axis span.z{color:var(--ink);font-weight:700}
.sec{margin:30px 0 8px}
.sec-head{display:flex;align-items:center;gap:14px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.sec-num{flex:none;font-family:var(--mono);font-weight:700;font-size:12.5px;color:#fff;
  background:linear-gradient(135deg,#8b6cff,#6f97ff);border-radius:9px;
  min-width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;padding:0 8px;
  box-shadow:0 4px 16px rgba(139,108,255,.4)}
.sec-head h2{font-family:var(--serif);font-weight:800;font-size:20px;letter-spacing:-.01em;margin:0;color:var(--ink)}
h3.subh{font-family:var(--serif);font-weight:700;font-size:15.5px;margin:18px 0 7px;color:#b3a4ff}
.pgrid{display:grid;grid-template-columns:1fr;gap:13px}
.pcard{border:1px solid var(--line);border-radius:var(--r);padding:16px 18px;background:rgba(255,255,255,.025);
  box-shadow:var(--shadow-s);position:relative;overflow:hidden;break-inside:avoid}
.pcard.comp{border-color:rgba(255,122,92,.32);background:linear-gradient(180deg,rgba(255,122,92,.06),rgba(255,255,255,.01))}
.pcard::before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:4px;border-radius:0 4px 4px 0;
  background:#8b6cff;box-shadow:0 0 12px rgba(139,108,255,.6)}
.pcard.comp::before{background:var(--coral);box-shadow:0 0 12px rgba(255,122,92,.6)}
.pc-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:11px}
.pc-id{display:flex;align-items:center;gap:13px}
.pc-letter{font-family:var(--serif);font-weight:800;font-size:25px;line-height:1;color:#b3a4ff;width:34px;text-align:center}
.pcard.comp .pc-letter{color:var(--coral)}
.pc-name{font-family:var(--serif);font-weight:700;font-size:16.5px;color:var(--ink);display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.pc-comp{font-family:var(--mono);font-size:9.5px;font-weight:700;color:var(--coral);background:var(--coral-s);
  border:1px solid rgba(255,122,92,.32);border-radius:999px;padding:2px 8px;letter-spacing:.04em}
.pc-val{text-align:right;flex:none}
.pc-num{font-family:var(--mono);font-weight:700;font-size:21px;color:var(--ink);display:block;line-height:1}
.pc-num.comp{color:var(--coral)}
.pc-zone{font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;color:#b3a4ff;
  display:inline-block;margin-top:4px;padding:2px 8px;border-radius:999px;background:var(--sky)}
.pc-zone.z-low,.pc-zone.z-vlow{background:rgba(255,138,110,.12);color:#e79b86}
.pc-zone.z-mid{background:rgba(255,255,255,.07);color:#9aa3bd}
.pc-zone.z-high,.pc-zone.z-vhigh{background:var(--sky);color:#b3a4ff}
.pc-mini{position:relative;height:8px;margin:0 0 12px;border-radius:5px;background:rgba(255,255,255,.06)}
.pc-zero{position:absolute;left:50%;top:-2px;bottom:-2px;width:1.5px;background:rgba(255,255,255,.28)}
.pc-bar{position:absolute;top:0;height:8px;border-radius:5px;background:linear-gradient(90deg,#8b6cff,#6f97ff);box-shadow:0 0 8px rgba(139,108,255,.5)}
.pc-bar.comp{background:linear-gradient(90deg,#ff7a5c,#ff9575);box-shadow:0 0 8px rgba(255,122,92,.5)}
.pc-body{font-size:13.7px;line-height:1.6;color:var(--ink2)}
.pc-body b{color:var(--ink)}
.callout{border:1px solid var(--line);border-left:4px solid #8b6cff;border-radius:var(--r-s);
  padding:14px 18px;margin:16px 0;background:linear-gradient(120deg,rgba(139,108,255,.07),rgba(255,255,255,.01));break-inside:avoid}
.callout .co-title{font-family:var(--serif);font-weight:700;font-size:14.5px;margin-bottom:5px;color:#b3a4ff}
.callout .co-body{font-size:13.7px;color:var(--ink2)}
.callout .co-body b{color:var(--ink)}
.callout.warn{border-left-color:var(--amber);background:linear-gradient(120deg,rgba(224,169,78,.09),rgba(255,255,255,.01))}
.callout.warn .co-title{color:#e3b45f}
.callout.risk{border-left-color:var(--red);background:linear-gradient(120deg,rgba(255,107,107,.08),rgba(255,255,255,.01))}
.callout.risk .co-title{color:#ff8a8a}
.callout.ok{border-left-color:var(--green);background:linear-gradient(120deg,rgba(67,224,160,.08),rgba(255,255,255,.01))}
.callout.ok .co-title{color:#5fe0b0}
.tw{margin:14px 0;border:1px solid var(--line);border-radius:var(--r-s);overflow:hidden;box-shadow:var(--shadow-s)}
table{width:100%;border-collapse:collapse;font-size:13px}
thead th{background:linear-gradient(135deg,#8b6cff,#6f97ff);color:#fff;text-align:left;font-weight:700;padding:10px 13px;font-size:12.5px;letter-spacing:.01em}
tbody td{padding:9px 13px;border-top:1px solid var(--line);vertical-align:top;color:var(--ink2)}
tbody tr:nth-child(even) td{background:rgba(255,255,255,.02)}
tbody td b{color:var(--ink)}
.synd-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0}
.synd{border:1px solid var(--line);border-radius:var(--r-s);padding:13px 15px;background:rgba(255,255,255,.025);box-shadow:var(--shadow-s);break-inside:avoid}
.synd.yes{border-left:4px solid var(--green);background:linear-gradient(120deg,rgba(67,224,160,.07),rgba(255,255,255,.01))}
.synd.no{border-left:4px solid var(--line2);background:rgba(255,255,255,.015)}
.synd-h{display:flex;align-items:center;gap:9px;font-family:var(--serif);font-size:14.5px;color:var(--ink);margin-bottom:5px}
.synd-h b{font-weight:700}
.synd-ic{flex:none;width:21px;height:21px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#04050c}
.synd.yes .synd-ic{background:var(--green);box-shadow:0 0 10px rgba(67,224,160,.5)}
.synd.no .synd-ic{background:#4b5470;color:#c3cbe4}
.synd-trig{font-family:var(--mono);font-size:11px;color:#b3a4ff;background:var(--sky);border-radius:6px;padding:3px 8px;display:inline-block;margin-bottom:7px}
.synd.no .synd-trig{color:var(--muted);background:rgba(255,255,255,.05)}
.synd-mean{font-size:12.8px;color:var(--ink2);line-height:1.55}
.synd-mean b{color:var(--ink)}
.chiprow{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}
.chip{display:flex;align-items:flex-start;gap:9px;border-radius:10px;padding:10px 13px;font-size:13px;line-height:1.5;border:1px solid var(--line);color:var(--ink2)}
.chip::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;margin-top:7px}
.chip.do{background:var(--green-s);border-color:rgba(67,224,160,.28)}
.chip.do::before{background:var(--green);box-shadow:0 0 8px rgba(67,224,160,.6)}
.chip.dont{background:var(--red-s);border-color:rgba(255,107,107,.28)}
.chip.dont::before{background:var(--red);box-shadow:0 0 8px rgba(255,107,107,.6)}
.verdict{border-radius:var(--r);overflow:hidden;margin:24px 0;box-shadow:var(--shadow);break-inside:avoid}
.verdict-h{display:flex;align-items:center;gap:14px;padding:16px 22px;color:#fff;background:linear-gradient(135deg,#b8731c,#e0a94e)}
.verdict.ok .verdict-h{background:linear-gradient(135deg,#1f7a52,#43e0a0)}
.verdict.risk .verdict-h{background:linear-gradient(135deg,#a62b2b,#ff6b6b)}
.verdict-badge{font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.05em;
  background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.4);border-radius:999px;padding:5px 13px;text-transform:uppercase;flex:none}
.verdict-h h3{font-family:var(--serif);font-weight:800;font-size:18px;margin:0;color:#fff}
.verdict-body{background:linear-gradient(180deg,rgba(224,169,78,.06),rgba(255,255,255,.01));border:1px solid rgba(224,169,78,.22);border-top:none;padding:18px 22px;font-size:13.8px;color:var(--ink2)}
.verdict-body b{color:var(--ink)}
.vcols{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:6px}
.vcol h4{font-family:var(--serif);font-size:13px;margin:0 0 7px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.vcol ul{margin:0;padding-left:18px}.vcol li{margin-bottom:4px}
ul.clean{margin:8px 0;padding-left:20px}
ul.clean li{margin-bottom:5px;color:var(--ink2)}
ul.clean li b{color:var(--ink)}
ol{margin:8px 0;padding-left:22px}ol li{margin-bottom:5px}
.note{font-size:12px;color:var(--muted);margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}
.foot{display:flex;justify-content:space-between;align-items:center;padding:22px 52px;background:#070813;border-top:1px solid var(--line);color:#fff;margin-top:30px}
.foot-l{display:flex;align-items:center;gap:11px;font-size:12.5px;color:#a3abc6}
.foot-r{font-family:var(--serif);font-weight:800;letter-spacing:.05em;font-size:13px;color:#c3cbe4}
.toolbar{position:fixed;top:16px;right:16px;display:flex;gap:8px;z-index:20}
.toolbar a,.toolbar button{font-family:var(--sans);font-size:13px;font-weight:600;cursor:pointer;
  display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:11px;text-decoration:none;
  color:#dbe0f0;background:rgba(13,16,36,.82);border:1px solid var(--line2);backdrop-filter:blur(8px)}
.toolbar button.primary{background:linear-gradient(135deg,#8b6cff,#6f97ff);border-color:transparent;color:#fff}
.toolbar a:hover,.toolbar button:hover{border-color:#8b6cff}
@media (max-width:680px){
  .wrap{margin:0;border-radius:0;border:none}
  .hero{padding:34px 24px 30px}.hero-title{font-size:29px}.content{padding:26px 22px 6px}
  .foot{padding:18px 22px;flex-direction:column;gap:10px;text-align:center}
  .srow{grid-template-columns:96px 1fr 86px;gap:8px}
  .slabel span{display:none}
  .synd-grid,.chiprow,.vcols{grid-template-columns:1fr}
  .kv{grid-template-columns:1fr;gap:2px}
  .toolbar{position:static;justify-content:flex-end;padding:12px 16px 0}
}
@media print{
  @page{size:A4;margin:12mm}
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  body{background:#04050c}
  .toolbar{display:none!important}
  .wrap{max-width:none;margin:0;border:none;border-radius:0;box-shadow:none;animation:none}
  .hero{padding:24px 26px 22px}.hero-title{font-size:27px}
  .hero-bg::after{animation:none}
  .content{padding:18px 26px 0}
  .sec,.pcard,.callout,.synd,.verdict,.tw{break-inside:avoid}
  .foot{margin-top:18px}
  a{color:inherit;text-decoration:none}
}
`;

const LOGO = (stroke, w) => `<svg class="logo-mark" width="${w}" height="${w}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M32 4 56 18 56 46 32 60 8 46 8 18Z" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round" opacity="0.9"/>
  <line x1="33" y1="31" x2="22" y2="25" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
  <line x1="33" y1="31" x2="41" y2="21" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
  <line x1="33" y1="31" x2="46" y2="35" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
  <line x1="33" y1="31" x2="29" y2="45" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
  <line x1="41" y1="21" x2="46" y2="35" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>
  <line x1="22" y1="25" x2="29" y2="45" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>
  <circle cx="22" cy="25" r="3.4" stroke="${stroke}" stroke-width="2" fill="none"/>
  <circle cx="41" cy="21" r="3.6" stroke="${stroke}" stroke-width="2" fill="none"/>
  <circle cx="46" cy="35" r="3.2" stroke="${stroke}" stroke-width="2" fill="none"/>
  <circle cx="29" cy="45" r="3" stroke="${stroke}" stroke-width="2" fill="none"/>
  <circle cx="33" cy="31" r="4.2" fill="#FF7A5C"/>
</svg>`;

const HNET = `<svg class="hnet" viewBox="0 0 880 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <g stroke="rgba(139,108,255,.28)" stroke-width="1">
    <line x1="60" y1="60" x2="220" y2="150"></line><line x1="220" y1="150" x2="140" y2="240"></line>
    <line x1="220" y1="150" x2="700" y2="90"></line><line x1="700" y1="90" x2="820" y2="200"></line>
    <line x1="700" y1="90" x2="560" y2="30"></line>
  </g>
  <circle cx="60" cy="60" r="2.6" style="animation:hnode 4s ease-in-out infinite"></circle>
  <circle cx="220" cy="150" r="3.2" style="animation:hnode 4s ease-in-out .7s infinite"></circle>
  <circle cx="140" cy="240" r="2.6" style="animation:hnode 4s ease-in-out 1.4s infinite"></circle>
  <circle cx="700" cy="90" r="3.2" style="animation:hnode 4s ease-in-out .3s infinite"></circle>
  <circle cx="820" cy="200" r="2.6" style="animation:hnode 4s ease-in-out 1.9s infinite"></circle>
  <circle cx="560" cy="30" r="2.4" style="animation:hnode 4s ease-in-out 1.1s infinite"></circle>
</svg>`;

// Зона по значению −100..+100 (совпадает со шкалой портала oca.js).
function zoneOf(v) {
  if (v >= 68) return { cls: 'z-vhigh', label: 'очень высокая' };
  if (v >= 32) return { cls: 'z-high', label: 'высокая' };
  if (v > -32) return { cls: 'z-mid', label: 'средняя' };
  if (v > -68) return { cls: 'z-low', label: 'низкая' };
  return { cls: 'z-vlow', label: 'очень низкая' };
}

// Компульсивность точки по документу «kompuls»: точка (кроме D) компульсивна,
// если её значение выше D хотя бы на 1 при D ≥ +32. До +8 над D — «пограничная».
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

// Спектр профиля — та же разметка srow, что в дизайне, но по реальным значениям точек.
function spectrum(points, order) {
  const ci = compInfo(points, order);
  const glines = '<div class="gline" style="left:16%"></div><div class="gline" style="left:34%"></div>' +
    '<div class="gline zero" style="left:50%"></div><div class="gline" style="left:66%"></div><div class="gline" style="left:84%"></div>';
  const rows = order.map(k => {
    const pt = points[k];
    const v = Math.max(-100, Math.min(100, pt.value));
    const pos = (v + 100) / 2;                 // 0..100 — позиция на шкале
    const barLeft = v >= 0 ? 50 : pos;
    const barW = Math.abs(pos - 50);
    const comp = ci.isComp(k);
    const z = zoneOf(v);
    const num = (v > 0 ? '+' : '') + v;
    const ctag = comp ? `<span class="ctag">${ci.borderline(k) ? 'компульс. погран.' : 'компульс.'}</span>` : '';
    return `<div class="srow${comp ? ' is-comp' : ''}">
        <div class="slabel"><b>${k}</b><span>${esc(pt.name)}</span></div>
        <div class="strack">
          <div class="zoneband"></div>${glines}
          <div class="bar${comp ? ' comp' : ''}" style="left:${barLeft.toFixed(1)}%;width:${barW.toFixed(1)}%"></div>
          <div class="bardot${comp ? ' comp' : ''}" style="left:${pos.toFixed(1)}%"></div>
        </div>
        <div class="sval"><span class="num${comp ? ' comp' : ''}">${num}</span><span class="zlab ${z.cls}">${z.label}</span>${ctag}</div>
      </div>`;
  }).join('\n');
  const compLegend = ci.comps.length
    ? `<div class="complegend"><i class="cdot"></i>компульсивная точка (${ci.comps.map(c => c.key + (c.borderline ? ' — погран.' : '')).join(', ')})</div>`
    : '';
  return `<div class="spectrum">
      <div class="spectrum-head">
        <div class="zonekey">
          <span><i class="k z-vlow"></i>оч. низкая</span><span><i class="k z-low"></i>низкая</span>
          <span><i class="k z-mid"></i>средняя</span><span><i class="k z-high"></i>высокая</span>
          <span><i class="k z-vhigh"></i>оч. высокая</span>
        </div>${compLegend}
      </div>
      ${rows}
      <div class="srow scale">
        <div class="slabel"></div>
        <div class="strack axis">
          <span style="left:0%">−100</span><span style="left:16%">−68</span>
          <span style="left:34%">−32</span><span class="z" style="left:50%">0</span>
          <span style="left:66%">+32</span><span style="left:84%">+68</span><span style="left:100%">+100</span>
        </div>
        <div class="sval"></div>
      </div>
    </div>`;
}

// Локализация «обвязки» страницы (контент секций приходит от ИИ уже на нужном языке).
const UI = {
  back: { ru: '← В портал', pl: '← Do portalu', en: '← Back to portal' },
  pdf: { ru: 'Скачать PDF', pl: 'Pobierz PDF', en: 'Download PDF' },
  tagline: { ru: 'технология, которая чувствует людей', pl: 'technologia, która czuje ludzi', en: 'technology that reads people' },
  footTag: { ru: 'Мы раскрываем личность, чтобы вы создавали сильные команды.', pl: 'Odkrywamy osobowość, byś budował silne zespoły.', en: 'We reveal personality so you can build strong teams.' },
  candidate: { ru: 'Кандидат', pl: 'Kandydat', en: 'Candidate' },
  employee: { ru: 'Сотрудник', pl: 'Pracownik', en: 'Employee' },
  position: { ru: 'Должность', pl: 'Stanowisko', en: 'Position' },
};
function L(key, lang) { const o = UI[key] || {}; return o[lang] || o.ru || ''; }

// Полная HTML-страница расшифровки.
// opts: { title, eyebrow, heroTitle, heroSub, candidate, vacancy, spectrumHtml, bodyHtml, backUrl, lang, roleWordKey }
function page(opts) {
  const o = opts || {};
  const lang = ['ru', 'pl', 'en'].includes(o.lang) ? o.lang : 'ru';
  const chips = [];
  if (o.candidate) chips.push(`<span class="hchip"><i>${esc(L(o.roleWordKey === 'employee' ? 'employee' : 'candidate', lang))}</i>${esc(o.candidate)}</span>`);
  if (o.vacancy) chips.push(`<span class="hchip"><i>${esc(L('position', lang))}</i>${esc(o.vacancy)}</span>`);
  const toolbar = `<div class="toolbar">
      ${o.backUrl ? `<a href="${esc(o.backUrl)}">${esc(L('back', lang))}</a>` : ''}
      <button class="primary" onclick="window.print()">${esc(L('pdf', lang))}</button>
    </div>`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title || 'HR PRO AI · Расшифровка')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
${toolbar}
<main class="wrap">
<header class="hero">
      <div class="hero-bg"></div>
      ${HNET}
      <div class="hero-inner">
        <div class="brand">
          ${LOGO('#FFFFFF', 44)}
          <div class="brand-tx"><b>HR PRO AI</b><span>${esc(L('tagline', lang))}</span></div>
        </div>
        <div class="eyebrow">${esc(o.eyebrow || '')}</div>
        <h1 class="hero-title">${esc(o.heroTitle || '')}</h1>
        <p class="hero-sub">${esc(o.heroSub || '')}</p>
        <div class="hchips">${chips.join('')}</div>
      </div>
    </header>
    <div class="content">
      ${o.spectrumHtml || ''}
      ${o.bodyHtml || ''}
    </div>
    <footer class="foot">
      <div class="foot-l">${LOGO('#b3a4ff', 22)}<span>${esc(L('footTag', lang))}</span></div>
      <div class="foot-r">HR PRO AI</div>
    </footer>
</main>
</body>
</html>`;
}

module.exports = { CSS, page, spectrum, zoneOf, compInfo, esc };
