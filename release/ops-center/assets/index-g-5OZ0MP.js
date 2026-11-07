(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const Ml=["FLIGHT","FDO","GNC","PROP","EECOM","INCO","CAPCOM"],Kc={FLIGHT:"Flight Director",FDO:"Flight Dynamics",GNC:"Guidance, Navigation & Control",PROP:"Propulsion",EECOM:"Electrical & Thermal",INCO:"Instrumentation & Comm",CAPCOM:"Capsule Communicator"},Gs={nodata:0,nominal:1,caution:2,warning:3},od={Earth:14e4,Mars:125e3,Venus:145e3,Titan:6e5,Jupiter:155e4};function Go(i){return i&&od[i]||0}function ti(i,e,t,n=!0){return i===null?"nodata":n?i>=t?"warning":i>=e?"caution":"nominal":i<=t?"warning":i<=e?"caution":"nominal"}const Ti=(i,e=1,t="")=>i===null?"no data":`${i.toFixed(e)}${t}`;function ld(i,e={}){const t=[],n=(d,h,f,g,v)=>t.push({position:d,id:h,label:f,level:g,detail:v}),s=i.paused!==5&&i.vessel.situation!==null,r=Go(i.vessel.body),a=i.vessel.alt!==null&&i.vessel.alt<r,o=i.orbit.pe;if(i.vessel.situation&&/orbit|sub.?orbital|escap/i.test(i.vessel.situation)&&o!==null&&i.vessel.alt!==null&&i.vessel.alt>r){const d=(i.control.throttle??0)>.05;let h=o<0?"warning":o<r?"caution":"nominal";d&&h!=="nominal"&&(h="nominal");const f=o<0?"below surface":o<r?"inside atmosphere":"clear of atmosphere";n("FDO","pe","Periapsis",h,`Pe ${Ti(o/1e3,1," km")} ${f}${d&&o<r?" (powered flight, expected)":""}`)}else n("FDO","pe","Periapsis",o===null?"nodata":"nominal",o===null?"no data":`Pe ${Ti(o/1e3,1," km")}`);const l=i.landing.timeToImpact;l!==null&&l>0&&i.vessel.vVert!==null&&i.vessel.vVert<-5&&!a&&n("FDO","impact","Impact",ti(l,120,30,!1),`Impact in ${l.toFixed(0)} s`),n("GNC","g","G-load",ti(i.vessel.g,4,6),`${Ti(i.vessel.g,2," g")}`),a&&i.vessel.mach!==null&&i.vessel.mach>.3&&n("GNC","aoa","Angle of attack",ti(i.aero.aoa===null?null:Math.abs(i.aero.aoa),5,10),`AoA ${Ti(i.aero.aoa,1,"°")}`),i.vessel.controllable===!1&&n("GNC","control","Control","warning","Vessel not controllable");const c=i.prop.totalDv;n("PROP","dv","Total Δv",c===null?"nodata":c<50?"caution":"nominal",`${Ti(c,0," m/s")}`);const u=i.power.ec!==null&&i.power.ecMax?i.power.ec/i.power.ecMax:null;return n("EECOM","ec","Electric charge",ti(u,.25,.1,!1),u===null?"no data":`${(u*100).toFixed(0)} % of capacity`),i.paused===2&&n("EECOM","nopower","Power","warning","Telemetry reports NO ELECTRIC POWER"),n("EECOM","heat","Hottest part",ti(i.thermal.hottestRatio,.75,.9),i.thermal.hottestRatio===null?"no data":`${(i.thermal.hottestRatio*100).toFixed(0)} % of limit${i.thermal.hottestName?` (${i.thermal.hottestName})`:""}`),a&&n("EECOM","q","Dynamic pressure",ti(i.vessel.q,35,50),`${Ti(i.vessel.q,1," kPa")}`),e.commNet===!1?n("INCO","signal","Signal","nodata","CommNet is off in this save: no link model"):n("INCO","signal","Signal",ti(i.comm.signal,.25,.05,!1),i.comm.signal===null?"no data":`${(i.comm.signal*100).toFixed(0)} %`),i.paused===4&&n("INCO","antenna","Antenna","warning","No antenna / no link"),s?t:t.map(d=>({...d,level:"nodata",detail:d.detail}))}function cd(i){const e=Object.fromEntries(Ml.map(n=>[n,"nodata"]));for(const n of i)Gs[n.level]>Gs[e[n.position]]&&(e[n.position]=n.level);let t="nodata";for(const n of Ml)Gs[e[n]]>Gs[t]&&(t=e[n]);return e.FLIGHT=t,e.CAPCOM==="nodata"&&t!=="nodata"&&(e.CAPCOM="nominal"),e}const Bt=Math.PI/180,jc={Kerbin:"Earth",Mun:"Moon",Duna:"Mars",Eve:"Venus",Moho:"Mercury",Jool:"Jupiter"};class ud{constructor(e,t=0){this.elementEpochUT=t;for(const n of e){const s=n.parent?jc[n.parent]??n.parent:null,r={...n,parent:s};this.byName.set(n.name,r),this.byIndex.set(n.index,r)}}elementEpochUT;byName=new Map;byIndex=new Map;get(e){return this.byName.get(e)}nameOf(e){return e==null?null:this.byIndex.get(e)?.name??null}relPos(e,t){const n=this.byName.get(e),s=n?.parent?this.byName.get(n.parent):null;return!n?.orbit||!s?.gm?null:dd(n.orbit,s.gm,t-this.elementEpochUT)}absPos(e,t){let n=[0,0,0],s=this.byName.get(e);for(;s?.parent;){const r=this.relPos(s.name,t);if(!r)return null;n=hd(n,r),s=this.byName.get(s.parent)}return n}period(e){const t=this.byName.get(e),n=t?.parent?this.byName.get(t.parent):null;return!t?.orbit||!n?.gm?null:2*Math.PI*Math.sqrt(t.orbit.sma**3/n.gm)}}function dd(i,e,t){const n=Math.sqrt(e/i.sma**3),s=((i.m0*Bt+n*t)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);let r=i.ecc<.8?s:Math.PI;for(let d=0;d<30;d++){const h=(r-i.ecc*Math.sin(r)-s)/(1-i.ecc*Math.cos(r));if(r-=h,Math.abs(h)<1e-12)break}const a=2*Math.atan2(Math.sqrt(1+i.ecc)*Math.sin(r/2),Math.sqrt(1-i.ecc)*Math.cos(r/2)),o=i.sma*(1-i.ecc*Math.cos(r)),l=i.argPe*Bt+a,c=i.lan*Bt,u=i.inc*Bt;return[o*(Math.cos(c)*Math.cos(l)-Math.sin(c)*Math.sin(l)*Math.cos(u)),o*(Math.sin(c)*Math.cos(l)+Math.cos(c)*Math.sin(l)*Math.cos(u)),o*Math.sin(l)*Math.sin(u)]}const hd=(i,e)=>[i[0]+e[0],i[1]+e[1],i[2]+e[2]],fd=(i,e)=>[i[0]-e[0],i[1]-e[1],i[2]-e[2]],Ga=i=>Math.hypot(i[0],i[1],i[2]),Zc=(i,e)=>i[0]*e[0]+i[1]*e[1]+i[2]*e[2],Ar=(i,e)=>Math.acos(Math.max(-1,Math.min(1,Zc(i,e)/(Ga(i)*Ga(e)))))/Bt;function mi(i,e){const t=i.relPos("Moon",e),n=i.relPos("Earth",e);if(!t||!n)return null;const s=Ga(t),r=Math.asin(t[2]/s)/Bt,a=[-n[0],-n[1],-n[2]],o=Ar(t,a),l=i.relPos("Moon",e+3600),c=Ar(l,[-n[0],-n[1],-n[2]]);return{dec:r,dist:s,elongation:o,waxing:c>o,illuminated:(1-Math.cos(o*Bt))/2}}function Vs(i,e,t,n){const s=(e?1:-1)*(180-i),r=Math.cos(t*Bt)*Math.cos((n-s)*Bt);return Math.asin(Math.max(-1,Math.min(1,r)))/Bt}function Va(i,e,t){const n=(e+t)/2,s=Math.abs(Math.sqrt(i/e)*(Math.sqrt(2*t/(e+t))-1)),r=Math.abs(Math.sqrt(i/t)*(1-Math.sqrt(2*e/(e+t)))),a=Math.PI*Math.sqrt(n**3/i),o=180-a/(2*Math.PI*Math.sqrt(t**3/i))*360;return{dv1:s,dv2:r,tof:a,phase:o}}function Sr(i,e,t,n){const s=i.relPos(e,n),r=i.relPos(t,n);if(!s||!r)return null;const a=Sl(s,i.relPos(e,n+86400)),o=Ar(s,r);return(Zc(a,Sl(s,r))>=0?1:-1)*o}const Sl=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]];function Wr(i,e,t,n,s,r=3){const a=i.get(e),o=i.get(t),l=a?.parent?i.get(a.parent):null;if(!a?.orbit||!o?.orbit||!l?.gm||a.parent!==o.parent)return[];const c=Va(l.gm,a.orbit.sma,o.orbit.sma),u=c.phase,d=[],h=Math.max(3600,Math.min(i.period(e),i.period(t))/720);let f=$r((Sr(i,e,t,n)??0)-u);for(let g=n+h;g<n+s&&d.length<r;g+=h){const v=$r((Sr(i,e,t,g)??0)-u);if(Math.sign(v)!==Math.sign(f)&&Math.abs(v-f)<90){let m=g-h,p=g;for(let S=0;S<40;S++){const E=(m+p)/2,M=$r((Sr(i,e,t,E)??0)-u);Math.sign(M)===Math.sign(f)?m=E:p=E}d.push({ut:(m+p)/2,dv1:c.dv1,tof:c.tof,phase:u})}f=v}return d}const $r=i=>((i+180)%360+360)%360-180;function yl(i,e,t,n,s){const r=(c,u,d)=>[d*Math.cos(c*Bt)*Math.cos(u*Bt),d*Math.cos(c*Bt)*Math.sin(u*Bt),d*Math.sin(c*Bt)],a=r(i.lat,i.lon,s+i.alt),o=r(e,t,s+n),l=fd(o,a);return 90-Ar(a,l)}function Vo(i){return i?jc[i]??i:null}const Xr={ElectricCharge:"Electric charge",Food:"Food",Water:"Water",Oxygen:"Oxygen",CarbonDioxide:"CO₂",Waste:"Waste",WasteWater:"Waste water",LqdOxygen:"LOX",LqdHydrogen:"LH₂",Kerosene:"RP-1",RP1:"RP-1",LqdMethane:"Methane",MMH:"MMH",NTO:"NTO",Hydrazine:"Hydrazine",HTP:"HTP",Aerozine50:"Aerozine-50",PSPC:"Solid (PSPC)",HTPB:"Solid (HTPB)",Nitrogen:"Nitrogen",Helium:"Helium"},Jc=["RANGE","VEHICLE","PROP","GNC","COMM","CREW","THERMAL"],El={RANGE:"Range & pad",VEHICLE:"Vehicle power",PROP:"Propulsion",GNC:"Guidance & control",COMM:"Communications",CREW:"Crew",THERMAL:"Thermal"},di={leo:{label:"Low Earth orbit",requiredDv:9300,crewed:!1},leoCrew:{label:"Crewed LEO",requiredDv:9300,crewed:!0},tli:{label:"Trans-lunar injection",requiredDv:12500,crewed:!1},lunarCrew:{label:"Crewed lunar (Orion-class)",requiredDv:13600,crewed:!0},suborbital:{label:"Suborbital",requiredDv:2500,crewed:!1}};function pd(i,e,t){const n=(m,p,S)=>({station:m,go:p==="nominal",level:p,detail:S});if(!i||i.paused===5||!i.vessel.situation)return Jc.map(m=>n(m,"nodata","No vehicle on the pad (KSP not in flight)"));const s=i.vessel,r=[],a=/pre.?launch|landed/i.test(s.situation??"");r.push(n("RANGE",a&&s.body==="Earth"?"nominal":a?"caution":"warning",a?`${s.situation} on ${s.body??"?"}${s.lat!==null&&s.lon!==null?` at ${s.lat.toFixed(3)}°, ${s.lon.toFixed(3)}°`:""}`:`Vehicle is ${s.situation}, not on the pad`));const o=i.power.ec!==null&&i.power.ecMax?i.power.ec/i.power.ecMax:null;r.push(n("VEHICLE",o===null?"nodata":o>=.5?"nominal":o>=.25?"caution":"warning",o===null?"No electric charge data":`Electric charge ${(o*100).toFixed(0)} %${i.paused===2?", NO POWER":""}`));const l=i.prop.totalDv,c=i.prop.stages,d=(c.length?c[c.length-1]:null)?.twr??null;let h=l===null?"nodata":l>=e.requiredDv?"nominal":l>=e.requiredDv*.95?"caution":"warning";d!==null&&d<1?h="warning":d!==null&&d<1.15&&h==="nominal"&&(h="caution"),r.push(n("PROP",h,`${l===null?"Δv unknown":`Δv ${Math.round(l)} of ${e.requiredDv} m/s`}${d!==null?` · liftoff TWR ${d.toFixed(2)}`:""}`));const f=s.controllable;if(r.push(n("GNC",f===!1?"warning":f===null?"nodata":"nominal",f===!1?"Vehicle not controllable":`Controllable · SAS ${i.control.sas?"on":"off"}`)),t===!1)r.push(n("COMM","nominal","CommNet is off in this save: link not required"));else{const m=i.comm.signal;r.push(n("COMM",m===null?"nodata":m>=.25?"nominal":m>.05?"caution":"warning",m===null?"No signal data":`Signal ${(m*100).toFixed(0)} %`))}const g=s.crew??0;r.push(n("CREW",e.crewed?g>0?"nominal":"warning":"nominal",e.crewed?g>0?`${g} aboard`:"Crewed profile but nobody is aboard":g>0?`${g} aboard (uncrewed profile)`:"Uncrewed"));const v=i.thermal.hottestRatio;return r.push(n("THERMAL",v===null?"nodata":v<.5?"nominal":v<.75?"caution":"warning",v===null?"No thermal data":`Hottest part ${(v*100).toFixed(0)} % of limit`)),r}function cs(i){return i.length>0&&i.every(e=>e.go)}function Qc(i=-1200,e=[-600,-240],t=-31){return{state:"idle",tAtRef:i,ref:0,holds:[...e].sort((n,s)=>n-s),holdReason:null,autoSeq:t}}function Xi(i,e){return i.state==="counting"?i.tAtRef+(e-i.ref):i.tAtRef}function md(i,e){return i.state==="launched"||i.state==="scrubbed"?i:{...i,state:"counting",ref:e,holdReason:null}}function gd(i,e,t){return i.state!=="counting"?i:{...i,state:"hold",tAtRef:Xi(i,e),ref:e,holdReason:t}}function vd(i,e){return{...i,state:"hold",tAtRef:e,holdReason:`Recycled to T${Vi(e)}`}}function _d(i,e){return{...i,state:"scrubbed",holdReason:e}}function xd(i,e,t,n){if(n&&(i.state==="counting"||i.state==="hold"))return{...i,state:"launched",tAtRef:Math.max(0,Xi(i,e)),ref:e,holdReason:null};if(i.state!=="counting")return i;const s=Xi(i,e),r=i.tAtRef;for(const a of i.holds)if(r<a&&s>=a)return{...i,state:"hold",tAtRef:a,ref:e,holds:i.holds.filter(o=>o!==a),holdReason:`Built-in hold at T${Vi(a)}`};return r<i.autoSeq&&s>=i.autoSeq&&!t?{...i,state:"hold",tAtRef:i.autoSeq,ref:e,holdReason:"Automatic hold: poll is not GO for launch"}:{...i,tAtRef:s,ref:e}}function Vi(i){const e=i<0;let t=Math.floor(Math.abs(i));const n=Math.floor(t/3600);t-=n*3600;const s=Math.floor(t/60),r=t-s*60,a=o=>String(o).padStart(2,"0");return`${e?"-":"+"}${a(n)}:${a(s)}:${a(r)}`}class Rr{frame=null;frameAt=0;checks=[];levels=null;events=[];status=null;bridgeConnected=!1;career=null;careerError=null;history=[];recordings=[];historyVessel=null;listeners=new Set;static HISTORY_MAX=7200;on(e){return this.listeners.add(e),()=>this.listeners.delete(e)}emit(e){for(const t of this.listeners)t(e)}setFrame(e){const t=`${e.source}:${e.vessel.name}`;(t!==this.historyVessel||this.frame&&e.vessel.met!==null&&this.frame.vessel.met!==null&&e.vessel.met<this.frame.vessel.met-1)&&(this.history=[],this.historyVessel=t),this.frame=e,this.frameAt=performance.now(),this.checks=ld(e,{commNet:this.status?.commNet}),this.levels=cd(this.checks),e.vessel.met!==null&&(this.history.push({met:e.vessel.met,alt:e.vessel.alt,vel:e.vessel.vOrb,lat:e.vessel.lat,lon:e.vessel.lon}),this.history.length>Rr.HISTORY_MAX&&this.history.splice(0,this.history.length-Rr.HISTORY_MAX)),this.emit("frame")}setHistory(e,t){this.history=t.slice(-7200),this.historyVessel=e}addEvent(e,t=!1){this.events.push(e),this.events.length>100&&this.events.shift(),this.emit(t?"frame":"event")}setStatus(e){const t=this.status?.mode!==e.mode||this.status?.replayFile!==e.replayFile;this.status=e,t&&(this.events=[],this.history=[],this.frame=null,this.levels=null,this.checks=[]),this.emit("status")}setBridge(e){this.bridgeConnected=e,this.emit("status")}setCareer(e,t=null){this.career=e,this.careerError=t,this.emit("career")}age(){return this.frame?(performance.now()-this.frameAt)/1e3:1/0}linkState(){if(!this.bridgeConnected)return{label:"BRIDGE DOWN",cls:"warning"};const e=this.status?.mode;return e==="sim"?{label:"SIM",cls:"sim"}:e==="replay"?{label:"REPLAY",cls:"sim"}:this.status?.telemachus.connected?this.frame?.paused===5?{label:"NOT IN FLIGHT",cls:"nodata"}:this.age()>3?{label:`STALE ${Math.round(this.age())}s`,cls:"caution"}:{label:"LIVE",cls:"nominal"}:{label:"NO LINK",cls:"warning"}}}const st=new Rr;function Md(){let i=null,e=500;const t=`${location.protocol==="https:"?"wss":"ws"}://${location.host}/ws`,n=()=>{i=new WebSocket(t),i.onopen=()=>{e=500,st.setBridge(!0),bl()},i.onmessage=s=>{let r;try{r=JSON.parse(s.data)}catch{return}r.type==="frame"?st.setFrame(r.frame):r.type==="event"?st.addEvent(r.event,!!r.backfill):r.type==="status"?st.setStatus(r):r.type==="history"&&st.setHistory(r.key,r.samples)},i.onclose=()=>{st.setBridge(!1),setTimeout(n,e),e=Math.min(e*2,8e3)}};n(),setInterval(bl,3e4)}async function bl(){try{const i=await fetch("/api/career"),e=await i.json();if(!i.ok)return st.setCareer(null,e.error??`HTTP ${i.status}`);st.setCareer(e)}catch(i){st.setCareer(null,i.message)}}async function Wa(i,e,t=1){await fetch("/api/source",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({mode:i,file:e,speed:t})})}async function Sd(){return(await(await fetch("/api/recordings")).json()).recordings??[]}const Wo="180",yd=0,Tl=1,Ed=2,eu=1,bd=2,In=3,Kn=0,kt=1,Un=2,qn=0,qi=1,wl=2,Al=3,Rl=4,Td=5,hi=100,wd=101,Ad=102,Rd=103,Cd=104,Pd=200,Dd=201,Ld=202,Id=203,$a=204,Xa=205,Ud=206,Nd=207,Fd=208,Od=209,Bd=210,kd=211,zd=212,Hd=213,Gd=214,qa=0,Ya=1,Ka=2,Zi=3,ja=4,Za=5,Ja=6,Qa=7,$o=0,Vd=1,Wd=2,Yn=0,$d=1,Xd=2,qd=3,tu=4,Yd=5,Kd=6,jd=7,nu=300,Ji=301,Qi=302,eo=303,to=304,Nr=306,no=1e3,gi=1001,io=1002,Jt=1003,Zd=1004,Ws=1005,Sn=1006,qr=1007,vi=1008,Tn=1009,iu=1010,su=1011,Rs=1012,Xo=1013,Mi=1014,yn=1015,Us=1016,qo=1017,Yo=1018,Cs=1020,ru=35902,au=35899,ou=1021,lu=1022,dn=1023,Ps=1026,Ds=1027,Ko=1028,jo=1029,cu=1030,Zo=1031,Jo=1033,yr=33776,Er=33777,br=33778,Tr=33779,so=35840,ro=35841,ao=35842,oo=35843,lo=36196,co=37492,uo=37496,ho=37808,fo=37809,po=37810,mo=37811,go=37812,vo=37813,_o=37814,xo=37815,Mo=37816,So=37817,yo=37818,Eo=37819,bo=37820,To=37821,wo=36492,Ao=36494,Ro=36495,Co=36283,Po=36284,Do=36285,Lo=36286,Jd=3200,Qd=3201,Qo=0,eh=1,$n="",Lt="srgb",es="srgb-linear",Cr="linear",et="srgb",wi=7680,Cl=519,th=512,nh=513,ih=514,uu=515,sh=516,rh=517,ah=518,oh=519,Pl=35044,Dl="300 es",En=2e3,Pr=2001;class ss{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Pt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Yr=Math.PI/180,Dr=180/Math.PI;function Ns(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Pt[i&255]+Pt[i>>8&255]+Pt[i>>16&255]+Pt[i>>24&255]+"-"+Pt[e&255]+Pt[e>>8&255]+"-"+Pt[e>>16&15|64]+Pt[e>>24&255]+"-"+Pt[t&63|128]+Pt[t>>8&255]+"-"+Pt[t>>16&255]+Pt[t>>24&255]+Pt[n&255]+Pt[n>>8&255]+Pt[n>>16&255]+Pt[n>>24&255]).toLowerCase()}function Xe(i,e,t){return Math.max(e,Math.min(t,i))}function lh(i,e){return(i%e+e)%e}function Kr(i,e,t){return(1-t)*i+t*e}function us(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ht(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class qe{constructor(e=0,t=0){qe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Fs{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],d=n[s+3];const h=r[a+0],f=r[a+1],g=r[a+2],v=r[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d;return}if(o===1){e[t+0]=h,e[t+1]=f,e[t+2]=g,e[t+3]=v;return}if(d!==v||l!==h||c!==f||u!==g){let m=1-o;const p=l*h+c*f+u*g+d*v,S=p>=0?1:-1,E=1-p*p;if(E>Number.EPSILON){const w=Math.sqrt(E),R=Math.atan2(w,p*S);m=Math.sin(m*R)/w,o=Math.sin(o*R)/w}const M=o*S;if(l=l*m+h*M,c=c*m+f*M,u=u*m+g*M,d=d*m+v*M,m===1-o){const w=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=w,c*=w,u*=w,d*=w}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],d=r[a],h=r[a+1],f=r[a+2],g=r[a+3];return e[t]=o*g+u*d+l*f-c*h,e[t+1]=l*g+u*h+c*d-o*f,e[t+2]=c*g+u*f+o*h-l*d,e[t+3]=u*g-o*d-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),d=o(r/2),h=l(n/2),f=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=h*u*d+c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d-h*f*g;break;case"YXZ":this._x=h*u*d+c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d+h*f*g;break;case"ZXY":this._x=h*u*d-c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d-h*f*g;break;case"ZYX":this._x=h*u*d-c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d+h*f*g;break;case"YZX":this._x=h*u*d+c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d-h*f*g;break;case"XZY":this._x=h*u*d-c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d+h*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=n+o+d;if(h>0){const f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>d){const f=2*Math.sqrt(1+n-o-d);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>d){const f=2*Math.sqrt(1+o-n-d);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+d-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const f=1-t;return this._w=f*a+t*this._w,this._x=f*n+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,o),d=Math.sin((1-t)*u)/c,h=Math.sin(t*u)/c;return this._w=a*d+this._w*h,this._x=n*d+this._x*h,this._y=s*d+this._y*h,this._z=r*d+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class N{constructor(e=0,t=0,n=0){N.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ll.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ll.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),d=2*(r*n-a*t);return this.x=t+l*c+a*d-o*u,this.y=n+l*u+o*c-r*d,this.z=s+l*d+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return jr.copy(this).projectOnVector(e),this.sub(jr)}reflect(e){return this.sub(jr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const jr=new N,Ll=new Fs;class Be{constructor(e,t,n,s,r,a,o,l,c){Be.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],d=n[7],h=n[2],f=n[5],g=n[8],v=s[0],m=s[3],p=s[6],S=s[1],E=s[4],M=s[7],w=s[2],R=s[5],A=s[8];return r[0]=a*v+o*S+l*w,r[3]=a*m+o*E+l*R,r[6]=a*p+o*M+l*A,r[1]=c*v+u*S+d*w,r[4]=c*m+u*E+d*R,r[7]=c*p+u*M+d*A,r[2]=h*v+f*S+g*w,r[5]=h*m+f*E+g*R,r[8]=h*p+f*M+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=u*a-o*c,h=o*l-u*r,f=c*r-a*l,g=t*d+n*h+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=d*v,e[1]=(s*c-u*n)*v,e[2]=(o*n-s*a)*v,e[3]=h*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=f*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Zr.makeScale(e,t)),this}rotate(e){return this.premultiply(Zr.makeRotation(-e)),this}translate(e,t){return this.premultiply(Zr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Zr=new Be;function du(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Lr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ch(){const i=Lr("canvas");return i.style.display="block",i}const Il={};function Ls(i){i in Il||(Il[i]=!0,console.warn(i))}function uh(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Ul=new Be().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Nl=new Be().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function dh(){const i={enabled:!0,workingColorSpace:es,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===et&&(s.r=On(s.r),s.g=On(s.g),s.b=On(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===et&&(s.r=Yi(s.r),s.g=Yi(s.g),s.b=Yi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===$n?Cr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ls("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ls("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[es]:{primaries:e,whitePoint:n,transfer:Cr,toXYZ:Ul,fromXYZ:Nl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Lt},outputColorSpaceConfig:{drawingBufferColorSpace:Lt}},[Lt]:{primaries:e,whitePoint:n,transfer:et,toXYZ:Ul,fromXYZ:Nl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Lt}}}),i}const je=dh();function On(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Yi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Ai;class hh{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ai===void 0&&(Ai=Lr("canvas")),Ai.width=e.width,Ai.height=e.height;const s=Ai.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Ai}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Lr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=On(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(On(t[n]/255)*255):t[n]=On(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let fh=0;class el{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:fh++}),this.uuid=Ns(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Jr(s[a].image)):r.push(Jr(s[a]))}else r=Jr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Jr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?hh.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let ph=0;const Qr=new N;class Rt extends ss{constructor(e=Rt.DEFAULT_IMAGE,t=Rt.DEFAULT_MAPPING,n=gi,s=gi,r=Sn,a=vi,o=dn,l=Tn,c=Rt.DEFAULT_ANISOTROPY,u=$n){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ph++}),this.uuid=Ns(),this.name="",this.source=new el(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new qe(0,0),this.repeat=new qe(1,1),this.center=new qe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Qr).x}get height(){return this.source.getSize(Qr).y}get depth(){return this.source.getSize(Qr).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==nu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case no:e.x=e.x-Math.floor(e.x);break;case gi:e.x=e.x<0?0:1;break;case io:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case no:e.y=e.y-Math.floor(e.y);break;case gi:e.y=e.y<0?0:1;break;case io:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Rt.DEFAULT_IMAGE=null;Rt.DEFAULT_MAPPING=nu;Rt.DEFAULT_ANISOTROPY=1;class tt{constructor(e=0,t=0,n=0,s=1){tt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],f=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(c+1)/2,M=(f+1)/2,w=(p+1)/2,R=(u+h)/4,A=(d+v)/4,L=(g+m)/4;return E>M&&E>w?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=R/n,r=A/n):M>w?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=R/s,r=L/s):w<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),n=A/r,s=L/r),this.set(n,s,r,t),this}let S=Math.sqrt((m-g)*(m-g)+(d-v)*(d-v)+(h-u)*(h-u));return Math.abs(S)<.001&&(S=1),this.x=(m-g)/S,this.y=(d-v)/S,this.z=(h-u)/S,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this.w=Xe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this.w=Xe(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class mh extends ss{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Sn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);const s={width:e,height:t,depth:n.depth},r=new Rt(s);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:Sn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new el(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Si extends mh{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class hu extends Rt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=gi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class gh extends Rt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=gi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class yi{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(an.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(an.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=an.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,an):an.fromBufferAttribute(r,a),an.applyMatrix4(e.matrixWorld),this.expandByPoint(an);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),$s.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),$s.copy(n.boundingBox)),$s.applyMatrix4(e.matrixWorld),this.union($s)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,an),an.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ds),Xs.subVectors(this.max,ds),Ri.subVectors(e.a,ds),Ci.subVectors(e.b,ds),Pi.subVectors(e.c,ds),kn.subVectors(Ci,Ri),zn.subVectors(Pi,Ci),ni.subVectors(Ri,Pi);let t=[0,-kn.z,kn.y,0,-zn.z,zn.y,0,-ni.z,ni.y,kn.z,0,-kn.x,zn.z,0,-zn.x,ni.z,0,-ni.x,-kn.y,kn.x,0,-zn.y,zn.x,0,-ni.y,ni.x,0];return!ea(t,Ri,Ci,Pi,Xs)||(t=[1,0,0,0,1,0,0,0,1],!ea(t,Ri,Ci,Pi,Xs))?!1:(qs.crossVectors(kn,zn),t=[qs.x,qs.y,qs.z],ea(t,Ri,Ci,Pi,Xs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,an).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(an).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Rn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Rn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Rn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Rn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Rn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Rn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Rn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Rn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Rn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Rn=[new N,new N,new N,new N,new N,new N,new N,new N],an=new N,$s=new yi,Ri=new N,Ci=new N,Pi=new N,kn=new N,zn=new N,ni=new N,ds=new N,Xs=new N,qs=new N,ii=new N;function ea(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ii.fromArray(i,r);const o=s.x*Math.abs(ii.x)+s.y*Math.abs(ii.y)+s.z*Math.abs(ii.z),l=e.dot(ii),c=t.dot(ii),u=n.dot(ii);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const vh=new yi,hs=new N,ta=new N;class rs{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):vh.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;hs.subVectors(e,this.center);const t=hs.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(hs,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ta.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(hs.copy(e.center).add(ta)),this.expandByPoint(hs.copy(e.center).sub(ta))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const Cn=new N,na=new N,Ys=new N,Hn=new N,ia=new N,Ks=new N,sa=new N;class tl{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Cn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Cn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Cn.copy(this.origin).addScaledVector(this.direction,t),Cn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){na.copy(e).add(t).multiplyScalar(.5),Ys.copy(t).sub(e).normalize(),Hn.copy(this.origin).sub(na);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Ys),o=Hn.dot(this.direction),l=-Hn.dot(Ys),c=Hn.lengthSq(),u=Math.abs(1-a*a);let d,h,f,g;if(u>0)if(d=a*l-o,h=a*o-l,g=r*u,d>=0)if(h>=-g)if(h<=g){const v=1/u;d*=v,h*=v,f=d*(d+a*h+2*o)+h*(a*d+h+2*l)+c}else h=r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;else h<=-g?(d=Math.max(0,-(-a*r+o)),h=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c):h<=g?(d=0,h=Math.min(Math.max(-r,-l),r),f=h*(h+2*l)+c):(d=Math.max(0,-(a*r+o)),h=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c);else h=a>0?-r:r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(na).addScaledVector(Ys,h),f}intersectSphere(e,t){Cn.subVectors(e.center,this.origin);const n=Cn.dot(this.direction),s=Cn.dot(Cn)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(o=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Cn)!==null}intersectTriangle(e,t,n,s,r){ia.subVectors(t,e),Ks.subVectors(n,e),sa.crossVectors(ia,Ks);let a=this.direction.dot(sa),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Hn.subVectors(this.origin,e);const l=o*this.direction.dot(Ks.crossVectors(Hn,Ks));if(l<0)return null;const c=o*this.direction.dot(ia.cross(Hn));if(c<0||l+c>a)return null;const u=-o*Hn.dot(sa);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class rt{constructor(e,t,n,s,r,a,o,l,c,u,d,h,f,g,v,m){rt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,d,h,f,g,v,m)}set(e,t,n,s,r,a,o,l,c,u,d,h,f,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=d,p[14]=h,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new rt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/Di.setFromMatrixColumn(e,0).length(),r=1/Di.setFromMatrixColumn(e,1).length(),a=1/Di.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const h=a*u,f=a*d,g=o*u,v=o*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=f+g*c,t[5]=h-v*c,t[9]=-o*l,t[2]=v-h*c,t[6]=g+f*c,t[10]=a*l}else if(e.order==="YXZ"){const h=l*u,f=l*d,g=c*u,v=c*d;t[0]=h+v*o,t[4]=g*o-f,t[8]=a*c,t[1]=a*d,t[5]=a*u,t[9]=-o,t[2]=f*o-g,t[6]=v+h*o,t[10]=a*l}else if(e.order==="ZXY"){const h=l*u,f=l*d,g=c*u,v=c*d;t[0]=h-v*o,t[4]=-a*d,t[8]=g+f*o,t[1]=f+g*o,t[5]=a*u,t[9]=v-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const h=a*u,f=a*d,g=o*u,v=o*d;t[0]=l*u,t[4]=g*c-f,t[8]=h*c+v,t[1]=l*d,t[5]=v*c+h,t[9]=f*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const h=a*l,f=a*c,g=o*l,v=o*c;t[0]=l*u,t[4]=v-h*d,t[8]=g*d+f,t[1]=d,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=f*d+g,t[10]=h-v*d}else if(e.order==="XZY"){const h=a*l,f=a*c,g=o*l,v=o*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+v,t[5]=a*u,t[9]=f*d-g,t[2]=g*d-f,t[6]=o*u,t[10]=v*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_h,e,xh)}lookAt(e,t,n){const s=this.elements;return qt.subVectors(e,t),qt.lengthSq()===0&&(qt.z=1),qt.normalize(),Gn.crossVectors(n,qt),Gn.lengthSq()===0&&(Math.abs(n.z)===1?qt.x+=1e-4:qt.z+=1e-4,qt.normalize(),Gn.crossVectors(n,qt)),Gn.normalize(),js.crossVectors(qt,Gn),s[0]=Gn.x,s[4]=js.x,s[8]=qt.x,s[1]=Gn.y,s[5]=js.y,s[9]=qt.y,s[2]=Gn.z,s[6]=js.z,s[10]=qt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],d=n[5],h=n[9],f=n[13],g=n[2],v=n[6],m=n[10],p=n[14],S=n[3],E=n[7],M=n[11],w=n[15],R=s[0],A=s[4],L=s[8],b=s[12],y=s[1],P=s[5],B=s[9],H=s[13],q=s[2],$=s[6],X=s[10],Z=s[14],G=s[3],ce=s[7],fe=s[11],we=s[15];return r[0]=a*R+o*y+l*q+c*G,r[4]=a*A+o*P+l*$+c*ce,r[8]=a*L+o*B+l*X+c*fe,r[12]=a*b+o*H+l*Z+c*we,r[1]=u*R+d*y+h*q+f*G,r[5]=u*A+d*P+h*$+f*ce,r[9]=u*L+d*B+h*X+f*fe,r[13]=u*b+d*H+h*Z+f*we,r[2]=g*R+v*y+m*q+p*G,r[6]=g*A+v*P+m*$+p*ce,r[10]=g*L+v*B+m*X+p*fe,r[14]=g*b+v*H+m*Z+p*we,r[3]=S*R+E*y+M*q+w*G,r[7]=S*A+E*P+M*$+w*ce,r[11]=S*L+E*B+M*X+w*fe,r[15]=S*b+E*H+M*Z+w*we,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15];return g*(+r*l*d-s*c*d-r*o*h+n*c*h+s*o*f-n*l*f)+v*(+t*l*f-t*c*h+r*a*h-s*a*f+s*c*u-r*l*u)+m*(+t*c*d-t*o*f-r*a*d+n*a*f+r*o*u-n*c*u)+p*(-s*o*u-t*l*d+t*o*h+s*a*d-n*a*h+n*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],S=d*m*c-v*h*c+v*l*f-o*m*f-d*l*p+o*h*p,E=g*h*c-u*m*c-g*l*f+a*m*f+u*l*p-a*h*p,M=u*v*c-g*d*c+g*o*f-a*v*f-u*o*p+a*d*p,w=g*d*l-u*v*l-g*o*h+a*v*h+u*o*m-a*d*m,R=t*S+n*E+s*M+r*w;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/R;return e[0]=S*A,e[1]=(v*h*r-d*m*r-v*s*f+n*m*f+d*s*p-n*h*p)*A,e[2]=(o*m*r-v*l*r+v*s*c-n*m*c-o*s*p+n*l*p)*A,e[3]=(d*l*r-o*h*r-d*s*c+n*h*c+o*s*f-n*l*f)*A,e[4]=E*A,e[5]=(u*m*r-g*h*r+g*s*f-t*m*f-u*s*p+t*h*p)*A,e[6]=(g*l*r-a*m*r-g*s*c+t*m*c+a*s*p-t*l*p)*A,e[7]=(a*h*r-u*l*r+u*s*c-t*h*c-a*s*f+t*l*f)*A,e[8]=M*A,e[9]=(g*d*r-u*v*r-g*n*f+t*v*f+u*n*p-t*d*p)*A,e[10]=(a*v*r-g*o*r+g*n*c-t*v*c-a*n*p+t*o*p)*A,e[11]=(u*o*r-a*d*r-u*n*c+t*d*c+a*n*f-t*o*f)*A,e[12]=w*A,e[13]=(u*v*s-g*d*s+g*n*h-t*v*h-u*n*m+t*d*m)*A,e[14]=(g*o*s-a*v*s-g*n*l+t*v*l+a*n*m-t*o*m)*A,e[15]=(a*d*s-u*o*s+u*n*l-t*d*l-a*n*h+t*o*h)*A,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,d=o+o,h=r*c,f=r*u,g=r*d,v=a*u,m=a*d,p=o*d,S=l*c,E=l*u,M=l*d,w=n.x,R=n.y,A=n.z;return s[0]=(1-(v+p))*w,s[1]=(f+M)*w,s[2]=(g-E)*w,s[3]=0,s[4]=(f-M)*R,s[5]=(1-(h+p))*R,s[6]=(m+S)*R,s[7]=0,s[8]=(g+E)*A,s[9]=(m-S)*A,s[10]=(1-(h+v))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=Di.set(s[0],s[1],s[2]).length();const a=Di.set(s[4],s[5],s[6]).length(),o=Di.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],on.copy(this);const c=1/r,u=1/a,d=1/o;return on.elements[0]*=c,on.elements[1]*=c,on.elements[2]*=c,on.elements[4]*=u,on.elements[5]*=u,on.elements[6]*=u,on.elements[8]*=d,on.elements[9]*=d,on.elements[10]*=d,t.setFromRotationMatrix(on),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=En,l=!1){const c=this.elements,u=2*r/(t-e),d=2*r/(n-s),h=(t+e)/(t-e),f=(n+s)/(n-s);let g,v;if(l)g=r/(a-r),v=a*r/(a-r);else if(o===En)g=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Pr)g=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=En,l=!1){const c=this.elements,u=2/(t-e),d=2/(n-s),h=-(t+e)/(t-e),f=-(n+s)/(n-s);let g,v;if(l)g=1/(a-r),v=a/(a-r);else if(o===En)g=-2/(a-r),v=-(a+r)/(a-r);else if(o===Pr)g=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Di=new N,on=new rt,_h=new N(0,0,0),xh=new N(1,1,1),Gn=new N,js=new N,qt=new N,Fl=new rt,Ol=new Fs;class pn{constructor(e=0,t=0,n=0,s=pn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],d=s[2],h=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Xe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Xe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Xe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Xe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Xe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Fl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Fl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ol.setFromEuler(this),this.setFromQuaternion(Ol,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}pn.DEFAULT_ORDER="XYZ";class nl{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Mh=0;const Bl=new N,Li=new Fs,Pn=new rt,Zs=new N,fs=new N,Sh=new N,yh=new Fs,kl=new N(1,0,0),zl=new N(0,1,0),Hl=new N(0,0,1),Gl={type:"added"},Eh={type:"removed"},Ii={type:"childadded",child:null},ra={type:"childremoved",child:null};class yt extends ss{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Mh++}),this.uuid=Ns(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=yt.DEFAULT_UP.clone();const e=new N,t=new pn,n=new Fs,s=new N(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new rt},normalMatrix:{value:new Be}}),this.matrix=new rt,this.matrixWorld=new rt,this.matrixAutoUpdate=yt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new nl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Li.setFromAxisAngle(e,t),this.quaternion.multiply(Li),this}rotateOnWorldAxis(e,t){return Li.setFromAxisAngle(e,t),this.quaternion.premultiply(Li),this}rotateX(e){return this.rotateOnAxis(kl,e)}rotateY(e){return this.rotateOnAxis(zl,e)}rotateZ(e){return this.rotateOnAxis(Hl,e)}translateOnAxis(e,t){return Bl.copy(e).applyQuaternion(this.quaternion),this.position.add(Bl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(kl,e)}translateY(e){return this.translateOnAxis(zl,e)}translateZ(e){return this.translateOnAxis(Hl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Pn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Zs.copy(e):Zs.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),fs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Pn.lookAt(fs,Zs,this.up):Pn.lookAt(Zs,fs,this.up),this.quaternion.setFromRotationMatrix(Pn),s&&(Pn.extractRotation(s.matrixWorld),Li.setFromRotationMatrix(Pn),this.quaternion.premultiply(Li.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Gl),Ii.child=e,this.dispatchEvent(Ii),Ii.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Eh),ra.child=e,this.dispatchEvent(ra),ra.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Pn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Pn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Pn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Gl),Ii.child=e,this.dispatchEvent(Ii),Ii.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,e,Sh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,yh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),d=a(e.shapes),h=a(e.skeletons),f=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}yt.DEFAULT_UP=new N(0,1,0);yt.DEFAULT_MATRIX_AUTO_UPDATE=!0;yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const ln=new N,Dn=new N,aa=new N,Ln=new N,Ui=new N,Ni=new N,Vl=new N,oa=new N,la=new N,ca=new N,ua=new tt,da=new tt,ha=new tt;class un{constructor(e=new N,t=new N,n=new N){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),ln.subVectors(e,t),s.cross(ln);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){ln.subVectors(s,t),Dn.subVectors(n,t),aa.subVectors(e,t);const a=ln.dot(ln),o=ln.dot(Dn),l=ln.dot(aa),c=Dn.dot(Dn),u=Dn.dot(aa),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;const h=1/d,f=(c*l-o*u)*h,g=(a*u-o*l)*h;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Ln)===null?!1:Ln.x>=0&&Ln.y>=0&&Ln.x+Ln.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Ln)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ln.x),l.addScaledVector(a,Ln.y),l.addScaledVector(o,Ln.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return ua.setScalar(0),da.setScalar(0),ha.setScalar(0),ua.fromBufferAttribute(e,t),da.fromBufferAttribute(e,n),ha.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(ua,r.x),a.addScaledVector(da,r.y),a.addScaledVector(ha,r.z),a}static isFrontFacing(e,t,n,s){return ln.subVectors(n,t),Dn.subVectors(e,t),ln.cross(Dn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ln.subVectors(this.c,this.b),Dn.subVectors(this.a,this.b),ln.cross(Dn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return un.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return un.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return un.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return un.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return un.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Ui.subVectors(s,n),Ni.subVectors(r,n),oa.subVectors(e,n);const l=Ui.dot(oa),c=Ni.dot(oa);if(l<=0&&c<=0)return t.copy(n);la.subVectors(e,s);const u=Ui.dot(la),d=Ni.dot(la);if(u>=0&&d<=u)return t.copy(s);const h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(Ui,a);ca.subVectors(e,r);const f=Ui.dot(ca),g=Ni.dot(ca);if(g>=0&&f<=g)return t.copy(r);const v=f*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(Ni,o);const m=u*g-f*d;if(m<=0&&d-u>=0&&f-g>=0)return Vl.subVectors(r,s),o=(d-u)/(d-u+(f-g)),t.copy(s).addScaledVector(Vl,o);const p=1/(m+v+h);return a=v*p,o=h*p,t.copy(n).addScaledVector(Ui,a).addScaledVector(Ni,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const fu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Vn={h:0,s:0,l:0},Js={h:0,s:0,l:0};function fa(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ve{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Lt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,je.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=je.workingColorSpace){return this.r=e,this.g=t,this.b=n,je.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=je.workingColorSpace){if(e=lh(e,1),t=Xe(t,0,1),n=Xe(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=fa(a,r,e+1/3),this.g=fa(a,r,e),this.b=fa(a,r,e-1/3)}return je.colorSpaceToWorking(this,s),this}setStyle(e,t=Lt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Lt){const n=fu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=On(e.r),this.g=On(e.g),this.b=On(e.b),this}copyLinearToSRGB(e){return this.r=Yi(e.r),this.g=Yi(e.g),this.b=Yi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Lt){return je.workingToColorSpace(Dt.copy(this),e),Math.round(Xe(Dt.r*255,0,255))*65536+Math.round(Xe(Dt.g*255,0,255))*256+Math.round(Xe(Dt.b*255,0,255))}getHexString(e=Lt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=je.workingColorSpace){je.workingToColorSpace(Dt.copy(this),t);const n=Dt.r,s=Dt.g,r=Dt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const d=a-o;switch(c=u<=.5?d/(a+o):d/(2-a-o),a){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=je.workingColorSpace){return je.workingToColorSpace(Dt.copy(this),t),e.r=Dt.r,e.g=Dt.g,e.b=Dt.b,e}getStyle(e=Lt){je.workingToColorSpace(Dt.copy(this),e);const t=Dt.r,n=Dt.g,s=Dt.b;return e!==Lt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Vn),this.setHSL(Vn.h+e,Vn.s+t,Vn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Vn),e.getHSL(Js);const n=Kr(Vn.h,Js.h,t),s=Kr(Vn.s,Js.s,t),r=Kr(Vn.l,Js.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Dt=new Ve;Ve.NAMES=fu;let bh=0;class Ei extends ss{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:bh++}),this.uuid=Ns(),this.name="",this.type="Material",this.blending=qi,this.side=Kn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=$a,this.blendDst=Xa,this.blendEquation=hi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=Zi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Cl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=wi,this.stencilZFail=wi,this.stencilZPass=wi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==qi&&(n.blending=this.blending),this.side!==Kn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==$a&&(n.blendSrc=this.blendSrc),this.blendDst!==Xa&&(n.blendDst=this.blendDst),this.blendEquation!==hi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Zi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Cl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==wi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==wi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==wi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class vn extends Ei{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.combine=$o,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Mt=new N,Qs=new qe;let Th=0;class rn{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Th++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Pl,this.updateRanges=[],this.gpuType=yn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Qs.fromBufferAttribute(this,t),Qs.applyMatrix3(e),this.setXY(t,Qs.x,Qs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix3(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix4(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyNormalMatrix(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.transformDirection(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=us(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ht(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=us(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=us(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=us(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=us(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array),s=Ht(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array),s=Ht(s,this.array),r=Ht(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Pl&&(e.usage=this.usage),e}}class pu extends rn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class mu extends rn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class hn extends rn{constructor(e,t,n){super(new Float32Array(e),t,n)}}let wh=0;const tn=new rt,pa=new yt,Fi=new N,Yt=new yi,ps=new yi,wt=new N;class mn extends ss{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:wh++}),this.uuid=Ns(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(du(e)?mu:pu)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Be().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return tn.makeRotationFromQuaternion(e),this.applyMatrix4(tn),this}rotateX(e){return tn.makeRotationX(e),this.applyMatrix4(tn),this}rotateY(e){return tn.makeRotationY(e),this.applyMatrix4(tn),this}rotateZ(e){return tn.makeRotationZ(e),this.applyMatrix4(tn),this}translate(e,t,n){return tn.makeTranslation(e,t,n),this.applyMatrix4(tn),this}scale(e,t,n){return tn.makeScale(e,t,n),this.applyMatrix4(tn),this}lookAt(e){return pa.lookAt(e),pa.updateMatrix(),this.applyMatrix4(pa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Fi).negate(),this.translate(Fi.x,Fi.y,Fi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new hn(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new yi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Yt.setFromBufferAttribute(r),this.morphTargetsRelative?(wt.addVectors(this.boundingBox.min,Yt.min),this.boundingBox.expandByPoint(wt),wt.addVectors(this.boundingBox.max,Yt.max),this.boundingBox.expandByPoint(wt)):(this.boundingBox.expandByPoint(Yt.min),this.boundingBox.expandByPoint(Yt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new rs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){const n=this.boundingSphere.center;if(Yt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];ps.setFromBufferAttribute(o),this.morphTargetsRelative?(wt.addVectors(Yt.min,ps.min),Yt.expandByPoint(wt),wt.addVectors(Yt.max,ps.max),Yt.expandByPoint(wt)):(Yt.expandByPoint(ps.min),Yt.expandByPoint(ps.max))}Yt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)wt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(wt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)wt.fromBufferAttribute(o,c),l&&(Fi.fromBufferAttribute(e,c),wt.add(Fi)),s=Math.max(s,n.distanceToSquared(wt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new rn(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let L=0;L<n.count;L++)o[L]=new N,l[L]=new N;const c=new N,u=new N,d=new N,h=new qe,f=new qe,g=new qe,v=new N,m=new N;function p(L,b,y){c.fromBufferAttribute(n,L),u.fromBufferAttribute(n,b),d.fromBufferAttribute(n,y),h.fromBufferAttribute(r,L),f.fromBufferAttribute(r,b),g.fromBufferAttribute(r,y),u.sub(c),d.sub(c),f.sub(h),g.sub(h);const P=1/(f.x*g.y-g.x*f.y);isFinite(P)&&(v.copy(u).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(P),m.copy(d).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(P),o[L].add(v),o[b].add(v),o[y].add(v),l[L].add(m),l[b].add(m),l[y].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let L=0,b=S.length;L<b;++L){const y=S[L],P=y.start,B=y.count;for(let H=P,q=P+B;H<q;H+=3)p(e.getX(H+0),e.getX(H+1),e.getX(H+2))}const E=new N,M=new N,w=new N,R=new N;function A(L){w.fromBufferAttribute(s,L),R.copy(w);const b=o[L];E.copy(b),E.sub(w.multiplyScalar(w.dot(b))).normalize(),M.crossVectors(R,b);const P=M.dot(l[L])<0?-1:1;a.setXYZW(L,E.x,E.y,E.z,P)}for(let L=0,b=S.length;L<b;++L){const y=S[L],P=y.start,B=y.count;for(let H=P,q=P+B;H<q;H+=3)A(e.getX(H+0)),A(e.getX(H+1)),A(e.getX(H+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new rn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);const s=new N,r=new N,a=new N,o=new N,l=new N,c=new N,u=new N,d=new N;if(e)for(let h=0,f=e.count;h<f;h+=3){const g=e.getX(h+0),v=e.getX(h+1),m=e.getX(h+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,m),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)wt.fromBufferAttribute(e,t),wt.normalize(),e.setXYZ(t,wt.x,wt.y,wt.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,d=o.normalized,h=new c.constructor(l.length*u);let f=0,g=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*u;for(let p=0;p<u;p++)h[g++]=c[f++]}return new rn(h,u,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new mn,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,d=c.length;u<d;u++){const h=c[u],f=e(h,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){const f=c[d];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],d=r[c];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Wl=new rt,si=new tl,er=new rs,$l=new N,tr=new N,nr=new N,ir=new N,ma=new N,sr=new N,Xl=new N,rr=new N;class $e extends yt{constructor(e=new mn,t=new vn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){sr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],d=r[l];u!==0&&(ma.fromBufferAttribute(d,e),a?sr.addScaledVector(ma,u):sr.addScaledVector(ma.sub(t),u))}t.add(sr)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),er.copy(n.boundingSphere),er.applyMatrix4(r),si.copy(e.ray).recast(e.near),!(er.containsPoint(si.origin)===!1&&(si.intersectSphere(er,$l)===null||si.origin.distanceToSquared($l)>(e.far-e.near)**2))&&(Wl.copy(r).invert(),si.copy(e.ray).applyMatrix4(Wl),!(n.boundingBox!==null&&si.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,si)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=h.length;g<v;g++){const m=h[g],p=a[m.materialIndex],S=Math.max(m.start,f.start),E=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let M=S,w=E;M<w;M+=3){const R=o.getX(M),A=o.getX(M+1),L=o.getX(M+2);s=ar(this,p,e,n,c,u,d,R,A,L),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const S=o.getX(m),E=o.getX(m+1),M=o.getX(m+2);s=ar(this,a,e,n,c,u,d,S,E,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=h.length;g<v;g++){const m=h[g],p=a[m.materialIndex],S=Math.max(m.start,f.start),E=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let M=S,w=E;M<w;M+=3){const R=M,A=M+1,L=M+2;s=ar(this,p,e,n,c,u,d,R,A,L),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const S=m,E=m+1,M=m+2;s=ar(this,a,e,n,c,u,d,S,E,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Ah(i,e,t,n,s,r,a,o){let l;if(e.side===kt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===Kn,o),l===null)return null;rr.copy(o),rr.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(rr);return c<t.near||c>t.far?null:{distance:c,point:rr.clone(),object:i}}function ar(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,tr),i.getVertexPosition(l,nr),i.getVertexPosition(c,ir);const u=Ah(i,e,t,n,tr,nr,ir,Xl);if(u){const d=new N;un.getBarycoord(Xl,tr,nr,ir,d),s&&(u.uv=un.getInterpolatedAttribute(s,o,l,c,d,new qe)),r&&(u.uv1=un.getInterpolatedAttribute(r,o,l,c,d,new qe)),a&&(u.normal=un.getInterpolatedAttribute(a,o,l,c,d,new N),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:l,c,normal:new N,materialIndex:0};un.getNormal(tr,nr,ir,h.normal),u.face=h,u.barycoord=d}return u}class Ft extends mn{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],d=[];let h=0,f=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new hn(c,3)),this.setAttribute("normal",new hn(u,3)),this.setAttribute("uv",new hn(d,2));function g(v,m,p,S,E,M,w,R,A,L,b){const y=M/A,P=w/L,B=M/2,H=w/2,q=R/2,$=A+1,X=L+1;let Z=0,G=0;const ce=new N;for(let fe=0;fe<X;fe++){const we=fe*P-H;for(let Ge=0;Ge<$;Ge++){const at=Ge*y-B;ce[v]=at*S,ce[m]=we*E,ce[p]=q,c.push(ce.x,ce.y,ce.z),ce[v]=0,ce[m]=0,ce[p]=R>0?1:-1,u.push(ce.x,ce.y,ce.z),d.push(Ge/A),d.push(1-fe/L),Z+=1}}for(let fe=0;fe<L;fe++)for(let we=0;we<A;we++){const Ge=h+we+$*fe,at=h+we+$*(fe+1),ct=h+(we+1)+$*(fe+1),Ze=h+(we+1)+$*fe;l.push(Ge,at,Ze),l.push(at,ct,Ze),G+=6}o.addGroup(f,G,b),f+=G,h+=Z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ft(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ts(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Nt(i){const e={};for(let t=0;t<i.length;t++){const n=ts(i[t]);for(const s in n)e[s]=n[s]}return e}function Rh(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function gu(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:je.workingColorSpace}const Ch={clone:ts,merge:Nt};var Ph=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Dh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class jn extends Ei{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ph,this.fragmentShader=Dh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ts(e.uniforms),this.uniformsGroups=Rh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class vu extends yt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new rt,this.projectionMatrix=new rt,this.projectionMatrixInverse=new rt,this.coordinateSystem=En,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Wn=new N,ql=new qe,Yl=new qe;class Vt extends vu{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Dr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Yr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Dr*2*Math.atan(Math.tan(Yr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Wn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Wn.x,Wn.y).multiplyScalar(-e/Wn.z),Wn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Wn.x,Wn.y).multiplyScalar(-e/Wn.z)}getViewSize(e,t){return this.getViewBounds(e,ql,Yl),t.subVectors(Yl,ql)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Yr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Oi=-90,Bi=1;class Lh extends yt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Vt(Oi,Bi,e,t);s.layers=this.layers,this.add(s);const r=new Vt(Oi,Bi,e,t);r.layers=this.layers,this.add(r);const a=new Vt(Oi,Bi,e,t);a.layers=this.layers,this.add(a);const o=new Vt(Oi,Bi,e,t);o.layers=this.layers,this.add(o);const l=new Vt(Oi,Bi,e,t);l.layers=this.layers,this.add(l);const c=new Vt(Oi,Bi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===En)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Pr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),e.render(t,u),e.setRenderTarget(d,h,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class _u extends Rt{constructor(e=[],t=Ji,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Ih extends Si{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new _u(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Ft(5,5,5),r=new jn({name:"CubemapFromEquirect",uniforms:ts(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:kt,blending:qn});r.uniforms.tEquirect.value=t;const a=new $e(s,r),o=t.minFilter;return t.minFilter===vi&&(t.minFilter=Sn),new Lh(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}class Fn extends yt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Uh={type:"move"};class ga{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Fn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Fn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Fn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&h>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Uh)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Fn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class il{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ve(e),this.near=t,this.far=n}clone(){return new il(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class xu extends yt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pn,this.environmentIntensity=1,this.environmentRotation=new pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Nh extends Rt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Jt,u=Jt,d,h){super(null,a,o,l,c,u,s,r,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Kl extends rn{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const ki=new rt,jl=new rt,or=[],Zl=new yi,Fh=new rt,ms=new $e,gs=new rs;class Oh extends $e{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Kl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Fh)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new yi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ki),Zl.copy(e.boundingBox).applyMatrix4(ki),this.boundingBox.union(Zl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new rs),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ki),gs.copy(e.boundingSphere).applyMatrix4(ki),this.boundingSphere.union(gs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(ms.geometry=this.geometry,ms.material=this.material,ms.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),gs.copy(this.boundingSphere),gs.applyMatrix4(n),e.ray.intersectsSphere(gs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ki),jl.multiplyMatrices(n,ki),ms.matrixWorld=jl,ms.raycast(e,or);for(let a=0,o=or.length;a<o;a++){const l=or[a];l.instanceId=r,l.object=this,t.push(l)}or.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Kl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Nh(new Float32Array(s*this.count),s,this.count,Ko,yn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const va=new N,Bh=new N,kh=new Be;class ci{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=va.subVectors(n,t).cross(Bh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(va),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||kh.getNormalMatrix(e),s=this.coplanarPoint(va).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ri=new rs,zh=new qe(.5,.5),lr=new N;class sl{constructor(e=new ci,t=new ci,n=new ci,s=new ci,r=new ci,a=new ci){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=En,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],d=r[5],h=r[6],f=r[7],g=r[8],v=r[9],m=r[10],p=r[11],S=r[12],E=r[13],M=r[14],w=r[15];if(s[0].setComponents(c-a,f-u,p-g,w-S).normalize(),s[1].setComponents(c+a,f+u,p+g,w+S).normalize(),s[2].setComponents(c+o,f+d,p+v,w+E).normalize(),s[3].setComponents(c-o,f-d,p-v,w-E).normalize(),n)s[4].setComponents(l,h,m,M).normalize(),s[5].setComponents(c-l,f-h,p-m,w-M).normalize();else if(s[4].setComponents(c-l,f-h,p-m,w-M).normalize(),t===En)s[5].setComponents(c+l,f+h,p+m,w+M).normalize();else if(t===Pr)s[5].setComponents(l,h,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ri.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ri.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ri)}intersectsSprite(e){ri.center.set(0,0,0);const t=zh.distanceTo(e.center);return ri.radius=.7071067811865476+t,ri.applyMatrix4(e.matrixWorld),this.intersectsSphere(ri)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(lr.x=s.normal.x>0?e.max.x:e.min.x,lr.y=s.normal.y>0?e.max.y:e.min.y,lr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(lr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Mu extends Ei{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ve(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Jl=new rt,Io=new tl,cr=new rs,ur=new N;class Hh extends yt{constructor(e=new mn,t=new Mu){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),cr.copy(n.boundingSphere),cr.applyMatrix4(s),cr.radius+=r,e.ray.intersectsSphere(cr)===!1)return;Jl.copy(s).invert(),Io.copy(e.ray).applyMatrix4(Jl);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,d=n.attributes.position;if(c!==null){const h=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let g=h,v=f;g<v;g++){const m=c.getX(g);ur.fromBufferAttribute(d,m),Ql(ur,m,l,s,e,t,this)}}else{const h=Math.max(0,a.start),f=Math.min(d.count,a.start+a.count);for(let g=h,v=f;g<v;g++)ur.fromBufferAttribute(d,g),Ql(ur,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Ql(i,e,t,n,s,r,a){const o=Io.distanceSqToPoint(i);if(o<t){const l=new N;Io.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class _a extends Rt{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Su extends Rt{constructor(e,t,n=Mi,s,r,a,o=Jt,l=Jt,c,u=Ps,d=1){if(u!==Ps&&u!==Ds)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:d};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new el(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class yu extends Rt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Fr extends mn{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],d=[],h=[],f=[];let g=0;const v=[],m=n/2;let p=0;S(),a===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(u),this.setAttribute("position",new hn(d,3)),this.setAttribute("normal",new hn(h,3)),this.setAttribute("uv",new hn(f,2));function S(){const M=new N,w=new N;let R=0;const A=(t-e)/n;for(let L=0;L<=r;L++){const b=[],y=L/r,P=y*(t-e)+e;for(let B=0;B<=s;B++){const H=B/s,q=H*l+o,$=Math.sin(q),X=Math.cos(q);w.x=P*$,w.y=-y*n+m,w.z=P*X,d.push(w.x,w.y,w.z),M.set($,A,X).normalize(),h.push(M.x,M.y,M.z),f.push(H,1-y),b.push(g++)}v.push(b)}for(let L=0;L<s;L++)for(let b=0;b<r;b++){const y=v[b][L],P=v[b+1][L],B=v[b+1][L+1],H=v[b][L+1];(e>0||b!==0)&&(u.push(y,P,H),R+=3),(t>0||b!==r-1)&&(u.push(P,B,H),R+=3)}c.addGroup(p,R,0),p+=R}function E(M){const w=g,R=new qe,A=new N;let L=0;const b=M===!0?e:t,y=M===!0?1:-1;for(let B=1;B<=s;B++)d.push(0,m*y,0),h.push(0,y,0),f.push(.5,.5),g++;const P=g;for(let B=0;B<=s;B++){const q=B/s*l+o,$=Math.cos(q),X=Math.sin(q);A.x=b*X,A.y=m*y,A.z=b*$,d.push(A.x,A.y,A.z),h.push(0,y,0),R.x=$*.5+.5,R.y=X*.5*y+.5,f.push(R.x,R.y),g++}for(let B=0;B<s;B++){const H=w+B,q=P+B;M===!0?u.push(q,q+1,H):u.push(q+1,q,H),L+=3}c.addGroup(p,L,M===!0?1:2),p+=L}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fr(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class rl extends Fr{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new rl(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class sn extends mn{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,d=e/o,h=t/l,f=[],g=[],v=[],m=[];for(let p=0;p<u;p++){const S=p*h-a;for(let E=0;E<c;E++){const M=E*d-r;g.push(M,-S,0),v.push(0,0,1),m.push(E/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let S=0;S<o;S++){const E=S+c*p,M=S+c*(p+1),w=S+1+c*(p+1),R=S+1+c*p;f.push(E,M,R),f.push(M,w,R)}this.setIndex(f),this.setAttribute("position",new hn(g,3)),this.setAttribute("normal",new hn(v,3)),this.setAttribute("uv",new hn(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new sn(e.width,e.height,e.widthSegments,e.heightSegments)}}class ns extends Ei{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Qo,this.normalScale=new qe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Gh extends Ei{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Qo,this.normalScale=new qe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.combine=$o,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Vh extends Ei{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Jd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Wh extends Ei{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class al extends yt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class Eu extends al{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(yt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ve(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const xa=new rt,ec=new N,tc=new N;class bu{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new qe(512,512),this.mapType=Tn,this.map=null,this.mapPass=null,this.matrix=new rt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new sl,this._frameExtents=new qe(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;ec.setFromMatrixPosition(e.matrixWorld),t.position.copy(ec),tc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(tc),t.updateMatrixWorld(),xa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(xa,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(xa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class $h extends bu{constructor(){super(new Vt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=Dr*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class ol extends al{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(yt.DEFAULT_UP),this.updateMatrix(),this.target=new yt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new $h}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const nc=new rt,vs=new N,Ma=new N;class Xh extends bu{constructor(){super(new Vt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new qe(4,2),this._viewportCount=6,this._viewports=[new tt(2,1,1,1),new tt(0,1,1,1),new tt(3,1,1,1),new tt(1,1,1,1),new tt(3,0,1,1),new tt(1,0,1,1)],this._cubeDirections=[new N(1,0,0),new N(-1,0,0),new N(0,0,1),new N(0,0,-1),new N(0,1,0),new N(0,-1,0)],this._cubeUps=[new N(0,1,0),new N(0,1,0),new N(0,1,0),new N(0,1,0),new N(0,0,1),new N(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),vs.setFromMatrixPosition(e.matrixWorld),n.position.copy(vs),Ma.copy(n.position),Ma.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Ma),n.updateMatrixWorld(),s.makeTranslation(-vs.x,-vs.y,-vs.z),nc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(nc,n.coordinateSystem,n.reversedDepth)}}class Tu extends al{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Xh}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class qh extends vu{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Yh extends Vt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const ic=new rt;class Kh{constructor(e,t,n=0,s=1/0){this.ray=new tl(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new nl,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return ic.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ic),this}intersectObject(e,t=!0,n=[]){return Uo(e,this,n,t),n.sort(sc),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Uo(e[s],this,n,t);return n.sort(sc),n}}function sc(i,e){return i.distance-e.distance}function Uo(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let a=0,o=r.length;a<o;a++)Uo(r[a],e,t,!0)}}function rc(i,e,t,n){const s=jh(n);switch(t){case ou:return i*e;case Ko:return i*e/s.components*s.byteLength;case jo:return i*e/s.components*s.byteLength;case cu:return i*e*2/s.components*s.byteLength;case Zo:return i*e*2/s.components*s.byteLength;case lu:return i*e*3/s.components*s.byteLength;case dn:return i*e*4/s.components*s.byteLength;case Jo:return i*e*4/s.components*s.byteLength;case yr:case Er:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case br:case Tr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ro:case oo:return Math.max(i,16)*Math.max(e,8)/4;case so:case ao:return Math.max(i,8)*Math.max(e,8)/2;case lo:case co:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case uo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ho:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case fo:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case po:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case mo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case go:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case vo:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case _o:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case xo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Mo:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case So:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case yo:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Eo:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case bo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case To:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case wo:case Ao:case Ro:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Co:case Po:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Do:case Lo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function jh(i){switch(i){case Tn:case iu:return{byteLength:1,components:1};case Rs:case su:case Us:return{byteLength:2,components:1};case qo:case Yo:return{byteLength:2,components:4};case Mi:case Xo:case yn:return{byteLength:4,components:1};case ru:case au:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Wo}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Wo);function wu(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Zh(i){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,d=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){const u=l.array,d=l.updateRanges;if(i.bindBuffer(c,o),d.length===0)i.bufferSubData(c,0,u);else{d.sort((f,g)=>f.start-g.start);let h=0;for(let f=1;f<d.length;f++){const g=d[h],v=d[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++h,d[h]=v)}d.length=h+1;for(let f=0,g=d.length;f<g;f++){const v=d[f];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Jh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Qh=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ef=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,tf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,nf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,sf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,rf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,af=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,of=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,lf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,cf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,uf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,df=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,hf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,ff=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,pf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,mf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,gf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,vf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,_f=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,xf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Mf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Sf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,yf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Ef=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,bf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Tf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,wf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Af=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Rf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Cf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Pf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Df=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Lf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,If=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Uf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Nf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Ff=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Of=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Bf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,kf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,zf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Hf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Gf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Vf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Wf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,$f=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Xf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,qf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Yf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Kf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,jf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Zf=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Jf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Qf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,ep=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,tp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,np=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ip=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,sp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,rp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ap=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,op=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,lp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,cp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,up=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,dp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,hp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,fp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,pp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,mp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,gp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,vp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,_p=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,xp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Mp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Sp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,yp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ep=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,bp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Tp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,wp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ap=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Rp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Cp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Pp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Dp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Lp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ip=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Up=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Np=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Fp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Op=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Bp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,kp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,zp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Hp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Gp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Vp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Wp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,$p=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Xp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,qp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Yp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Kp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,jp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Zp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Jp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Qp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,em=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,tm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,im=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,rm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,am=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,om=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,lm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,cm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,um=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,dm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,hm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,fm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,mm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,vm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_m=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,xm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Mm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Sm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ym=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Em=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Am=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Rm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Cm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Pm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Dm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,He={alphahash_fragment:Jh,alphahash_pars_fragment:Qh,alphamap_fragment:ef,alphamap_pars_fragment:tf,alphatest_fragment:nf,alphatest_pars_fragment:sf,aomap_fragment:rf,aomap_pars_fragment:af,batching_pars_vertex:of,batching_vertex:lf,begin_vertex:cf,beginnormal_vertex:uf,bsdfs:df,iridescence_fragment:hf,bumpmap_pars_fragment:ff,clipping_planes_fragment:pf,clipping_planes_pars_fragment:mf,clipping_planes_pars_vertex:gf,clipping_planes_vertex:vf,color_fragment:_f,color_pars_fragment:xf,color_pars_vertex:Mf,color_vertex:Sf,common:yf,cube_uv_reflection_fragment:Ef,defaultnormal_vertex:bf,displacementmap_pars_vertex:Tf,displacementmap_vertex:wf,emissivemap_fragment:Af,emissivemap_pars_fragment:Rf,colorspace_fragment:Cf,colorspace_pars_fragment:Pf,envmap_fragment:Df,envmap_common_pars_fragment:Lf,envmap_pars_fragment:If,envmap_pars_vertex:Uf,envmap_physical_pars_fragment:$f,envmap_vertex:Nf,fog_vertex:Ff,fog_pars_vertex:Of,fog_fragment:Bf,fog_pars_fragment:kf,gradientmap_pars_fragment:zf,lightmap_pars_fragment:Hf,lights_lambert_fragment:Gf,lights_lambert_pars_fragment:Vf,lights_pars_begin:Wf,lights_toon_fragment:Xf,lights_toon_pars_fragment:qf,lights_phong_fragment:Yf,lights_phong_pars_fragment:Kf,lights_physical_fragment:jf,lights_physical_pars_fragment:Zf,lights_fragment_begin:Jf,lights_fragment_maps:Qf,lights_fragment_end:ep,logdepthbuf_fragment:tp,logdepthbuf_pars_fragment:np,logdepthbuf_pars_vertex:ip,logdepthbuf_vertex:sp,map_fragment:rp,map_pars_fragment:ap,map_particle_fragment:op,map_particle_pars_fragment:lp,metalnessmap_fragment:cp,metalnessmap_pars_fragment:up,morphinstance_vertex:dp,morphcolor_vertex:hp,morphnormal_vertex:fp,morphtarget_pars_vertex:pp,morphtarget_vertex:mp,normal_fragment_begin:gp,normal_fragment_maps:vp,normal_pars_fragment:_p,normal_pars_vertex:xp,normal_vertex:Mp,normalmap_pars_fragment:Sp,clearcoat_normal_fragment_begin:yp,clearcoat_normal_fragment_maps:Ep,clearcoat_pars_fragment:bp,iridescence_pars_fragment:Tp,opaque_fragment:wp,packing:Ap,premultiplied_alpha_fragment:Rp,project_vertex:Cp,dithering_fragment:Pp,dithering_pars_fragment:Dp,roughnessmap_fragment:Lp,roughnessmap_pars_fragment:Ip,shadowmap_pars_fragment:Up,shadowmap_pars_vertex:Np,shadowmap_vertex:Fp,shadowmask_pars_fragment:Op,skinbase_vertex:Bp,skinning_pars_vertex:kp,skinning_vertex:zp,skinnormal_vertex:Hp,specularmap_fragment:Gp,specularmap_pars_fragment:Vp,tonemapping_fragment:Wp,tonemapping_pars_fragment:$p,transmission_fragment:Xp,transmission_pars_fragment:qp,uv_pars_fragment:Yp,uv_pars_vertex:Kp,uv_vertex:jp,worldpos_vertex:Zp,background_vert:Jp,background_frag:Qp,backgroundCube_vert:em,backgroundCube_frag:tm,cube_vert:nm,cube_frag:im,depth_vert:sm,depth_frag:rm,distanceRGBA_vert:am,distanceRGBA_frag:om,equirect_vert:lm,equirect_frag:cm,linedashed_vert:um,linedashed_frag:dm,meshbasic_vert:hm,meshbasic_frag:fm,meshlambert_vert:pm,meshlambert_frag:mm,meshmatcap_vert:gm,meshmatcap_frag:vm,meshnormal_vert:_m,meshnormal_frag:xm,meshphong_vert:Mm,meshphong_frag:Sm,meshphysical_vert:ym,meshphysical_frag:Em,meshtoon_vert:bm,meshtoon_frag:Tm,points_vert:wm,points_frag:Am,shadow_vert:Rm,shadow_frag:Cm,sprite_vert:Pm,sprite_frag:Dm},le={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new qe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new qe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},_n={basic:{uniforms:Nt([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:Nt([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.fog,le.lights,{emissive:{value:new Ve(0)}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:Nt([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.fog,le.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:Nt([le.common,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.roughnessmap,le.metalnessmap,le.fog,le.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:Nt([le.common,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.gradientmap,le.fog,le.lights,{emissive:{value:new Ve(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:Nt([le.common,le.bumpmap,le.normalmap,le.displacementmap,le.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:Nt([le.points,le.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:Nt([le.common,le.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:Nt([le.common,le.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:Nt([le.common,le.bumpmap,le.normalmap,le.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:Nt([le.sprite,le.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distanceRGBA:{uniforms:Nt([le.common,le.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distanceRGBA_vert,fragmentShader:He.distanceRGBA_frag},shadow:{uniforms:Nt([le.lights,le.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};_n.physical={uniforms:Nt([_n.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new qe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new qe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new qe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};const dr={r:0,b:0,g:0},ai=new pn,Lm=new rt;function Im(i,e,t,n,s,r,a){const o=new Ve(0);let l=r===!0?0:1,c,u,d=null,h=0,f=null;function g(E){let M=E.isScene===!0?E.background:null;return M&&M.isTexture&&(M=(E.backgroundBlurriness>0?t:e).get(M)),M}function v(E){let M=!1;const w=g(E);w===null?p(o,l):w&&w.isColor&&(p(w,1),M=!0);const R=i.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,a):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(E,M){const w=g(M);w&&(w.isCubeTexture||w.mapping===Nr)?(u===void 0&&(u=new $e(new Ft(1,1,1),new jn({name:"BackgroundCubeMaterial",uniforms:ts(_n.backgroundCube.uniforms),vertexShader:_n.backgroundCube.vertexShader,fragmentShader:_n.backgroundCube.fragmentShader,side:kt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(R,A,L){this.matrixWorld.copyPosition(L.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),ai.copy(M.backgroundRotation),ai.x*=-1,ai.y*=-1,ai.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(ai.y*=-1,ai.z*=-1),u.material.uniforms.envMap.value=w,u.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Lm.makeRotationFromEuler(ai)),u.material.toneMapped=je.getTransfer(w.colorSpace)!==et,(d!==w||h!==w.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,d=w,h=w.version,f=i.toneMapping),u.layers.enableAll(),E.unshift(u,u.geometry,u.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new $e(new sn(2,2),new jn({name:"BackgroundMaterial",uniforms:ts(_n.background.uniforms),vertexShader:_n.background.vertexShader,fragmentShader:_n.background.fragmentShader,side:Kn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=je.getTransfer(w.colorSpace)!==et,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(d!==w||h!==w.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,d=w,h=w.version,f=i.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null))}function p(E,M){E.getRGB(dr,gu(i)),n.buffers.color.setClear(dr.r,dr.g,dr.b,M,a)}function S(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(E,M=1){o.set(E),l=M,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(E){l=E,p(o,l)},render:v,addToRenderList:m,dispose:S}}function Um(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null);let r=s,a=!1;function o(y,P,B,H,q){let $=!1;const X=d(H,B,P);r!==X&&(r=X,c(r.object)),$=f(y,H,B,q),$&&g(y,H,B,q),q!==null&&e.update(q,i.ELEMENT_ARRAY_BUFFER),($||a)&&(a=!1,M(y,P,B,H),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function l(){return i.createVertexArray()}function c(y){return i.bindVertexArray(y)}function u(y){return i.deleteVertexArray(y)}function d(y,P,B){const H=B.wireframe===!0;let q=n[y.id];q===void 0&&(q={},n[y.id]=q);let $=q[P.id];$===void 0&&($={},q[P.id]=$);let X=$[H];return X===void 0&&(X=h(l()),$[H]=X),X}function h(y){const P=[],B=[],H=[];for(let q=0;q<t;q++)P[q]=0,B[q]=0,H[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:B,attributeDivisors:H,object:y,attributes:{},index:null}}function f(y,P,B,H){const q=r.attributes,$=P.attributes;let X=0;const Z=B.getAttributes();for(const G in Z)if(Z[G].location>=0){const fe=q[G];let we=$[G];if(we===void 0&&(G==="instanceMatrix"&&y.instanceMatrix&&(we=y.instanceMatrix),G==="instanceColor"&&y.instanceColor&&(we=y.instanceColor)),fe===void 0||fe.attribute!==we||we&&fe.data!==we.data)return!0;X++}return r.attributesNum!==X||r.index!==H}function g(y,P,B,H){const q={},$=P.attributes;let X=0;const Z=B.getAttributes();for(const G in Z)if(Z[G].location>=0){let fe=$[G];fe===void 0&&(G==="instanceMatrix"&&y.instanceMatrix&&(fe=y.instanceMatrix),G==="instanceColor"&&y.instanceColor&&(fe=y.instanceColor));const we={};we.attribute=fe,fe&&fe.data&&(we.data=fe.data),q[G]=we,X++}r.attributes=q,r.attributesNum=X,r.index=H}function v(){const y=r.newAttributes;for(let P=0,B=y.length;P<B;P++)y[P]=0}function m(y){p(y,0)}function p(y,P){const B=r.newAttributes,H=r.enabledAttributes,q=r.attributeDivisors;B[y]=1,H[y]===0&&(i.enableVertexAttribArray(y),H[y]=1),q[y]!==P&&(i.vertexAttribDivisor(y,P),q[y]=P)}function S(){const y=r.newAttributes,P=r.enabledAttributes;for(let B=0,H=P.length;B<H;B++)P[B]!==y[B]&&(i.disableVertexAttribArray(B),P[B]=0)}function E(y,P,B,H,q,$,X){X===!0?i.vertexAttribIPointer(y,P,B,q,$):i.vertexAttribPointer(y,P,B,H,q,$)}function M(y,P,B,H){v();const q=H.attributes,$=B.getAttributes(),X=P.defaultAttributeValues;for(const Z in $){const G=$[Z];if(G.location>=0){let ce=q[Z];if(ce===void 0&&(Z==="instanceMatrix"&&y.instanceMatrix&&(ce=y.instanceMatrix),Z==="instanceColor"&&y.instanceColor&&(ce=y.instanceColor)),ce!==void 0){const fe=ce.normalized,we=ce.itemSize,Ge=e.get(ce);if(Ge===void 0)continue;const at=Ge.buffer,ct=Ge.type,Ze=Ge.bytesPerElement,Y=ct===i.INT||ct===i.UNSIGNED_INT||ce.gpuType===Xo;if(ce.isInterleavedBufferAttribute){const J=ce.data,ge=J.stride,Ue=ce.offset;if(J.isInstancedInterleavedBuffer){for(let Te=0;Te<G.locationSize;Te++)p(G.location+Te,J.meshPerAttribute);y.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let Te=0;Te<G.locationSize;Te++)m(G.location+Te);i.bindBuffer(i.ARRAY_BUFFER,at);for(let Te=0;Te<G.locationSize;Te++)E(G.location+Te,we/G.locationSize,ct,fe,ge*Ze,(Ue+we/G.locationSize*Te)*Ze,Y)}else{if(ce.isInstancedBufferAttribute){for(let J=0;J<G.locationSize;J++)p(G.location+J,ce.meshPerAttribute);y.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let J=0;J<G.locationSize;J++)m(G.location+J);i.bindBuffer(i.ARRAY_BUFFER,at);for(let J=0;J<G.locationSize;J++)E(G.location+J,we/G.locationSize,ct,fe,we*Ze,we/G.locationSize*J*Ze,Y)}}else if(X!==void 0){const fe=X[Z];if(fe!==void 0)switch(fe.length){case 2:i.vertexAttrib2fv(G.location,fe);break;case 3:i.vertexAttrib3fv(G.location,fe);break;case 4:i.vertexAttrib4fv(G.location,fe);break;default:i.vertexAttrib1fv(G.location,fe)}}}}S()}function w(){L();for(const y in n){const P=n[y];for(const B in P){const H=P[B];for(const q in H)u(H[q].object),delete H[q];delete P[B]}delete n[y]}}function R(y){if(n[y.id]===void 0)return;const P=n[y.id];for(const B in P){const H=P[B];for(const q in H)u(H[q].object),delete H[q];delete P[B]}delete n[y.id]}function A(y){for(const P in n){const B=n[P];if(B[y.id]===void 0)continue;const H=B[y.id];for(const q in H)u(H[q].object),delete H[q];delete B[y.id]}}function L(){b(),a=!0,r!==s&&(r=s,c(r.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:L,resetDefaultState:b,dispose:w,releaseStatesOfGeometry:R,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:m,disableUnusedAttributes:S}}function Nm(i,e,t){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),t.update(u,n,1)}function a(c,u,d){d!==0&&(i.drawArraysInstanced(n,c,u,d),t.update(u,n,d))}function o(c,u,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,d);let f=0;for(let g=0;g<d;g++)f+=u[g];t.update(f,n,1)}function l(c,u,d,h){if(d===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)a(c[g],u[g],h[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,h,0,d);let g=0;for(let v=0;v<d;v++)g+=u[v]*h[v];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Fm(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(A){return!(A!==dn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const L=A===Us&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==Tn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==yn&&!L)}function l(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const d=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=g>0,R=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:S,maxVaryings:E,maxFragmentUniforms:M,vertexTextures:w,maxSamples:R}}function Om(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new ci,o=new Be,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){const f=d.length!==0||h||n!==0||s;return s=h,n=d.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,f){const g=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,p=i.get(d);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{const S=r?0:n,E=S*4;let M=p.clippingState||null;l.value=M,M=u(g,h,E,f);for(let w=0;w!==E;++w)M[w]=t[w];p.clippingState=M,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,h,f,g){const v=d!==null?d.length:0;let m=null;if(v!==0){if(m=l.value,g!==!0||m===null){const p=f+v*4,S=h.matrixWorldInverse;o.getNormalMatrix(S),(m===null||m.length<p)&&(m=new Float32Array(p));for(let E=0,M=f;E!==v;++E,M+=4)a.copy(d[E]).applyMatrix4(S,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}function Bm(i){let e=new WeakMap;function t(a,o){return o===eo?a.mapping=Ji:o===to&&(a.mapping=Qi),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===eo||o===to)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Ih(l.height);return c.fromEquirectangularTexture(i,a),e.set(a,c),a.addEventListener("dispose",s),t(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const Wi=4,ac=[.125,.215,.35,.446,.526,.582],fi=20,Sa=new qh,oc=new Ve;let ya=null,Ea=0,ba=0,Ta=!1;const ui=(1+Math.sqrt(5))/2,zi=1/ui,lc=[new N(-ui,zi,0),new N(ui,zi,0),new N(-zi,0,ui),new N(zi,0,ui),new N(0,ui,-zi),new N(0,ui,zi),new N(-1,1,-1),new N(1,1,-1),new N(-1,1,1),new N(1,1,1)],km=new N;class No{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=km}=r;ya=this._renderer.getRenderTarget(),Ea=this._renderer.getActiveCubeFace(),ba=this._renderer.getActiveMipmapLevel(),Ta=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=dc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=uc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(ya,Ea,ba),this._renderer.xr.enabled=Ta,e.scissorTest=!1,hr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ji||e.mapping===Qi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ya=this._renderer.getRenderTarget(),Ea=this._renderer.getActiveCubeFace(),ba=this._renderer.getActiveMipmapLevel(),Ta=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Sn,minFilter:Sn,generateMipmaps:!1,type:Us,format:dn,colorSpace:es,depthBuffer:!1},s=cc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=cc(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=zm(r)),this._blurMaterial=Hm(r,e,t)}return s}_compileMaterial(e){const t=new $e(this._lodPlanes[0],e);this._renderer.compile(t,Sa)}_sceneToCubeUV(e,t,n,s,r){const l=new Vt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,f=d.toneMapping;d.getClearColor(oc),d.toneMapping=Yn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null));const v=new vn({name:"PMREM.Background",side:kt,depthWrite:!1,depthTest:!1}),m=new $e(new Ft,v);let p=!1;const S=e.background;S?S.isColor&&(v.color.copy(S),e.background=null,p=!0):(v.color.copy(oc),p=!0);for(let E=0;E<6;E++){const M=E%3;M===0?(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[E],r.y,r.z)):M===1?(l.up.set(0,0,c[E]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[E],r.z)):(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[E]));const w=this._cubeSize;hr(s,M*w,E>2?w:0,w,w),d.setRenderTarget(s),p&&d.render(m,l),d.render(e,l)}m.geometry.dispose(),m.material.dispose(),d.toneMapping=f,d.autoClear=h,e.background=S}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===Ji||e.mapping===Qi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=dc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=uc());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new $e(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;hr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Sa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=lc[(s-r-1)%lc.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,d=new $e(this._lodPlanes[s],c),h=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*fi-1),v=r/g,m=isFinite(r)?1+Math.floor(u*v):fi;m>fi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${fi}`);const p=[];let S=0;for(let A=0;A<fi;++A){const L=A/v,b=Math.exp(-L*L/2);p.push(b),A===0?S+=b:A<m&&(S+=2*b)}for(let A=0;A<p.length;A++)p[A]=p[A]/S;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=p,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);const{_lodMax:E}=this;h.dTheta.value=g,h.mipInt.value=E-n;const M=this._sizeLods[s],w=3*M*(s>E-Wi?s-E+Wi:0),R=4*(this._cubeSize-M);hr(t,w,R,3*M,2*M),l.setRenderTarget(t),l.render(d,Sa)}}function zm(i){const e=[],t=[],n=[];let s=i;const r=i-Wi+1+ac.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);t.push(o);let l=1/o;a>i-Wi?l=ac[a-i+Wi-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),u=-c,d=1+c,h=[u,u,d,u,d,d,u,u,d,d,u,d],f=6,g=6,v=3,m=2,p=1,S=new Float32Array(v*g*f),E=new Float32Array(m*g*f),M=new Float32Array(p*g*f);for(let R=0;R<f;R++){const A=R%3*2/3-1,L=R>2?0:-1,b=[A,L,0,A+2/3,L,0,A+2/3,L+1,0,A,L,0,A+2/3,L+1,0,A,L+1,0];S.set(b,v*g*R),E.set(h,m*g*R);const y=[R,R,R,R,R,R];M.set(y,p*g*R)}const w=new mn;w.setAttribute("position",new rn(S,v)),w.setAttribute("uv",new rn(E,m)),w.setAttribute("faceIndex",new rn(M,p)),e.push(w),s>Wi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function cc(i,e,t){const n=new Si(i,e,t);return n.texture.mapping=Nr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function hr(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Hm(i,e,t){const n=new Float32Array(fi),s=new N(0,1,0);return new jn({name:"SphericalGaussianBlur",defines:{n:fi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ll(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:qn,depthTest:!1,depthWrite:!1})}function uc(){return new jn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ll(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:qn,depthTest:!1,depthWrite:!1})}function dc(){return new jn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ll(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:qn,depthTest:!1,depthWrite:!1})}function ll(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Gm(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===eo||l===to,u=l===Ji||l===Qi;if(c||u){let d=e.get(o);const h=d!==void 0?d.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==h)return t===null&&(t=new No(i)),d=c?t.fromEquirectangular(o,d):t.fromCubemap(o,d),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),d.texture;if(d!==void 0)return d.texture;{const f=o.image;return c&&f&&f.height>0||u&&f&&s(f)?(t===null&&(t=new No(i)),d=c?t.fromEquirectangular(o):t.fromCubemap(o),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),o.addEventListener("dispose",r),d.texture):null}}}return o}function s(o){let l=0;const c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function Vm(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Ls("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Wm(i,e,t,n){const s={},r=new WeakMap;function a(d){const h=d.target;h.index!==null&&e.remove(h.index);for(const g in h.attributes)e.remove(h.attributes[g]);h.removeEventListener("dispose",a),delete s[h.id];const f=r.get(h);f&&(e.remove(f),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(d,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,t.memory.geometries++),h}function l(d){const h=d.attributes;for(const f in h)e.update(h[f],i.ARRAY_BUFFER)}function c(d){const h=[],f=d.index,g=d.attributes.position;let v=0;if(f!==null){const S=f.array;v=f.version;for(let E=0,M=S.length;E<M;E+=3){const w=S[E+0],R=S[E+1],A=S[E+2];h.push(w,R,R,A,A,w)}}else if(g!==void 0){const S=g.array;v=g.version;for(let E=0,M=S.length/3-1;E<M;E+=3){const w=E+0,R=E+1,A=E+2;h.push(w,R,R,A,A,w)}}else return;const m=new(du(h)?mu:pu)(h,1);m.version=v;const p=r.get(d);p&&e.remove(p),r.set(d,m)}function u(d){const h=r.get(d);if(h){const f=d.index;f!==null&&h.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:u}}function $m(i,e,t){let n;function s(h){n=h}let r,a;function o(h){r=h.type,a=h.bytesPerElement}function l(h,f){i.drawElements(n,f,r,h*a),t.update(f,n,1)}function c(h,f,g){g!==0&&(i.drawElementsInstanced(n,f,r,h*a,g),t.update(f,n,g))}function u(h,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,h,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function d(h,f,g,v){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<h.length;p++)c(h[p]/a,f[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,h,0,v,0,g);let p=0;for(let S=0;S<g;S++)p+=f[S]*v[S];t.update(p,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function Xm(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function qm(i,e,t){const n=new WeakMap,s=new tt;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u!==void 0?u.length:0;let h=n.get(o);if(h===void 0||h.count!==d){let y=function(){L.dispose(),n.delete(o),o.removeEventListener("dispose",y)};var f=y;h!==void 0&&h.texture.dispose();const g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],S=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let M=0;g===!0&&(M=1),v===!0&&(M=2),m===!0&&(M=3);let w=o.attributes.position.count*M,R=1;w>e.maxTextureSize&&(R=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const A=new Float32Array(w*R*4*d),L=new hu(A,w,R,d);L.type=yn,L.needsUpdate=!0;const b=M*4;for(let P=0;P<d;P++){const B=p[P],H=S[P],q=E[P],$=w*R*4*P;for(let X=0;X<B.count;X++){const Z=X*b;g===!0&&(s.fromBufferAttribute(B,X),A[$+Z+0]=s.x,A[$+Z+1]=s.y,A[$+Z+2]=s.z,A[$+Z+3]=0),v===!0&&(s.fromBufferAttribute(H,X),A[$+Z+4]=s.x,A[$+Z+5]=s.y,A[$+Z+6]=s.z,A[$+Z+7]=0),m===!0&&(s.fromBufferAttribute(q,X),A[$+Z+8]=s.x,A[$+Z+9]=s.y,A[$+Z+10]=s.z,A[$+Z+11]=q.itemSize===4?s.w:1)}}h={count:d,texture:L,size:new qe(w,R)},n.set(o,h),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const v=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function Ym(i,e,t,n){let s=new WeakMap;function r(l){const c=n.render.frame,u=l.geometry,d=e.get(l,u);if(s.get(d)!==c&&(e.update(d),s.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;s.get(h)!==c&&(h.update(),s.set(h,c))}return d}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}const Au=new Rt,hc=new Su(1,1),Ru=new hu,Cu=new gh,Pu=new _u,fc=[],pc=[],mc=new Float32Array(16),gc=new Float32Array(9),vc=new Float32Array(4);function as(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=fc[s];if(r===void 0&&(r=new Float32Array(s),fc[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Et(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function bt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Or(i,e){let t=pc[e];t===void 0&&(t=new Int32Array(e),pc[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Km(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function jm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2fv(this.addr,e),bt(t,e)}}function Zm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;i.uniform3fv(this.addr,e),bt(t,e)}}function Jm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4fv(this.addr,e),bt(t,e)}}function Qm(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),bt(t,e)}else{if(Et(t,n))return;vc.set(n),i.uniformMatrix2fv(this.addr,!1,vc),bt(t,n)}}function e0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),bt(t,e)}else{if(Et(t,n))return;gc.set(n),i.uniformMatrix3fv(this.addr,!1,gc),bt(t,n)}}function t0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Et(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),bt(t,e)}else{if(Et(t,n))return;mc.set(n),i.uniformMatrix4fv(this.addr,!1,mc),bt(t,n)}}function n0(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function i0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2iv(this.addr,e),bt(t,e)}}function s0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;i.uniform3iv(this.addr,e),bt(t,e)}}function r0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4iv(this.addr,e),bt(t,e)}}function a0(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function o0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;i.uniform2uiv(this.addr,e),bt(t,e)}}function l0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;i.uniform3uiv(this.addr,e),bt(t,e)}}function c0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;i.uniform4uiv(this.addr,e),bt(t,e)}}function u0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(hc.compareFunction=uu,r=hc):r=Au,t.setTexture2D(e||r,s)}function d0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Cu,s)}function h0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Pu,s)}function f0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Ru,s)}function p0(i){switch(i){case 5126:return Km;case 35664:return jm;case 35665:return Zm;case 35666:return Jm;case 35674:return Qm;case 35675:return e0;case 35676:return t0;case 5124:case 35670:return n0;case 35667:case 35671:return i0;case 35668:case 35672:return s0;case 35669:case 35673:return r0;case 5125:return a0;case 36294:return o0;case 36295:return l0;case 36296:return c0;case 35678:case 36198:case 36298:case 36306:case 35682:return u0;case 35679:case 36299:case 36307:return d0;case 35680:case 36300:case 36308:case 36293:return h0;case 36289:case 36303:case 36311:case 36292:return f0}}function m0(i,e){i.uniform1fv(this.addr,e)}function g0(i,e){const t=as(e,this.size,2);i.uniform2fv(this.addr,t)}function v0(i,e){const t=as(e,this.size,3);i.uniform3fv(this.addr,t)}function _0(i,e){const t=as(e,this.size,4);i.uniform4fv(this.addr,t)}function x0(i,e){const t=as(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function M0(i,e){const t=as(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function S0(i,e){const t=as(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function y0(i,e){i.uniform1iv(this.addr,e)}function E0(i,e){i.uniform2iv(this.addr,e)}function b0(i,e){i.uniform3iv(this.addr,e)}function T0(i,e){i.uniform4iv(this.addr,e)}function w0(i,e){i.uniform1uiv(this.addr,e)}function A0(i,e){i.uniform2uiv(this.addr,e)}function R0(i,e){i.uniform3uiv(this.addr,e)}function C0(i,e){i.uniform4uiv(this.addr,e)}function P0(i,e,t){const n=this.cache,s=e.length,r=Or(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||Au,r[a])}function D0(i,e,t){const n=this.cache,s=e.length,r=Or(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Cu,r[a])}function L0(i,e,t){const n=this.cache,s=e.length,r=Or(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Pu,r[a])}function I0(i,e,t){const n=this.cache,s=e.length,r=Or(t,s);Et(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Ru,r[a])}function U0(i){switch(i){case 5126:return m0;case 35664:return g0;case 35665:return v0;case 35666:return _0;case 35674:return x0;case 35675:return M0;case 35676:return S0;case 5124:case 35670:return y0;case 35667:case 35671:return E0;case 35668:case 35672:return b0;case 35669:case 35673:return T0;case 5125:return w0;case 36294:return A0;case 36295:return R0;case 36296:return C0;case 35678:case 36198:case 36298:case 36306:case 35682:return P0;case 35679:case 36299:case 36307:return D0;case 35680:case 36300:case 36308:case 36293:return L0;case 36289:case 36303:case 36311:case 36292:return I0}}class N0{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=p0(t.type)}}class F0{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=U0(t.type)}}class O0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const wa=/(\w+)(\])?(\[|\.)?/g;function _c(i,e){i.seq.push(e),i.map[e.id]=e}function B0(i,e,t){const n=i.name,s=n.length;for(wa.lastIndex=0;;){const r=wa.exec(n),a=wa.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){_c(t,c===void 0?new N0(o,i,e):new F0(o,i,e));break}else{let d=t.map[o];d===void 0&&(d=new O0(o),_c(t,d)),t=d}}}class wr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);B0(r,a,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function xc(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const k0=37297;let z0=0;function H0(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Mc=new Be;function G0(i){je._getMatrix(Mc,je.workingColorSpace,i);const e=`mat3( ${Mc.elements.map(t=>t.toFixed(4))} )`;switch(je.getTransfer(i)){case Cr:return[e,"LinearTransferOETF"];case et:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Sc(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+H0(i.getShaderSource(e),o)}else return r}function V0(i,e){const t=G0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function W0(i,e){let t;switch(e){case $d:t="Linear";break;case Xd:t="Reinhard";break;case qd:t="Cineon";break;case tu:t="ACESFilmic";break;case Kd:t="AgX";break;case jd:t="Neutral";break;case Yd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const fr=new N;function $0(){je.getLuminanceCoefficients(fr);const i=fr.x.toFixed(4),e=fr.y.toFixed(4),t=fr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function X0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ts).join(`
`)}function q0(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Y0(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Ts(i){return i!==""}function yc(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ec(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const K0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Fo(i){return i.replace(K0,Z0)}const j0=new Map;function Z0(i,e){let t=He[e];if(t===void 0){const n=j0.get(e);if(n!==void 0)t=He[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Fo(t)}const J0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function bc(i){return i.replace(J0,Q0)}function Q0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Tc(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function e1(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===eu?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===bd?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===In&&(e="SHADOWMAP_TYPE_VSM"),e}function t1(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ji:case Qi:e="ENVMAP_TYPE_CUBE";break;case Nr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function n1(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===Qi&&(e="ENVMAP_MODE_REFRACTION"),e}function i1(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case $o:e="ENVMAP_BLENDING_MULTIPLY";break;case Vd:e="ENVMAP_BLENDING_MIX";break;case Wd:e="ENVMAP_BLENDING_ADD";break}return e}function s1(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function r1(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=e1(t),c=t1(t),u=n1(t),d=i1(t),h=s1(t),f=X0(t),g=q0(r),v=s.createProgram();let m,p,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ts).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ts).join(`
`),p.length>0&&(p+=`
`)):(m=[Tc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ts).join(`
`),p=[Tc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Yn?"#define TONE_MAPPING":"",t.toneMapping!==Yn?He.tonemapping_pars_fragment:"",t.toneMapping!==Yn?W0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,V0("linearToOutputTexel",t.outputColorSpace),$0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ts).join(`
`)),a=Fo(a),a=yc(a,t),a=Ec(a,t),o=Fo(o),o=yc(o,t),o=Ec(o,t),a=bc(a),o=bc(o),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Dl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Dl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const E=S+m+a,M=S+p+o,w=xc(s,s.VERTEX_SHADER,E),R=xc(s,s.FRAGMENT_SHADER,M);s.attachShader(v,w),s.attachShader(v,R),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function A(P){if(i.debug.checkShaderErrors){const B=s.getProgramInfoLog(v)||"",H=s.getShaderInfoLog(w)||"",q=s.getShaderInfoLog(R)||"",$=B.trim(),X=H.trim(),Z=q.trim();let G=!0,ce=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,w,R);else{const fe=Sc(s,w,"vertex"),we=Sc(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+$+`
`+fe+`
`+we)}else $!==""?console.warn("THREE.WebGLProgram: Program Info Log:",$):(X===""||Z==="")&&(ce=!1);ce&&(P.diagnostics={runnable:G,programLog:$,vertexShader:{log:X,prefix:m},fragmentShader:{log:Z,prefix:p}})}s.deleteShader(w),s.deleteShader(R),L=new wr(s,v),b=Y0(s,v)}let L;this.getUniforms=function(){return L===void 0&&A(this),L};let b;this.getAttributes=function(){return b===void 0&&A(this),b};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(v,k0)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=z0++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=w,this.fragmentShader=R,this}let a1=0;class o1{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new l1(e),t.set(e,n)),n}}class l1{constructor(e){this.id=a1++,this.code=e,this.usedTimes=0}}function c1(i,e,t,n,s,r,a){const o=new nl,l=new o1,c=new Set,u=[],d=s.logarithmicDepthBuffer,h=s.vertexTextures;let f=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(b){return c.add(b),b===0?"uv":`uv${b}`}function m(b,y,P,B,H){const q=B.fog,$=H.geometry,X=b.isMeshStandardMaterial?B.environment:null,Z=(b.isMeshStandardMaterial?t:e).get(b.envMap||X),G=Z&&Z.mapping===Nr?Z.image.height:null,ce=g[b.type];b.precision!==null&&(f=s.getMaxPrecision(b.precision),f!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",f,"instead."));const fe=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,we=fe!==void 0?fe.length:0;let Ge=0;$.morphAttributes.position!==void 0&&(Ge=1),$.morphAttributes.normal!==void 0&&(Ge=2),$.morphAttributes.color!==void 0&&(Ge=3);let at,ct,Ze,Y;if(ce){const Je=_n[ce];at=Je.vertexShader,ct=Je.fragmentShader}else at=b.vertexShader,ct=b.fragmentShader,l.update(b),Ze=l.getVertexShaderID(b),Y=l.getFragmentShaderID(b);const J=i.getRenderTarget(),ge=i.state.buffers.depth.getReversed(),Ue=H.isInstancedMesh===!0,Te=H.isBatchedMesh===!0,Ye=!!b.map,Ct=!!b.matcap,C=!!Z,ut=!!b.aoMap,Fe=!!b.lightMap,Le=!!b.bumpMap,xe=!!b.normalMap,dt=!!b.displacementMap,Me=!!b.emissiveMap,ze=!!b.metalnessMap,Tt=!!b.roughnessMap,xt=b.anisotropy>0,T=b.clearcoat>0,_=b.dispersion>0,O=b.iridescence>0,W=b.sheen>0,j=b.transmission>0,V=xt&&!!b.anisotropyMap,be=T&&!!b.clearcoatMap,ae=T&&!!b.clearcoatNormalMap,Se=T&&!!b.clearcoatRoughnessMap,ye=O&&!!b.iridescenceMap,ie=O&&!!b.iridescenceThicknessMap,he=W&&!!b.sheenColorMap,De=W&&!!b.sheenRoughnessMap,Ee=!!b.specularMap,ue=!!b.specularColorMap,Oe=!!b.specularIntensityMap,D=j&&!!b.transmissionMap,se=j&&!!b.thicknessMap,oe=!!b.gradientMap,me=!!b.alphaMap,te=b.alphaTest>0,K=!!b.alphaHash,_e=!!b.extensions;let Ne=Yn;b.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(Ne=i.toneMapping);const ot={shaderID:ce,shaderType:b.type,shaderName:b.name,vertexShader:at,fragmentShader:ct,defines:b.defines,customVertexShaderID:Ze,customFragmentShaderID:Y,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:f,batching:Te,batchingColor:Te&&H._colorsTexture!==null,instancing:Ue,instancingColor:Ue&&H.instanceColor!==null,instancingMorph:Ue&&H.morphTexture!==null,supportsVertexTextures:h,outputColorSpace:J===null?i.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:es,alphaToCoverage:!!b.alphaToCoverage,map:Ye,matcap:Ct,envMap:C,envMapMode:C&&Z.mapping,envMapCubeUVHeight:G,aoMap:ut,lightMap:Fe,bumpMap:Le,normalMap:xe,displacementMap:h&&dt,emissiveMap:Me,normalMapObjectSpace:xe&&b.normalMapType===eh,normalMapTangentSpace:xe&&b.normalMapType===Qo,metalnessMap:ze,roughnessMap:Tt,anisotropy:xt,anisotropyMap:V,clearcoat:T,clearcoatMap:be,clearcoatNormalMap:ae,clearcoatRoughnessMap:Se,dispersion:_,iridescence:O,iridescenceMap:ye,iridescenceThicknessMap:ie,sheen:W,sheenColorMap:he,sheenRoughnessMap:De,specularMap:Ee,specularColorMap:ue,specularIntensityMap:Oe,transmission:j,transmissionMap:D,thicknessMap:se,gradientMap:oe,opaque:b.transparent===!1&&b.blending===qi&&b.alphaToCoverage===!1,alphaMap:me,alphaTest:te,alphaHash:K,combine:b.combine,mapUv:Ye&&v(b.map.channel),aoMapUv:ut&&v(b.aoMap.channel),lightMapUv:Fe&&v(b.lightMap.channel),bumpMapUv:Le&&v(b.bumpMap.channel),normalMapUv:xe&&v(b.normalMap.channel),displacementMapUv:dt&&v(b.displacementMap.channel),emissiveMapUv:Me&&v(b.emissiveMap.channel),metalnessMapUv:ze&&v(b.metalnessMap.channel),roughnessMapUv:Tt&&v(b.roughnessMap.channel),anisotropyMapUv:V&&v(b.anisotropyMap.channel),clearcoatMapUv:be&&v(b.clearcoatMap.channel),clearcoatNormalMapUv:ae&&v(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&v(b.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&v(b.iridescenceMap.channel),iridescenceThicknessMapUv:ie&&v(b.iridescenceThicknessMap.channel),sheenColorMapUv:he&&v(b.sheenColorMap.channel),sheenRoughnessMapUv:De&&v(b.sheenRoughnessMap.channel),specularMapUv:Ee&&v(b.specularMap.channel),specularColorMapUv:ue&&v(b.specularColorMap.channel),specularIntensityMapUv:Oe&&v(b.specularIntensityMap.channel),transmissionMapUv:D&&v(b.transmissionMap.channel),thicknessMapUv:se&&v(b.thicknessMap.channel),alphaMapUv:me&&v(b.alphaMap.channel),vertexTangents:!!$.attributes.tangent&&(xe||xt),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!$.attributes.uv&&(Ye||me),fog:!!q,useFog:b.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:b.flatShading===!0&&b.wireframe===!1,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ge,skinning:H.isSkinnedMesh===!0,morphTargets:$.morphAttributes.position!==void 0,morphNormals:$.morphAttributes.normal!==void 0,morphColors:$.morphAttributes.color!==void 0,morphTargetsCount:we,morphTextureStride:Ge,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ne,decodeVideoTexture:Ye&&b.map.isVideoTexture===!0&&je.getTransfer(b.map.colorSpace)===et,decodeVideoTextureEmissive:Me&&b.emissiveMap.isVideoTexture===!0&&je.getTransfer(b.emissiveMap.colorSpace)===et,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Un,flipSided:b.side===kt,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:_e&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(_e&&b.extensions.multiDraw===!0||Te)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return ot.vertexUv1s=c.has(1),ot.vertexUv2s=c.has(2),ot.vertexUv3s=c.has(3),c.clear(),ot}function p(b){const y=[];if(b.shaderID?y.push(b.shaderID):(y.push(b.customVertexShaderID),y.push(b.customFragmentShaderID)),b.defines!==void 0)for(const P in b.defines)y.push(P),y.push(b.defines[P]);return b.isRawShaderMaterial===!1&&(S(y,b),E(y,b),y.push(i.outputColorSpace)),y.push(b.customProgramCacheKey),y.join()}function S(b,y){b.push(y.precision),b.push(y.outputColorSpace),b.push(y.envMapMode),b.push(y.envMapCubeUVHeight),b.push(y.mapUv),b.push(y.alphaMapUv),b.push(y.lightMapUv),b.push(y.aoMapUv),b.push(y.bumpMapUv),b.push(y.normalMapUv),b.push(y.displacementMapUv),b.push(y.emissiveMapUv),b.push(y.metalnessMapUv),b.push(y.roughnessMapUv),b.push(y.anisotropyMapUv),b.push(y.clearcoatMapUv),b.push(y.clearcoatNormalMapUv),b.push(y.clearcoatRoughnessMapUv),b.push(y.iridescenceMapUv),b.push(y.iridescenceThicknessMapUv),b.push(y.sheenColorMapUv),b.push(y.sheenRoughnessMapUv),b.push(y.specularMapUv),b.push(y.specularColorMapUv),b.push(y.specularIntensityMapUv),b.push(y.transmissionMapUv),b.push(y.thicknessMapUv),b.push(y.combine),b.push(y.fogExp2),b.push(y.sizeAttenuation),b.push(y.morphTargetsCount),b.push(y.morphAttributeCount),b.push(y.numDirLights),b.push(y.numPointLights),b.push(y.numSpotLights),b.push(y.numSpotLightMaps),b.push(y.numHemiLights),b.push(y.numRectAreaLights),b.push(y.numDirLightShadows),b.push(y.numPointLightShadows),b.push(y.numSpotLightShadows),b.push(y.numSpotLightShadowsWithMaps),b.push(y.numLightProbes),b.push(y.shadowMapType),b.push(y.toneMapping),b.push(y.numClippingPlanes),b.push(y.numClipIntersection),b.push(y.depthPacking)}function E(b,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),y.gradientMap&&o.enable(22),b.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reversedDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),b.push(o.mask)}function M(b){const y=g[b.type];let P;if(y){const B=_n[y];P=Ch.clone(B.uniforms)}else P=b.uniforms;return P}function w(b,y){let P;for(let B=0,H=u.length;B<H;B++){const q=u[B];if(q.cacheKey===y){P=q,++P.usedTimes;break}}return P===void 0&&(P=new r1(i,y,b,r),u.push(P)),P}function R(b){if(--b.usedTimes===0){const y=u.indexOf(b);u[y]=u[u.length-1],u.pop(),b.destroy()}}function A(b){l.remove(b)}function L(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:M,acquireProgram:w,releaseProgram:R,releaseShaderCache:A,programs:u,dispose:L}}function u1(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function d1(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function wc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Ac(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d,h,f,g,v,m){let p=i[e];return p===void 0?(p={id:d.id,object:d,geometry:h,material:f,groupOrder:g,renderOrder:d.renderOrder,z:v,group:m},i[e]=p):(p.id=d.id,p.object=d,p.geometry=h,p.material=f,p.groupOrder=g,p.renderOrder=d.renderOrder,p.z=v,p.group=m),e++,p}function o(d,h,f,g,v,m){const p=a(d,h,f,g,v,m);f.transmission>0?n.push(p):f.transparent===!0?s.push(p):t.push(p)}function l(d,h,f,g,v,m){const p=a(d,h,f,g,v,m);f.transmission>0?n.unshift(p):f.transparent===!0?s.unshift(p):t.unshift(p)}function c(d,h){t.length>1&&t.sort(d||d1),n.length>1&&n.sort(h||wc),s.length>1&&s.sort(h||wc)}function u(){for(let d=e,h=i.length;d<h;d++){const f=i[d];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:u,sort:c}}function h1(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new Ac,i.set(n,[a])):s>=r.length?(a=new Ac,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function f1(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new N,color:new Ve};break;case"SpotLight":t={position:new N,direction:new N,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new N,halfWidth:new N,halfHeight:new N};break}return i[e.id]=t,t}}}function p1(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let m1=0;function g1(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function v1(i){const e=new f1,t=p1(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);const s=new N,r=new rt,a=new rt;function o(c){let u=0,d=0,h=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,S=0,E=0,M=0,w=0,R=0,A=0;c.sort(g1);for(let b=0,y=c.length;b<y;b++){const P=c[b],B=P.color,H=P.intensity,q=P.distance,$=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=B.r*H,d+=B.g*H,h+=B.b*H;else if(P.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(P.sh.coefficients[X],H);A++}else if(P.isDirectionalLight){const X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const Z=P.shadow,G=t.get(P);G.shadowIntensity=Z.intensity,G.shadowBias=Z.bias,G.shadowNormalBias=Z.normalBias,G.shadowRadius=Z.radius,G.shadowMapSize=Z.mapSize,n.directionalShadow[f]=G,n.directionalShadowMap[f]=$,n.directionalShadowMatrix[f]=P.shadow.matrix,S++}n.directional[f]=X,f++}else if(P.isSpotLight){const X=e.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(B).multiplyScalar(H),X.distance=q,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,n.spot[v]=X;const Z=P.shadow;if(P.map&&(n.spotLightMap[w]=P.map,w++,Z.updateMatrices(P),P.castShadow&&R++),n.spotLightMatrix[v]=Z.matrix,P.castShadow){const G=t.get(P);G.shadowIntensity=Z.intensity,G.shadowBias=Z.bias,G.shadowNormalBias=Z.normalBias,G.shadowRadius=Z.radius,G.shadowMapSize=Z.mapSize,n.spotShadow[v]=G,n.spotShadowMap[v]=$,M++}v++}else if(P.isRectAreaLight){const X=e.get(P);X.color.copy(B).multiplyScalar(H),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=X,m++}else if(P.isPointLight){const X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),X.distance=P.distance,X.decay=P.decay,P.castShadow){const Z=P.shadow,G=t.get(P);G.shadowIntensity=Z.intensity,G.shadowBias=Z.bias,G.shadowNormalBias=Z.normalBias,G.shadowRadius=Z.radius,G.shadowMapSize=Z.mapSize,G.shadowCameraNear=Z.camera.near,G.shadowCameraFar=Z.camera.far,n.pointShadow[g]=G,n.pointShadowMap[g]=$,n.pointShadowMatrix[g]=P.shadow.matrix,E++}n.point[g]=X,g++}else if(P.isHemisphereLight){const X=e.get(P);X.skyColor.copy(P.color).multiplyScalar(H),X.groundColor.copy(P.groundColor).multiplyScalar(H),n.hemi[p]=X,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=le.LTC_FLOAT_1,n.rectAreaLTC2=le.LTC_FLOAT_2):(n.rectAreaLTC1=le.LTC_HALF_1,n.rectAreaLTC2=le.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;const L=n.hash;(L.directionalLength!==f||L.pointLength!==g||L.spotLength!==v||L.rectAreaLength!==m||L.hemiLength!==p||L.numDirectionalShadows!==S||L.numPointShadows!==E||L.numSpotShadows!==M||L.numSpotMaps!==w||L.numLightProbes!==A)&&(n.directional.length=f,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=S,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=M+w-R,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=A,L.directionalLength=f,L.pointLength=g,L.spotLength=v,L.rectAreaLength=m,L.hemiLength=p,L.numDirectionalShadows=S,L.numPointShadows=E,L.numSpotShadows=M,L.numSpotMaps=w,L.numLightProbes=A,n.version=m1++)}function l(c,u){let d=0,h=0,f=0,g=0,v=0;const m=u.matrixWorldInverse;for(let p=0,S=c.length;p<S;p++){const E=c[p];if(E.isDirectionalLight){const M=n.directional[d];M.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),d++}else if(E.isSpotLight){const M=n.spot[f];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),f++}else if(E.isRectAreaLight){const M=n.rectArea[g];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(m),a.identity(),r.copy(E.matrixWorld),r.premultiply(m),a.extractRotation(r),M.halfWidth.set(E.width*.5,0,0),M.halfHeight.set(0,E.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),g++}else if(E.isPointLight){const M=n.point[h];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(m),h++}else if(E.isHemisphereLight){const M=n.hemi[v];M.direction.setFromMatrixPosition(E.matrixWorld),M.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:n}}function Rc(i){const e=new v1(i),t=[],n=[];function s(u){c.camera=u,t.length=0,n.length=0}function r(u){t.push(u)}function a(u){n.push(u)}function o(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function _1(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new Rc(i),e.set(s,[o])):r>=a.length?(o=new Rc(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const x1=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,M1=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function S1(i,e,t){let n=new sl;const s=new qe,r=new qe,a=new tt,o=new Vh({depthPacking:Qd}),l=new Wh,c={},u=t.maxTextureSize,d={[Kn]:kt,[kt]:Kn,[Un]:Un},h=new jn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new qe},radius:{value:4}},vertexShader:x1,fragmentShader:M1}),f=h.clone();f.defines.HORIZONTAL_PASS=1;const g=new mn;g.setAttribute("position",new rn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new $e(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=eu;let p=this.type;this.render=function(R,A,L){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;const b=i.getRenderTarget(),y=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),B=i.state;B.setBlending(qn),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const H=p!==In&&this.type===In,q=p===In&&this.type!==In;for(let $=0,X=R.length;$<X;$++){const Z=R[$],G=Z.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);const ce=G.getFrameExtents();if(s.multiply(ce),r.copy(G.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ce.x),s.x=r.x*ce.x,G.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ce.y),s.y=r.y*ce.y,G.mapSize.y=r.y)),G.map===null||H===!0||q===!0){const we=this.type!==In?{minFilter:Jt,magFilter:Jt}:{};G.map!==null&&G.map.dispose(),G.map=new Si(s.x,s.y,we),G.map.texture.name=Z.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();const fe=G.getViewportCount();for(let we=0;we<fe;we++){const Ge=G.getViewport(we);a.set(r.x*Ge.x,r.y*Ge.y,r.x*Ge.z,r.y*Ge.w),B.viewport(a),G.updateMatrices(Z,we),n=G.getFrustum(),M(A,L,G.camera,Z,this.type)}G.isPointLightShadow!==!0&&this.type===In&&S(G,L),G.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(b,y,P)};function S(R,A){const L=e.update(v);h.defines.VSM_SAMPLES!==R.blurSamples&&(h.defines.VSM_SAMPLES=R.blurSamples,f.defines.VSM_SAMPLES=R.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Si(s.x,s.y)),h.uniforms.shadow_pass.value=R.map.texture,h.uniforms.resolution.value=R.mapSize,h.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(A,null,L,h,v,null),f.uniforms.shadow_pass.value=R.mapPass.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(A,null,L,f,v,null)}function E(R,A,L,b){let y=null;const P=L.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(P!==void 0)y=P;else if(y=L.isPointLight===!0?l:o,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const B=y.uuid,H=A.uuid;let q=c[B];q===void 0&&(q={},c[B]=q);let $=q[H];$===void 0&&($=y.clone(),q[H]=$,A.addEventListener("dispose",w)),y=$}if(y.visible=A.visible,y.wireframe=A.wireframe,b===In?y.side=A.shadowSide!==null?A.shadowSide:A.side:y.side=A.shadowSide!==null?A.shadowSide:d[A.side],y.alphaMap=A.alphaMap,y.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,y.map=A.map,y.clipShadows=A.clipShadows,y.clippingPlanes=A.clippingPlanes,y.clipIntersection=A.clipIntersection,y.displacementMap=A.displacementMap,y.displacementScale=A.displacementScale,y.displacementBias=A.displacementBias,y.wireframeLinewidth=A.wireframeLinewidth,y.linewidth=A.linewidth,L.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const B=i.properties.get(y);B.light=L}return y}function M(R,A,L,b,y){if(R.visible===!1)return;if(R.layers.test(A.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&y===In)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,R.matrixWorld);const H=e.update(R),q=R.material;if(Array.isArray(q)){const $=H.groups;for(let X=0,Z=$.length;X<Z;X++){const G=$[X],ce=q[G.materialIndex];if(ce&&ce.visible){const fe=E(R,ce,b,y);R.onBeforeShadow(i,R,A,L,H,fe,G),i.renderBufferDirect(L,null,H,fe,R,G),R.onAfterShadow(i,R,A,L,H,fe,G)}}}else if(q.visible){const $=E(R,q,b,y);R.onBeforeShadow(i,R,A,L,H,$,null),i.renderBufferDirect(L,null,H,$,R,null),R.onAfterShadow(i,R,A,L,H,$,null)}}const B=R.children;for(let H=0,q=B.length;H<q;H++)M(B[H],A,L,b,y)}function w(R){R.target.removeEventListener("dispose",w);for(const L in c){const b=c[L],y=R.target.uuid;y in b&&(b[y].dispose(),delete b[y])}}}const y1={[qa]:Ya,[Ka]:Ja,[ja]:Qa,[Zi]:Za,[Ya]:qa,[Ja]:Ka,[Qa]:ja,[Za]:Zi};function E1(i,e){function t(){let D=!1;const se=new tt;let oe=null;const me=new tt(0,0,0,0);return{setMask:function(te){oe!==te&&!D&&(i.colorMask(te,te,te,te),oe=te)},setLocked:function(te){D=te},setClear:function(te,K,_e,Ne,ot){ot===!0&&(te*=Ne,K*=Ne,_e*=Ne),se.set(te,K,_e,Ne),me.equals(se)===!1&&(i.clearColor(te,K,_e,Ne),me.copy(se))},reset:function(){D=!1,oe=null,me.set(-1,0,0,0)}}}function n(){let D=!1,se=!1,oe=null,me=null,te=null;return{setReversed:function(K){if(se!==K){const _e=e.get("EXT_clip_control");K?_e.clipControlEXT(_e.LOWER_LEFT_EXT,_e.ZERO_TO_ONE_EXT):_e.clipControlEXT(_e.LOWER_LEFT_EXT,_e.NEGATIVE_ONE_TO_ONE_EXT),se=K;const Ne=te;te=null,this.setClear(Ne)}},getReversed:function(){return se},setTest:function(K){K?J(i.DEPTH_TEST):ge(i.DEPTH_TEST)},setMask:function(K){oe!==K&&!D&&(i.depthMask(K),oe=K)},setFunc:function(K){if(se&&(K=y1[K]),me!==K){switch(K){case qa:i.depthFunc(i.NEVER);break;case Ya:i.depthFunc(i.ALWAYS);break;case Ka:i.depthFunc(i.LESS);break;case Zi:i.depthFunc(i.LEQUAL);break;case ja:i.depthFunc(i.EQUAL);break;case Za:i.depthFunc(i.GEQUAL);break;case Ja:i.depthFunc(i.GREATER);break;case Qa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}me=K}},setLocked:function(K){D=K},setClear:function(K){te!==K&&(se&&(K=1-K),i.clearDepth(K),te=K)},reset:function(){D=!1,oe=null,me=null,te=null,se=!1}}}function s(){let D=!1,se=null,oe=null,me=null,te=null,K=null,_e=null,Ne=null,ot=null;return{setTest:function(Je){D||(Je?J(i.STENCIL_TEST):ge(i.STENCIL_TEST))},setMask:function(Je){se!==Je&&!D&&(i.stencilMask(Je),se=Je)},setFunc:function(Je,An,gn){(oe!==Je||me!==An||te!==gn)&&(i.stencilFunc(Je,An,gn),oe=Je,me=An,te=gn)},setOp:function(Je,An,gn){(K!==Je||_e!==An||Ne!==gn)&&(i.stencilOp(Je,An,gn),K=Je,_e=An,Ne=gn)},setLocked:function(Je){D=Je},setClear:function(Je){ot!==Je&&(i.clearStencil(Je),ot=Je)},reset:function(){D=!1,se=null,oe=null,me=null,te=null,K=null,_e=null,Ne=null,ot=null}}}const r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let u={},d={},h=new WeakMap,f=[],g=null,v=!1,m=null,p=null,S=null,E=null,M=null,w=null,R=null,A=new Ve(0,0,0),L=0,b=!1,y=null,P=null,B=null,H=null,q=null;const $=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,Z=0;const G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec(G)[1]),X=Z>=1):G.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),X=Z>=2);let ce=null,fe={};const we=i.getParameter(i.SCISSOR_BOX),Ge=i.getParameter(i.VIEWPORT),at=new tt().fromArray(we),ct=new tt().fromArray(Ge);function Ze(D,se,oe,me){const te=new Uint8Array(4),K=i.createTexture();i.bindTexture(D,K),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let _e=0;_e<oe;_e++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(se,0,i.RGBA,1,1,me,0,i.RGBA,i.UNSIGNED_BYTE,te):i.texImage2D(se+_e,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,te);return K}const Y={};Y[i.TEXTURE_2D]=Ze(i.TEXTURE_2D,i.TEXTURE_2D,1),Y[i.TEXTURE_CUBE_MAP]=Ze(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[i.TEXTURE_2D_ARRAY]=Ze(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Y[i.TEXTURE_3D]=Ze(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),J(i.DEPTH_TEST),a.setFunc(Zi),Le(!1),xe(Tl),J(i.CULL_FACE),ut(qn);function J(D){u[D]!==!0&&(i.enable(D),u[D]=!0)}function ge(D){u[D]!==!1&&(i.disable(D),u[D]=!1)}function Ue(D,se){return d[D]!==se?(i.bindFramebuffer(D,se),d[D]=se,D===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=se),D===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=se),!0):!1}function Te(D,se){let oe=f,me=!1;if(D){oe=h.get(se),oe===void 0&&(oe=[],h.set(se,oe));const te=D.textures;if(oe.length!==te.length||oe[0]!==i.COLOR_ATTACHMENT0){for(let K=0,_e=te.length;K<_e;K++)oe[K]=i.COLOR_ATTACHMENT0+K;oe.length=te.length,me=!0}}else oe[0]!==i.BACK&&(oe[0]=i.BACK,me=!0);me&&i.drawBuffers(oe)}function Ye(D){return g!==D?(i.useProgram(D),g=D,!0):!1}const Ct={[hi]:i.FUNC_ADD,[wd]:i.FUNC_SUBTRACT,[Ad]:i.FUNC_REVERSE_SUBTRACT};Ct[Rd]=i.MIN,Ct[Cd]=i.MAX;const C={[Pd]:i.ZERO,[Dd]:i.ONE,[Ld]:i.SRC_COLOR,[$a]:i.SRC_ALPHA,[Bd]:i.SRC_ALPHA_SATURATE,[Fd]:i.DST_COLOR,[Ud]:i.DST_ALPHA,[Id]:i.ONE_MINUS_SRC_COLOR,[Xa]:i.ONE_MINUS_SRC_ALPHA,[Od]:i.ONE_MINUS_DST_COLOR,[Nd]:i.ONE_MINUS_DST_ALPHA,[kd]:i.CONSTANT_COLOR,[zd]:i.ONE_MINUS_CONSTANT_COLOR,[Hd]:i.CONSTANT_ALPHA,[Gd]:i.ONE_MINUS_CONSTANT_ALPHA};function ut(D,se,oe,me,te,K,_e,Ne,ot,Je){if(D===qn){v===!0&&(ge(i.BLEND),v=!1);return}if(v===!1&&(J(i.BLEND),v=!0),D!==Td){if(D!==m||Je!==b){if((p!==hi||M!==hi)&&(i.blendEquation(i.FUNC_ADD),p=hi,M=hi),Je)switch(D){case qi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case wl:i.blendFunc(i.ONE,i.ONE);break;case Al:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Rl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case qi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case wl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Al:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Rl:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}S=null,E=null,w=null,R=null,A.set(0,0,0),L=0,m=D,b=Je}return}te=te||se,K=K||oe,_e=_e||me,(se!==p||te!==M)&&(i.blendEquationSeparate(Ct[se],Ct[te]),p=se,M=te),(oe!==S||me!==E||K!==w||_e!==R)&&(i.blendFuncSeparate(C[oe],C[me],C[K],C[_e]),S=oe,E=me,w=K,R=_e),(Ne.equals(A)===!1||ot!==L)&&(i.blendColor(Ne.r,Ne.g,Ne.b,ot),A.copy(Ne),L=ot),m=D,b=!1}function Fe(D,se){D.side===Un?ge(i.CULL_FACE):J(i.CULL_FACE);let oe=D.side===kt;se&&(oe=!oe),Le(oe),D.blending===qi&&D.transparent===!1?ut(qn):ut(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);const me=D.stencilWrite;o.setTest(me),me&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Me(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?J(i.SAMPLE_ALPHA_TO_COVERAGE):ge(i.SAMPLE_ALPHA_TO_COVERAGE)}function Le(D){y!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),y=D)}function xe(D){D!==yd?(J(i.CULL_FACE),D!==P&&(D===Tl?i.cullFace(i.BACK):D===Ed?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ge(i.CULL_FACE),P=D}function dt(D){D!==B&&(X&&i.lineWidth(D),B=D)}function Me(D,se,oe){D?(J(i.POLYGON_OFFSET_FILL),(H!==se||q!==oe)&&(i.polygonOffset(se,oe),H=se,q=oe)):ge(i.POLYGON_OFFSET_FILL)}function ze(D){D?J(i.SCISSOR_TEST):ge(i.SCISSOR_TEST)}function Tt(D){D===void 0&&(D=i.TEXTURE0+$-1),ce!==D&&(i.activeTexture(D),ce=D)}function xt(D,se,oe){oe===void 0&&(ce===null?oe=i.TEXTURE0+$-1:oe=ce);let me=fe[oe];me===void 0&&(me={type:void 0,texture:void 0},fe[oe]=me),(me.type!==D||me.texture!==se)&&(ce!==oe&&(i.activeTexture(oe),ce=oe),i.bindTexture(D,se||Y[D]),me.type=D,me.texture=se)}function T(){const D=fe[ce];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function _(){try{i.compressedTexImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function O(){try{i.compressedTexImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function W(){try{i.texSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function j(){try{i.texSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function V(){try{i.compressedTexSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function be(){try{i.compressedTexSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ae(){try{i.texStorage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Se(){try{i.texStorage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ye(){try{i.texImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ie(){try{i.texImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function he(D){at.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),at.copy(D))}function De(D){ct.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),ct.copy(D))}function Ee(D,se){let oe=c.get(se);oe===void 0&&(oe=new WeakMap,c.set(se,oe));let me=oe.get(D);me===void 0&&(me=i.getUniformBlockIndex(se,D.name),oe.set(D,me))}function ue(D,se){const me=c.get(se).get(D);l.get(se)!==me&&(i.uniformBlockBinding(se,me,D.__bindingPointIndex),l.set(se,me))}function Oe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},ce=null,fe={},d={},h=new WeakMap,f=[],g=null,v=!1,m=null,p=null,S=null,E=null,M=null,w=null,R=null,A=new Ve(0,0,0),L=0,b=!1,y=null,P=null,B=null,H=null,q=null,at.set(0,0,i.canvas.width,i.canvas.height),ct.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:J,disable:ge,bindFramebuffer:Ue,drawBuffers:Te,useProgram:Ye,setBlending:ut,setMaterial:Fe,setFlipSided:Le,setCullFace:xe,setLineWidth:dt,setPolygonOffset:Me,setScissorTest:ze,activeTexture:Tt,bindTexture:xt,unbindTexture:T,compressedTexImage2D:_,compressedTexImage3D:O,texImage2D:ye,texImage3D:ie,updateUBOMapping:Ee,uniformBlockBinding:ue,texStorage2D:ae,texStorage3D:Se,texSubImage2D:W,texSubImage3D:j,compressedTexSubImage2D:V,compressedTexSubImage3D:be,scissor:he,viewport:De,reset:Oe}}function b1(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new qe,u=new WeakMap;let d;const h=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,_){return f?new OffscreenCanvas(T,_):Lr("canvas")}function v(T,_,O){let W=1;const j=xt(T);if((j.width>O||j.height>O)&&(W=O/Math.max(j.width,j.height)),W<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const V=Math.floor(W*j.width),be=Math.floor(W*j.height);d===void 0&&(d=g(V,be));const ae=_?g(V,be):d;return ae.width=V,ae.height=be,ae.getContext("2d").drawImage(T,0,0,V,be),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+V+"x"+be+")."),ae}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),T;return T}function m(T){return T.generateMipmaps}function p(T){i.generateMipmap(T)}function S(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(T,_,O,W,j=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let V=_;if(_===i.RED&&(O===i.FLOAT&&(V=i.R32F),O===i.HALF_FLOAT&&(V=i.R16F),O===i.UNSIGNED_BYTE&&(V=i.R8)),_===i.RED_INTEGER&&(O===i.UNSIGNED_BYTE&&(V=i.R8UI),O===i.UNSIGNED_SHORT&&(V=i.R16UI),O===i.UNSIGNED_INT&&(V=i.R32UI),O===i.BYTE&&(V=i.R8I),O===i.SHORT&&(V=i.R16I),O===i.INT&&(V=i.R32I)),_===i.RG&&(O===i.FLOAT&&(V=i.RG32F),O===i.HALF_FLOAT&&(V=i.RG16F),O===i.UNSIGNED_BYTE&&(V=i.RG8)),_===i.RG_INTEGER&&(O===i.UNSIGNED_BYTE&&(V=i.RG8UI),O===i.UNSIGNED_SHORT&&(V=i.RG16UI),O===i.UNSIGNED_INT&&(V=i.RG32UI),O===i.BYTE&&(V=i.RG8I),O===i.SHORT&&(V=i.RG16I),O===i.INT&&(V=i.RG32I)),_===i.RGB_INTEGER&&(O===i.UNSIGNED_BYTE&&(V=i.RGB8UI),O===i.UNSIGNED_SHORT&&(V=i.RGB16UI),O===i.UNSIGNED_INT&&(V=i.RGB32UI),O===i.BYTE&&(V=i.RGB8I),O===i.SHORT&&(V=i.RGB16I),O===i.INT&&(V=i.RGB32I)),_===i.RGBA_INTEGER&&(O===i.UNSIGNED_BYTE&&(V=i.RGBA8UI),O===i.UNSIGNED_SHORT&&(V=i.RGBA16UI),O===i.UNSIGNED_INT&&(V=i.RGBA32UI),O===i.BYTE&&(V=i.RGBA8I),O===i.SHORT&&(V=i.RGBA16I),O===i.INT&&(V=i.RGBA32I)),_===i.RGB&&(O===i.UNSIGNED_INT_5_9_9_9_REV&&(V=i.RGB9_E5),O===i.UNSIGNED_INT_10F_11F_11F_REV&&(V=i.R11F_G11F_B10F)),_===i.RGBA){const be=j?Cr:je.getTransfer(W);O===i.FLOAT&&(V=i.RGBA32F),O===i.HALF_FLOAT&&(V=i.RGBA16F),O===i.UNSIGNED_BYTE&&(V=be===et?i.SRGB8_ALPHA8:i.RGBA8),O===i.UNSIGNED_SHORT_4_4_4_4&&(V=i.RGBA4),O===i.UNSIGNED_SHORT_5_5_5_1&&(V=i.RGB5_A1)}return(V===i.R16F||V===i.R32F||V===i.RG16F||V===i.RG32F||V===i.RGBA16F||V===i.RGBA32F)&&e.get("EXT_color_buffer_float"),V}function M(T,_){let O;return T?_===null||_===Mi||_===Cs?O=i.DEPTH24_STENCIL8:_===yn?O=i.DEPTH32F_STENCIL8:_===Rs&&(O=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Mi||_===Cs?O=i.DEPTH_COMPONENT24:_===yn?O=i.DEPTH_COMPONENT32F:_===Rs&&(O=i.DEPTH_COMPONENT16),O}function w(T,_){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==Jt&&T.minFilter!==Sn?Math.log2(Math.max(_.width,_.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?_.mipmaps.length:1}function R(T){const _=T.target;_.removeEventListener("dispose",R),L(_),_.isVideoTexture&&u.delete(_)}function A(T){const _=T.target;_.removeEventListener("dispose",A),y(_)}function L(T){const _=n.get(T);if(_.__webglInit===void 0)return;const O=T.source,W=h.get(O);if(W){const j=W[_.__cacheKey];j.usedTimes--,j.usedTimes===0&&b(T),Object.keys(W).length===0&&h.delete(O)}n.remove(T)}function b(T){const _=n.get(T);i.deleteTexture(_.__webglTexture);const O=T.source,W=h.get(O);delete W[_.__cacheKey],a.memory.textures--}function y(T){const _=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(_.__webglFramebuffer[W]))for(let j=0;j<_.__webglFramebuffer[W].length;j++)i.deleteFramebuffer(_.__webglFramebuffer[W][j]);else i.deleteFramebuffer(_.__webglFramebuffer[W]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[W])}else{if(Array.isArray(_.__webglFramebuffer))for(let W=0;W<_.__webglFramebuffer.length;W++)i.deleteFramebuffer(_.__webglFramebuffer[W]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let W=0;W<_.__webglColorRenderbuffer.length;W++)_.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[W]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const O=T.textures;for(let W=0,j=O.length;W<j;W++){const V=n.get(O[W]);V.__webglTexture&&(i.deleteTexture(V.__webglTexture),a.memory.textures--),n.remove(O[W])}n.remove(T)}let P=0;function B(){P=0}function H(){const T=P;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),P+=1,T}function q(T){const _=[];return _.push(T.wrapS),_.push(T.wrapT),_.push(T.wrapR||0),_.push(T.magFilter),_.push(T.minFilter),_.push(T.anisotropy),_.push(T.internalFormat),_.push(T.format),_.push(T.type),_.push(T.generateMipmaps),_.push(T.premultiplyAlpha),_.push(T.flipY),_.push(T.unpackAlignment),_.push(T.colorSpace),_.join()}function $(T,_){const O=n.get(T);if(T.isVideoTexture&&ze(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&O.__version!==T.version){const W=T.image;if(W===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(O,T,_);return}}else T.isExternalTexture&&(O.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,O.__webglTexture,i.TEXTURE0+_)}function X(T,_){const O=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&O.__version!==T.version){Y(O,T,_);return}t.bindTexture(i.TEXTURE_2D_ARRAY,O.__webglTexture,i.TEXTURE0+_)}function Z(T,_){const O=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&O.__version!==T.version){Y(O,T,_);return}t.bindTexture(i.TEXTURE_3D,O.__webglTexture,i.TEXTURE0+_)}function G(T,_){const O=n.get(T);if(T.version>0&&O.__version!==T.version){J(O,T,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+_)}const ce={[no]:i.REPEAT,[gi]:i.CLAMP_TO_EDGE,[io]:i.MIRRORED_REPEAT},fe={[Jt]:i.NEAREST,[Zd]:i.NEAREST_MIPMAP_NEAREST,[Ws]:i.NEAREST_MIPMAP_LINEAR,[Sn]:i.LINEAR,[qr]:i.LINEAR_MIPMAP_NEAREST,[vi]:i.LINEAR_MIPMAP_LINEAR},we={[th]:i.NEVER,[oh]:i.ALWAYS,[nh]:i.LESS,[uu]:i.LEQUAL,[ih]:i.EQUAL,[ah]:i.GEQUAL,[sh]:i.GREATER,[rh]:i.NOTEQUAL};function Ge(T,_){if(_.type===yn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Sn||_.magFilter===qr||_.magFilter===Ws||_.magFilter===vi||_.minFilter===Sn||_.minFilter===qr||_.minFilter===Ws||_.minFilter===vi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,ce[_.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,ce[_.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,ce[_.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,fe[_.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,fe[_.minFilter]),_.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,we[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Jt||_.minFilter!==Ws&&_.minFilter!==vi||_.type===yn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){const O=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function at(T,_){let O=!1;T.__webglInit===void 0&&(T.__webglInit=!0,_.addEventListener("dispose",R));const W=_.source;let j=h.get(W);j===void 0&&(j={},h.set(W,j));const V=q(_);if(V!==T.__cacheKey){j[V]===void 0&&(j[V]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,O=!0),j[V].usedTimes++;const be=j[T.__cacheKey];be!==void 0&&(j[T.__cacheKey].usedTimes--,be.usedTimes===0&&b(_)),T.__cacheKey=V,T.__webglTexture=j[V].texture}return O}function ct(T,_,O){return Math.floor(Math.floor(T/O)/_)}function Ze(T,_,O,W){const V=T.updateRanges;if(V.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,O,W,_.data);else{V.sort((ie,he)=>ie.start-he.start);let be=0;for(let ie=1;ie<V.length;ie++){const he=V[be],De=V[ie],Ee=he.start+he.count,ue=ct(De.start,_.width,4),Oe=ct(he.start,_.width,4);De.start<=Ee+1&&ue===Oe&&ct(De.start+De.count-1,_.width,4)===ue?he.count=Math.max(he.count,De.start+De.count-he.start):(++be,V[be]=De)}V.length=be+1;const ae=i.getParameter(i.UNPACK_ROW_LENGTH),Se=i.getParameter(i.UNPACK_SKIP_PIXELS),ye=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let ie=0,he=V.length;ie<he;ie++){const De=V[ie],Ee=Math.floor(De.start/4),ue=Math.ceil(De.count/4),Oe=Ee%_.width,D=Math.floor(Ee/_.width),se=ue,oe=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Oe),i.pixelStorei(i.UNPACK_SKIP_ROWS,D),t.texSubImage2D(i.TEXTURE_2D,0,Oe,D,se,oe,O,W,_.data)}T.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,ae),i.pixelStorei(i.UNPACK_SKIP_PIXELS,Se),i.pixelStorei(i.UNPACK_SKIP_ROWS,ye)}}function Y(T,_,O){let W=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(W=i.TEXTURE_3D);const j=at(T,_),V=_.source;t.bindTexture(W,T.__webglTexture,i.TEXTURE0+O);const be=n.get(V);if(V.version!==be.__version||j===!0){t.activeTexture(i.TEXTURE0+O);const ae=je.getPrimaries(je.workingColorSpace),Se=_.colorSpace===$n?null:je.getPrimaries(_.colorSpace),ye=_.colorSpace===$n||ae===Se?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let ie=v(_.image,!1,s.maxTextureSize);ie=Tt(_,ie);const he=r.convert(_.format,_.colorSpace),De=r.convert(_.type);let Ee=E(_.internalFormat,he,De,_.colorSpace,_.isVideoTexture);Ge(W,_);let ue;const Oe=_.mipmaps,D=_.isVideoTexture!==!0,se=be.__version===void 0||j===!0,oe=V.dataReady,me=w(_,ie);if(_.isDepthTexture)Ee=M(_.format===Ds,_.type),se&&(D?t.texStorage2D(i.TEXTURE_2D,1,Ee,ie.width,ie.height):t.texImage2D(i.TEXTURE_2D,0,Ee,ie.width,ie.height,0,he,De,null));else if(_.isDataTexture)if(Oe.length>0){D&&se&&t.texStorage2D(i.TEXTURE_2D,me,Ee,Oe[0].width,Oe[0].height);for(let te=0,K=Oe.length;te<K;te++)ue=Oe[te],D?oe&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,ue.width,ue.height,he,De,ue.data):t.texImage2D(i.TEXTURE_2D,te,Ee,ue.width,ue.height,0,he,De,ue.data);_.generateMipmaps=!1}else D?(se&&t.texStorage2D(i.TEXTURE_2D,me,Ee,ie.width,ie.height),oe&&Ze(_,ie,he,De)):t.texImage2D(i.TEXTURE_2D,0,Ee,ie.width,ie.height,0,he,De,ie.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){D&&se&&t.texStorage3D(i.TEXTURE_2D_ARRAY,me,Ee,Oe[0].width,Oe[0].height,ie.depth);for(let te=0,K=Oe.length;te<K;te++)if(ue=Oe[te],_.format!==dn)if(he!==null)if(D){if(oe)if(_.layerUpdates.size>0){const _e=rc(ue.width,ue.height,_.format,_.type);for(const Ne of _.layerUpdates){const ot=ue.data.subarray(Ne*_e/ue.data.BYTES_PER_ELEMENT,(Ne+1)*_e/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,Ne,ue.width,ue.height,1,he,ot)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,0,ue.width,ue.height,ie.depth,he,ue.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,te,Ee,ue.width,ue.height,ie.depth,0,ue.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else D?oe&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,0,ue.width,ue.height,ie.depth,he,De,ue.data):t.texImage3D(i.TEXTURE_2D_ARRAY,te,Ee,ue.width,ue.height,ie.depth,0,he,De,ue.data)}else{D&&se&&t.texStorage2D(i.TEXTURE_2D,me,Ee,Oe[0].width,Oe[0].height);for(let te=0,K=Oe.length;te<K;te++)ue=Oe[te],_.format!==dn?he!==null?D?oe&&t.compressedTexSubImage2D(i.TEXTURE_2D,te,0,0,ue.width,ue.height,he,ue.data):t.compressedTexImage2D(i.TEXTURE_2D,te,Ee,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):D?oe&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,ue.width,ue.height,he,De,ue.data):t.texImage2D(i.TEXTURE_2D,te,Ee,ue.width,ue.height,0,he,De,ue.data)}else if(_.isDataArrayTexture)if(D){if(se&&t.texStorage3D(i.TEXTURE_2D_ARRAY,me,Ee,ie.width,ie.height,ie.depth),oe)if(_.layerUpdates.size>0){const te=rc(ie.width,ie.height,_.format,_.type);for(const K of _.layerUpdates){const _e=ie.data.subarray(K*te/ie.data.BYTES_PER_ELEMENT,(K+1)*te/ie.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,K,ie.width,ie.height,1,he,De,_e)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ie.width,ie.height,ie.depth,he,De,ie.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ee,ie.width,ie.height,ie.depth,0,he,De,ie.data);else if(_.isData3DTexture)D?(se&&t.texStorage3D(i.TEXTURE_3D,me,Ee,ie.width,ie.height,ie.depth),oe&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ie.width,ie.height,ie.depth,he,De,ie.data)):t.texImage3D(i.TEXTURE_3D,0,Ee,ie.width,ie.height,ie.depth,0,he,De,ie.data);else if(_.isFramebufferTexture){if(se)if(D)t.texStorage2D(i.TEXTURE_2D,me,Ee,ie.width,ie.height);else{let te=ie.width,K=ie.height;for(let _e=0;_e<me;_e++)t.texImage2D(i.TEXTURE_2D,_e,Ee,te,K,0,he,De,null),te>>=1,K>>=1}}else if(Oe.length>0){if(D&&se){const te=xt(Oe[0]);t.texStorage2D(i.TEXTURE_2D,me,Ee,te.width,te.height)}for(let te=0,K=Oe.length;te<K;te++)ue=Oe[te],D?oe&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,he,De,ue):t.texImage2D(i.TEXTURE_2D,te,Ee,he,De,ue);_.generateMipmaps=!1}else if(D){if(se){const te=xt(ie);t.texStorage2D(i.TEXTURE_2D,me,Ee,te.width,te.height)}oe&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,he,De,ie)}else t.texImage2D(i.TEXTURE_2D,0,Ee,he,De,ie);m(_)&&p(W),be.__version=V.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function J(T,_,O){if(_.image.length!==6)return;const W=at(T,_),j=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+O);const V=n.get(j);if(j.version!==V.__version||W===!0){t.activeTexture(i.TEXTURE0+O);const be=je.getPrimaries(je.workingColorSpace),ae=_.colorSpace===$n?null:je.getPrimaries(_.colorSpace),Se=_.colorSpace===$n||be===ae?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se);const ye=_.isCompressedTexture||_.image[0].isCompressedTexture,ie=_.image[0]&&_.image[0].isDataTexture,he=[];for(let K=0;K<6;K++)!ye&&!ie?he[K]=v(_.image[K],!0,s.maxCubemapSize):he[K]=ie?_.image[K].image:_.image[K],he[K]=Tt(_,he[K]);const De=he[0],Ee=r.convert(_.format,_.colorSpace),ue=r.convert(_.type),Oe=E(_.internalFormat,Ee,ue,_.colorSpace),D=_.isVideoTexture!==!0,se=V.__version===void 0||W===!0,oe=j.dataReady;let me=w(_,De);Ge(i.TEXTURE_CUBE_MAP,_);let te;if(ye){D&&se&&t.texStorage2D(i.TEXTURE_CUBE_MAP,me,Oe,De.width,De.height);for(let K=0;K<6;K++){te=he[K].mipmaps;for(let _e=0;_e<te.length;_e++){const Ne=te[_e];_.format!==dn?Ee!==null?D?oe&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e,0,0,Ne.width,Ne.height,Ee,Ne.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e,Oe,Ne.width,Ne.height,0,Ne.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?oe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e,0,0,Ne.width,Ne.height,Ee,ue,Ne.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e,Oe,Ne.width,Ne.height,0,Ee,ue,Ne.data)}}}else{if(te=_.mipmaps,D&&se){te.length>0&&me++;const K=xt(he[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,me,Oe,K.width,K.height)}for(let K=0;K<6;K++)if(ie){D?oe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,he[K].width,he[K].height,Ee,ue,he[K].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Oe,he[K].width,he[K].height,0,Ee,ue,he[K].data);for(let _e=0;_e<te.length;_e++){const ot=te[_e].image[K].image;D?oe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e+1,0,0,ot.width,ot.height,Ee,ue,ot.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e+1,Oe,ot.width,ot.height,0,Ee,ue,ot.data)}}else{D?oe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Ee,ue,he[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Oe,Ee,ue,he[K]);for(let _e=0;_e<te.length;_e++){const Ne=te[_e];D?oe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e+1,0,0,Ee,ue,Ne.image[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e+1,Oe,Ee,ue,Ne.image[K])}}}m(_)&&p(i.TEXTURE_CUBE_MAP),V.__version=j.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function ge(T,_,O,W,j,V){const be=r.convert(O.format,O.colorSpace),ae=r.convert(O.type),Se=E(O.internalFormat,be,ae,O.colorSpace),ye=n.get(_),ie=n.get(O);if(ie.__renderTarget=_,!ye.__hasExternalTextures){const he=Math.max(1,_.width>>V),De=Math.max(1,_.height>>V);j===i.TEXTURE_3D||j===i.TEXTURE_2D_ARRAY?t.texImage3D(j,V,Se,he,De,_.depth,0,be,ae,null):t.texImage2D(j,V,Se,he,De,0,be,ae,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),Me(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,j,ie.__webglTexture,0,dt(_)):(j===i.TEXTURE_2D||j>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,j,ie.__webglTexture,V),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ue(T,_,O){if(i.bindRenderbuffer(i.RENDERBUFFER,T),_.depthBuffer){const W=_.depthTexture,j=W&&W.isDepthTexture?W.type:null,V=M(_.stencilBuffer,j),be=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=dt(_);Me(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ae,V,_.width,_.height):O?i.renderbufferStorageMultisample(i.RENDERBUFFER,ae,V,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,V,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,be,i.RENDERBUFFER,T)}else{const W=_.textures;for(let j=0;j<W.length;j++){const V=W[j],be=r.convert(V.format,V.colorSpace),ae=r.convert(V.type),Se=E(V.internalFormat,be,ae,V.colorSpace),ye=dt(_);O&&Me(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ye,Se,_.width,_.height):Me(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ye,Se,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,Se,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Te(T,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const W=n.get(_.depthTexture);W.__renderTarget=_,(!W.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),$(_.depthTexture,0);const j=W.__webglTexture,V=dt(_);if(_.depthTexture.format===Ps)Me(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,V):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(_.depthTexture.format===Ds)Me(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,V):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Ye(T){const _=n.get(T),O=T.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==T.depthTexture){const W=T.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),W){const j=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,W.removeEventListener("dispose",j)};W.addEventListener("dispose",j),_.__depthDisposeCallback=j}_.__boundDepthTexture=W}if(T.depthTexture&&!_.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");const W=T.texture.mipmaps;W&&W.length>0?Te(_.__webglFramebuffer[0],T):Te(_.__webglFramebuffer,T)}else if(O){_.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[W]),_.__webglDepthbuffer[W]===void 0)_.__webglDepthbuffer[W]=i.createRenderbuffer(),Ue(_.__webglDepthbuffer[W],T,!1);else{const j=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,V=_.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,V),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,V)}}else{const W=T.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),Ue(_.__webglDepthbuffer,T,!1);else{const j=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,V=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,V),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,V)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ct(T,_,O){const W=n.get(T);_!==void 0&&ge(W.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),O!==void 0&&Ye(T)}function C(T){const _=T.texture,O=n.get(T),W=n.get(_);T.addEventListener("dispose",A);const j=T.textures,V=T.isWebGLCubeRenderTarget===!0,be=j.length>1;if(be||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=_.version,a.memory.textures++),V){O.__webglFramebuffer=[];for(let ae=0;ae<6;ae++)if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer[ae]=[];for(let Se=0;Se<_.mipmaps.length;Se++)O.__webglFramebuffer[ae][Se]=i.createFramebuffer()}else O.__webglFramebuffer[ae]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer=[];for(let ae=0;ae<_.mipmaps.length;ae++)O.__webglFramebuffer[ae]=i.createFramebuffer()}else O.__webglFramebuffer=i.createFramebuffer();if(be)for(let ae=0,Se=j.length;ae<Se;ae++){const ye=n.get(j[ae]);ye.__webglTexture===void 0&&(ye.__webglTexture=i.createTexture(),a.memory.textures++)}if(T.samples>0&&Me(T)===!1){O.__webglMultisampledFramebuffer=i.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ae=0;ae<j.length;ae++){const Se=j[ae];O.__webglColorRenderbuffer[ae]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,O.__webglColorRenderbuffer[ae]);const ye=r.convert(Se.format,Se.colorSpace),ie=r.convert(Se.type),he=E(Se.internalFormat,ye,ie,Se.colorSpace,T.isXRRenderTarget===!0),De=dt(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,De,he,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,O.__webglColorRenderbuffer[ae])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(O.__webglDepthRenderbuffer=i.createRenderbuffer(),Ue(O.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(V){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),Ge(i.TEXTURE_CUBE_MAP,_);for(let ae=0;ae<6;ae++)if(_.mipmaps&&_.mipmaps.length>0)for(let Se=0;Se<_.mipmaps.length;Se++)ge(O.__webglFramebuffer[ae][Se],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Se);else ge(O.__webglFramebuffer[ae],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0);m(_)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(be){for(let ae=0,Se=j.length;ae<Se;ae++){const ye=j[ae],ie=n.get(ye);let he=i.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(he=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(he,ie.__webglTexture),Ge(he,ye),ge(O.__webglFramebuffer,T,ye,i.COLOR_ATTACHMENT0+ae,he,0),m(ye)&&p(he)}t.unbindTexture()}else{let ae=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ae=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ae,W.__webglTexture),Ge(ae,_),_.mipmaps&&_.mipmaps.length>0)for(let Se=0;Se<_.mipmaps.length;Se++)ge(O.__webglFramebuffer[Se],T,_,i.COLOR_ATTACHMENT0,ae,Se);else ge(O.__webglFramebuffer,T,_,i.COLOR_ATTACHMENT0,ae,0);m(_)&&p(ae),t.unbindTexture()}T.depthBuffer&&Ye(T)}function ut(T){const _=T.textures;for(let O=0,W=_.length;O<W;O++){const j=_[O];if(m(j)){const V=S(T),be=n.get(j).__webglTexture;t.bindTexture(V,be),p(V),t.unbindTexture()}}}const Fe=[],Le=[];function xe(T){if(T.samples>0){if(Me(T)===!1){const _=T.textures,O=T.width,W=T.height;let j=i.COLOR_BUFFER_BIT;const V=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,be=n.get(T),ae=_.length>1;if(ae)for(let ye=0;ye<_.length;ye++)t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer);const Se=T.texture.mipmaps;Se&&Se.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let ye=0;ye<_.length;ye++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(j|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(j|=i.STENCIL_BUFFER_BIT)),ae){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,be.__webglColorRenderbuffer[ye]);const ie=n.get(_[ye]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ie,0)}i.blitFramebuffer(0,0,O,W,0,0,O,W,j,i.NEAREST),l===!0&&(Fe.length=0,Le.length=0,Fe.push(i.COLOR_ATTACHMENT0+ye),T.depthBuffer&&T.resolveDepthBuffer===!1&&(Fe.push(V),Le.push(V),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Le)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Fe))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ae)for(let ye=0;ye<_.length;ye++){t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,be.__webglColorRenderbuffer[ye]);const ie=n.get(_[ye]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,ie,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const _=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function dt(T){return Math.min(s.maxSamples,T.samples)}function Me(T){const _=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function ze(T){const _=a.render.frame;u.get(T)!==_&&(u.set(T,_),T.update())}function Tt(T,_){const O=T.colorSpace,W=T.format,j=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||O!==es&&O!==$n&&(je.getTransfer(O)===et?(W!==dn||j!==Tn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),_}function xt(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=H,this.resetTextureUnits=B,this.setTexture2D=$,this.setTexture2DArray=X,this.setTexture3D=Z,this.setTextureCube=G,this.rebindTextures=Ct,this.setupRenderTarget=C,this.updateRenderTargetMipmap=ut,this.updateMultisampleRenderTarget=xe,this.setupDepthRenderbuffer=Ye,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=Me}function T1(i,e){function t(n,s=$n){let r;const a=je.getTransfer(s);if(n===Tn)return i.UNSIGNED_BYTE;if(n===qo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Yo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===ru)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===au)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===iu)return i.BYTE;if(n===su)return i.SHORT;if(n===Rs)return i.UNSIGNED_SHORT;if(n===Xo)return i.INT;if(n===Mi)return i.UNSIGNED_INT;if(n===yn)return i.FLOAT;if(n===Us)return i.HALF_FLOAT;if(n===ou)return i.ALPHA;if(n===lu)return i.RGB;if(n===dn)return i.RGBA;if(n===Ps)return i.DEPTH_COMPONENT;if(n===Ds)return i.DEPTH_STENCIL;if(n===Ko)return i.RED;if(n===jo)return i.RED_INTEGER;if(n===cu)return i.RG;if(n===Zo)return i.RG_INTEGER;if(n===Jo)return i.RGBA_INTEGER;if(n===yr||n===Er||n===br||n===Tr)if(a===et)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===yr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Er)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Tr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===yr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Er)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===br)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Tr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===so||n===ro||n===ao||n===oo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===so)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ro)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ao)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===oo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===lo||n===co||n===uo)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===lo||n===co)return a===et?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===uo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ho||n===fo||n===po||n===mo||n===go||n===vo||n===_o||n===xo||n===Mo||n===So||n===yo||n===Eo||n===bo||n===To)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ho)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===fo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===po)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===mo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===go)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===vo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===_o)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===xo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Mo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===So)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===yo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Eo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===bo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===To)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===wo||n===Ao||n===Ro)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===wo)return a===et?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ao)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ro)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Co||n===Po||n===Do||n===Lo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Co)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Po)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Do)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Lo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Cs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const w1=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,A1=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class R1{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new yu(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new jn({vertexShader:w1,fragmentShader:A1,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new $e(new sn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class C1 extends ss{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,d=null,h=null,f=null,g=null;const v=typeof XRWebGLBinding<"u",m=new R1,p={},S=t.getContextAttributes();let E=null,M=null;const w=[],R=[],A=new qe;let L=null;const b=new Vt;b.viewport=new tt;const y=new Vt;y.viewport=new tt;const P=[b,y],B=new Yh;let H=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let J=w[Y];return J===void 0&&(J=new ga,w[Y]=J),J.getTargetRaySpace()},this.getControllerGrip=function(Y){let J=w[Y];return J===void 0&&(J=new ga,w[Y]=J),J.getGripSpace()},this.getHand=function(Y){let J=w[Y];return J===void 0&&(J=new ga,w[Y]=J),J.getHandSpace()};function $(Y){const J=R.indexOf(Y.inputSource);if(J===-1)return;const ge=w[J];ge!==void 0&&(ge.update(Y.inputSource,Y.frame,c||a),ge.dispatchEvent({type:Y.type,data:Y.inputSource}))}function X(){s.removeEventListener("select",$),s.removeEventListener("selectstart",$),s.removeEventListener("selectend",$),s.removeEventListener("squeeze",$),s.removeEventListener("squeezestart",$),s.removeEventListener("squeezeend",$),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",Z);for(let Y=0;Y<w.length;Y++){const J=R[Y];J!==null&&(R[Y]=null,w[Y].disconnect(J))}H=null,q=null,m.reset();for(const Y in p)delete p[Y];e.setRenderTarget(E),f=null,h=null,d=null,s=null,M=null,Ze.stop(),n.isPresenting=!1,e.setPixelRatio(L),e.setSize(A.width,A.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",$),s.addEventListener("selectstart",$),s.addEventListener("selectend",$),s.addEventListener("squeeze",$),s.addEventListener("squeezestart",$),s.addEventListener("squeezeend",$),s.addEventListener("end",X),s.addEventListener("inputsourceschange",Z),S.xrCompatible!==!0&&await t.makeXRCompatible(),L=e.getPixelRatio(),e.getSize(A),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let ge=null,Ue=null,Te=null;S.depth&&(Te=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ge=S.stencil?Ds:Ps,Ue=S.stencil?Cs:Mi);const Ye={colorFormat:t.RGBA8,depthFormat:Te,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(Ye),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),M=new Si(h.textureWidth,h.textureHeight,{format:dn,type:Tn,depthTexture:new Su(h.textureWidth,h.textureHeight,Ue,void 0,void 0,void 0,void 0,void 0,void 0,ge),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const ge={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ge),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),M=new Si(f.framebufferWidth,f.framebufferHeight,{format:dn,type:Tn,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Ze.setContext(s),Ze.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function Z(Y){for(let J=0;J<Y.removed.length;J++){const ge=Y.removed[J],Ue=R.indexOf(ge);Ue>=0&&(R[Ue]=null,w[Ue].disconnect(ge))}for(let J=0;J<Y.added.length;J++){const ge=Y.added[J];let Ue=R.indexOf(ge);if(Ue===-1){for(let Ye=0;Ye<w.length;Ye++)if(Ye>=R.length){R.push(ge),Ue=Ye;break}else if(R[Ye]===null){R[Ye]=ge,Ue=Ye;break}if(Ue===-1)break}const Te=w[Ue];Te&&Te.connect(ge)}}const G=new N,ce=new N;function fe(Y,J,ge){G.setFromMatrixPosition(J.matrixWorld),ce.setFromMatrixPosition(ge.matrixWorld);const Ue=G.distanceTo(ce),Te=J.projectionMatrix.elements,Ye=ge.projectionMatrix.elements,Ct=Te[14]/(Te[10]-1),C=Te[14]/(Te[10]+1),ut=(Te[9]+1)/Te[5],Fe=(Te[9]-1)/Te[5],Le=(Te[8]-1)/Te[0],xe=(Ye[8]+1)/Ye[0],dt=Ct*Le,Me=Ct*xe,ze=Ue/(-Le+xe),Tt=ze*-Le;if(J.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(Tt),Y.translateZ(ze),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Te[10]===-1)Y.projectionMatrix.copy(J.projectionMatrix),Y.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{const xt=Ct+ze,T=C+ze,_=dt-Tt,O=Me+(Ue-Tt),W=ut*C/T*xt,j=Fe*C/T*xt;Y.projectionMatrix.makePerspective(_,O,W,j,xt,T),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function we(Y,J){J===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(J.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let J=Y.near,ge=Y.far;m.texture!==null&&(m.depthNear>0&&(J=m.depthNear),m.depthFar>0&&(ge=m.depthFar)),B.near=y.near=b.near=J,B.far=y.far=b.far=ge,(H!==B.near||q!==B.far)&&(s.updateRenderState({depthNear:B.near,depthFar:B.far}),H=B.near,q=B.far),B.layers.mask=Y.layers.mask|6,b.layers.mask=B.layers.mask&3,y.layers.mask=B.layers.mask&5;const Ue=Y.parent,Te=B.cameras;we(B,Ue);for(let Ye=0;Ye<Te.length;Ye++)we(Te[Ye],Ue);Te.length===2?fe(B,b,y):B.projectionMatrix.copy(b.projectionMatrix),Ge(Y,B,Ue)};function Ge(Y,J,ge){ge===null?Y.matrix.copy(J.matrixWorld):(Y.matrix.copy(ge.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(J.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(J.projectionMatrix),Y.projectionMatrixInverse.copy(J.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Dr*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(Y){l=Y,h!==null&&(h.fixedFoveation=Y),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Y)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(B)},this.getCameraTexture=function(Y){return p[Y]};let at=null;function ct(Y,J){if(u=J.getViewerPose(c||a),g=J,u!==null){const ge=u.views;f!==null&&(e.setRenderTargetFramebuffer(M,f.framebuffer),e.setRenderTarget(M));let Ue=!1;ge.length!==B.cameras.length&&(B.cameras.length=0,Ue=!0);for(let C=0;C<ge.length;C++){const ut=ge[C];let Fe=null;if(f!==null)Fe=f.getViewport(ut);else{const xe=d.getViewSubImage(h,ut);Fe=xe.viewport,C===0&&(e.setRenderTargetTextures(M,xe.colorTexture,xe.depthStencilTexture),e.setRenderTarget(M))}let Le=P[C];Le===void 0&&(Le=new Vt,Le.layers.enable(C),Le.viewport=new tt,P[C]=Le),Le.matrix.fromArray(ut.transform.matrix),Le.matrix.decompose(Le.position,Le.quaternion,Le.scale),Le.projectionMatrix.fromArray(ut.projectionMatrix),Le.projectionMatrixInverse.copy(Le.projectionMatrix).invert(),Le.viewport.set(Fe.x,Fe.y,Fe.width,Fe.height),C===0&&(B.matrix.copy(Le.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Ue===!0&&B.cameras.push(Le)}const Te=s.enabledFeatures;if(Te&&Te.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){d=n.getBinding();const C=d.getDepthInformation(ge[0]);C&&C.isValid&&C.texture&&m.init(C,s.renderState)}if(Te&&Te.includes("camera-access")&&v){e.state.unbindTexture(),d=n.getBinding();for(let C=0;C<ge.length;C++){const ut=ge[C].camera;if(ut){let Fe=p[ut];Fe||(Fe=new yu,p[ut]=Fe);const Le=d.getCameraImage(ut);Fe.sourceTexture=Le}}}}for(let ge=0;ge<w.length;ge++){const Ue=R[ge],Te=w[ge];Ue!==null&&Te!==void 0&&Te.update(Ue,J,c||a)}at&&at(Y,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),g=null}const Ze=new wu;Ze.setAnimationLoop(ct),this.setAnimationLoop=function(Y){at=Y},this.dispose=function(){}}}const oi=new pn,P1=new rt;function D1(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,gu(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,S,E,M){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),h(m,p),p.isMeshPhysicalMaterial&&f(m,p,M)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,S,E):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===kt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===kt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const S=e.get(p),E=S.envMap,M=S.envMapRotation;E&&(m.envMap.value=E,oi.copy(M),oi.x*=-1,oi.y*=-1,oi.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(oi.y*=-1,oi.z*=-1),m.envMapRotation.value.setFromMatrix4(P1.makeRotationFromEuler(oi)),m.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,S,E){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*S,m.scale.value=E*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,S){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===kt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const S=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function L1(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,E){const M=E.program;n.uniformBlockBinding(S,M)}function c(S,E){let M=s[S.id];M===void 0&&(g(S),M=u(S),s[S.id]=M,S.addEventListener("dispose",m));const w=E.program;n.updateUBOMapping(S,w);const R=e.render.frame;r[S.id]!==R&&(h(S),r[S.id]=R)}function u(S){const E=d();S.__bindingPointIndex=E;const M=i.createBuffer(),w=S.__size,R=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,w,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,M),M}function d(){for(let S=0;S<o;S++)if(a.indexOf(S)===-1)return a.push(S),S;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(S){const E=s[S.id],M=S.uniforms,w=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let R=0,A=M.length;R<A;R++){const L=Array.isArray(M[R])?M[R]:[M[R]];for(let b=0,y=L.length;b<y;b++){const P=L[b];if(f(P,R,b,w)===!0){const B=P.__offset,H=Array.isArray(P.value)?P.value:[P.value];let q=0;for(let $=0;$<H.length;$++){const X=H[$],Z=v(X);typeof X=="number"||typeof X=="boolean"?(P.__data[0]=X,i.bufferSubData(i.UNIFORM_BUFFER,B+q,P.__data)):X.isMatrix3?(P.__data[0]=X.elements[0],P.__data[1]=X.elements[1],P.__data[2]=X.elements[2],P.__data[3]=0,P.__data[4]=X.elements[3],P.__data[5]=X.elements[4],P.__data[6]=X.elements[5],P.__data[7]=0,P.__data[8]=X.elements[6],P.__data[9]=X.elements[7],P.__data[10]=X.elements[8],P.__data[11]=0):(X.toArray(P.__data,q),q+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,B,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(S,E,M,w){const R=S.value,A=E+"_"+M;if(w[A]===void 0)return typeof R=="number"||typeof R=="boolean"?w[A]=R:w[A]=R.clone(),!0;{const L=w[A];if(typeof R=="number"||typeof R=="boolean"){if(L!==R)return w[A]=R,!0}else if(L.equals(R)===!1)return L.copy(R),!0}return!1}function g(S){const E=S.uniforms;let M=0;const w=16;for(let A=0,L=E.length;A<L;A++){const b=Array.isArray(E[A])?E[A]:[E[A]];for(let y=0,P=b.length;y<P;y++){const B=b[y],H=Array.isArray(B.value)?B.value:[B.value];for(let q=0,$=H.length;q<$;q++){const X=H[q],Z=v(X),G=M%w,ce=G%Z.boundary,fe=G+ce;M+=ce,fe!==0&&w-fe<Z.storage&&(M+=w-fe),B.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=M,M+=Z.storage}}}const R=M%w;return R>0&&(M+=w-R),S.__size=M,S.__cache={},this}function v(S){const E={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(E.boundary=4,E.storage=4):S.isVector2?(E.boundary=8,E.storage=8):S.isVector3||S.isColor?(E.boundary=16,E.storage=12):S.isVector4?(E.boundary=16,E.storage=16):S.isMatrix3?(E.boundary=48,E.storage=48):S.isMatrix4?(E.boundary=64,E.storage=64):S.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",S),E}function m(S){const E=S.target;E.removeEventListener("dispose",m);const M=a.indexOf(E.__bindingPointIndex);a.splice(M,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function p(){for(const S in s)i.deleteBuffer(s[S]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}class I1{constructor(e={}){const{canvas:t=ch(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;const g=new Uint32Array(4),v=new Int32Array(4);let m=null,p=null;const S=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Yn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const M=this;let w=!1;this._outputColorSpace=Lt;let R=0,A=0,L=null,b=-1,y=null;const P=new tt,B=new tt;let H=null;const q=new Ve(0);let $=0,X=t.width,Z=t.height,G=1,ce=null,fe=null;const we=new tt(0,0,X,Z),Ge=new tt(0,0,X,Z);let at=!1;const ct=new sl;let Ze=!1,Y=!1;const J=new rt,ge=new N,Ue=new tt,Te={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ye=!1;function Ct(){return L===null?G:1}let C=n;function ut(x,I){return t.getContext(x,I)}try{const x={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Wo}`),t.addEventListener("webglcontextlost",oe,!1),t.addEventListener("webglcontextrestored",me,!1),t.addEventListener("webglcontextcreationerror",te,!1),C===null){const I="webgl2";if(C=ut(I,x),C===null)throw ut(I)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(x){throw console.error("THREE.WebGLRenderer: "+x.message),x}let Fe,Le,xe,dt,Me,ze,Tt,xt,T,_,O,W,j,V,be,ae,Se,ye,ie,he,De,Ee,ue,Oe;function D(){Fe=new Vm(C),Fe.init(),Ee=new T1(C,Fe),Le=new Fm(C,Fe,e,Ee),xe=new E1(C,Fe),Le.reversedDepthBuffer&&h&&xe.buffers.depth.setReversed(!0),dt=new Xm(C),Me=new u1,ze=new b1(C,Fe,xe,Me,Le,Ee,dt),Tt=new Bm(M),xt=new Gm(M),T=new Zh(C),ue=new Um(C,T),_=new Wm(C,T,dt,ue),O=new Ym(C,_,T,dt),ie=new qm(C,Le,ze),ae=new Om(Me),W=new c1(M,Tt,xt,Fe,Le,ue,ae),j=new D1(M,Me),V=new h1,be=new _1(Fe),ye=new Im(M,Tt,xt,xe,O,f,l),Se=new S1(M,O,Le),Oe=new L1(C,dt,Le,xe),he=new Nm(C,Fe,dt),De=new $m(C,Fe,dt),dt.programs=W.programs,M.capabilities=Le,M.extensions=Fe,M.properties=Me,M.renderLists=V,M.shadowMap=Se,M.state=xe,M.info=dt}D();const se=new C1(M,C);this.xr=se,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){const x=Fe.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){const x=Fe.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(x){x!==void 0&&(G=x,this.setSize(X,Z,!1))},this.getSize=function(x){return x.set(X,Z)},this.setSize=function(x,I,k=!0){if(se.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=x,Z=I,t.width=Math.floor(x*G),t.height=Math.floor(I*G),k===!0&&(t.style.width=x+"px",t.style.height=I+"px"),this.setViewport(0,0,x,I)},this.getDrawingBufferSize=function(x){return x.set(X*G,Z*G).floor()},this.setDrawingBufferSize=function(x,I,k){X=x,Z=I,G=k,t.width=Math.floor(x*k),t.height=Math.floor(I*k),this.setViewport(0,0,x,I)},this.getCurrentViewport=function(x){return x.copy(P)},this.getViewport=function(x){return x.copy(we)},this.setViewport=function(x,I,k,z){x.isVector4?we.set(x.x,x.y,x.z,x.w):we.set(x,I,k,z),xe.viewport(P.copy(we).multiplyScalar(G).round())},this.getScissor=function(x){return x.copy(Ge)},this.setScissor=function(x,I,k,z){x.isVector4?Ge.set(x.x,x.y,x.z,x.w):Ge.set(x,I,k,z),xe.scissor(B.copy(Ge).multiplyScalar(G).round())},this.getScissorTest=function(){return at},this.setScissorTest=function(x){xe.setScissorTest(at=x)},this.setOpaqueSort=function(x){ce=x},this.setTransparentSort=function(x){fe=x},this.getClearColor=function(x){return x.copy(ye.getClearColor())},this.setClearColor=function(){ye.setClearColor(...arguments)},this.getClearAlpha=function(){return ye.getClearAlpha()},this.setClearAlpha=function(){ye.setClearAlpha(...arguments)},this.clear=function(x=!0,I=!0,k=!0){let z=0;if(x){let U=!1;if(L!==null){const ne=L.texture.format;U=ne===Jo||ne===Zo||ne===jo}if(U){const ne=L.texture.type,de=ne===Tn||ne===Mi||ne===Rs||ne===Cs||ne===qo||ne===Yo,ve=ye.getClearColor(),pe=ye.getClearAlpha(),Ce=ve.r,Ie=ve.g,Ae=ve.b;de?(g[0]=Ce,g[1]=Ie,g[2]=Ae,g[3]=pe,C.clearBufferuiv(C.COLOR,0,g)):(v[0]=Ce,v[1]=Ie,v[2]=Ae,v[3]=pe,C.clearBufferiv(C.COLOR,0,v))}else z|=C.COLOR_BUFFER_BIT}I&&(z|=C.DEPTH_BUFFER_BIT),k&&(z|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),C.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",oe,!1),t.removeEventListener("webglcontextrestored",me,!1),t.removeEventListener("webglcontextcreationerror",te,!1),ye.dispose(),V.dispose(),be.dispose(),Me.dispose(),Tt.dispose(),xt.dispose(),O.dispose(),ue.dispose(),Oe.dispose(),W.dispose(),se.dispose(),se.removeEventListener("sessionstart",gn),se.removeEventListener("sessionend",pl),Qn.stop()};function oe(x){x.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function me(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const x=dt.autoReset,I=Se.enabled,k=Se.autoUpdate,z=Se.needsUpdate,U=Se.type;D(),dt.autoReset=x,Se.enabled=I,Se.autoUpdate=k,Se.needsUpdate=z,Se.type=U}function te(x){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}function K(x){const I=x.target;I.removeEventListener("dispose",K),_e(I)}function _e(x){Ne(x),Me.remove(x)}function Ne(x){const I=Me.get(x).programs;I!==void 0&&(I.forEach(function(k){W.releaseProgram(k)}),x.isShaderMaterial&&W.releaseShaderCache(x))}this.renderBufferDirect=function(x,I,k,z,U,ne){I===null&&(I=Te);const de=U.isMesh&&U.matrixWorld.determinant()<0,ve=td(x,I,k,z,U);xe.setMaterial(z,de);let pe=k.index,Ce=1;if(z.wireframe===!0){if(pe=_.getWireframeAttribute(k),pe===void 0)return;Ce=2}const Ie=k.drawRange,Ae=k.attributes.position;let We=Ie.start*Ce,Qe=(Ie.start+Ie.count)*Ce;ne!==null&&(We=Math.max(We,ne.start*Ce),Qe=Math.min(Qe,(ne.start+ne.count)*Ce)),pe!==null?(We=Math.max(We,0),Qe=Math.min(Qe,pe.count)):Ae!=null&&(We=Math.max(We,0),Qe=Math.min(Qe,Ae.count));const mt=Qe-We;if(mt<0||mt===1/0)return;ue.setup(U,z,ve,k,pe);let lt,nt=he;if(pe!==null&&(lt=T.get(pe),nt=De,nt.setIndex(lt)),U.isMesh)z.wireframe===!0?(xe.setLineWidth(z.wireframeLinewidth*Ct()),nt.setMode(C.LINES)):nt.setMode(C.TRIANGLES);else if(U.isLine){let Re=z.linewidth;Re===void 0&&(Re=1),xe.setLineWidth(Re*Ct()),U.isLineSegments?nt.setMode(C.LINES):U.isLineLoop?nt.setMode(C.LINE_LOOP):nt.setMode(C.LINE_STRIP)}else U.isPoints?nt.setMode(C.POINTS):U.isSprite&&nt.setMode(C.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)Ls("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),nt.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(Fe.get("WEBGL_multi_draw"))nt.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const Re=U._multiDrawStarts,ht=U._multiDrawCounts,Ke=U._multiDrawCount,$t=pe?T.get(pe).bytesPerElement:1,bi=Me.get(z).currentProgram.getUniforms();for(let Xt=0;Xt<Ke;Xt++)bi.setValue(C,"_gl_DrawID",Xt),nt.render(Re[Xt]/$t,ht[Xt])}else if(U.isInstancedMesh)nt.renderInstances(We,mt,U.count);else if(k.isInstancedBufferGeometry){const Re=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,ht=Math.min(k.instanceCount,Re);nt.renderInstances(We,mt,ht)}else nt.render(We,mt)};function ot(x,I,k){x.transparent===!0&&x.side===Un&&x.forceSinglePass===!1?(x.side=kt,x.needsUpdate=!0,Hs(x,I,k),x.side=Kn,x.needsUpdate=!0,Hs(x,I,k),x.side=Un):Hs(x,I,k)}this.compile=function(x,I,k=null){k===null&&(k=x),p=be.get(k),p.init(I),E.push(p),k.traverseVisible(function(U){U.isLight&&U.layers.test(I.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),x!==k&&x.traverseVisible(function(U){U.isLight&&U.layers.test(I.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),p.setupLights();const z=new Set;return x.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const ne=U.material;if(ne)if(Array.isArray(ne))for(let de=0;de<ne.length;de++){const ve=ne[de];ot(ve,k,U),z.add(ve)}else ot(ne,k,U),z.add(ne)}),p=E.pop(),z},this.compileAsync=function(x,I,k=null){const z=this.compile(x,I,k);return new Promise(U=>{function ne(){if(z.forEach(function(de){Me.get(de).currentProgram.isReady()&&z.delete(de)}),z.size===0){U(x);return}setTimeout(ne,10)}Fe.get("KHR_parallel_shader_compile")!==null?ne():setTimeout(ne,10)})};let Je=null;function An(x){Je&&Je(x)}function gn(){Qn.stop()}function pl(){Qn.start()}const Qn=new wu;Qn.setAnimationLoop(An),typeof self<"u"&&Qn.setContext(self),this.setAnimationLoop=function(x){Je=x,se.setAnimationLoop(x),x===null?Qn.stop():Qn.start()},se.addEventListener("sessionstart",gn),se.addEventListener("sessionend",pl),this.render=function(x,I){if(I!==void 0&&I.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),se.enabled===!0&&se.isPresenting===!0&&(se.cameraAutoUpdate===!0&&se.updateCamera(I),I=se.getCamera()),x.isScene===!0&&x.onBeforeRender(M,x,I,L),p=be.get(x,E.length),p.init(I),E.push(p),J.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),ct.setFromProjectionMatrix(J,En,I.reversedDepth),Y=this.localClippingEnabled,Ze=ae.init(this.clippingPlanes,Y),m=V.get(x,S.length),m.init(),S.push(m),se.enabled===!0&&se.isPresenting===!0){const ne=M.xr.getDepthSensingMesh();ne!==null&&Gr(ne,I,-1/0,M.sortObjects)}Gr(x,I,0,M.sortObjects),m.finish(),M.sortObjects===!0&&m.sort(ce,fe),Ye=se.enabled===!1||se.isPresenting===!1||se.hasDepthSensing()===!1,Ye&&ye.addToRenderList(m,x),this.info.render.frame++,Ze===!0&&ae.beginShadows();const k=p.state.shadowsArray;Se.render(k,x,I),Ze===!0&&ae.endShadows(),this.info.autoReset===!0&&this.info.reset();const z=m.opaque,U=m.transmissive;if(p.setupLights(),I.isArrayCamera){const ne=I.cameras;if(U.length>0)for(let de=0,ve=ne.length;de<ve;de++){const pe=ne[de];gl(z,U,x,pe)}Ye&&ye.render(x);for(let de=0,ve=ne.length;de<ve;de++){const pe=ne[de];ml(m,x,pe,pe.viewport)}}else U.length>0&&gl(z,U,x,I),Ye&&ye.render(x),ml(m,x,I);L!==null&&A===0&&(ze.updateMultisampleRenderTarget(L),ze.updateRenderTargetMipmap(L)),x.isScene===!0&&x.onAfterRender(M,x,I),ue.resetDefaultState(),b=-1,y=null,E.pop(),E.length>0?(p=E[E.length-1],Ze===!0&&ae.setGlobalState(M.clippingPlanes,p.state.camera)):p=null,S.pop(),S.length>0?m=S[S.length-1]:m=null};function Gr(x,I,k,z){if(x.visible===!1)return;if(x.layers.test(I.layers)){if(x.isGroup)k=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(I);else if(x.isLight)p.pushLight(x),x.castShadow&&p.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||ct.intersectsSprite(x)){z&&Ue.setFromMatrixPosition(x.matrixWorld).applyMatrix4(J);const de=O.update(x),ve=x.material;ve.visible&&m.push(x,de,ve,k,Ue.z,null)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||ct.intersectsObject(x))){const de=O.update(x),ve=x.material;if(z&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),Ue.copy(x.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),Ue.copy(de.boundingSphere.center)),Ue.applyMatrix4(x.matrixWorld).applyMatrix4(J)),Array.isArray(ve)){const pe=de.groups;for(let Ce=0,Ie=pe.length;Ce<Ie;Ce++){const Ae=pe[Ce],We=ve[Ae.materialIndex];We&&We.visible&&m.push(x,de,We,k,Ue.z,Ae)}}else ve.visible&&m.push(x,de,ve,k,Ue.z,null)}}const ne=x.children;for(let de=0,ve=ne.length;de<ve;de++)Gr(ne[de],I,k,z)}function ml(x,I,k,z){const U=x.opaque,ne=x.transmissive,de=x.transparent;p.setupLightsView(k),Ze===!0&&ae.setGlobalState(M.clippingPlanes,k),z&&xe.viewport(P.copy(z)),U.length>0&&zs(U,I,k),ne.length>0&&zs(ne,I,k),de.length>0&&zs(de,I,k),xe.buffers.depth.setTest(!0),xe.buffers.depth.setMask(!0),xe.buffers.color.setMask(!0),xe.setPolygonOffset(!1)}function gl(x,I,k,z){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[z.id]===void 0&&(p.state.transmissionRenderTarget[z.id]=new Si(1,1,{generateMipmaps:!0,type:Fe.has("EXT_color_buffer_half_float")||Fe.has("EXT_color_buffer_float")?Us:Tn,minFilter:vi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:je.workingColorSpace}));const ne=p.state.transmissionRenderTarget[z.id],de=z.viewport||P;ne.setSize(de.z*M.transmissionResolutionScale,de.w*M.transmissionResolutionScale);const ve=M.getRenderTarget(),pe=M.getActiveCubeFace(),Ce=M.getActiveMipmapLevel();M.setRenderTarget(ne),M.getClearColor(q),$=M.getClearAlpha(),$<1&&M.setClearColor(16777215,.5),M.clear(),Ye&&ye.render(k);const Ie=M.toneMapping;M.toneMapping=Yn;const Ae=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),p.setupLightsView(z),Ze===!0&&ae.setGlobalState(M.clippingPlanes,z),zs(x,k,z),ze.updateMultisampleRenderTarget(ne),ze.updateRenderTargetMipmap(ne),Fe.has("WEBGL_multisampled_render_to_texture")===!1){let We=!1;for(let Qe=0,mt=I.length;Qe<mt;Qe++){const lt=I[Qe],nt=lt.object,Re=lt.geometry,ht=lt.material,Ke=lt.group;if(ht.side===Un&&nt.layers.test(z.layers)){const $t=ht.side;ht.side=kt,ht.needsUpdate=!0,vl(nt,k,z,Re,ht,Ke),ht.side=$t,ht.needsUpdate=!0,We=!0}}We===!0&&(ze.updateMultisampleRenderTarget(ne),ze.updateRenderTargetMipmap(ne))}M.setRenderTarget(ve,pe,Ce),M.setClearColor(q,$),Ae!==void 0&&(z.viewport=Ae),M.toneMapping=Ie}function zs(x,I,k){const z=I.isScene===!0?I.overrideMaterial:null;for(let U=0,ne=x.length;U<ne;U++){const de=x[U],ve=de.object,pe=de.geometry,Ce=de.group;let Ie=de.material;Ie.allowOverride===!0&&z!==null&&(Ie=z),ve.layers.test(k.layers)&&vl(ve,I,k,pe,Ie,Ce)}}function vl(x,I,k,z,U,ne){x.onBeforeRender(M,I,k,z,U,ne),x.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),U.onBeforeRender(M,I,k,z,x,ne),U.transparent===!0&&U.side===Un&&U.forceSinglePass===!1?(U.side=kt,U.needsUpdate=!0,M.renderBufferDirect(k,I,z,U,x,ne),U.side=Kn,U.needsUpdate=!0,M.renderBufferDirect(k,I,z,U,x,ne),U.side=Un):M.renderBufferDirect(k,I,z,U,x,ne),x.onAfterRender(M,I,k,z,U,ne)}function Hs(x,I,k){I.isScene!==!0&&(I=Te);const z=Me.get(x),U=p.state.lights,ne=p.state.shadowsArray,de=U.state.version,ve=W.getParameters(x,U.state,ne,I,k),pe=W.getProgramCacheKey(ve);let Ce=z.programs;z.environment=x.isMeshStandardMaterial?I.environment:null,z.fog=I.fog,z.envMap=(x.isMeshStandardMaterial?xt:Tt).get(x.envMap||z.environment),z.envMapRotation=z.environment!==null&&x.envMap===null?I.environmentRotation:x.envMapRotation,Ce===void 0&&(x.addEventListener("dispose",K),Ce=new Map,z.programs=Ce);let Ie=Ce.get(pe);if(Ie!==void 0){if(z.currentProgram===Ie&&z.lightsStateVersion===de)return xl(x,ve),Ie}else ve.uniforms=W.getUniforms(x),x.onBeforeCompile(ve,M),Ie=W.acquireProgram(ve,pe),Ce.set(pe,Ie),z.uniforms=ve.uniforms;const Ae=z.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(Ae.clippingPlanes=ae.uniform),xl(x,ve),z.needsLights=id(x),z.lightsStateVersion=de,z.needsLights&&(Ae.ambientLightColor.value=U.state.ambient,Ae.lightProbe.value=U.state.probe,Ae.directionalLights.value=U.state.directional,Ae.directionalLightShadows.value=U.state.directionalShadow,Ae.spotLights.value=U.state.spot,Ae.spotLightShadows.value=U.state.spotShadow,Ae.rectAreaLights.value=U.state.rectArea,Ae.ltc_1.value=U.state.rectAreaLTC1,Ae.ltc_2.value=U.state.rectAreaLTC2,Ae.pointLights.value=U.state.point,Ae.pointLightShadows.value=U.state.pointShadow,Ae.hemisphereLights.value=U.state.hemi,Ae.directionalShadowMap.value=U.state.directionalShadowMap,Ae.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Ae.spotShadowMap.value=U.state.spotShadowMap,Ae.spotLightMatrix.value=U.state.spotLightMatrix,Ae.spotLightMap.value=U.state.spotLightMap,Ae.pointShadowMap.value=U.state.pointShadowMap,Ae.pointShadowMatrix.value=U.state.pointShadowMatrix),z.currentProgram=Ie,z.uniformsList=null,Ie}function _l(x){if(x.uniformsList===null){const I=x.currentProgram.getUniforms();x.uniformsList=wr.seqWithValue(I.seq,x.uniforms)}return x.uniformsList}function xl(x,I){const k=Me.get(x);k.outputColorSpace=I.outputColorSpace,k.batching=I.batching,k.batchingColor=I.batchingColor,k.instancing=I.instancing,k.instancingColor=I.instancingColor,k.instancingMorph=I.instancingMorph,k.skinning=I.skinning,k.morphTargets=I.morphTargets,k.morphNormals=I.morphNormals,k.morphColors=I.morphColors,k.morphTargetsCount=I.morphTargetsCount,k.numClippingPlanes=I.numClippingPlanes,k.numIntersection=I.numClipIntersection,k.vertexAlphas=I.vertexAlphas,k.vertexTangents=I.vertexTangents,k.toneMapping=I.toneMapping}function td(x,I,k,z,U){I.isScene!==!0&&(I=Te),ze.resetTextureUnits();const ne=I.fog,de=z.isMeshStandardMaterial?I.environment:null,ve=L===null?M.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:es,pe=(z.isMeshStandardMaterial?xt:Tt).get(z.envMap||de),Ce=z.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Ie=!!k.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Ae=!!k.morphAttributes.position,We=!!k.morphAttributes.normal,Qe=!!k.morphAttributes.color;let mt=Yn;z.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(mt=M.toneMapping);const lt=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,nt=lt!==void 0?lt.length:0,Re=Me.get(z),ht=p.state.lights;if(Ze===!0&&(Y===!0||x!==y)){const Ut=x===y&&z.id===b;ae.setState(z,x,Ut)}let Ke=!1;z.version===Re.__version?(Re.needsLights&&Re.lightsStateVersion!==ht.state.version||Re.outputColorSpace!==ve||U.isBatchedMesh&&Re.batching===!1||!U.isBatchedMesh&&Re.batching===!0||U.isBatchedMesh&&Re.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Re.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Re.instancing===!1||!U.isInstancedMesh&&Re.instancing===!0||U.isSkinnedMesh&&Re.skinning===!1||!U.isSkinnedMesh&&Re.skinning===!0||U.isInstancedMesh&&Re.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Re.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Re.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Re.instancingMorph===!1&&U.morphTexture!==null||Re.envMap!==pe||z.fog===!0&&Re.fog!==ne||Re.numClippingPlanes!==void 0&&(Re.numClippingPlanes!==ae.numPlanes||Re.numIntersection!==ae.numIntersection)||Re.vertexAlphas!==Ce||Re.vertexTangents!==Ie||Re.morphTargets!==Ae||Re.morphNormals!==We||Re.morphColors!==Qe||Re.toneMapping!==mt||Re.morphTargetsCount!==nt)&&(Ke=!0):(Ke=!0,Re.__version=z.version);let $t=Re.currentProgram;Ke===!0&&($t=Hs(z,I,U));let bi=!1,Xt=!1,ls=!1;const ft=$t.getUniforms(),Qt=Re.uniforms;if(xe.useProgram($t.program)&&(bi=!0,Xt=!0,ls=!0),z.id!==b&&(b=z.id,Xt=!0),bi||y!==x){xe.buffers.depth.getReversed()&&x.reversedDepth!==!0&&(x._reversedDepth=!0,x.updateProjectionMatrix()),ft.setValue(C,"projectionMatrix",x.projectionMatrix),ft.setValue(C,"viewMatrix",x.matrixWorldInverse);const zt=ft.map.cameraPosition;zt!==void 0&&zt.setValue(C,ge.setFromMatrixPosition(x.matrixWorld)),Le.logarithmicDepthBuffer&&ft.setValue(C,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&ft.setValue(C,"isOrthographic",x.isOrthographicCamera===!0),y!==x&&(y=x,Xt=!0,ls=!0)}if(U.isSkinnedMesh){ft.setOptional(C,U,"bindMatrix"),ft.setOptional(C,U,"bindMatrixInverse");const Ut=U.skeleton;Ut&&(Ut.boneTexture===null&&Ut.computeBoneTexture(),ft.setValue(C,"boneTexture",Ut.boneTexture,ze))}U.isBatchedMesh&&(ft.setOptional(C,U,"batchingTexture"),ft.setValue(C,"batchingTexture",U._matricesTexture,ze),ft.setOptional(C,U,"batchingIdTexture"),ft.setValue(C,"batchingIdTexture",U._indirectTexture,ze),ft.setOptional(C,U,"batchingColorTexture"),U._colorsTexture!==null&&ft.setValue(C,"batchingColorTexture",U._colorsTexture,ze));const en=k.morphAttributes;if((en.position!==void 0||en.normal!==void 0||en.color!==void 0)&&ie.update(U,k,$t),(Xt||Re.receiveShadow!==U.receiveShadow)&&(Re.receiveShadow=U.receiveShadow,ft.setValue(C,"receiveShadow",U.receiveShadow)),z.isMeshGouraudMaterial&&z.envMap!==null&&(Qt.envMap.value=pe,Qt.flipEnvMap.value=pe.isCubeTexture&&pe.isRenderTargetTexture===!1?-1:1),z.isMeshStandardMaterial&&z.envMap===null&&I.environment!==null&&(Qt.envMapIntensity.value=I.environmentIntensity),Xt&&(ft.setValue(C,"toneMappingExposure",M.toneMappingExposure),Re.needsLights&&nd(Qt,ls),ne&&z.fog===!0&&j.refreshFogUniforms(Qt,ne),j.refreshMaterialUniforms(Qt,z,G,Z,p.state.transmissionRenderTarget[x.id]),wr.upload(C,_l(Re),Qt,ze)),z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(wr.upload(C,_l(Re),Qt,ze),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&ft.setValue(C,"center",U.center),ft.setValue(C,"modelViewMatrix",U.modelViewMatrix),ft.setValue(C,"normalMatrix",U.normalMatrix),ft.setValue(C,"modelMatrix",U.matrixWorld),z.isShaderMaterial||z.isRawShaderMaterial){const Ut=z.uniformsGroups;for(let zt=0,Vr=Ut.length;zt<Vr;zt++){const ei=Ut[zt];Oe.update(ei,$t),Oe.bind(ei,$t)}}return $t}function nd(x,I){x.ambientLightColor.needsUpdate=I,x.lightProbe.needsUpdate=I,x.directionalLights.needsUpdate=I,x.directionalLightShadows.needsUpdate=I,x.pointLights.needsUpdate=I,x.pointLightShadows.needsUpdate=I,x.spotLights.needsUpdate=I,x.spotLightShadows.needsUpdate=I,x.rectAreaLights.needsUpdate=I,x.hemisphereLights.needsUpdate=I}function id(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(x,I,k){const z=Me.get(x);z.__autoAllocateDepthBuffer=x.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),Me.get(x.texture).__webglTexture=I,Me.get(x.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:k,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(x,I){const k=Me.get(x);k.__webglFramebuffer=I,k.__useDefaultFramebuffer=I===void 0};const sd=C.createFramebuffer();this.setRenderTarget=function(x,I=0,k=0){L=x,R=I,A=k;let z=!0,U=null,ne=!1,de=!1;if(x){const pe=Me.get(x);if(pe.__useDefaultFramebuffer!==void 0)xe.bindFramebuffer(C.FRAMEBUFFER,null),z=!1;else if(pe.__webglFramebuffer===void 0)ze.setupRenderTarget(x);else if(pe.__hasExternalTextures)ze.rebindTextures(x,Me.get(x.texture).__webglTexture,Me.get(x.depthTexture).__webglTexture);else if(x.depthBuffer){const Ae=x.depthTexture;if(pe.__boundDepthTexture!==Ae){if(Ae!==null&&Me.has(Ae)&&(x.width!==Ae.image.width||x.height!==Ae.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ze.setupDepthRenderbuffer(x)}}const Ce=x.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(de=!0);const Ie=Me.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(Ie[I])?U=Ie[I][k]:U=Ie[I],ne=!0):x.samples>0&&ze.useMultisampledRTT(x)===!1?U=Me.get(x).__webglMultisampledFramebuffer:Array.isArray(Ie)?U=Ie[k]:U=Ie,P.copy(x.viewport),B.copy(x.scissor),H=x.scissorTest}else P.copy(we).multiplyScalar(G).floor(),B.copy(Ge).multiplyScalar(G).floor(),H=at;if(k!==0&&(U=sd),xe.bindFramebuffer(C.FRAMEBUFFER,U)&&z&&xe.drawBuffers(x,U),xe.viewport(P),xe.scissor(B),xe.setScissorTest(H),ne){const pe=Me.get(x.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+I,pe.__webglTexture,k)}else if(de){const pe=I;for(let Ce=0;Ce<x.textures.length;Ce++){const Ie=Me.get(x.textures[Ce]);C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0+Ce,Ie.__webglTexture,k,pe)}}else if(x!==null&&k!==0){const pe=Me.get(x.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,pe.__webglTexture,k)}b=-1},this.readRenderTargetPixels=function(x,I,k,z,U,ne,de,ve=0){if(!(x&&x.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let pe=Me.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&de!==void 0&&(pe=pe[de]),pe){xe.bindFramebuffer(C.FRAMEBUFFER,pe);try{const Ce=x.textures[ve],Ie=Ce.format,Ae=Ce.type;if(!Le.textureFormatReadable(Ie)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Le.textureTypeReadable(Ae)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=x.width-z&&k>=0&&k<=x.height-U&&(x.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+ve),C.readPixels(I,k,z,U,Ee.convert(Ie),Ee.convert(Ae),ne))}finally{const Ce=L!==null?Me.get(L).__webglFramebuffer:null;xe.bindFramebuffer(C.FRAMEBUFFER,Ce)}}},this.readRenderTargetPixelsAsync=async function(x,I,k,z,U,ne,de,ve=0){if(!(x&&x.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let pe=Me.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&de!==void 0&&(pe=pe[de]),pe)if(I>=0&&I<=x.width-z&&k>=0&&k<=x.height-U){xe.bindFramebuffer(C.FRAMEBUFFER,pe);const Ce=x.textures[ve],Ie=Ce.format,Ae=Ce.type;if(!Le.textureFormatReadable(Ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Le.textureTypeReadable(Ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const We=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,We),C.bufferData(C.PIXEL_PACK_BUFFER,ne.byteLength,C.STREAM_READ),x.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+ve),C.readPixels(I,k,z,U,Ee.convert(Ie),Ee.convert(Ae),0);const Qe=L!==null?Me.get(L).__webglFramebuffer:null;xe.bindFramebuffer(C.FRAMEBUFFER,Qe);const mt=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await uh(C,mt,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,We),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,ne),C.deleteBuffer(We),C.deleteSync(mt),ne}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(x,I=null,k=0){const z=Math.pow(2,-k),U=Math.floor(x.image.width*z),ne=Math.floor(x.image.height*z),de=I!==null?I.x:0,ve=I!==null?I.y:0;ze.setTexture2D(x,0),C.copyTexSubImage2D(C.TEXTURE_2D,k,0,0,de,ve,U,ne),xe.unbindTexture()};const rd=C.createFramebuffer(),ad=C.createFramebuffer();this.copyTextureToTexture=function(x,I,k=null,z=null,U=0,ne=null){ne===null&&(U!==0?(Ls("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ne=U,U=0):ne=0);let de,ve,pe,Ce,Ie,Ae,We,Qe,mt;const lt=x.isCompressedTexture?x.mipmaps[ne]:x.image;if(k!==null)de=k.max.x-k.min.x,ve=k.max.y-k.min.y,pe=k.isBox3?k.max.z-k.min.z:1,Ce=k.min.x,Ie=k.min.y,Ae=k.isBox3?k.min.z:0;else{const en=Math.pow(2,-U);de=Math.floor(lt.width*en),ve=Math.floor(lt.height*en),x.isDataArrayTexture?pe=lt.depth:x.isData3DTexture?pe=Math.floor(lt.depth*en):pe=1,Ce=0,Ie=0,Ae=0}z!==null?(We=z.x,Qe=z.y,mt=z.z):(We=0,Qe=0,mt=0);const nt=Ee.convert(I.format),Re=Ee.convert(I.type);let ht;I.isData3DTexture?(ze.setTexture3D(I,0),ht=C.TEXTURE_3D):I.isDataArrayTexture||I.isCompressedArrayTexture?(ze.setTexture2DArray(I,0),ht=C.TEXTURE_2D_ARRAY):(ze.setTexture2D(I,0),ht=C.TEXTURE_2D),C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,I.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,I.unpackAlignment);const Ke=C.getParameter(C.UNPACK_ROW_LENGTH),$t=C.getParameter(C.UNPACK_IMAGE_HEIGHT),bi=C.getParameter(C.UNPACK_SKIP_PIXELS),Xt=C.getParameter(C.UNPACK_SKIP_ROWS),ls=C.getParameter(C.UNPACK_SKIP_IMAGES);C.pixelStorei(C.UNPACK_ROW_LENGTH,lt.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,lt.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Ce),C.pixelStorei(C.UNPACK_SKIP_ROWS,Ie),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Ae);const ft=x.isDataArrayTexture||x.isData3DTexture,Qt=I.isDataArrayTexture||I.isData3DTexture;if(x.isDepthTexture){const en=Me.get(x),Ut=Me.get(I),zt=Me.get(en.__renderTarget),Vr=Me.get(Ut.__renderTarget);xe.bindFramebuffer(C.READ_FRAMEBUFFER,zt.__webglFramebuffer),xe.bindFramebuffer(C.DRAW_FRAMEBUFFER,Vr.__webglFramebuffer);for(let ei=0;ei<pe;ei++)ft&&(C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,Me.get(x).__webglTexture,U,Ae+ei),C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,Me.get(I).__webglTexture,ne,mt+ei)),C.blitFramebuffer(Ce,Ie,de,ve,We,Qe,de,ve,C.DEPTH_BUFFER_BIT,C.NEAREST);xe.bindFramebuffer(C.READ_FRAMEBUFFER,null),xe.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else if(U!==0||x.isRenderTargetTexture||Me.has(x)){const en=Me.get(x),Ut=Me.get(I);xe.bindFramebuffer(C.READ_FRAMEBUFFER,rd),xe.bindFramebuffer(C.DRAW_FRAMEBUFFER,ad);for(let zt=0;zt<pe;zt++)ft?C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,en.__webglTexture,U,Ae+zt):C.framebufferTexture2D(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,en.__webglTexture,U),Qt?C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,Ut.__webglTexture,ne,mt+zt):C.framebufferTexture2D(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,Ut.__webglTexture,ne),U!==0?C.blitFramebuffer(Ce,Ie,de,ve,We,Qe,de,ve,C.COLOR_BUFFER_BIT,C.NEAREST):Qt?C.copyTexSubImage3D(ht,ne,We,Qe,mt+zt,Ce,Ie,de,ve):C.copyTexSubImage2D(ht,ne,We,Qe,Ce,Ie,de,ve);xe.bindFramebuffer(C.READ_FRAMEBUFFER,null),xe.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else Qt?x.isDataTexture||x.isData3DTexture?C.texSubImage3D(ht,ne,We,Qe,mt,de,ve,pe,nt,Re,lt.data):I.isCompressedArrayTexture?C.compressedTexSubImage3D(ht,ne,We,Qe,mt,de,ve,pe,nt,lt.data):C.texSubImage3D(ht,ne,We,Qe,mt,de,ve,pe,nt,Re,lt):x.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,ne,We,Qe,de,ve,nt,Re,lt.data):x.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,ne,We,Qe,lt.width,lt.height,nt,lt.data):C.texSubImage2D(C.TEXTURE_2D,ne,We,Qe,de,ve,nt,Re,lt);C.pixelStorei(C.UNPACK_ROW_LENGTH,Ke),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,$t),C.pixelStorei(C.UNPACK_SKIP_PIXELS,bi),C.pixelStorei(C.UNPACK_SKIP_ROWS,Xt),C.pixelStorei(C.UNPACK_SKIP_IMAGES,ls),ne===0&&I.generateMipmaps&&C.generateMipmap(ht),xe.unbindTexture()},this.initRenderTarget=function(x){Me.get(x).__webglFramebuffer===void 0&&ze.setupRenderTarget(x)},this.initTexture=function(x){x.isCubeTexture?ze.setTextureCube(x,0):x.isData3DTexture?ze.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?ze.setTexture2DArray(x,0):ze.setTexture2D(x,0),xe.unbindTexture()},this.resetState=function(){R=0,A=0,L=null,xe.reset(),ue.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return En}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=je._getDrawingBufferColorSpace(e),t.unpackColorSpace=je._getUnpackColorSpace()}}class U1 extends xu{constructor(){super();const e=new Ft;e.deleteAttribute("uv");const t=new ns({side:kt}),n=new ns,s=new Tu(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);const r=new $e(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const a=new Oh(e,n,6),o=new yt;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);const l=new $e(e,Hi(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);const c=new $e(e,Hi(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);const u=new $e(e,Hi(17));u.position.set(14.904,12.198,-1.832),u.scale.set(.15,4.265,6.331),this.add(u);const d=new $e(e,Hi(43));d.position.set(-.462,8.89,14.52),d.scale.set(4.38,5.441,.088),this.add(d);const h=new $e(e,Hi(20));h.position.set(3.235,11.486,-12.541),h.scale.set(2.5,2,.1),this.add(h);const f=new $e(e,Hi(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function Hi(i){return new Gh({color:0,emissive:16777215,emissiveIntensity:i})}class N1{constructor(e){this.host=e,this.renderer=new I1({antialias:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)),this.renderer.toneMapping=tu,this.renderer.outputColorSpace=Lt,e.appendChild(this.renderer.domElement);const t=new No(this.renderer);this.envMap=t.fromScene(new U1,.04).texture,t.dispose(),new ResizeObserver(()=>this.resize()).observe(e),this.resize(),this.bindPointer();const n=s=>{this.tick(s),requestAnimationFrame(n)};requestAnimationFrame(n),document.addEventListener("visibilitychange",()=>{this.dirty=!0})}host;renderer;camera=new Vt(55,1,.1,4e3);room=null;envMap;dirty=!0;tween=null;look=new N;raycaster=new Kh;hovered=null;reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;onPick=()=>{};perf={frameMs:0,calls:0,triangles:0,frames:0,textures:0,geometries:0};load(e){this.room&&F1(this.room),this.room=e,e.scene.environment=this.envMap,e.scene.environmentIntensity===1&&(e.scene.environmentIntensity=.12),this.setView(e.overview,!0),this.dirty=!0}setView(e,t=!1){t||this.reducedMotion?(this.camera.position.copy(e.pos),this.look.copy(e.look),this.camera.lookAt(this.look),this.tween=null):this.tween={from:this.camera.position.clone(),to:e.pos.clone(),fromLook:this.look.clone(),toLook:e.look.clone(),t0:performance.now(),dur:550},this.dirty=!0}markDirty(){this.dirty=!0}refresh(e){e&&(e.needsUpdate=!0,this.dirty=!0)}setLamp(e,t){const n=this.room?.consoles.get(e);n&&n.lamp.color.getHexString()!==t.replace("#","").toLowerCase()&&(n.lamp.color.set(t),this.dirty=!0)}resize(){const e=this.host.clientWidth||1,t=this.host.clientHeight||1;this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.camera.fov=e/t<1.3?70:55,this.camera.updateProjectionMatrix(),this.dirty=!0}bindPointer(){const e=this.renderer.domElement,t=n=>{if(!this.room)return null;const s=e.getBoundingClientRect(),r=new qe((n.clientX-s.left)/s.width*2-1,-((n.clientY-s.top)/s.height)*2+1);return this.raycaster.setFromCamera(r,this.camera),this.raycaster.intersectObjects([...this.room.consoles.values()].map(o=>o.hit),!1)[0]?.object.userData.console??null};e.addEventListener("pointermove",n=>{const s=t(n);s!==this.hovered&&(this.hovered=s,e.style.cursor=s?"pointer":"default",e.title=s?`${s} console`:"")}),e.addEventListener("click",n=>{const s=t(n);s&&this.onPick(s)})}tick(e){if(!this.room||document.hidden)return;if(this.tween){const s=Math.min(1,(performance.now()-this.tween.t0)/this.tween.dur),r=s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;this.camera.position.lerpVectors(this.tween.from,this.tween.to,r),this.look.lerpVectors(this.tween.fromLook,this.tween.toLook,r),this.camera.lookAt(this.look),s>=1&&(this.tween=null),this.dirty=!0}if(this.room.animate&&!this.reducedMotion&&this.room.animate(e)&&(this.dirty=!0),!this.dirty)return;this.dirty=!1;const t=performance.now();this.renderer.render(this.room.scene,this.camera);const n=this.renderer.info;this.perf={frameMs:performance.now()-t,calls:n.render.calls,triangles:n.render.triangles,frames:this.perf.frames+1,textures:n.memory.textures,geometries:n.memory.geometries}}}function F1(i){i.dispose?.(),i.scene.traverse(e=>{const t=e;t.geometry?.dispose();const n=Array.isArray(t.material)?t.material:t.material?[t.material]:[];for(const s of n){for(const r of Object.values(s))r instanceof Rt&&r.dispose();s.dispose()}})}function O1(i){return i}function B1(i){if(i==null)return O1;var e,t,n=i.scale[0],s=i.scale[1],r=i.translate[0],a=i.translate[1];return function(o,l){l||(e=t=0);var c=2,u=o.length,d=new Array(u);for(d[0]=(e+=o[0])*n+r,d[1]=(t+=o[1])*s+a;c<u;)d[c]=o[c],++c;return d}}function k1(i,e){for(var t,n=i.length,s=n-e;s<--n;)t=i[s],i[s++]=i[n],i[n]=t}function z1(i,e){return typeof e=="string"&&(e=i.objects[e]),e.type==="GeometryCollection"?{type:"FeatureCollection",features:e.geometries.map(function(t){return Cc(i,t)})}:Cc(i,e)}function Cc(i,e){var t=e.id,n=e.bbox,s=e.properties==null?{}:e.properties,r=H1(i,e);return t==null&&n==null?{type:"Feature",properties:s,geometry:r}:n==null?{type:"Feature",id:t,properties:s,geometry:r}:{type:"Feature",id:t,bbox:n,properties:s,geometry:r}}function H1(i,e){var t=B1(i.transform),n=i.arcs;function s(u,d){d.length&&d.pop();for(var h=n[u<0?~u:u],f=0,g=h.length;f<g;++f)d.push(t(h[f],f));u<0&&k1(d,g)}function r(u){return t(u)}function a(u){for(var d=[],h=0,f=u.length;h<f;++h)s(u[h],d);return d.length<2&&d.push(d[0]),d}function o(u){for(var d=a(u);d.length<4;)d.push(d[0]);return d}function l(u){return u.map(o)}function c(u){var d=u.type,h;switch(d){case"GeometryCollection":return{type:d,geometries:u.geometries.map(c)};case"Point":h=r(u.coordinates);break;case"MultiPoint":h=u.coordinates.map(r);break;case"LineString":h=a(u.arcs);break;case"MultiLineString":h=u.arcs.map(a);break;case"Polygon":h=l(u.arcs);break;case"MultiPolygon":h=u.arcs.map(l);break;default:return null}return{type:d,coordinates:h}}return c(e)}const G1={land:{type:"GeometryCollection",geometries:[{type:"MultiPolygon",arcs:[[[0]],[[1]],[[2]],[[3]],[[4]],[[5]],[[6]],[[7]],[[8]],[[9]],[[10]],[[11]],[[12]],[[13]],[[14]],[[15]],[[16,18]],[[19]],[[20]],[[21]],[[22]],[[23]],[[24]],[[25]],[[26]],[[27]],[[28]],[[29]],[[30]],[[31]],[[32]],[[33]],[[34]],[[35]],[[36]],[[37]],[[38]],[[39]],[[40]],[[41]],[[42]],[[43]],[[44]],[[45]],[[46]],[[47]],[[48]],[[49]],[[50]],[[51]],[[52]],[[53]],[[54]],[[55]],[[56]],[[57]],[[58]],[[59]],[[60]],[[61]],[[62]],[[63]],[[64]],[[65]],[[66]],[[67]],[[68]],[[69]],[[70]],[[71]],[[72]],[[73]],[[74]],[[75]],[[76]],[[77]],[[78]],[[79]],[[80]],[[81]],[[82]],[[83]],[[84]],[[85]],[[86]],[[87]],[[88]],[[89]],[[90]],[[91]],[[92,115],[114]],[[94]],[[95]],[[96]],[[97]],[[98]],[[99]],[[100]],[[101]],[[102]],[[103]],[[104]],[[105]],[[106]],[[107]],[[108]],[[109]],[[110]],[[111]],[[112]],[[113]],[[116]],[[117]],[[118]],[[119]],[[120]],[[121]],[[122]],[[123]],[[124]],[[125]],[[126]],[[127]],[[128]],[[129]]]}]}},V1=JSON.parse("[[[33452,3290],[-82,-301],[-81,-266],[-582,81],[-621,-35],[-348,197],[0,23],[-152,174],[625,-23],[599,-58],[207,243],[147,208],[288,-243]],[[5775,3611],[-533,-81],[-364,208],[-163,209],[-11,35],[-180,162],[169,220],[517,-93],[277,-185],[212,-209],[76,-266]],[[37457,4468],[342,-255],[120,-359],[33,-254],[11,-301],[-430,-186],[-452,-150],[-522,-139],[-582,-116],[-658,35],[-365,197],[49,243],[593,162],[239,197],[174,254],[126,220],[168,209],[180,243],[141,0],[414,127],[419,-127]],[[16330,7154],[359,-93],[332,104],[-158,-208],[-261,-151],[-386,47],[-278,208],[60,197],[332,-104]],[[15122,7165],[425,-231],[-164,23],[-359,58],[-381,162],[202,127],[277,-139]],[[22505,8080],[305,-81],[304,69],[163,-335],[-217,46],[-337,-23],[-343,23],[-376,-35],[-283,116],[-146,243],[174,104],[353,-81],[403,-46]],[[30985,8657],[33,-266],[-49,-231],[-76,-220],[-326,-81],[-311,-116],[-364,11],[136,232],[-327,-81],[-310,-81],[-212,174],[-16,243],[305,231],[190,70],[321,-23],[82,301],[16,219],[-6,475],[158,278],[256,93],[147,-220],[65,-220],[120,-267],[92,-254],[76,-267]],[[0,529],[16,-5],[245,344],[501,-185],[32,21],[78,49],[94,61],[81,52],[41,26],[41,-1],[29,-10],[402,-246],[352,246],[63,34],[816,104],[265,-138],[130,-71],[419,-196],[789,-151],[625,-185],[1072,-139],[800,162],[1181,-116],[669,-185],[734,174],[773,162],[60,278],[-1094,23],[-898,139],[-234,231],[-745,128],[49,266],[103,243],[104,220],[-55,243],[-462,162],[-212,209],[-430,185],[675,-35],[642,93],[402,-197],[495,173],[457,220],[223,197],[-98,243],[-359,162],[-408,174],[-571,35],[-500,81],[-539,58],[-180,220],[-359,185],[-217,208],[-87,672],[136,-58],[250,-185],[457,58],[441,81],[228,-255],[441,58],[370,127],[348,162],[315,197],[419,58],[-11,220],[-97,220],[81,208],[359,104],[163,-196],[425,115],[321,151],[397,12],[375,57],[376,139],[299,128],[337,127],[218,-35],[190,-46],[414,81],[370,-104],[381,11],[364,81],[375,-57],[414,-58],[386,23],[403,-12],[413,-11],[381,23],[283,174],[337,92],[349,-127],[331,104],[300,208],[179,-185],[98,-208],[180,-197],[288,174],[332,-220],[375,-70],[321,-162],[392,35],[354,104],[418,-23],[376,-81],[381,-104],[147,254],[-180,197],[-136,209],[-359,46],[-158,220],[-60,220],[-98,440],[213,-81],[364,-35],[359,35],[327,-93],[283,-174],[119,-208],[376,-35],[359,81],[381,116],[342,70],[283,-139],[370,46],[239,451],[224,-266],[321,-104],[348,58],[228,-232],[365,-23],[337,-69],[332,-128],[218,220],[108,209],[278,-232],[381,58],[283,-127],[190,-197],[370,58],[288,127],[283,151],[337,81],[392,69],[354,81],[272,127],[163,186],[65,254],[-32,244],[-87,231],[-98,232],[-87,231],[-71,209],[-16,231],[27,232],[130,220],[109,243],[44,231],[-55,255],[-32,232],[136,266],[152,173],[180,220],[190,186],[223,173],[109,255],[152,162],[174,151],[267,34],[174,186],[196,115],[228,70],[202,150],[157,186],[218,69],[163,-151],[-103,-196],[-283,-174],[-120,-127],[-206,92],[-229,-58],[-190,-139],[-202,-150],[-136,-174],[-38,-231],[17,-220],[130,-197],[-190,-139],[-261,-46],[-153,-197],[-163,-185],[-174,-255],[-44,-220],[98,-243],[147,-185],[229,-139],[212,-185],[114,-232],[60,-220],[82,-232],[130,-196],[82,-220],[38,-544],[81,-220],[22,-232],[87,-231],[-38,-313],[-152,-243],[-163,-197],[-370,-81],[-125,-208],[-169,-197],[-419,-220],[-370,-93],[-348,-127],[-376,-128],[-223,-243],[-446,-23],[-489,23],[-441,-46],[-468,0],[87,-232],[424,-104],[311,-162],[174,-208],[-310,-185],[-479,58],[-397,-151],[-17,-243],[-11,-232],[327,-196],[60,-220],[353,-220],[588,-93],[500,-162],[398,-185],[506,-186],[690,-92],[681,-162],[473,-174],[517,-197],[272,-278],[136,-220],[337,209],[457,173],[484,186],[577,150],[495,162],[691,12],[680,-81],[560,-139],[180,255],[386,173],[702,12],[550,127],[522,128],[577,81],[614,104],[430,150],[-196,209],[-119,208],[0,220],[-539,-23],[-571,-93],[-544,0],[-77,220],[39,440],[125,128],[397,138],[468,139],[337,174],[337,174],[251,231],[380,104],[376,81],[190,47],[430,23],[408,81],[343,116],[337,139],[305,139],[386,185],[245,197],[261,173],[82,232],[-294,139],[98,243],[185,185],[288,116],[305,139],[283,185],[217,232],[136,277],[202,163],[331,-35],[136,-197],[332,-23],[11,220],[142,231],[299,-58],[71,-220],[331,-34],[360,104],[348,69],[315,-34],[120,-243],[305,196],[283,105],[315,81],[310,81],[283,139],[310,92],[240,128],[168,208],[207,-151],[288,81],[202,-277],[157,-209],[316,116],[125,232],[283,162],[365,-35],[108,-220],[229,220],[299,69],[326,23],[294,-11],[310,-70],[300,-34],[130,-197],[180,-174],[304,104],[327,24],[315,0],[310,11],[278,81],[294,70],[245,162],[261,104],[283,58],[212,162],[152,324],[158,197],[288,-93],[109,-208],[239,-139],[289,46],[196,-208],[206,-151],[283,139],[98,255],[250,104],[289,197],[272,81],[326,116],[218,127],[228,139],[218,127],[261,-69],[250,208],[180,162],[261,-11],[229,139],[54,208],[234,162],[228,116],[278,93],[256,46],[244,-35],[262,-58],[223,-162],[27,-254],[245,-197],[168,-162],[332,-70],[185,-162],[229,-162],[266,-35],[223,116],[240,243],[261,-127],[272,-70],[261,-69],[272,-46],[277,0],[229,-614],[-11,-150],[-33,-267],[-266,-150],[-218,-220],[38,-232],[310,12],[-38,-232],[-141,-220],[-131,-243],[212,-185],[321,-58],[321,104],[153,232],[92,220],[153,185],[174,174],[70,208],[147,289],[174,58],[316,24],[277,69],[283,93],[136,231],[82,220],[190,220],[272,151],[234,115],[153,197],[157,104],[202,93],[277,-58],[250,58],[272,69],[305,-34],[201,162],[142,393],[103,-162],[131,-278],[234,-115],[266,-47],[267,70],[283,-46],[261,-12],[174,58],[234,-35],[212,-127],[250,81],[300,0],[255,81],[289,-81],[185,197],[141,196],[191,163],[348,439],[179,-81],[212,-162],[185,-208],[354,-359],[272,-12],[256,0],[299,70],[299,81],[229,162],[190,174],[310,23],[207,127],[218,-116],[141,-185],[196,-185],[305,23],[190,-150],[332,-151],[348,-58],[288,47],[218,185],[185,185],[250,46],[251,-81],[288,-58],[261,93],[250,0],[245,-58],[256,-58],[250,104],[299,93],[283,23],[316,0],[255,58],[251,46],[76,290],[11,243],[174,-162],[49,-266],[92,-244],[115,-196],[234,-105],[315,35],[365,12],[250,35],[364,0],[262,11],[364,-23],[310,-46],[196,-186],[-54,-220],[179,-173],[299,-139],[310,-151],[360,-104],[375,-92],[283,-93],[315,-12],[180,197],[245,-162],[212,-185],[245,-139],[337,-58],[321,-69],[136,-232],[316,-139],[212,-208],[310,-93],[321,12],[299,-35],[332,12],[332,-47],[310,-81],[288,-139],[289,-116],[195,-173],[-32,-232],[-147,-208],[-125,-266],[-98,-209],[-131,-243],[-364,-93],[-163,-208],[-360,-127],[-125,-232],[-190,-220],[-201,-185],[-115,-243],[-70,-220],[-28,-266],[6,-220],[158,-232],[60,-220],[130,-208],[517,-81],[109,-255],[-501,-93],[-424,-127],[-528,-23],[-234,-336],[-49,-278],[-119,-220],[-147,-220],[370,-196],[141,-244],[239,-219],[338,-197],[386,-186],[419,-185],[636,-185],[142,-289],[800,-128],[53,-45],[208,-175],[767,151],[636,-186],[-99520,-142]],[[31180,18764],[361,-355],[389,-147],[-125,-296],[-264,-29],[-141,208],[-92,-239],[-238,-183],[-301,67],[-202,177],[-291,86],[-350,330],[-283,317],[-383,662],[229,-124],[390,-395],[369,-212],[143,271],[90,405],[256,244],[198,-70],[106,-274],[139,-443]],[[33736,20389],[222,-266],[-83,-207],[-375,-177],[-125,207],[-236,-266],[-139,266],[333,354],[236,-148],[167,237]],[[69522,21210],[-427,-38],[-7,314],[41,244],[19,121],[179,-186],[263,-74],[9,-112],[-77,-269]],[[90387,26479],[269,-204],[151,81],[217,113],[166,-39],[20,-702],[-95,-203],[-29,-476],[-97,162],[-193,-412],[-57,32],[-171,19],[-171,505],[-38,390],[-160,515],[7,271],[181,-52]],[[98060,26404],[63,-244],[198,239],[80,-249],[0,-249],[-103,-274],[-182,-435],[-142,-238],[103,-284],[-214,-7],[-238,-223],[-75,-387],[-157,-597],[-219,-264],[-138,-169],[-256,13],[-180,194],[-302,42],[-46,217],[149,438],[349,583],[179,111],[200,225],[238,310],[167,306],[123,441],[106,149],[41,330],[195,273],[61,-251]],[[98502,29218],[202,-622],[5,403],[126,-161],[41,-447],[224,-192],[188,-48],[158,226],[141,-69],[-67,-524],[-85,-345],[-212,12],[-74,-179],[26,-254],[-41,-110],[-105,-319],[-138,-404],[-214,-236],[-48,155],[-116,85],[160,486],[-91,326],[-299,236],[8,214],[201,206],[47,455],[-13,382],[-113,396],[8,104],[-133,244],[-218,523],[-117,418],[104,46],[151,-328],[216,-153],[78,-526]],[[96421,37487],[-105,-142],[-153,160],[-199,266],[-179,313],[-184,416],[-38,201],[119,-9],[156,-201],[122,-200],[89,-166],[228,-366],[144,-272]],[[99547,40335],[96,-171],[-46,-308],[-172,-81],[-153,73],[-27,260],[107,203],[126,-74],[69,98]],[[0,40798],[99822,-145],[-177,-124],[-36,220],[139,121],[88,33],[-99836,184]],[[0,41087],[0,-289]],[[0,41087],[57,27],[-34,-284],[-23,-32]],[[96623,40851],[-92,-78],[-93,259],[10,158],[175,-339]],[[96418,41756],[45,-476],[-75,74],[-58,-32],[-39,163],[-6,453],[133,-182]],[[63904,42571],[45,-711],[72,-276],[-28,-284],[-49,-174],[-94,347],[-53,-175],[53,-438],[-24,-250],[-77,-137],[-18,-500],[-109,-689],[-137,-814],[-172,-1120],[-106,-821],[-125,-685],[-226,-140],[-243,-250],[-160,151],[-220,211],[-77,312],[-18,524],[-98,471],[-26,425],[50,426],[128,102],[1,197],[133,447],[25,377],[-65,280],[-52,372],[-23,544],[97,331],[38,375],[138,22],[155,121],[103,107],[122,7],[158,337],[229,364],[83,297],[-38,253],[118,-71],[153,410],[6,356],[92,264],[96,-254],[74,-251],[69,-390]],[[89877,42448],[100,-464],[179,223],[92,-250],[133,-231],[-29,-262],[60,-506],[42,-295],[70,-72],[75,-505],[-27,-307],[90,-400],[301,-309],[197,-281],[186,-257],[-37,-143],[159,-371],[108,-639],[111,130],[113,-256],[68,91],[48,-626],[197,-363],[129,-226],[217,-478],[78,-475],[7,-337],[-19,-365],[132,-502],[-16,-523],[-48,-274],[-75,-527],[6,-339],[-55,-423],[-123,-538],[-205,-290],[-102,-458],[-93,-292],[-82,-510],[-107,-294],[-70,-442],[-36,-407],[14,-187],[-159,-205],[-311,-22],[-257,-242],[-127,-229],[-168,-254],[-230,262],[-170,104],[43,308],[-152,-112],[-243,-428],[-240,160],[-158,94],[-159,42],[-269,171],[-179,364],[-52,449],[-64,298],[-137,240],[-267,71],[91,287],[-67,438],[-136,-408],[-247,-109],[146,327],[42,341],[107,289],[-22,438],[-226,-504],[-174,-202],[-106,-470],[-217,243],[9,313],[-174,429],[-147,221],[52,137],[-356,358],[-195,17],[-267,287],[-498,-56],[-359,-211],[-317,-197],[-265,39],[-294,-303],[-241,-137],[-53,-309],[-103,-240],[-236,-15],[-174,-52],[-246,107],[-199,-64],[-191,-27],[-165,-315],[-81,26],[-140,-167],[-133,-187],[-203,23],[-186,0],[-295,377],[-149,113],[6,338],[138,81],[47,134],[-10,212],[34,411],[-31,350],[-147,598],[-45,337],[12,336],[-111,385],[-7,174],[-123,235],[-35,463],[-158,467],[-39,252],[122,-255],[-93,548],[137,-171],[83,-229],[-5,303],[-138,465],[-26,186],[-65,177],[31,341],[56,146],[38,295],[-29,346],[114,425],[21,-450],[118,406],[225,198],[136,252],[212,217],[126,46],[77,-73],[219,220],[168,66],[42,129],[74,54],[153,-14],[292,173],[151,262],[71,316],[163,300],[13,236],[7,321],[194,502],[117,-510],[119,118],[-99,279],[87,287],[122,-128],[34,449],[152,291],[67,233],[140,101],[4,165],[122,-69],[5,148],[122,85],[134,80],[205,-271],[155,-350],[173,-4],[177,-56],[-59,325],[133,473],[126,155],[-44,147],[121,338],[168,208],[142,-70],[234,111],[-5,302],[-204,195],[148,86],[184,-147],[148,-242],[234,-151],[79,60],[172,-182],[162,169],[105,-51],[65,113],[127,-292],[-74,-316],[-105,-239],[-96,-20],[32,-236],[-81,-295],[-99,-291],[20,-166],[221,-327],[214,-189],[143,-204],[201,-350],[78,1],[145,-151],[43,-183],[265,-200],[183,202],[55,317],[56,262],[34,324],[85,470],[-39,286],[20,171],[-32,339],[37,445],[53,120],[-43,197],[67,313],[52,325],[7,168],[104,222],[78,-289],[19,-371],[70,-71],[11,-249],[101,-300],[21,-335],[-10,-214]],[[95032,44386],[78,-203],[-194,4],[-106,363],[166,-142],[56,-22]],[[83531,44530],[-117,-11],[-368,414],[259,116],[146,-180],[97,-180],[-17,-159]],[[94680,44747],[-108,-14],[-170,60],[-58,91],[17,235],[183,-93],[91,-124],[45,-155]],[[94910,44908],[-42,-109],[-206,512],[-57,353],[94,0],[100,-473],[111,-283]],[[84565,44589],[-238,-130],[-33,71],[25,201],[119,360],[275,235],[32,139],[239,133],[194,20],[87,74],[105,-74],[-102,-160],[-289,-258],[-233,-170],[-181,-441]],[[82749,45797],[100,-158],[172,48],[69,-251],[-321,-119],[-193,-79],[-149,5],[95,340],[153,5],[74,209]],[[84139,45797],[-41,-328],[-417,-168],[-370,73],[0,216],[220,123],[174,-177],[185,45],[249,216]],[[94409,45654],[12,-119],[-218,251],[-152,212],[-104,197],[41,60],[128,-142],[228,-272],[65,-187]],[[93760,46238],[-56,-33],[-121,134],[-114,243],[14,99],[166,-250],[111,-193]],[[80172,46575],[533,-59],[61,244],[515,-284],[101,-383],[417,-108],[341,-351],[-317,-225],[-306,238],[-251,-16],[-288,44],[-260,106],[-322,225],[-204,59],[-116,-74],[-506,243],[-48,254],[-255,44],[191,564],[337,-35],[224,-231],[115,-45],[38,-210]],[[87423,46908],[-143,-402],[-27,445],[49,212],[58,200],[63,-173],[0,-282]],[[93299,46550],[-78,-59],[-120,227],[-122,375],[-59,450],[38,57],[30,-175],[84,-134],[135,-375],[131,-200],[-39,-166]],[[92217,47343],[-146,-48],[-44,-166],[-152,-144],[-142,-138],[-148,1],[-228,171],[-158,165],[23,183],[249,-86],[152,46],[42,283],[40,15],[27,-314],[158,45],[78,202],[155,211],[-30,348],[166,11],[56,-97],[-5,-327],[-93,-361]],[[85346,48536],[-104,-196],[-192,108],[-54,254],[281,29],[69,-195]],[[86241,48752],[101,-452],[-234,244],[-232,49],[-157,-39],[-192,21],[65,325],[344,24],[305,-172]],[[92538,47921],[-87,-157],[-52,348],[-65,229],[-126,193],[-158,252],[-200,174],[77,143],[150,-166],[94,-130],[117,-142],[111,-248],[106,-189],[33,-307]],[[87261,49899],[78,-955],[287,-354],[232,627],[319,356],[247,1],[238,-206],[206,-212],[298,-113],[482,-407],[513,-338],[192,-302],[154,-297],[43,-349],[462,-365],[68,-313],[-256,-64],[62,-393],[248,-388],[180,-627],[159,20],[-11,-262],[215,-100],[-84,-111],[295,-249],[-30,-171],[-184,-41],[-69,153],[-238,66],[-281,89],[-216,377],[-158,325],[-144,517],[-362,259],[-235,-169],[-170,-195],[35,-436],[-218,-203],[-155,99],[-288,25],[-247,485],[-282,118],[-69,-168],[-352,-18],[118,481],[175,164],[-72,642],[-134,496],[-538,500],[-229,50],[-417,546],[-82,-287],[-107,-52],[-63,216],[-1,257],[-212,290],[299,213],[198,-11],[-23,156],[-407,1],[-110,352],[-248,109],[-117,293],[374,143],[142,192],[446,-242],[44,-220]],[[84788,51419],[-223,-587],[-209,-113],[-267,115],[-463,-29],[-243,-85],[-39,-447],[248,-526],[150,268],[518,201],[-22,-272],[-121,86],[-121,-347],[-245,-229],[263,-757],[-50,-203],[249,-682],[-2,-388],[-148,-173],[-109,207],[134,484],[-273,-229],[-69,164],[36,228],[-200,346],[21,576],[-186,-179],[24,-689],[11,-846],[-176,-85],[-119,173],[79,544],[-43,570],[-117,4],[-86,405],[115,387],[40,469],[139,891],[58,243],[237,439],[217,-174],[350,-82],[319,25],[275,429],[48,-132]],[[85746,51249],[-15,-517],[-143,58],[-42,-359],[114,-312],[-78,-71],[-112,374],[-82,755],[56,472],[92,215],[20,-322],[164,-52],[26,-241]],[[79393,47122],[-308,-12],[-234,494],[-356,482],[-119,358],[-210,481],[-138,443],[-212,827],[-244,493],[-81,508],[-103,461],[-250,372],[-145,506],[-209,330],[-290,652],[-24,300],[178,-24],[430,-114],[246,-577],[215,-401],[153,-246],[263,-635],[283,-9],[233,-405],[161,-495],[211,-270],[-111,-482],[159,-205],[100,-15],[47,-412],[97,-330],[204,-52],[135,-374],[-70,-735],[-11,-914]],[[82742,51659],[312,-546],[-329,-70],[-93,-403],[12,-535],[-267,-404],[-7,-589],[-107,-903],[-41,210],[-316,-266],[-110,361],[-198,34],[-139,189],[-330,-212],[-101,285],[-182,-32],[-229,68],[-43,793],[-138,164],[-134,505],[-38,517],[32,548],[165,392],[204,-202],[214,110],[56,500],[119,112],[333,128],[199,467],[137,374],[110,221],[236,323],[214,411],[140,462],[112,2],[143,-299],[13,-257],[183,-165],[231,-177],[-20,-232],[-186,-29],[50,-289],[-205,-201],[-158,-533],[204,-560],[-48,-272]],[[85104,55551],[28,-392],[16,-332],[-94,-540],[-102,602],[-130,-300],[89,-435],[-79,-277],[-327,343],[-78,428],[84,280],[-176,280],[-87,-245],[-131,23],[-205,-330],[-46,173],[109,498],[175,166],[151,223],[98,-268],[212,162],[45,264],[196,15],[-16,457],[225,-280],[23,-297],[20,-218]],[[72560,54241],[-242,-135],[-132,470],[-49,849],[126,959],[192,-328],[129,-416],[134,-616],[-42,-615],[-116,-168]],[[33073,56553],[-232,-65],[-50,53],[81,163],[-6,233],[160,77],[58,-21],[-11,-440]],[[84439,56653],[-100,-195],[-87,-373],[-87,-175],[-171,409],[57,158],[70,165],[30,367],[153,35],[-44,-398],[205,570],[-26,-563]],[[82917,56084],[-369,-561],[136,414],[200,364],[167,409],[146,587],[49,-482],[-183,-325],[-146,-406]],[[83856,57606],[166,-183],[177,1],[-5,-247],[-129,-251],[-176,-178],[-10,275],[20,301],[-43,282]],[[84861,57766],[78,-660],[-214,157],[5,-199],[68,-364],[-132,-133],[-11,416],[-84,31],[-43,357],[163,-47],[-4,224],[-169,451],[266,-13],[77,-220]],[[83757,58301],[-74,-510],[-119,295],[-142,450],[238,-22],[97,-213]],[[83700,61512],[171,-168],[85,153],[26,-150],[-46,-245],[95,-423],[-73,-491],[-164,-196],[-43,-476],[62,-471],[147,-65],[123,70],[347,-328],[-27,-321],[91,-142],[-29,-272],[-216,290],[-103,310],[-71,-217],[-177,354],[-253,-87],[-138,130],[14,244],[87,151],[-83,136],[-36,-213],[-137,340],[-41,257],[-11,566],[112,-195],[29,925],[90,535],[169,-1]],[[31780,61349],[-71,-149],[-209,4],[-163,-21],[-16,253],[40,86],[227,-3],[142,-52],[50,-118]],[[28638,61137],[-84,-99],[-156,95],[-159,215],[34,135],[116,41],[64,-20],[187,-53],[147,-142],[46,-161],[-195,-11]],[[29839,62320],[241,-93],[34,101],[217,-3],[165,-152],[73,15],[50,-209],[152,11],[-9,-176],[124,-21],[136,-217],[-103,-240],[-132,128],[-127,-25],[-92,28],[-50,-107],[-106,-37],[-43,144],[-92,-85],[-111,-405],[-71,94],[-14,170],[-185,100],[-131,-41],[-169,43],[-130,-110],[-149,184],[24,190],[256,-82],[210,-47],[100,131],[-127,256],[2,226],[-175,92],[62,163],[170,-26]],[[80649,61615],[-240,-284],[-228,183],[-8,509],[137,267],[304,166],[159,-14],[62,-226],[-122,-260],[-64,-341]],[[6794,61855],[-41,-99],[-69,84],[8,165],[-46,216],[14,65],[48,97],[-19,116],[16,55],[21,-11],[107,-100],[49,-51],[45,-79],[71,-207],[-7,-33],[-108,-126],[-89,-92]],[[6645,62777],[-94,-43],[-47,125],[-32,48],[-3,37],[27,50],[99,-56],[73,-90],[-23,-71]],[[6456,63091],[-9,-63],[-149,17],[21,72],[137,-26]],[[6207,63177],[-15,-34],[-19,8],[-97,21],[-35,133],[-11,24],[74,82],[23,-38],[80,-196]],[[5737,63567],[-33,-58],[-93,107],[14,43],[43,58],[64,-12],[5,-138]],[[27867,64030],[110,-216],[260,66],[98,-138],[235,-366],[173,-267],[92,8],[165,-120],[-20,-167],[205,-24],[210,-242],[-33,-138],[-185,-75],[-187,-29],[-191,46],[-398,-57],[186,329],[-113,154],[-179,39],[-96,171],[-66,336],[-157,-23],[-259,159],[-83,124],[-362,91],[-97,115],[104,148],[-273,30],[-199,-307],[-115,-8],[-40,-144],[-138,-65],[-118,56],[146,183],[60,213],[126,131],[142,116],[210,56],[67,65],[240,-42],[219,-7],[261,-201]],[[28462,64617],[-68,-29],[-70,340],[-104,171],[60,375],[84,-23],[97,-491],[1,-343]],[[83659,64045],[-119,-485],[-146,499],[-32,438],[163,581],[223,447],[127,-176],[-49,-357],[-167,-947]],[[28383,66284],[-303,-95],[-19,219],[130,47],[184,-18],[8,-153]],[[28611,66290],[-48,-420],[-51,75],[4,309],[-124,234],[-1,67],[220,-265]],[[87399,70756],[35,-203],[-156,-357],[-114,189],[-143,-137],[-73,-346],[-181,168],[2,281],[154,352],[158,-68],[114,248],[204,-127]],[[59604,71655],[-188,-251],[21,-111],[8,-48],[-285,-240],[-136,77],[-64,237],[132,22],[19,3],[40,143],[200,-8],[253,176]],[[56583,71675],[152,-199],[216,34],[207,-42],[-7,-103],[151,71],[-35,-175],[-400,-50],[3,98],[-339,115],[52,251]],[[54311,73167],[-100,-465],[41,-183],[-58,-303],[-213,222],[-141,64],[-387,300],[38,304],[325,-54],[284,64],[211,51]],[[52558,74927],[166,-419],[-39,-782],[-126,38],[-113,-197],[-105,156],[-11,713],[-64,338],[153,-30],[139,183]],[[89159,72524],[-104,-472],[48,-296],[-145,-416],[-355,-278],[-488,-36],[-396,-675],[-186,227],[-12,442],[-483,-130],[-329,-279],[-325,-11],[282,-435],[-186,-1004],[-179,-248],[-135,229],[69,533],[-176,172],[-113,405],[263,182],[145,371],[280,306],[203,403],[553,177],[297,-121],[291,1050],[185,-282],[408,591],[158,229],[174,723],[-47,664],[117,374],[295,108],[152,-819],[-9,-479],[-256,-595],[4,-610]],[[52655,75484],[-92,-456],[-126,120],[-64,398],[56,219],[179,226],[47,-507]],[[89974,76679],[195,-126],[197,250],[62,-663],[-412,-162],[-244,-587],[-436,404],[-152,-646],[-308,-9],[-39,587],[138,455],[296,33],[81,817],[83,460],[326,-615],[213,-198]],[[32315,78082],[202,-79],[257,16],[-137,-242],[-102,-38],[-353,250],[-69,198],[105,183],[97,-288]],[[32831,79592],[-135,-11],[-360,186],[-258,279],[96,49],[365,-148],[284,-247],[8,-108]],[[15692,79240],[-140,-82],[-456,269],[-84,209],[-248,207],[-50,168],[-286,107],[-107,321],[24,137],[291,-129],[171,-89],[261,-63],[94,-204],[138,-280],[277,-244],[115,-327]],[[34407,80527],[-184,-517],[181,199],[187,-126],[-98,-206],[247,-162],[128,144],[277,-182],[-86,-433],[194,101],[36,-313],[86,-367],[-117,-520],[-125,-22],[-183,111],[60,484],[-77,75],[-322,-513],[-166,21],[196,277],[-267,144],[-298,-35],[-539,18],[-43,175],[173,208],[-121,160],[234,356],[287,941],[172,336],[241,204],[129,-26],[-54,-160],[-148,-372]],[[13136,82508],[267,47],[-84,-671],[242,-475],[-111,1],[-167,270],[-103,272],[-140,184],[-51,260],[16,188],[131,-76]],[[89901,80562],[280,-1046],[-411,195],[-171,-854],[271,-605],[-8,-413],[-211,356],[-182,-457],[-51,496],[31,575],[-32,638],[64,446],[13,790],[-163,581],[24,808],[257,271],[-110,274],[123,83],[73,-391],[96,-569],[-7,-581],[114,-597]],[[48114,81456],[-493,-349],[-393,89],[225,617],[-145,601],[378,463],[210,276],[233,24],[298,-365],[-149,-406],[46,-422],[-210,-528]],[[53524,83435],[-166,-478],[-291,333],[-39,246],[408,195],[88,-296]],[[7498,84325],[-277,-225],[-142,152],[-43,277],[252,210],[148,90],[185,-40],[117,-183],[-240,-281]],[[49165,85222],[-297,-639],[283,81],[304,-3],[-72,-481],[-250,-530],[287,-38],[270,-759],[190,-95],[171,-673],[79,-233],[337,-113],[-34,-378],[-142,-173],[111,-305],[-250,-310],[-371,6],[-473,-163],[-130,116],[-183,-276],[-257,67],[-195,-226],[-148,118],[407,621],[249,127],[-436,99],[-79,235],[291,183],[-152,319],[52,387],[414,-54],[40,343],[-190,372],[-337,104],[-66,160],[101,264],[-92,163],[-149,-279],[-17,569],[-140,301],[101,611],[216,480],[222,-47],[335,49]],[[4006,85976],[-171,-92],[-182,110],[-168,161],[274,101],[220,-54],[27,-226]],[[27981,87304],[-108,-310],[-123,50],[-73,176],[13,41],[107,177],[114,-13],[70,-121]],[[27250,87631],[-325,-326],[-196,13],[-61,160],[207,273],[381,-6],[-6,-114]],[[2297,88264],[171,-113],[173,61],[225,-156],[276,-79],[-23,-64],[-211,-125],[-211,128],[-106,107],[-245,-34],[-66,52],[17,223]],[[26344,89371],[51,-259],[143,91],[161,-155],[304,-203],[318,-184],[25,-281],[204,46],[199,-196],[-247,-186],[-432,142],[-156,266],[-275,-314],[-396,-306],[-95,346],[-377,-57],[242,292],[35,465],[95,542],[201,-49]],[[45969,89843],[-64,-382],[314,-403],[-361,-451],[-801,-405],[-240,-107],[-365,87],[-775,187],[273,261],[-605,289],[492,114],[-12,174],[-583,137],[188,385],[421,87],[433,-400],[422,321],[349,-167],[453,315],[461,-42]],[[28926,90253],[-312,-30],[-69,289],[118,331],[255,82],[217,-163],[3,-253],[-32,-82],[-180,-174]],[[0,91325],[681,-451],[728,-588],[-24,-367],[187,-147],[-64,429],[754,-88],[544,-553],[-276,-257],[-455,-61],[-7,-578],[-111,-122],[-260,17],[-212,206],[-369,172],[-62,257],[-283,96],[-315,-76],[-151,207],[60,219],[-333,-140],[126,-278],[-158,-251]],[[0,88971],[0,2354]],[[23431,91410],[-173,-207],[-374,179],[-226,-65],[-380,266],[245,183],[194,256],[295,-168],[166,-106],[84,-112],[169,-226]],[[0,92833],[99999,-404],[-305,-30],[-49,187],[-99645,247]],[[0,92833],[36,24],[235,-1],[402,-169],[-24,-81],[-286,-141],[-363,-36],[0,404]],[[24848,91640],[-1,-604],[371,463],[332,-380],[-83,-438],[269,-399],[290,427],[202,510],[16,648],[394,-45],[411,-87],[373,-293],[17,-293],[-207,-315],[196,-316],[-36,-288],[-544,-413],[-386,-91],[-287,178],[-83,-297],[-268,-498],[-81,-258],[-322,-400],[-397,-39],[-220,-250],[-18,-384],[-323,-74],[-340,-479],[-301,-665],[-108,-466],[-15,-686],[408,-99],[125,-553],[130,-448],[388,117],[517,-256],[277,-225],[199,-279],[348,-162],[294,-249],[459,-34],[302,-58],[-45,-511],[86,-594],[201,-661],[414,-561],[214,192],[150,607],[-145,934],[-196,311],[445,276],[314,415],[154,411],[-22,395],[-189,502],[-338,445],[328,619],[-121,535],[-93,922],[194,137],[476,-161],[286,-57],[230,155],[258,-200],[342,-343],[85,-229],[495,-45],[-8,-496],[92,-747],[254,-92],[201,-348],[402,328],[266,652],[184,274],[216,-527],[362,-754],[307,-709],[-112,-371],[370,-333],[250,-338],[442,-152],[179,-189],[110,-500],[216,-78],[112,-223],[20,-664],[-202,-222],[-199,-207],[-458,-210],[-349,-486],[-470,-96],[-594,125],[-417,4],[-287,-41],[-233,-424],[-354,-262],[-401,-782],[-320,-545],[236,97],[446,776],[583,493],[416,59],[245,-290],[-262,-397],[88,-637],[91,-446],[361,-295],[459,86],[278,664],[19,-429],[180,-214],[-344,-387],[-615,-351],[-276,-239],[-310,-426],[-211,44],[-11,500],[483,488],[-445,-19],[-309,-72],[48,-194],[-296,-286],[-286,-204],[-293,-175],[-159,-386],[-35,-98],[-3,-313],[92,-313],[115,-15],[-29,216],[83,-131],[-22,-169],[-188,-96],[-133,12],[-205,-104],[-121,-29],[-162,-29],[-231,-171],[408,111],[82,-112],[-389,-177],[-177,-1],[8,72],[-84,-164],[82,-27],[-60,-424],[-203,-455],[-20,152],[-61,31],[-91,147],[57,-318],[66,-106],[8,-222],[-89,-230],[-157,-472],[-25,24],[86,402],[-142,226],[-33,490],[-53,-255],[59,-375],[-175,88],[183,-186],[12,-562],[79,-41],[29,-204],[39,-591],[-176,-439],[-288,-175],[-182,-346],[-139,-38],[-141,-217],[-39,-199],[-305,-383],[-157,-281],[-131,-351],[-43,-419],[50,-411],[92,-505],[124,-418],[1,-256],[132,-685],[-9,-398],[-12,-230],[-69,-361],[-83,-74],[-137,71],[-44,259],[-106,136],[-147,508],[-129,452],[-42,231],[57,393],[-77,325],[-217,494],[-108,91],[-281,-269],[-49,30],[-135,276],[-174,146],[-314,-75],[-247,66],[-212,-41],[-118,-83],[54,-166],[-5,-240],[59,-117],[-53,-77],[-103,87],[-104,-112],[-202,18],[-207,313],[-242,-74],[-202,137],[-173,-42],[-234,-138],[-253,-438],[-276,-255],[-152,-282],[-63,-266],[-3,-407],[14,-284],[52,-201],[1,-1],[-1,-1],[-107,-516],[-49,-426],[-20,-791],[-27,-289],[48,-322],[86,-288],[56,-458],[184,-440],[65,-337],[109,-291],[295,-157],[114,-247],[244,165],[212,60],[208,106],[175,101],[176,241],[67,345],[22,496],[48,173],[188,155],[294,137],[246,-21],[169,50],[66,-125],[-9,-285],[-149,-351],[-66,-360],[51,-103],[-42,-255],[-69,-461],[-71,152],[-58,-10],[1,-87],[53,-3],[-5,-160],[-45,-256],[24,-91],[-29,-212],[18,-56],[-32,-299],[-55,-156],[-50,-19],[-55,-205],[90,-107],[24,88],[82,-75],[29,-23],[61,104],[79,8],[26,-48],[43,29],[129,-53],[128,16],[90,65],[32,66],[89,-31],[66,-40],[73,14],[55,51],[127,-82],[44,-13],[85,-110],[80,-132],[101,-91],[73,-162],[-24,-57],[-14,-132],[29,-216],[-64,-202],[-30,-237],[-9,-261],[15,-152],[7,-266],[-43,-58],[-26,-253],[19,-156],[-56,-151],[12,-159],[43,-97],[70,-321],[108,-238],[130,-252],[100,-212],[-6,-125],[111,-27],[26,48],[77,-145],[136,42],[119,150],[168,119],[95,176],[153,-34],[-10,-58],[155,-21],[124,-102],[90,-177],[105,-164],[143,-18],[209,412],[114,63],[3,195],[51,500],[159,274],[175,11],[22,123],[218,-49],[218,298],[109,132],[134,285],[98,-36],[73,-156],[-54,-199],[-8,-139],[-163,-69],[91,-268],[-3,-309],[-123,-343],[105,-469],[120,38],[62,427],[-86,208],[-14,447],[346,241],[-38,278],[97,186],[100,-415],[195,-9],[180,-330],[11,-195],[249,-6],[297,61],[159,-264],[213,-73],[155,184],[4,149],[344,35],[333,9],[-236,-175],[95,-279],[222,-44],[210,-291],[45,-473],[144,13],[109,-139],[183,-217],[171,-385],[8,-304],[105,-14],[149,-289],[109,-205],[333,-119],[30,107],[225,43],[298,-159],[95,-65],[204,-140],[294,-499],[46,-242],[95,28],[69,-327],[155,-1033],[149,-97],[7,-408],[-208,-487],[86,-178],[491,-92],[10,-593],[211,388],[349,-212],[462,-361],[135,-346],[-45,-327],[323,182],[540,-313],[415,23],[411,-489],[355,-662],[214,-170],[237,-24],[101,-186],[94,-752],[46,-358],[-110,-977],[-142,-385],[-391,-822],[-177,-668],[-206,-513],[-69,-11],[-78,-435],[20,-1107],[-77,-910],[-30,-390],[-88,-233],[-49,-790],[-282,-771],[-47,-610],[-225,-256],[-65,-355],[-302,2],[-437,-227],[-195,-263],[-311,-173],[-327,-470],[-235,-586],[-41,-441],[46,-326],[-51,-597],[-63,-289],[-195,-325],[-308,-1040],[-244,-468],[-189,-277],[-127,-562],[-183,-337],[-121,-372],[-313,-328],[-205,118],[-151,-63],[-256,253],[-189,-19],[-169,327],[-19,-308],[353,-506],[-38,-408],[173,-257],[-14,-289],[-267,-757],[-412,-317],[-557,-123],[-305,59],[59,-352],[-57,-442],[51,-298],[-167,-208],[-284,-82],[-267,216],[-108,-155],[39,-587],[188,-178],[152,186],[82,-307],[-255,-183],[-223,-367],[-41,-595],[-66,-316],[-262,-2],[-218,-302],[-80,-443],[274,-433],[265,-119],[-96,-531],[-328,-333],[-180,-692],[-254,-234],[-113,-276],[89,-614],[185,-342],[-117,30],[-247,4],[-134,-145],[-250,-213],[-45,-552],[-118,-14],[-313,192],[-318,412],[-346,338],[-87,374],[79,346],[-140,393],[-36,1007],[119,568],[293,457],[-422,172],[265,522],[94,982],[309,-208],[145,1224],[-186,157],[-87,-738],[-175,83],[87,845],[95,1095],[127,404],[-79,576],[-23,666],[117,19],[170,954],[192,945],[118,881],[-64,885],[83,487],[-34,730],[163,721],[50,1143],[89,1227],[87,1321],[-20,967],[-58,832],[-279,340],[-24,242],[-551,593],[-498,646],[-214,365],[-115,488],[46,170],[-236,775],[-274,1090],[-262,1177],[-114,269],[-87,435],[-216,386],[-198,239],[90,264],[-134,563],[86,414],[221,373],[148,442],[-60,258],[-106,-275],[-166,259],[56,167],[-47,536],[97,89],[52,368],[105,381],[-20,241],[153,126],[190,236],[-37,183],[103,44],[-12,296],[65,214],[138,40],[117,371],[106,310],[-102,141],[52,343],[-62,540],[59,155],[-44,500],[-112,315],[-93,170],[-59,319],[68,158],[-70,40],[-52,195],[-138,165],[-122,-38],[-56,-205],[-112,-149],[-61,-20],[-27,-123],[132,-321],[-75,-76],[-40,-87],[-130,-30],[-48,353],[-36,-101],[-92,35],[-56,238],[-114,39],[-72,69],[-119,-1],[-8,-128],[-32,89],[-151,131],[-56,124],[32,103],[-11,130],[-77,142],[-109,116],[-95,76],[-19,173],[-73,105],[18,-172],[-55,-141],[-64,164],[-89,58],[-38,120],[2,179],[36,187],[-78,83],[64,114],[-96,186],[-130,238],[-61,200],[-117,185],[-140,267],[31,92],[46,-89],[21,41],[-48,185],[-84,52],[-31,-140],[-161,9],[-100,57],[-115,117],[-154,37],[-79,127],[-142,103],[-174,11],[-127,117],[-149,244],[-314,636],[-144,192],[-226,154],[-156,-43],[-223,-223],[-140,-58],[-196,156],[-208,112],[-260,271],[-208,83],[-314,275],[-233,282],[-70,158],[-155,35],[-284,187],[-116,270],[-299,335],[-139,373],[-66,288],[93,57],[-29,169],[64,153],[1,204],[-93,266],[-25,235],[-94,298],[-244,587],[-280,462],[-135,368],[-238,241],[-51,145],[42,365],[-142,137],[-164,288],[-69,412],[-149,48],[-162,311],[-130,288],[-12,184],[-149,446],[-99,452],[5,227],[-201,235],[-93,-26],[-159,163],[-44,-240],[46,-284],[27,-444],[95,-243],[206,-407],[46,-139],[42,-42],[37,-203],[49,8],[56,-381],[85,-150],[59,-210],[174,-300],[92,-550],[83,-259],[77,-277],[15,-311],[134,-20],[112,-268],[100,-264],[-6,-106],[-117,-217],[-49,3],[-74,359],[-182,337],[-200,286],[-142,150],[9,432],[-42,320],[-132,183],[-191,264],[-37,-76],[-70,154],[-171,143],[-164,343],[20,44],[115,-33],[103,221],[10,266],[-214,422],[-163,163],[-102,369],[-103,388],[-129,472],[-113,531],[-46,302],[-180,340],[-130,71],[-30,169],[-156,30],[-100,159],[-258,59],[-70,95],[-34,324],[-270,594],[-231,821],[10,137],[-123,195],[-215,495],[-38,482],[-148,323],[61,489],[-10,507],[-89,453],[109,557],[67,1072],[-50,792],[-88,506],[-80,274],[33,115],[402,-200],[148,-558],[68,156],[-44,485],[-94,484],[-38,1],[-537,581],[-199,255],[-503,245],[-155,523],[40,362],[-356,252],[-48,476],[-336,429],[-6,304],[-153,223],[-245,188],[-78,515],[-358,478],[-150,558],[-267,38],[-441,15],[-326,170],[-574,613],[-266,112],[-486,211],[-385,-50],[-546,271],[-330,252],[-309,-125],[58,-411],[-154,-38],[-321,-123],[-245,-199],[-307,-126],[-40,348],[125,580],[295,182],[-76,148],[-354,-329],[-190,-394],[-400,-420],[203,-287],[-262,-424],[-299,-247],[-278,-181],[-69,-261],[-434,-305],[-87,-278],[-325,-252],[-191,45],[-259,-165],[-282,-201],[-231,-197],[-477,-169],[-43,99],[304,276],[271,182],[296,324],[345,66],[137,243],[385,353],[62,119],[205,208],[48,448],[141,349],[-320,-179],[-90,102],[-150,-215],[-181,300],[-75,-212],[-104,294],[-278,-236],[-170,0],[-24,352],[50,217],[-179,210],[-361,-113],[-235,277],[-190,142],[-1,334],[-214,252],[108,340],[226,330],[99,303],[225,43],[191,-94],[224,285],[201,-51],[212,183],[-52,270],[-155,106],[205,228],[-170,-7],[-295,-128],[-85,-131],[-219,131],[-392,-67],[-407,142],[-117,238],[-351,343],[390,247],[620,289],[228,0],[-38,-295],[586,22],[-225,366],[-342,226],[-197,295],[-267,252],[-381,187],[155,309],[493,19],[350,270],[66,287],[284,281],[271,68],[526,262],[256,-40],[427,315],[421,-124],[201,-266],[123,114],[469,-35],[-16,-136],[425,-101],[283,59],[585,-186],[534,-56],[214,-77],[370,96],[421,-177],[302,-83],[518,-142],[438,-284],[289,-55],[244,247],[336,184],[413,-72],[416,259],[455,148],[191,-245],[207,138],[62,278],[192,-63],[470,-530],[369,401],[38,-448],[341,96],[105,173],[337,-34],[424,-248],[650,-217],[383,-100],[272,38],[375,-300],[-391,-293],[502,-127],[750,70],[236,103],[296,-354],[302,299],[-283,251],[179,202],[338,27],[223,59],[224,-141],[279,-321],[310,47],[491,-266],[431,94],[405,-14],[-32,367],[247,103],[431,-200],[-2,-559],[177,471],[223,-16],[126,594],[-298,364],[-324,239],[22,653],[329,429],[366,-95],[281,-261],[378,-666],[-247,-290],[517,-120]],[[18287,93781],[-139,-277],[618,179],[386,-298],[314,302],[254,-194],[227,-580],[140,244],[-197,606],[244,86],[276,-94],[311,-239],[175,-575],[86,-417],[466,-293],[502,-279],[-31,-260],[-456,-48],[178,-227],[-94,-217],[-503,93],[-478,160],[-322,-36],[-522,-201],[-824,-103],[-374,-41],[-151,279],[-379,161],[-246,-66],[-343,468],[185,62],[429,101],[392,-26],[362,103],[-537,138],[-594,-47],[-394,12],[-146,217],[644,237],[-428,-9],[-485,156],[233,443],[193,235],[744,359],[284,-114]],[[20972,93958],[-244,-390],[-434,413],[95,83],[372,24],[211,-130]],[[28794,93770],[25,-163],[-296,17],[-299,13],[-304,-80],[-80,36],[-306,313],[12,213],[133,39],[636,-63],[479,-325]],[[25955,93803],[219,-369],[256,477],[704,242],[477,-611],[-42,-387],[550,172],[263,235],[616,-299],[383,-282],[36,-258],[515,134],[290,-376],[670,-234],[242,-238],[263,-553],[-510,-275],[654,-386],[441,-130],[400,-543],[437,-39],[-87,-414],[-487,-687],[-342,253],[-437,568],[-359,-74],[-35,-338],[292,-344],[377,-272],[114,-157],[181,-584],[-96,-425],[-350,160],[-697,473],[393,-509],[289,-357],[45,-206],[-753,236],[-596,343],[-337,287],[97,167],[-414,304],[-405,286],[5,-171],[-803,-94],[-235,203],[183,435],[522,10],[571,76],[-92,211],[96,294],[360,576],[-77,261],[-107,203],[-425,286],[-563,201],[178,150],[-294,367],[-245,34],[-219,201],[-149,-175],[-503,-76],[-1011,132],[-588,174],[-450,89],[-231,207],[290,270],[-394,2],[-88,599],[213,528],[286,241],[717,158],[-204,-382]],[[22123,94208],[331,-124],[496,75],[72,-172],[-259,-283],[420,-254],[-50,-532],[-455,-229],[-268,50],[-192,225],[-690,456],[5,189],[567,-73],[-306,386],[329,286]],[[89889,93835],[-421,-4],[-569,66],[-49,31],[263,234],[348,54],[394,-226],[34,-155]],[[24112,93575],[-298,-442],[-317,22],[-173,519],[4,294],[145,251],[276,161],[579,-20],[530,-144],[-415,-526],[-331,-115]],[[16539,92764],[-731,-294],[-147,259],[-641,312],[93,193],[218,489],[241,388],[-272,362],[939,93],[397,-123],[709,-33],[270,-171],[298,-249],[-349,-149],[-681,-415],[-344,-414],[0,-248]],[[91869,94941],[-321,-234],[-444,53],[-516,233],[66,192],[518,-89],[697,-155]],[[23996,94879],[-151,-229],[-403,44],[-337,155],[148,266],[399,159],[243,-208],[101,-187]],[[90301,95224],[-219,-439],[-1023,16],[-461,-139],[-550,384],[149,406],[366,111],[734,-26],[1004,-313]],[[22639,95907],[212,-273],[9,-303],[-127,-440],[-458,-60],[-298,94],[5,345],[-455,-46],[-18,457],[299,-18],[419,201],[390,-34],[22,77]],[[19941,95601],[109,-210],[247,99],[291,-26],[49,-289],[-169,-281],[-940,-91],[-701,-256],[-423,-14],[-35,193],[577,261],[-1255,-70],[-389,106],[379,577],[262,165],[782,-199],[493,-350],[485,-45],[-397,565],[255,215],[286,-68],[94,-282]],[[65981,92363],[-164,-52],[-907,77],[-74,262],[-503,158],[-40,320],[284,126],[-10,323],[551,503],[-255,73],[665,518],[-75,268],[621,312],[917,380],[925,110],[475,220],[541,76],[193,-233],[-187,-184],[-984,-293],[-848,-282],[-863,-562],[-414,-577],[-435,-568],[56,-491],[531,-484]],[[23699,96131],[308,-190],[547,1],[240,-194],[-64,-222],[319,-134],[177,-140],[374,-26],[406,-50],[441,128],[566,51],[451,-42],[298,-223],[62,-244],[-174,-157],[-414,-127],[-355,72],[-797,-91],[-570,-11],[-449,73],[-738,190],[-96,325],[-34,293],[-279,258],[-574,72],[-322,183],[104,242],[573,-37]],[[17722,96454],[-38,-454],[-214,-205],[-259,-29],[-517,-252],[-444,-91],[-377,128],[472,442],[570,383],[426,-9],[381,87]],[[63641,74970],[141,-419],[130,-28],[85,-159],[-228,-47],[-49,-459],[-47,-207],[-102,-138],[7,-293],[88,-436],[263,-123],[193,-296],[395,-102],[434,156],[27,139],[-52,417],[40,618],[-216,200],[71,405],[-184,34],[61,498],[262,-145],[244,189],[-202,355],[-80,338],[-224,-151],[-28,-433],[-87,383],[-15,144],[68,246],[-53,206],[-322,202],[-125,530],[-154,150],[-9,192],[270,-56],[11,432],[236,96],[243,-88],[50,576],[-50,365],[-278,-28],[-236,144],[-321,-260],[-259,-124],[-127,-350],[-269,-97],[-276,-610],[252,-561],[-27,-398],[303,-696],[146,-311]],[[0,88971],[99997,-3],[-357,-260],[-360,44],[250,-315],[166,-487],[128,-159],[32,-244],[-71,-157],[-518,129],[-777,-445],[-247,-69],[-425,-415],[-403,-362],[-102,-269],[-397,409],[-724,-464],[-126,220],[-268,-254],[-371,81],[-90,-388],[-333,-572],[10,-239],[316,-132],[-37,-860],[-258,-22],[-119,-494],[116,-255],[-486,-301],[-96,-675],[-415,-144],[-83,-600],[-400,-551],[-103,407],[-119,862],[-155,1313],[134,819],[234,353],[15,276],[431,132],[496,744],[479,608],[499,471],[223,833],[-337,-50],[-167,-487],[-705,-648],[-227,726],[-717,-201],[-696,-990],[230,-362],[-620,-154],[-430,-61],[20,427],[-431,90],[-344,-291],[-850,102],[-913,-175],[-900,-1153],[-1065,-1394],[438,-74],[136,-370],[270,-132],[178,296],[305,-39],[401,-650],[9,-502],[-217,-591],[-23,-705],[-126,-945],[-418,-855],[-94,-409],[-377,-688],[-374,-682],[-179,-349],[-370,-346],[-175,-8],[-175,287],[-373,-432],[-43,-197],[-106,36],[-120,-201],[-83,-201],[10,-424],[-143,-130],[-50,-105],[-104,-174],[-185,-97],[-121,-159],[-9,-256],[-32,-65],[111,-96],[157,-259],[240,-697],[68,-383],[3,-681],[-105,-325],[-252,-113],[-222,-245],[-250,-51],[-31,322],[52,443],[-123,615],[206,99],[-190,506],[-135,113],[-34,-112],[-81,-49],[-10,112],[-72,54],[-75,94],[77,260],[65,69],[-25,108],[71,319],[-18,97],[-163,64],[-131,158],[-388,-171],[-204,-277],[-300,-161],[148,274],[-58,230],[220,397],[-147,310],[-242,-209],[-314,-411],[-171,-381],[-272,-29],[-142,-275],[147,-400],[227,-97],[9,-265],[220,-172],[311,421],[247,-230],[179,-15],[46,-310],[-394,-165],[-130,-319],[-270,-296],[-142,-414],[299,-324],[109,-582],[169,-541],[189,-454],[-5,-439],[-174,-161],[66,-315],[164,-184],[-43,-481],[-71,-468],[-155,-53],[-203,-640],[-225,-775],[-258,-705],[-382,-545],[-386,-498],[-313,-68],[-170,-262],[-96,192],[-157,-294],[-388,-296],[-294,-90],[-95,-624],[-154,-35],[-73,429],[66,228],[-373,190],[-131,-97],[-371,-505],[-231,-558],[-61,-410],[212,-623],[260,-772],[252,-365],[169,-475],[127,-1093],[-37,-1039],[-232,-389],[-318,-381],[-227,-492],[-346,-550],[-101,378],[78,401],[-206,335],[-233,87],[-112,307],[-141,611],[-249,271],[-238,-11],[41,464],[-245,-3],[-22,-650],[-150,-863],[-90,-522],[19,-428],[181,-18],[113,-539],[50,-512],[155,-338],[168,-69],[144,-306],[64,-56],[164,-356],[116,-396],[16,-398],[-29,-269],[27,-203],[20,-349],[98,-163],[109,-523],[-5,-199],[-197,-40],[-263,438],[-329,469],[-32,301],[-161,395],[-38,489],[-100,322],[30,431],[-61,250],[-110,227],[-47,292],[-148,334],[-135,280],[-45,-347],[-53,328],[30,369],[82,566],[-27,439],[86,452],[-94,350],[23,644],[-113,306],[-90,707],[-50,746],[-121,490],[-183,-297],[-315,-421],[-156,53],[-172,138],[96,732],[-58,554],[-218,681],[34,213],[-163,76],[-197,481],[-79,309],[-16,301],[-53,284],[-116,344],[-256,23],[25,-243],[-87,-329],[-118,120],[-41,-108],[-78,65],[-108,53],[-39,-216],[-189,7],[-343,-122],[16,-445],[-148,-349],[-400,-398],[-311,-695],[-209,-373],[-276,-386],[-1,-272],[-138,-146],[-250,-212],[-130,-31],[-84,-450],[58,-769],[15,-490],[-118,-561],[-1,-1004],[-144,-29],[-126,-450],[84,-195],[-253,-167],[-93,-402],[-112,-170],[-263,552],[-128,827],[-107,596],[-97,279],[-148,568],[-69,739],[-48,369],[-253,811],[-115,1145],[-83,756],[1,716],[-54,553],[-404,-353],[-196,70],[-362,716],[133,214],[-82,232],[-326,501],[-203,150],[-83,425],[-215,449],[-512,-111],[-451,-11],[-391,-83],[-523,179],[-302,136],[-314,76],[-118,725],[-133,105],[-214,-106],[-280,-286],[-339,196],[-281,454],[-267,168],[-186,561],[-205,788],[-149,-96],[-177,196],[-103,-231],[-165,29],[58,-261],[-25,-135],[89,-445],[109,-510],[137,-135],[47,-207],[190,-248],[16,-244],[-27,-197],[35,-199],[80,-165],[37,-194],[41,-145],[-18,430],[75,310],[76,64],[84,-186],[5,-345],[-61,-348],[53,-226],[49,29],[11,-162],[217,93],[230,-15],[168,-18],[190,400],[207,379],[176,364],[80,201],[35,-51],[-26,-244],[-37,-108],[38,-466],[125,-404],[155,-214],[204,-78],[164,-107],[125,-339],[75,-196],[100,-75],[-1,-132],[-101,-352],[-44,-166],[-117,-189],[-104,-404],[-126,31],[-58,-141],[-44,-300],[34,-395],[-26,-72],[-128,2],[-174,-221],[-27,-288],[-63,-125],[-173,5],[-109,-149],[1,-239],[-134,-164],[-153,56],[-186,-199],[-128,-33],[-201,-159],[-54,-263],[-6,-201],[-277,-249],[-444,-276],[-249,-417],[-122,-32],[-83,34],[-163,-245],[-177,-113],[-233,-31],[-70,-34],[-61,-156],[-73,-43],[-42,-150],[-138,13],[-89,-80],[-192,30],[-72,345],[8,323],[-46,174],[-54,437],[-80,243],[56,29],[-29,270],[34,114],[-12,257],[-36,253],[-84,177],[-22,236],[-143,212],[-148,495],[-79,482],[-192,406],[-124,97],[-184,563],[-32,411],[12,350],[-159,655],[-130,231],[-150,122],[-92,339],[15,133],[-77,307],[-81,131],[-108,440],[-170,476],[-141,406],[-139,-3],[44,325],[12,206],[34,236],[-9,86],[-78,-238],[-60,-446],[-75,-308],[-65,-103],[-93,191],[-125,263],[-198,847],[-29,-53],[115,-624],[171,-594],[210,-920],[102,-321],[90,-334],[249,-654],[-55,-103],[9,-384],[323,-530],[49,-121],[90,-580],[-61,-107],[40,-608],[102,-706],[106,-145],[152,-219],[161,-683],[77,-543],[152,-288],[379,-558],[154,-336],[151,-341],[87,-203],[136,-178],[66,-183],[-9,-245],[-158,-142],[119,-161],[91,-109],[54,-244],[125,-248],[138,-2],[262,151],[302,70],[245,184],[138,39],[99,108],[158,20],[89,12],[128,88],[147,59],[132,202],[105,2],[6,-163],[-25,-344],[1,-310],[-59,-214],[-78,-639],[-134,-659],[-172,-755],[-238,-866],[-237,-661],[-327,-806],[-278,-479],[-415,-586],[-259,-450],[-304,-715],[-64,-312],[-63,-140],[-195,-236],[-68,-246],[-104,-44],[-40,-416],[-89,-238],[-54,-393],[-112,-195],[-128,-728],[16,-335],[178,-216],[8,-153],[-76,-357],[16,-180],[-18,-282],[97,-370],[115,-583],[101,-129],[45,-265],[-11,-588],[34,-519],[11,-923],[49,-290],[-83,-422],[-108,-410],[-177,-366],[-254,-225],[-313,-287],[-313,-634],[-107,-108],[-194,-420],[-115,-136],[-23,-421],[132,-448],[54,-346],[4,-177],[49,29],[-8,-579],[-45,-274],[65,-102],[-41,-246],[-116,-210],[-229,-199],[-334,-320],[-122,-219],[24,-248],[71,-40],[-24,-311],[-70,-430],[-32,-491],[-72,-267],[-190,-298],[-54,-86],[-118,-300],[-77,-303],[-158,-424],[-314,-609],[-196,-355],[-209,-269],[-291,-229],[-141,-31],[-36,-164],[-169,88],[-138,-113],[-301,114],[-168,-72],[-115,31],[-286,-233],[-238,-94],[-171,-223],[-127,-14],[-117,210],[-94,11],[-120,264],[-13,-82],[-37,159],[2,346],[-90,396],[89,108],[-7,453],[-182,553],[-139,501],[-1,1],[-199,768],[-207,446],[-108,432],[-62,575],[-68,428],[-93,910],[-7,707],[-35,322],[-108,243],[-144,489],[-146,708],[-60,371],[-226,577],[-17,453],[-26,372],[38,519],[96,541],[15,254],[90,532],[66,243],[159,386],[90,263],[29,438],[-15,335],[-83,211],[-74,358],[-68,355],[15,122],[85,235],[-84,570],[-57,396],[-139,374],[26,115],[-39,183],[-74,444],[-228,626],[-285,596],[-184,488],[-169,610],[9,196],[61,189],[67,430],[56,438],[-52,90],[96,663],[40,467],[-108,390],[-127,100],[-56,265],[-71,85],[3,163],[-289,-213],[-105,32],[-107,-133],[-222,13],[-149,370],[-91,427],[-197,390],[-209,-8],[-245,1],[-229,-69],[-224,-126],[-436,-346],[-154,-203],[-250,-171],[-248,168],[-126,-7],[-194,116],[-178,-7],[-329,-103],[-193,-170],[-275,-217],[-54,15],[-73,-5],[-286,282],[-252,450],[-237,323],[-187,381],[-75,44],[-200,238],[-144,316],[-49,216],[-34,437],[-122,349],[-108,232],[-71,76],[-69,118],[-32,261],[-41,130],[-80,97],[-149,247],[-117,39],[-63,166],[1,90],[-84,125],[-18,127],[-46,453],[36,262],[-115,460],[-138,210],[122,112],[134,415],[66,304],[-24,318],[78,291],[34,557],[-30,583],[-34,294],[28,295],[-72,281],[-146,255],[12,249],[13,274],[106,161],[91,308],[-18,200],[96,417],[155,376],[93,95],[74,344],[6,315],[100,365],[185,216],[177,603],[144,235],[259,66],[219,403],[139,158],[232,493],[-70,735],[106,508],[37,312],[179,399],[278,270],[206,244],[186,612],[87,362],[205,-2],[167,-251],[264,41],[288,-131],[121,-6],[267,323],[300,102],[175,244],[268,180],[471,105],[459,48],[140,-87],[262,232],[297,5],[113,-137],[190,35],[302,239],[195,-71],[-9,-299],[236,217],[20,-113],[-139,-289],[-2,-274],[96,-147],[-36,-511],[-183,-297],[53,-322],[143,-10],[70,-281],[106,-92],[326,-204],[117,51],[232,-98],[368,-264],[130,-526],[250,-114],[391,-248],[296,-293],[136,153],[133,272],[-65,452],[87,288],[200,277],[192,80],[375,-121],[95,-264],[104,-2],[88,-101],[276,-69],[68,-196],[369,10],[268,-156],[275,-175],[129,-92],[214,188],[114,169],[245,49],[198,-75],[75,-293],[65,193],[222,-140],[217,-33],[137,149],[80,194],[-19,34],[74,276],[56,446],[40,149],[8,6],[99,482],[138,416],[5,21],[-26,452],[68,243],[-102,268],[105,222],[-169,-51],[-233,136],[-191,-340],[-421,-66],[-225,317],[-300,20],[-64,-245],[-192,-71],[-268,315],[-303,-10],[-165,587],[-203,328],[135,459],[-176,283],[308,565],[428,23],[117,449],[529,-78],[334,383],[324,167],[459,13],[485,-416],[399,-229],[323,91],[239,-53],[328,309],[42,252],[-70,403],[-160,218],[-154,68],[-102,181],[-354,499],[-317,223],[-240,347],[202,95],[231,494],[-156,234],[410,241],[-8,129],[-249,-95],[-222,-48],[-185,-191],[-260,-31],[-239,-220],[16,-368],[136,-142],[284,35],[-55,-210],[-304,-103],[-377,-342],[-154,121],[61,277],[-304,173],[50,113],[265,197],[-80,135],[-432,149],[-19,221],[-257,-73],[-103,-325],[-215,-437],[6,-152],[-135,-128],[-84,56],[-78,-713],[-144,-245],[-101,-422],[89,-337],[33,-228],[243,-190],[-51,-145],[-330,-33],[-118,-182],[-232,-319],[-87,275],[3,122],[-169,17],[-145,56],[-336,-154],[192,-332],[-141,-96],[-154,0],[-147,304],[-52,-130],[62,-353],[139,-277],[-105,-130],[155,-272],[137,-171],[4,-334],[-257,157],[82,-302],[-176,-62],[105,-521],[-184,-7],[-228,257],[-104,472],[-49,393],[-108,272],[-143,337],[-18,168],[-48,41],[-5,130],[-154,199],[-24,281],[23,403],[38,184],[-46,93],[-59,46],[-78,192],[-120,118],[-261,218],[-161,213],[-254,176],[-233,435],[56,44],[-127,248],[-5,200],[-179,93],[-85,-255],[-82,198],[6,205],[10,9],[62,54],[-221,86],[-226,-210],[15,-293],[-34,-168],[91,-301],[261,-298],[140,-488],[309,-476],[217,3],[68,-130],[-78,-118],[249,-213],[204,-179],[238,-308],[29,-111],[-52,-211],[-154,276],[-242,97],[-116,-382],[200,-219],[-33,-309],[-116,-35],[-148,-506],[-116,-46],[1,181],[57,317],[60,126],[-108,342],[-85,298],[-115,74],[-82,255],[-179,107],[-120,238],[-206,38],[-217,267],[-254,384],[-189,341],[-86,584],[-138,68],[-226,195],[-128,-80],[-161,-274],[-115,-43],[-252,-334],[-548,160],[-404,-192],[-32,-355],[15,-344],[-263,-393],[-356,-125],[-25,-199],[-171,-327],[-107,-481],[108,-338],[-160,-263],[-60,-384],[-210,-118],[-197,-455],[-352,-8],[-265,11],[-174,-209],[-106,-223],[-136,49],[-103,199],[-79,340],[-259,92],[-112,-153],[-146,83],[-143,-65],[42,462],[-26,363],[-124,55],[-67,224],[22,386],[111,215],[20,239],[58,355],[-6,250],[-56,212],[-12,200],[14,420],[-114,257],[393,426],[340,-107],[373,4],[296,-101],[230,31],[449,-19],[144,354],[53,1177],[-287,620],[-205,299],[-424,228],[-28,430],[360,129],[466,-152],[-88,669],[263,-254],[646,461],[84,484],[243,119],[222,117],[143,162],[244,870],[380,247],[231,-17],[54,125],[232,32],[52,-130],[188,291],[-63,222],[-13,335],[-113,328],[-8,604],[46,159],[80,178],[244,36],[98,163],[223,167],[-9,-304],[-82,-192],[33,-166],[151,-89],[-68,-223],[-83,64],[-200,-425],[76,-288],[4,-228],[281,-138],[-3,-210],[283,111],[156,162],[313,-233],[132,-189],[189,174],[434,273],[350,200],[277,-100],[21,-144],[268,-7],[63,260],[383,191],[-59,497],[10,445],[136,371],[262,202],[221,-442],[223,12],[53,453],[32,349],[-102,-75],[-176,210],[-24,340],[351,164],[350,86],[301,-97],[287,17],[316,327],[-291,280],[-504,-47],[-489,-216],[-452,-125],[-161,322],[-269,195],[62,581],[-135,534],[133,344],[252,371],[635,640],[185,124],[-28,250],[-387,279],[-478,-167],[-269,-413],[43,-361],[-441,-475],[-537,-509],[-202,-832],[198,-416],[265,-328],[-255,-666],[-289,-138],[-106,-992],[-157,-554],[-337,57],[-158,-468],[-321,-27],[-89,558],[-232,671],[-211,835],[-187,363],[-548,-684],[-370,-138],[-385,301],[-99,635],[-88,1364],[256,380],[733,496],[549,609],[508,824],[668,1141],[465,444],[763,741],[610,259],[457,-31],[423,489],[506,-26],[499,118],[869,-433],[-358,-158],[305,-371],[286,206],[456,-358],[761,-140],[1050,-668],[213,-281],[18,-393],[-308,-311],[-454,-157],[-1240,449],[-204,-75],[453,-433],[36,-878],[358,-180],[217,-153],[36,286],[-174,263],[183,215],[672,-368],[234,144],[-187,433],[647,578],[256,-34],[260,-206],[161,406],[-231,352],[136,353],[-204,367],[777,-190],[158,-331],[-351,-73],[2,-328],[218,-203],[429,128],[68,377],[581,282],[969,507],[209,-29],[-273,-359],[344,-61],[199,202],[521,16],[412,245],[317,-356],[315,391],[-291,343],[145,195],[820,-179],[385,-185],[1006,-675],[186,309],[-282,313],[-8,125],[-335,58],[92,280],[-149,461],[-8,189],[512,535],[182,537],[207,116],[735,-156],[58,-328],[-263,-479],[173,-189],[89,-413],[-63,-809],[307,-362],[-120,-395],[-544,-839],[318,-87],[110,213],[306,151],[74,293],[240,281],[-162,336],[130,390],[-304,49],[-67,328],[222,594],[-361,481],[497,398],[-64,421],[139,13],[145,-328],[-109,-570],[297,-108],[-127,426],[465,233],[577,31],[513,-337],[-247,492],[-28,630],[484,119],[668,-26],[602,77],[-226,309],[321,388],[319,16],[540,293],[734,79],[93,162],[729,55],[227,-133],[624,314],[510,-10],[77,255],[265,252],[656,242],[476,-191],[-378,-146],[629,-90],[75,-292],[254,143],[812,-7],[626,-289],[223,-221],[-69,-307],[-307,-175],[-730,-328],[-209,-175],[345,-83],[410,-149],[250,112],[142,-379],[122,153],[444,93],[892,-97],[67,-276],[1162,-88],[15,451],[590,-103],[443,3],[449,-312],[128,-378],[-165,-247],[349,-465],[437,-240],[268,620],[446,-266],[473,159],[538,-182],[204,166],[455,-83],[-201,549],[367,256],[2509,-384],[236,-351],[727,-451],[1122,112],[553,-98],[231,-244],[-33,-432],[342,-168],[372,121],[492,15],[525,-116],[526,66],[484,-526],[344,189],[-224,378],[123,263],[886,-166],[578,36],[799,-282],[-99610,-258]],[[23933,96380],[-126,-17],[-521,38],[-74,165],[559,-9],[195,-109],[-33,-68]],[[19392,96485],[-518,-170],[-411,191],[224,188],[406,60],[392,-92],[-93,-177]],[[56867,96577],[-620,-241],[-490,137],[191,152],[-167,189],[575,119],[110,-222],[401,-134]],[[19538,97019],[-339,-115],[-461,1],[5,84],[285,177],[149,-27],[361,-120]],[[23380,96697],[-411,-122],[-226,138],[-119,221],[-22,245],[360,-24],[162,-39],[332,-205],[-76,-214]],[[22205,96856],[108,-247],[-453,66],[-457,192],[-619,21],[268,176],[-335,142],[-21,227],[546,-81],[751,-215],[212,-281]],[[79187,96845],[-1566,-228],[507,776],[229,66],[208,-38],[704,-336],[-82,-240]],[[55069,97669],[915,-440],[-699,-233],[-155,-435],[-243,-111],[-132,-490],[-335,-23],[-598,361],[252,210],[-416,170],[-541,499],[-216,463],[757,212],[152,-207],[396,8],[105,202],[408,20],[350,-206]],[[57068,98086],[545,-207],[-412,-318],[-806,-70],[-819,98],[-50,163],[-398,11],[-304,271],[858,165],[403,-142],[281,177],[702,-148]],[[64204,98169],[-373,-78],[-250,-45],[-39,-97],[-324,-98],[-301,140],[158,185],[-618,18],[542,107],[422,8],[57,-160],[159,142],[262,97],[412,-129],[-107,-90]],[[77760,97184],[-606,-73],[-773,170],[-462,226],[-213,423],[-379,117],[722,404],[600,133],[540,-297],[640,-572],[-69,-531]],[[25828,97644],[334,-190],[-381,-176],[-513,-445],[-492,-42],[-575,76],[-299,240],[4,215],[220,157],[-508,-4],[-306,196],[-176,268],[193,262],[192,180],[285,42],[-122,135],[646,30],[355,-315],[468,-127],[455,-112],[220,-390]],[[30972,99681],[742,-47],[597,-75],[508,-161],[-12,-157],[-678,-257],[-672,-119],[-251,-133],[605,3],[-656,-358],[-452,-167],[-476,-483],[-573,-98],[-177,-120],[-841,-64],[383,-74],[-192,-105],[230,-292],[-264,-202],[-429,-167],[-132,-232],[-388,-176],[39,-134],[475,23],[6,-144],[-742,-355],[-726,163],[-816,-91],[-414,71],[-525,31],[-35,284],[514,133],[-137,427],[170,41],[742,-255],[-379,379],[-450,113],[225,229],[492,141],[79,206],[-392,231],[-118,304],[759,-26],[220,-64],[433,216],[-625,68],[-972,-38],[-491,201],[-232,239],[-324,173],[-61,202],[413,112],[324,19],[545,96],[409,220],[344,-30],[300,-166],[211,319],[367,95],[498,65],[849,24],[148,-63],[802,100],[601,-38],[602,-37]],[[42472,99925],[1737,-469],[-513,-227],[-1062,-26],[-1496,-58],[140,-105],[984,65],[836,-204],[540,181],[231,-212],[-305,-344],[707,220],[1348,229],[833,-114],[156,-253],[-1132,-420],[-157,-136],[-888,-102],[643,-28],[-324,-431],[-224,-383],[9,-658],[333,-386],[-434,-24],[-457,-187],[513,-313],[65,-502],[-297,-55],[360,-508],[-617,-42],[322,-241],[-91,-208],[-391,-91],[-388,-2],[348,-400],[4,-263],[-549,244],[-143,-158],[375,-148],[364,-361],[105,-476],[-495,-114],[-214,228],[-344,340],[95,-401],[-322,-311],[732,-25],[383,-32],[-745,-515],[-755,-466],[-813,-204],[-306,-2],[-288,-228],[-386,-624],[-597,-414],[-192,-24],[-370,-145],[-399,-138],[-238,-365],[-4,-415],[-141,-388],[-453,-472],[112,-462],[-125,-488],[-142,-577],[-391,-36],[-410,482],[-556,3],[-269,324],[-186,577],[-481,735],[-141,385],[-38,530],[-384,546],[100,435],[-186,208],[275,691],[418,220],[110,247],[58,461],[-318,-209],[-151,-88],[-249,-84],[-341,193],[-19,401],[109,314],[258,9],[567,-157],[-478,375],[-249,202],[-276,-83],[-232,147],[310,550],[-169,220],[-220,409],[-335,626],[-353,230],[3,247],[-745,346],[-590,43],[-743,-24],[-677,-44],[-323,188],[-482,372],[729,186],[559,31],[-1188,154],[-627,241],[39,229],[1051,285],[1018,284],[107,214],[-750,213],[243,235],[961,413],[404,63],[-115,265],[658,156],[854,93],[853,5],[303,-184],[737,325],[663,-221],[390,-46],[577,-192],[-660,318],[38,253],[932,353],[975,-27],[354,218],[982,57],[2219,-74]]]"),W1={scale:[.0036000360003600037,.0016925586033320111],translate:[-180,-85.60903777459777]},Pc={objects:G1,arcs:V1,transform:W1},Jn="—";function ee(i,e=0,t=""){return i==null||!Number.isFinite(i)?Jn:i.toLocaleString("en-US",{minimumFractionDigits:e,maximumFractionDigits:e})+(t?` ${t}`:"")}function Kt(i,e={}){if(i==null||!Number.isFinite(i))return Jn;if(e.escape&&i<0)return"ESCAPE";const t=Math.abs(i);return t>=1e9?ee(i/1e9,2,"Gm"):t>=1e6?ee(i/1e6,2,"Mm"):t>=1e4?ee(i/1e3,1,"km"):ee(i,0,"m")}function Nn(i){return ee(i,i!=null&&Math.abs(i)<100?1:0,"m/s")}function pt(i){if(i==null||!Number.isFinite(i))return Jn;const e=i<0;let t=Math.floor(Math.abs(i));const n=Math.floor(t/86400);t-=n*86400;const s=Math.floor(t/3600);t-=s*3600;const r=Math.floor(t/60),a=t-r*60,o=l=>String(l).padStart(2,"0");return`${e?"−":""}${n?`${n}d `:""}${o(s)}:${o(r)}:${o(a)}`}function gt(i){return i==null?"T+ "+Jn:`T+ ${pt(i)}`}let Du=Date.UTC(2e3,0,1);function $1(i){i!=null&&Number.isFinite(i)&&(Du=i)}function Ki(i){return new Date(Du+i*1e3)}function Is(i){return i==null||!Number.isFinite(i)?Jn:Ki(i).toISOString().replace("T"," ").slice(0,19)+" UTC"}function xn(i){return i==null||!Number.isFinite(i)?Jn:Ki(i).toISOString().slice(0,10)}function Mn(i,e=0){return i==null||!Number.isFinite(i)?Jn:`${(i*100).toFixed(e)} %`}function Wt(i){if(i==null)return Jn;const e=Math.abs(i);return e>=1e6?`√${(i/1e6).toFixed(2)}M`:e>=1e3?`√${(i/1e3).toFixed(1)}k`:`√${i.toFixed(0)}`}function Q(i){return(i??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}const F={bg:"#05080c",grid:"#14202b",gridStrong:"#1e3040",land:"#16232c",coast:"#3a5566",text:"#d8e1e8",dim:"#7d8d99",track:"#e8eef2",predicted:"#5fb3d9",caution:"#f2b134",warning:"#ff4d4d",sim:"#d36bd6",accent:"#5fb3d9"},X1='"JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace',cl='"Inter", "SF Pro Text", system-ui, -apple-system, "Segoe UI", sans-serif';function ws(i,e){const t=document.createElement("canvas");return t.width=i,t.height=e,t}let Aa=null;function q1(){if(Aa)return Aa;const i=z1(Pc,Pc.objects.land),e=[],t=n=>{for(const s of n)e.push(s)};for(const n of i.features??[i]){const s=n.geometry;if(s.type==="Polygon")t(s.coordinates);else if(s.type==="MultiPolygon")for(const r of s.coordinates)t(r)}return Aa=e}const Dc=new Map;function Lu(i,e,t=!0){const n=`${i}x${e}${t?"s":""}`,s=Dc.get(n);if(s)return s;const r=ws(i,e),a=r.getContext("2d");a.fillStyle=F.bg,a.fillRect(0,0,i,e);const o=u=>(u+180)/360*i,l=u=>(90-u)/180*e;a.fillStyle=F.land,a.strokeStyle=F.coast,a.lineWidth=1;for(const u of q1()){a.beginPath();let d=null;for(const[h,f]of u)d===null||Math.abs(h-d)>180?a.moveTo(o(h),l(f)):a.lineTo(o(h),l(f)),d=h;a.closePath(),a.fill(),a.stroke()}a.strokeStyle=F.grid,a.lineWidth=1;for(let u=-180;u<=180;u+=30)a.beginPath(),a.moveTo(o(u),0),a.lineTo(o(u),e),a.stroke();for(let u=-60;u<=60;u+=30)a.beginPath(),a.moveTo(0,l(u)),a.lineTo(i,l(u)),a.stroke();a.strokeStyle=F.gridStrong,a.beginPath(),a.moveTo(0,l(0)),a.lineTo(i,l(0)),a.stroke();const c=t?[["GDS",35.43,-116.89],["MAD",40.43,-4.25],["CAN",-35.4,148.98],["KSC",28.57,-80.65]]:[];a.font=`600 ${Math.round(e*.022)}px ${cl}`;for(const[u,d,h]of c)a.fillStyle=F.dim,a.fillRect(o(h)-3,l(d)-3,6,6),a.fillText(u,o(h)+6,l(d)+4);return Dc.set(n,r),r}const Y1={Earth:86164.1,Moon:23605915e-1,Mars:88642.7};function ul(i,e,t=30){const{inc:n,argPe:s,trueAnomaly:r,ecc:a,period:o,sma:l}=i.orbit,{lat:c,lon:u,body:d}=i.vessel;if([n,s,r,a,o,l,c,u].some(w=>w===null))return[];if(a>=1||(i.orbit.pe??-1)<0)return[];const h=Y1[d??""];if(!h)return[];const f=n*Math.PI/180,g=a,v=K1(r*Math.PI/180,g),m=2*Math.PI/o,p=w=>Math.atan2(Math.cos(f)*Math.sin(w),Math.cos(w)),S=(s+r)*Math.PI/180,E=p(S),M=[];for(let w=0;w<=e;w+=t){const R=j1(v+m*w,g),A=s*Math.PI/180+R,L=Math.asin(Math.sin(f)*Math.sin(A))*180/Math.PI;let b=(p(A)-E)*180/Math.PI,y=u+b-360*w/h;y=((y+180)%360+360)%360-180,M.push([L,y])}return M}function K1(i,e){const t=2*Math.atan(Math.sqrt((1-e)/(1+e))*Math.tan(i/2));return t-e*Math.sin(t)}function j1(i,e){let t=i;for(let n=0;n<8;n++)t-=(t-e*Math.sin(t)-i)/(1-e*Math.cos(t));return 2*Math.atan2(Math.sqrt(1+e)*Math.sin(t/2),Math.sqrt(1-e)*Math.cos(t/2))}function Ir(i,e,t,n){const s=o=>(o+180)/360*t,r=o=>(90-o)/180*n;i.beginPath();let a=null;for(const[o,l]of e)a===null||Math.abs(l-a)>180?i.moveTo(s(l),r(o)):i.lineTo(s(l),r(o)),a=l;i.stroke()}function Z1(i,e,t){const n=i.getContext("2d"),{width:s,height:r}=i;n.drawImage(Lu(s,r),0,0);const a=!e||e.vessel.body===null||e.vessel.body==="Earth";if(e&&!a&&(n.fillStyle="rgba(5,8,12,0.75)",n.fillRect(0,0,s,r),re(n,`Vessel is in the ${e.vessel.body} system. Earth map not applicable.`,s/2,r/2,r*.04,F.dim,"center")),e&&a){const o=ul(e,Math.min(1.5*(e.orbit.period??0),14400));o.length&&(n.setLineDash([r*.012,r*.012]),n.strokeStyle=F.predicted,n.lineWidth=Math.max(1.5,r*.004),Ir(n,o,s,r),n.setLineDash([]));const l=t.filter(c=>c.lat!==null&&c.lon!==null).map(c=>[c.lat,c.lon]);if(n.strokeStyle=F.track,n.lineWidth=Math.max(2,r*.006),Ir(n,l,s,r),e.vessel.lat!==null&&e.vessel.lon!==null){const c=(e.vessel.lon+180)/360*s,u=(90-e.vessel.lat)/180*r;n.fillStyle=F.track,n.beginPath(),n.arc(c,u,r*.014,0,Math.PI*2),n.fill(),n.strokeStyle=F.bg,n.lineWidth=2,n.stroke()}else re(n,"Position not in this telemetry source",s/2,r*.94,r*.032,F.dim,"center")}Br(n,s,r,"GROUND TRACK",e?`${e.vessel.name??""}${dl(e)}`:"NO DATA"),e&&a&&(n.fillStyle=F.dim,n.font=`500 ${Math.round(r*.026)}px ${cl}`,n.textAlign="right",n.fillText("— flown   - - predicted 1.5 rev",s-r*.03,r-r*.03),n.textAlign="left")}function dl(i){return i.source==="sim"?"  · SIM":i.source==="replay"?"  · REPLAY":""}function Br(i,e,t,n,s){i.fillStyle="rgba(5,8,12,0.85)",i.fillRect(0,0,e,t*.075),re(i,n,t*.03,t*.052,t*.036,F.dim,"left",700),re(i,s,e-t*.03,t*.052,t*.036,s.includes("SIM")||s.includes("REPLAY")?F.sim:F.text,"right",600)}function re(i,e,t,n,s,r,a="left",o=500,l=!1){i.font=`${o} ${Math.round(s)}px ${l?X1:cl}`,i.fillStyle=r,i.textAlign=a,i.fillText(e,t,n),i.textAlign="left"}function J1(i,e,t){const n=i.getContext("2d"),{width:s,height:r}=i;n.fillStyle=F.bg,n.fillRect(0,0,s,r),Br(n,s,r,"ALTITUDE · VELOCITY vs MET",e?`${gt(e.vessel.met)}${dl(e)}`:"NO DATA");const a=s*.1,o=s*.9,l=r*.16,c=r*.86;n.strokeStyle=F.grid,n.lineWidth=1;for(let S=0;S<=4;S++){const E=l+(c-l)*S/4;n.beginPath(),n.moveTo(a,E),n.lineTo(o,E),n.stroke()}const u=t.filter(S=>S.alt!==null);if(u.length<2){re(n,"Waiting for flight data",s/2,(l+c)/2,r*.05,F.dim,"center");return}const d=u[0].met,h=Math.max(u[u.length-1].met,d+60),f=Oo(Math.max(...u.map(S=>S.alt),1e3)),g=Oo(Math.max(...u.map(S=>S.vel??0),100)),v=S=>a+(S-d)/(h-d)*(o-a),m=Go(e?.vessel.body??"Earth");if(m&&m<f){const S=c-m/f*(c-l);n.setLineDash([6,6]),n.strokeStyle=F.gridStrong,n.beginPath(),n.moveTo(a,S),n.lineTo(o,S),n.stroke(),n.setLineDash([]),re(n,"atmosphere top",a+8,S-6,r*.035,F.dim)}const p=(S,E,M)=>{n.strokeStyle=M,n.lineWidth=Math.max(2,r*.008),n.beginPath();let w=!0;for(const R of u){const A=S(R);if(A===null)continue;const L=c-A/E*(c-l);w?(n.moveTo(v(R.met),L),w=!1):n.lineTo(v(R.met),L)}n.stroke()};p(S=>S.alt,f,F.track),p(S=>S.vel,g,F.accent),re(n,`ALT ${Kt(f)}`,a,l-r*.02,r*.035,F.track,"left",600),re(n,`VEL ${Nn(g)}`,o,l-r*.02,r*.035,F.accent,"right",600),re(n,gt(d),a,c+r*.08,r*.035,F.dim),re(n,gt(h),o,c+r*.08,r*.035,F.dim,"right")}function Oo(i){const e=Math.pow(10,Math.floor(Math.log10(i)));for(const t of[1,2,2.5,5,10])if(t*e>=i)return t*e;return 10*e}function Q1(i,e){const t=i.getContext("2d"),{width:n,height:s}=i;if(t.fillStyle=F.bg,t.fillRect(0,0,n,s),Br(t,n,s,"ORBIT",e?.vessel.body?`${e.vessel.body}${e?dl(e):""}`:"NO DATA"),!e||e.orbit.apR===null||e.orbit.ap===null||e.orbit.pe===null||e.orbit.ecc===null){re(t,"No orbit data",n/2,s/2,s*.05,F.dim,"center");return}const r=e.orbit.apR-e.orbit.ap,a=e.orbit.ecc,o=n*.36,l=s*.56,c=Math.min(n*.3,s*.36);if(a>=1||e.orbit.ap<0){const h=c/(r*3);Lc(t,o,l,r*h),re(t,"ESCAPE TRAJECTORY",o,l+r*h+s*.1,s*.05,F.caution,"center",700)}else{const h=r+e.orbit.ap,f=r+e.orbit.pe,g=(h+f)/2,v=g*Math.sqrt(1-a*a),m=c/Math.max(g,r*1.05),p=o-(g-f)*m;Lc(t,o,l,r*m);const S=Go(e.vessel.body);if(S&&(t.strokeStyle="rgba(95,179,217,0.35)",t.lineWidth=1,t.beginPath(),t.arc(o,l,(r+S)*m,0,Math.PI*2),t.stroke()),t.strokeStyle=e.orbit.pe<S?F.caution:F.track,t.lineWidth=Math.max(2,s*.008),t.beginPath(),t.ellipse(p,l,g*m,v*m,0,0,Math.PI*2),t.stroke(),e.orbit.trueAnomaly!==null){const E=e.orbit.trueAnomaly*Math.PI/180,M=g*(1-a*a)/(1+a*Math.cos(E)),w=o+M*Math.cos(E)*m,R=l-M*Math.sin(E)*m;t.fillStyle=F.track,t.beginPath(),t.arc(w,R,s*.022,0,Math.PI*2),t.fill()}re(t,"Pe",o+f*m+8,l+6,s*.04,F.accent,"left",700),re(t,"Ap",o-h*m-8,l+6,s*.04,F.accent,"right",700)}const u=n*.8;[["Ap",Kt(e.orbit.ap,{escape:!0})],["Pe",Kt(e.orbit.pe)],["T Ap",pt(e.orbit.timeToAp)],["T Pe",pt(e.orbit.timeToPe)],["Inc",e.orbit.inc===null?"—":`${e.orbit.inc.toFixed(2)}°`],["Ecc",a.toFixed(4)],["Period",pt(e.orbit.period)]].forEach(([h,f],g)=>{const v=s*.22+g*s*.105;re(t,h,u-n*.06,v,s*.04,F.dim,"left",600),re(t,f,n-s*.04,v,s*.05,F.text,"right",600,!0)})}function Lc(i,e,t,n){const s=i.createRadialGradient(e-n*.3,t-n*.3,n*.1,e,t,n);s.addColorStop(0,"#2b5f7f"),s.addColorStop(1,"#0d2533"),i.fillStyle=s,i.beginPath(),i.arc(e,t,Math.max(2,n),0,Math.PI*2),i.fill()}function e2(i,e,t,n){const s=i.getContext("2d"),{width:r,height:a}=i;s.fillStyle="#020406",s.fillRect(0,0,r,a);const o=(d,h,f,g=F.text)=>{re(s,h,d,a*.3,a*.19,F.dim,"left",700),re(s,f,d,a*.8,a*.4,g,"left",600,!0)},l=e?.vessel.met??null,c=e?.vessel.situation?/pre.?launch/i.test(e.vessel.situation):!1;o(r*.01,"MISSION ELAPSED",c?"T− HOLD":gt(l)),o(r*.215,"FLIGHT DAY",l===null?"—":`FD ${Math.floor(l/86400)+1}`),o(r*.31,"GAME DATE (UTC)",Is(e?.ut??null).slice(0,16));let u="—";e&&e.orbit.timeToAp!==null&&e.orbit.timeToPe!==null&&(e.orbit.ecc??1)<1&&(u=e.orbit.timeToAp<e.orbit.timeToPe?`Ap ${pt(e.orbit.timeToAp)}`:`Pe ${pt(e.orbit.timeToPe)}`),o(r*.59,"NEXT APSIS",u),re(s,t,r-a*.15,a*.68,a*.34,n,"right",800)}function t2(i,e,t,n){const s=i.getContext("2d"),{width:r,height:a}=i;s.fillStyle="#071018",s.fillRect(0,0,r,a),s.fillStyle=n,s.fillRect(0,0,r,a*.012+4),re(s,e,r*.04,a*.14,a*.09,F.text,"left",800),t.slice(0,6).forEach(([o,l,c],u)=>{const d=a*.29+u*a*.12;re(s,o,r*.04,d,a*.065,F.dim,"left",600),re(s,l,r*.96,d,a*.075,c??F.text,"right",600,!0)})}const Bo={nominal:"#7fd19b",caution:F.caution,warning:F.warning,nodata:"#4a5864"},pr={nominal:"GO",caution:"CAUTION",warning:"WARNING",nodata:"NO DATA"},cn=(i,e)=>i.find(t=>t.id===e)?.level;function Iu(i,e,t){if(!e)return[["Status","No telemetry"]];const n=e.vessel,s=e.orbit;switch(i){case"FLIGHT":return[["Vessel",n.name??"—"],["Situation",n.situation??"—"],["Body",n.body??"—"],["MET",gt(n.met)],["Crew",ee(n.crew)],["Stage",ee(n.stage)]];case"FDO":return[["Apoapsis",Kt(s.ap,{escape:!0})],["Periapsis",Kt(s.pe),cn(t,"pe")],["Time to Ap",pt(s.timeToAp)],["Time to Pe",pt(s.timeToPe)],["Inclination",s.inc===null?"—":`${s.inc.toFixed(2)}°`],["Eccentricity",s.ecc===null?"—":s.ecc.toFixed(4)],["Period",pt(s.period)],["SMA",Kt(s.sma)],["LAN",s.lan===null?"—":`${s.lan.toFixed(2)}°`],["Arg Pe",s.argPe===null?"—":`${s.argPe.toFixed(2)}°`],["Altitude",Kt(n.alt)],["Radar alt",Kt(n.radarAlt)],["Impact in",pt(e.landing.timeToImpact),cn(t,"impact")],["Suicide burn",pt(e.landing.suicideBurn)],["Target",e.target.name??"—"],["Target range",Kt(e.target.distance)],["Rel. velocity",Nn(e.target.relVel)]];case"GNC":return[["Heading",e.attitude.heading===null?"—":`${e.attitude.heading.toFixed(1)}°`],["Pitch",e.attitude.pitch===null?"—":`${e.attitude.pitch.toFixed(1)}°`],["Roll",e.attitude.roll===null?"—":`${e.attitude.roll.toFixed(1)}°`],["G-load",ee(n.g,2,"g"),cn(t,"g")],["AoA",e.aero.aoa===null?"—":`${e.aero.aoa.toFixed(1)}°`,cn(t,"aoa")],["SAS",e.control.sas===null?"—":e.control.sas?`ON ${e.control.sasMode??""}`:"OFF"],["RCS",e.control.rcs===null?"—":e.control.rcs?"ON":"OFF"],["Stall",Mn(e.aero.stall)],["Mach",ee(n.mach,2)],["Vert. speed",Nn(n.vVert)],["Horiz. speed",Nn(n.vHorz)],["Orbital vel.",Nn(n.vOrb)],["Surface vel.",Nn(n.vSurf)],["Controllable",n.controllable===null?"—":n.controllable?"YES":"NO",cn(t,"control")]];case"PROP":{const r=[["Total Δv (vac)",ee(e.prop.totalDv,0,"m/s"),cn(t,"dv")],["Total burn",pt(e.prop.totalBurn)],["Throttle",Mn(e.control.throttle)],["Mass",n.mass===null?"—":`${ee(n.mass/1e3,1,"t")}`],["Stages",ee(e.prop.stageCount)]];return e.prop.stages.forEach((a,o)=>r.push([`S${o} Δv · TWR`,`${ee(a.dv,0)} · ${ee(a.twr,2)}`])),r}case"EECOM":{const r=e.power.ec!==null&&e.power.ecMax?e.power.ec/e.power.ecMax:null;return[["Elec. charge",Mn(r),cn(t,"ec")],["EC units",`${ee(e.power.ec)} / ${ee(e.power.ecMax)}`],["Hottest part",Mn(e.thermal.hottestRatio),cn(t,"heat")],["Part",e.thermal.hottestName??"—"],["Dyn. pressure",ee(n.q,1,"kPa"),cn(t,"q")],["Power state",e.paused===2?"NO POWER":e.paused===null?"—":"OK",cn(t,"nopower")]]}case"INCO":return[["Signal",t.find(r=>r.id==="signal")?.detail.startsWith("CommNet is off")?"CommNet off":Mn(e.comm.signal),cn(t,"signal")],["Source",e.source.toUpperCase()],["Telemetry",e.paused===null?"—":["OK","PAUSED","NO POWER","OFF","NO ANTENNA","NOT IN FLIGHT"][e.paused]??String(e.paused)],["Time warp",e.control.warp===null?"—":`${e.control.warp}×`]];case"CAPCOM":return[["Crew aboard",ee(n.crew)],["Situation",n.situation??"—"]]}}function n2(i,e){const t=Iu(i,e.frame,e.checks);if(i==="CAPCOM"){const n=e.events.slice(-5).reverse();return n.length?n.map(s=>[gt(s.met).replace("T+ ",""),s.text.slice(0,26)]):[["","No callouts yet"]]}return t.slice(0,6).map(([n,s,r])=>[n,s,r&&r!=="nominal"?Bo[r]:void 0])}function i2(i,e){const t=e.levels?.[i]??"nodata",n=e.checks.filter(o=>o.position===i||i==="FLIGHT"),r=Iu(i,e.frame,e.checks).map(([o,l,c])=>`<div class="row ${c??""}"><span class="k">${Q(o)}</span><span class="v">${Q(l)}${c&&c!=="nominal"&&c!=="nodata"?` <b class="tag ${c}">${pr[c]}</b>`:""}</span></div>`).join("");let a="";if(i==="FLIGHT"){const o=["FDO","GNC","PROP","EECOM","INCO"].map(c=>{const u=e.levels?.[c]??"nodata";return`<div class="poll ${u}"><span>${c}</span><b>${pr[u]}</b></div>`}).join(""),l=n.filter(c=>c.level==="caution"||c.level==="warning");a=`<h3>Position status</h3><div class="pollgrid">${o}</div>
      <h3>Active alerts</h3>${l.length?l.map(c=>`<div class="alert ${c.level}"><b>${c.position}</b> ${Q(c.label)}: ${Q(c.detail)}</div>`).join(""):'<div class="muted">None</div>'}`}else if(i==="CAPCOM"){const o=e.events.slice().reverse();a=`<h3>Flight loop</h3><div class="log">${o.length?o.map(l=>`<div><span class="met">${Q(gt(l.met))}</span> ${Q(l.text)}</div>`).join(""):'<div class="muted">No callouts yet. Liftoff, staging, Max-Q, MECO, orbit insertion, SOI changes and LOS/AOS are called automatically.</div>'}</div>`}else{const o=e.checks.filter(l=>l.position===i);a=o.length?`<h3>Limit checks</h3>${o.map(l=>`<div class="alert ${l.level}"><b>${pr[l.level]}</b> ${Q(l.label)}: ${Q(l.detail)}</div>`).join("")}`:""}return`<header><div><div class="pos">${i}</div><div class="ptitle">${Kc[i]}</div></div><div class="lamp ${t}">${pr[t]}</div></header>
    <div class="rows">${r}</div>${a}`}class s2{ctx=null;room=null;master=null;enabled=!1;toggle(){return this.enabled?this.disable():this.enable(),this.enabled}enable(){this.ctx??=new AudioContext,this.ctx.resume(),this.master=this.ctx.createGain(),this.master.gain.value=.5,this.master.connect(this.ctx.destination);const e=this.ctx.sampleRate*4,t=this.ctx.createBuffer(1,e,this.ctx.sampleRate),n=t.getChannelData(0);let s=0;for(let l=0;l<e;l++)s=(s+.02*(Math.random()*2-1))/1.02,n[l]=s*3;const r=this.ctx.createBufferSource();r.buffer=t,r.loop=!0;const a=this.ctx.createBiquadFilter();a.type="lowpass",a.frequency.value=380;const o=this.ctx.createGain();o.gain.value=.05,r.connect(a).connect(o).connect(this.master),r.start(),this.room=r,this.enabled=!0}disable(){this.room?.stop(),this.room=null,this.master?.disconnect(),this.master=null,this.enabled=!1}tone(e,t,n,s=.12,r="sine"){if(!this.ctx||!this.master)return;const a=this.ctx.createOscillator(),o=this.ctx.createGain();a.type=r,a.frequency.value=e;const l=this.ctx.currentTime+t;o.gain.setValueAtTime(0,l),o.gain.linearRampToValueAtTime(s,l+.01),o.gain.setValueAtTime(s,l+n-.01),o.gain.linearRampToValueAtTime(0,l+n),a.connect(o).connect(this.master),a.start(l),a.stop(l+n+.02)}quindar(){this.enabled&&(this.tone(2525,0,.25,.06),this.tone(2475,1.4,.25,.06))}masterCaution(){if(this.enabled)for(let e=0;e<3;e++)this.tone(760,e*.5,.22,.09,"square"),this.tone(1020,e*.5+.22,.22,.09,"square")}}class r2{install=null;system=null;craft=null;craftDetail=new Map;planning=null;history=null;analyses=new Map;errors={};listeners=new Set;inflight=new Set;on(e){return this.listeners.add(e),()=>this.listeners.delete(e)}emit(){for(const e of this.listeners)e()}async get(e,t,n){if(!this.inflight.has(e)){this.inflight.add(e);try{const s=await fetch(t),r=await s.json();if(!s.ok)throw new Error(r.error??`HTTP ${s.status}`);n(r),delete this.errors[e]}catch(s){this.errors[e]=s.message}finally{this.inflight.delete(e),this.emit()}}}loadInstall(e=!1){this.install&&!e||this.get("install","/api/install",t=>{this.install=t,$1(t.timeEpochMs),this.system=t.bodies.length?new ud(t.bodies,t.elementEpochUT??0):null})}loadCraft(e=!1){(!this.craft||e)&&this.get("craft","/api/craft",t=>{this.craft=t.craft})}loadCraftDetail(e){this.craftDetail.has(e)||this.get(`craft:${e}`,`/api/craft/detail?file=${encodeURIComponent(e)}`,t=>{this.craftDetail.set(e,t)})}loadPlanning(e=!1){(!this.planning||e)&&this.get("planning","/api/planning",t=>{this.planning=t})}loadHistory(){this.get("history","/api/career/history",e=>{this.history=e.points})}loadAnalysis(e){this.analyses.has(e)||this.get(`rec:${e}`,`/api/recording?file=${encodeURIComponent(e)}`,t=>{this.analyses.set(e,t.analysis)})}}const Xn=new r2;function _t(i,e,t=""){const n=i.getContext("2d"),{width:s,height:r}=i;return n.fillStyle=F.bg,n.fillRect(0,0,s,r),Br(n,s,r,e,t),{g:n,w:s,h:r}}function St(i,e,t){const n=i.getContext("2d"),{width:s,height:r}=i;re(n,e,s/2,r*.5,r*.05,F.dim,"center",600),t&&re(n,t,s/2,r*.58,r*.034,F.dim,"center")}function wn(i,e,t,n,s,r,a,o=[],l=99){const c=r.reduce((g,v)=>g+v.w,0),u=[];let d=e;for(const g of r)u.push(d),d+=g.w/c*n;const h=g=>r[g].align==="right"?u[g]+r[g].w/c*n-s*.2:r[g].align==="center"?u[g]+r[g].w/c*n/2:u[g];r.forEach((g,v)=>re(i,g.label.toUpperCase(),h(v),t,s*.42,F.dim,g.align??"left",700)),i.strokeStyle=F.gridStrong,i.lineWidth=1,i.beginPath(),i.moveTo(e,t+s*.3),i.lineTo(e+n,t+s*.3),i.stroke();const f=Math.min(a.length,l);for(let g=0;g<f;g++){const v=t+s*(g+1.05);a[g].forEach((m,p)=>{const S=r[p];if(!S)return;const E=S.w/c*n-s*.3;re(i,a2(i,m,E,s*.5,S.mono),h(p),v,s*.5,o[g]??F.text,S.align??"left",p===0?600:500,S.mono)})}return f}function a2(i,e,t,n,s=!1){if(i.font=`500 ${Math.round(n)}px ${s?"monospace":"sans-serif"}`,i.measureText(e).width<=t)return e;let r=0,a=e.length;for(;r<a;){const o=r+a+1>>1;i.measureText(e.slice(0,o)+"…").width<=t?r=o:a=o-1}return e.slice(0,r)+"…"}function kr(i,e,t,n,s,r,a){const o=r.flatMap(d=>d.pts);if(o.length<2)return null;const l=a?.[0]??Math.min(...o.map(d=>d[0])),c=a?.[1]??Math.max(...o.map(d=>d[0]),l+1);i.strokeStyle=F.grid,i.lineWidth=1;for(let d=0;d<=4;d++){const h=t+(s-t)*d/4;i.beginPath(),i.moveTo(e,h),i.lineTo(n,h),i.stroke()}const u=d=>e+(d-l)/(c-l||1)*(n-e);for(const d of r){if(d.pts.length<1)continue;const h=d.pts.map(m=>m[1]),f=d.min??Math.min(0,...h),g=d.max??Oo(Math.max(...h,f+1e-9)-f||1)+f,v=m=>s-(m-f)/(g-f||1)*(s-t);i.strokeStyle=d.color,i.lineWidth=Math.max(2,(s-t)*.012),d.dash&&i.setLineDash([8,6]),i.beginPath(),d.pts.forEach(([m,p],S)=>S?i.lineTo(u(m),v(p)):i.moveTo(u(m),v(p))),i.stroke(),i.setLineDash([])}return{X:u,x0:l,x1:c}}function is(i,e,t,n,s){let r=e;for(const[a,o]of s)i.fillStyle=o,i.fillRect(r,t-n*.6,n*1.2,n*.25),re(i,a,r+n*1.5,t,n,F.dim,"left",600),i.font=`600 ${Math.round(n)}px sans-serif`,r+=n*2.4+i.measureText(a).width}function Gt(i,e,t,n,s,r,a=F.text){re(i,s.toUpperCase(),e,t,n*.36,F.dim,"left",700),re(i,r,e,t+n*.95,n,a,"left",600,!0)}function Uu(i,e,t,n,s,r,a){i.fillStyle="#0f1820",i.fillRect(e,t,n,s),r!==null&&(i.fillStyle=a,i.fillRect(e,t,n*Math.max(0,Math.min(1,r)),s)),i.strokeStyle=F.gridStrong,i.lineWidth=1,i.strokeRect(e+.5,t+.5,n-1,s-1)}function Nu(i){if(!i.career)return`<header><div><div class="pos">PROGRAM</div><div class="ptitle">Program Office</div></div><div class="lamp nodata">NO DATA</div></header>
      <p class="muted">${Q(i.careerError??"Loading career save…")}</p>
      <p class="muted">The bridge reads <code>saves/&lt;career&gt;/persistent.sfs</code> under <code>KSP_ROOT</code>, read-only.</p>`;const{save:e,summary:t}=i.career,n=t.ut??0,s=c=>{const u=c.dueUT!==null?c.dueUT-n:null,d=u!==null&&u<30*86400?"caution":"";return`<div class="contract">
      <div class="ct">${Q(c.title)}</div>
      <div class="cm"><span>${Q(c.agent??"")}</span><span>adv ${Wt(c.fundsAdvance)} · done ${Wt(c.fundsCompletion)}${c.science?` · ${ee(c.science)} sci`:""}</span><span class="${d}">${c.state==="Active"?"due":"offer ends"} ${u===null?"—":u<0?"past":"in "+pt(u)}</span></div>
    </div>`},r=t.crew.filter(c=>c.type==="Crew"&&c.state==="Available").length,a=t.crew.filter(c=>c.type==="Crew"&&c.state==="Assigned").length,o=t.crew.filter(c=>c.type==="Applicant").length,l=t.facilities.map(c=>`<div class="fac"><span>${Q(c.id.replace(/([a-z])([A-Z])/g,"$1 $2"))}</span><b>${c.level===null?"—":`L${Math.round(c.level*2)+1}`}</b></div>`).join("");return`<header><div><div class="pos">PROGRAM</div><div class="ptitle">${Q(t.title??e)}</div></div><div class="lamp nominal">${Q(t.mode??"")}</div></header>
    <div class="kpis">
      <div><span>Funds</span><b>${Wt(t.funds)}</b></div>
      <div><span>Science</span><b>${ee(t.science,1)}</b></div>
      <div><span>Reputation</span><b>${ee(t.reputation,0)}</b></div>
      <div><span>Game date</span><b class="small">${Q(Is(t.ut).slice(0,10))}</b></div>
    </div>
    <h3>Active contracts (${t.contracts.active.length})</h3>
    ${t.contracts.active.map(s).join("")||'<div class="muted">None</div>'}
    <h3>Offered (${t.contracts.offered.length})</h3>
    ${t.contracts.offered.slice(0,8).map(s).join("")}${t.contracts.offered.length>8?`<div class="muted">+${t.contracts.offered.length-8} more</div>`:""}
    <h3>Record</h3>
    <div class="row"><span class="k">Completed / failed</span><span class="v">${t.contracts.completedCount} / ${t.contracts.failedCount}</span></div>
    <div class="row"><span class="k">Astronauts available / assigned</span><span class="v">${r} / ${a}</span></div>
    <div class="row"><span class="k">Applicants</span><span class="v">${o}</span></div>
    <div class="row"><span class="k">Tracked vessels</span><span class="v">${t.vessels.filter(c=>c.type!=="Debris").length} (+${t.vessels.filter(c=>c.type==="Debris").length} debris)</span></div>
    <h3>Facilities</h3><div class="facs">${l}</div>
    <p class="muted foot">Save <code>${Q(e)}</code>, written ${Q(t.savedAt?.slice(0,19).replace("T"," ")??"?")} UTC. Updates when KSP saves.</p>`}function o2(i,e=!1){const t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},a={},o=i[0].morphTargetsRelative,l=new mn;let c=0;for(let u=0;u<i.length;++u){const d=i[u];let h=0;if(t!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in d.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(d.attributes[f]),h++}if(h!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(o!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in d.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(d.morphAttributes[f])}if(e){let f;if(t)f=d.index.count;else if(d.attributes.position!==void 0)f=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,u),c+=f}}if(t){let u=0;const d=[];for(let h=0;h<i.length;++h){const f=i[h].index;for(let g=0;g<f.count;++g)d.push(f.getX(g)+u);u+=i[h].attributes.position.count}l.setIndex(d)}for(const u in r){const d=Ic(r[u]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,d)}for(const u in a){const d=a[u][0].length;if(d===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let h=0;h<d;++h){const f=[];for(let v=0;v<a[u].length;++v)f.push(a[u][v][h]);const g=Ic(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(g)}}return l}function Ic(i){let e,t,n,s=-1,r=0;for(let c=0;c<i.length;++c){const u=i[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=u.count*t}const a=new e(r),o=new rn(a,t,n);let l=0;for(let c=0;c<i.length;++c){const u=i[c];if(u.isInterleavedBufferAttribute){const d=l/t;for(let h=0,f=u.count;h<f;h++)for(let g=0;g<t;g++){const v=u.getComponent(h,g);o.setComponent(h+d,g,v)}}else a.set(u.array,l);l+=u.count*t}return s!==void 0&&(o.gpuType=s),o}class Os{scene=new xu;consoles=new Map;screens={};merged=new Map;constructor(e="#06080b",t=[26,48]){this.scene.background=new Ve(e),this.scene.fog=new il(e,t[0],t[1])}std(e,t=.85,n=.05){return new ns({color:e,roughness:t,metalness:n})}box(e,t,n,s,r,a,o,l,c=0){const u=new Ft(n,s,r);c&&u.rotateY(c),u.translate(a,o,l),this.queue(e,t,u)}queue(e,t,n){let s=this.merged.get(e);s||(s={mat:t(),geos:[]},this.merged.set(e,s)),s.geos.push(n.index?n.toNonIndexed():n)}shell(e){const{w:t,d:n,h:s,front:r}=e,a=(l,c,u,d,h=0,f=0)=>{const g=new $e(new sn(l,c),u);g.rotation.set(h,f,0),g.position.set(...d),this.scene.add(g)};a(t,n,this.std(e.floor??"#1b1f24",.97),[0,0,r+n/2],-Math.PI/2),a(t,n,this.std(e.ceil??"#101215",1),[0,s,r+n/2],Math.PI/2);const o=this.std(e.wall??"#23272c",.9);a(n,s,o,[-t/2,s/2,r+n/2],0,Math.PI/2),a(n,s,o,[t/2,s/2,r+n/2],0,-Math.PI/2),a(t,s,o,[0,s/2,r+n],0,Math.PI),e.skipFront||a(t,s,this.std(e.frontColor??"#0c0e11",.95),[0,s/2,r])}sidePanels(e,t,n,s=3.4,r=3.2){for(let a=t+2;a<n-1;a+=2.2)for(const o of[-1,1])this.box("panels",()=>this.std("#2b3036",.95),.06,r,1.9,o*(e/2-.03),s,a)}tiers(e,t,n,s,r="#1d2126",a="#c79a5b"){for(let o=1;o<t.length;o++){const l=t[o]-1.9,c=o===t.length-1?s:t[o+1]-1.9;this.box("tiers",()=>this.std(r,.96),e,n*o,c-l,0,n*o/2,l+(c-l)/2),this.box("strips",()=>new vn({color:a}),e-.4,.025,.025,0,n*o-.03,l-.02)}}coffers(e,t,n,s="#5a5144",r=[2.6,.7]){for(const a of t)for(const o of e){const l=new sn(r[0],r[1]);l.rotateX(Math.PI/2),l.translate(o,n-.01,a),this.queue(`coffer${s}`,()=>new vn({color:s}),l)}}screen(e,t,n,s,r,a,o,l,c=0){const u=ws(t,n),d=new _a(u);d.colorSpace=Lt,d.anisotropy=4;const h=new Fn;h.position.set(a,o,l),h.rotation.y=c;const f=new $e(new Ft(s+.24,r+.24,.12),this.std("#050607",.6,.3));f.position.z=.06;const g=new $e(new sn(s,r),new vn({map:d,toneMapped:!1}));return g.position.z=.125,h.add(f,g),this.scene.add(h),this.screens[e]={canvas:u,texture:d},h}labelTexture(e,t=512,n=96,s="#c9d3da",r="#0b0d10"){const a=ws(t,n),o=a.getContext("2d");o.fillStyle=r,o.fillRect(0,0,t,n),o.fillStyle=s,o.font=`800 ${n*.56}px Inter, system-ui, sans-serif`,o.textAlign="center",o.fillText(e,t/2,n*.7);const l=new _a(a);return l.colorSpace=Lt,l}console(e,t,n,s,r={}){const a=r.width??3.6,o=new Fn;o.position.set(t,n,s),o.rotation.y=r.rotY??0;const l=this.std("#2a2f35",.55,.35),c=new $e(new Ft(a,.74,.95),l);c.position.set(0,.37,0);const u=new $e(new Ft(a+.1,.05,1.15),this.std("#3a4047",.4,.2));u.position.set(0,.765,.08);const d=new $e(new Ft(a-.1,.78,.12),this.std("#14171a",.5,.3));d.position.set(0,1.25,-.28),d.rotation.x=-.12;const h=ws(1024,256),f=new _a(h);f.colorSpace=Lt,f.anisotropy=4;const g=new $e(new sn(a-.26,(a-.26)/4),new vn({map:f,toneMapped:!1}));g.position.set(0,1.25,-.215),g.rotation.x=-.12;const v=new $e(new sn(1.1,.2),new vn({map:this.labelTexture(r.label??e),toneMapped:!1}));v.position.set(0,1.73,-.25);const m=new vn({color:"#4a5864",toneMapped:!1}),p=new $e(new Ft(.16,.06,.04),m);p.position.set(.75,1.73,-.25);const S=this.std("#16191c",.8),E=new $e(new Ft(.55,.08,.55),S);E.position.set(0,.5,1);const M=new $e(new Ft(.55,.7,.06),S);M.position.set(0,.9,1.28);const w=new $e(new Ft(a,1.9,1.6),new vn({visible:!1}));w.position.set(0,.95,.2),w.userData.console=e,o.add(c,u,d,g,v,p,E,M,w),this.scene.add(o);const R=r.rotY??0,A=new N(0,2.4,3.2).applyAxisAngle(new N(0,1,0),R).add(o.position),L=r.lookAt??new N(0,1.4,-6).applyAxisAngle(new N(0,1,0),R).add(o.position);return this.consoles.set(e,{id:e,canvas:h,texture:f,lamp:m,hit:w,view:r.view??{pos:A,look:L}}),o}table(e,t,n,s,r=.76){this.box("tableTop",()=>this.std("#2c3238",.35,.25),n,.06,s,e,r,t),this.box("tableBase",()=>this.std("#15181b",.8),n*.8,r-.03,s*.4,e,(r-.03)/2,t)}glass(e,t,n,s,r,a=8){const o=t-e,l=s-n,c=new $e(new sn(o,l),new ns({color:"#0b1a24",transparent:!0,opacity:.18,roughness:.05,metalness:.6,depthWrite:!1}));c.position.set((e+t)/2,(n+s)/2,r),this.scene.add(c);for(let u=0;u<=a;u++)this.box("mullion",()=>this.std("#0d0f12",.5,.6),.14,l,.14,e+o*u/a,(n+s)/2,r);for(const u of[n,s])this.box("mullion",()=>this.std("#0d0f12",.5,.6),o,.2,.2,(e+t)/2,u,r)}lights(e,t,n,s={}){this.scene.add(new Eu("#9fb4c8","#1a1612",s.hemi??.35));for(const a of e){const o=new ol(s.warm??"#ffd7a8",60,16,.85,.6,1.6);o.position.set(0,t-.3,a+1.2),o.target.position.set(0,0,a),this.scene.add(o,o.target)}const r=new Tu(s.spill??"#7fb4d8",s.spillI??40,18,1.6);r.position.set(0,4.5,n+1.5),this.scene.add(r)}finish(e,t={}){for(const{mat:n,geos:s}of this.merged.values())s.length&&this.scene.add(new $e(o2(s),n));return this.merged.clear(),{scene:this.scene,consoles:this.consoles,screens:this.screens,overview:e,...t}}}const vt=(i,e,t)=>new N(i,e,t);function Bs(i){const e=-i.D/2,t=new Os(i.bg??"#07090c",i.fog??[i.D*1.2,i.D*2.6]);t.shell({w:i.W,d:i.D,h:i.H,front:e,wall:i.wall,floor:i.floor,ceil:i.ceil}),t.sidePanels(i.W,e,e+i.D,Math.min(3.2,i.H*.5),Math.min(3,i.H*.45));for(const a of i.screens){const o=a.wall??"front";o==="front"?t.screen(a.key,a.cw,a.ch,a.w,a.h,a.x,a.y,e+.03):t.screen(a.key,a.cw,a.ch,a.w,a.h,o==="left"?-i.W/2+.05:i.W/2-.05,a.y,a.x,o==="left"?Math.PI/2:-Math.PI/2)}const n=i.tiers??[];n.length&&t.tiers(i.W,n,.4,e+i.D),i.table&&t.table(...i.table);for(const a of i.seats){const o=.4*(a.row??0);t.console(a.id,a.x,o,a.z,{rotY:a.rotY,width:a.width,view:a.rotY?void 0:{pos:vt(a.x*.85,o+2.4,a.z+3.4),look:vt(a.x*.35,o+2.6,e)}})}const s=n.length?n:[e+i.D*.35,e+i.D*.7];t.coffers([-i.W/3,0,i.W/3],s,i.H,i.coffer??"#5a5144"),t.lights(s,i.H,e,{spillI:30,hemi:.62});const r=i.overview??{pos:[0,i.H*.62,e+i.D-1.2],look:[0,i.H*.45,e]};return t.finish({pos:vt(...r.pos),look:vt(...r.look)})}function bn(i){const e=i.store.frame;return e?.source==="live"&&e.ut!==null?e.ut:i.store.career?.summary.ut??e?.ut??null}function Uc(i){const e=bn(i);return e===null?null:Ki(e)}function Gi(i,e=!1){if(!i)return null;let t=/^(\d{4})-Q([1-4])$/.exec(i);return t?Date.UTC(+t[1],(+t[2]-1)*3+(e?3:0),1)-(e?1:0):(t=/^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(i),t?t[3]?Date.UTC(+t[1],+t[2]-1,+t[3]):Date.UTC(+t[1],+t[2]-1+(e?1:0),1)-(e?1:0):(t=/^(\d{4})$/.exec(i),t?Date.UTC(+t[1]+(e?1:0),0,1)-(e?1:0):null))}function Ra(i,e){const t=new Map,n=i?.contractMeta?.contracts??{},s=new Map;for(const[l,c]of Object.entries(n))for(const u of c.missions??[])s.set(u.id,[...s.get(u.id)??[],l]);const r=new Set(e?.active.map(l=>l.subtype??"")??[]),a=new Set(e?.offered.map(l=>l.subtype??"")??[]),o=new Set(e?.completedTypes??[]);for(const l of i?.manifest?.missions??[]){const c=s.get(l.id)??[];let u=c.length?"not offered":"no contract";c.some(d=>a.has(d))&&(u="offered"),c.some(d=>r.has(d))&&(u="active"),c.length&&c.every(d=>o.has(d))&&(u="completed"),t.set(l.id,{state:u,contracts:c})}return t}const _s={completed:"#7fd19b",active:"#5fb3d9",offered:"#f2b134","not offered":"#7d8d99","no contract":"#4a5864"};function pi(i,e){return e?i?.contractMeta?.contracts?.[e]?.phase??null:null}let mr="";function Nc(i){const e=i.data.planning;return e?e.manifest?null:"No program manifest in this checkout (docs/research/artemis-manifest.json)":i.data.errors.planning?`Planning data unavailable: ${i.data.errors.planning}`:"Loading planning data…"}const Fu={id:"program",code:"PO",name:"Program Office",purpose:"Program manifest, contracts by phase, budget trends and the lunar base goal",consoles:[{id:"PM",title:"Program manager"},{id:"MANIFEST",title:"Manifest"},{id:"CONTRACTS",title:"Contracts by phase"},{id:"BUDGET",title:"Budget and trends"},{id:"BASE",title:"Lunar base goal"},{id:"FACILITIES",title:"Facilities"}],screens:[{key:"timeline",w:2048,h:900,label:"Program manifest"},{key:"trend",w:1024,h:768,label:"Funds, science, reputation"},{key:"phases",w:1024,h:768,label:"Contracts by phase"}],build(){return mr="",Bs({W:22,D:16,H:5.2,wall:"#2b2a28",floor:"#2a2622",coffer:"#6a5c48",screens:[{key:"timeline",cw:2048,ch:900,w:9.4,h:4.13,x:0,y:2.75},{key:"trend",cw:1024,ch:768,w:4.4,h:3.3,x:-2.2,y:2.6,wall:"left"},{key:"phases",cw:1024,ch:768,w:4.4,h:3.3,x:-2.2,y:2.6,wall:"right"}],table:[0,1.2,8,2.4],seats:[{id:"PM",x:0,z:4.6,rotY:Math.PI,width:2.6},{id:"MANIFEST",x:-2.8,z:-1.6,width:2.6},{id:"CONTRACTS",x:0,z:-1.6,width:2.6},{id:"BUDGET",x:2.8,z:-1.6,width:2.6},{id:"BASE",x:-3.2,z:4,rotY:Math.PI,width:2.4},{id:"FACILITIES",x:3.2,z:4,rotY:Math.PI,width:2.4}],overview:{pos:[0,3.6,7.4],look:[0,2.6,-8]}})},enter(i){i.data.loadPlanning(),i.data.loadHistory(),mr=""},draw(i,e){const t=e.data.planning,n=e.store.career?.summary,s=e.data.history,r=Uc(e),a=`${!!t}|${n?.ut}|${n?.contracts.active.length}|${n?.contracts.completedCount}|${s?.length}|${r?.toISOString().slice(0,10)}`;if(a===mr)return[];mr=a;const o=Ra(t,n?.contracts);{const{g:l,w:c,h:u}=_t(i.timeline,"PROGRAM MANIFEST · 2026–2032",t?.manifest?.as_of?`research as of ${t.manifest.as_of}`:""),d=Nc(e);if(d)St(i.timeline,d);else{const h=(t.manifest.missions??[]).filter(w=>Gi(w.window?.start)!==null),f=Date.UTC(2026,0,1),g=Date.UTC(2032,0,1),v=c*.2,m=c*.98,p=u*.12,S=u*.9,E=w=>v+(Math.min(g,Math.max(f,w))-f)/(g-f)*(m-v);for(let w=2026;w<=2032;w++){const R=E(Date.UTC(w,0,1));l.strokeStyle=F.grid,l.lineWidth=1,l.beginPath(),l.moveTo(R,p),l.lineTo(R,S),l.stroke(),re(l,String(w),R+4,S+u*.04,u*.026,F.dim,"left",600)}const M=(S-p)/Math.max(h.length,1);if(h.sort((w,R)=>Gi(w.window?.start)-Gi(R.window?.start)),h.forEach((w,R)=>{const A=p+R*M,L=o.get(w.id)?.state??"no contract",b=E(Gi(w.window?.start)),y=Math.max(b+6,E(Gi(w.window?.end??w.window?.start,!0)??Gi(w.window?.start)));l.fillStyle=_s[L],l.globalAlpha=w.status==="proposed"?.45:.85,l.fillRect(b,A+M*.18,y-b,M*.64),l.globalAlpha=1,re(l,w.name,v-10,A+M*.72,Math.min(M*.62,u*.024),w.category==="crewed"?F.text:F.dim,"right",w.category==="crewed"?700:500)}),r){const w=E(r.getTime());l.strokeStyle=F.warning,l.lineWidth=2,l.beginPath(),l.moveTo(w,p-6),l.lineTo(w,S),l.stroke(),re(l,`GAME DATE ${r.toISOString().slice(0,10)}`,w+6,p-2,u*.024,F.warning,"left",700)}is(l,v,u*.985,u*.024,Object.keys(_s).map(w=>[w,_s[w]]))}}{const{g:l,w:c,h:u}=_t(i.trend,"FUNDS · SCIENCE · REPUTATION",s?`${s.length} points`:""),d=s??[];if(d.length<2)St(i.trend,d.length?"One data point so far":e.data.errors.history?"History unavailable":"Loading history…","Trends come from the save's Backup/ snapshots and every state the bridge has seen");else{const h=[d[0].ut,d[d.length-1].ut];kr(l,c*.06,u*.14,c*.96,u*.84,[{pts:d.filter(f=>f.funds!==null).map(f=>[f.ut,f.funds]),color:"#7fd19b"},{pts:d.filter(f=>f.science!==null).map(f=>[f.ut,f.science]),color:F.predicted},{pts:d.filter(f=>f.reputation!==null).map(f=>[f.ut,f.reputation]),color:F.caution}],h),is(l,c*.06,u*.94,u*.032,[["Funds","#7fd19b"],["Science",F.predicted],["Reputation",F.caution]]),re(l,`${Ki(h[0]).toISOString().slice(0,10)} → ${Ki(h[1]).toISOString().slice(0,10)}`,c*.96,u*.94,u*.028,F.dim,"right"),re(l,"Each series scaled to its own maximum",c*.96,u*.12,u*.024,F.dim,"right")}}{const{g:l,w:c,h:u}=_t(i.phases,"CONTRACTS BY PROGRAM PHASE",n?`${n.contracts.completedCount} completed`:"");if(!n)St(i.phases,e.store.careerError?"Career save unavailable":"Loading career…");else{const d=t?.contractMeta?.phases??[],h=t?.contractMeta?.contracts??{},f=new Set(n.contracts.completedTypes),g=d.map(m=>{const p=Object.entries(h).filter(([,M])=>M.phase===m.id).map(([M])=>M),S=n.contracts.active.filter(M=>pi(t,M.subtype)===m.id).length,E=n.contracts.offered.filter(M=>pi(t,M.subtype)===m.id).length;return[m.label,String(p.length),String(p.filter(M=>f.has(M)).length),String(S),String(E)]}),v=n.contracts.active.filter(m=>!pi(t,m.subtype)).length;g.push(["Other (stock / RP-1 contracts)","—","—",String(v),String(n.contracts.offered.filter(m=>!pi(t,m.subtype)).length)]),wn(l,c*.04,u*.16,c*.92,u*.075,[{label:"Phase",w:5},{label:"Defined",w:1.2,align:"right"},{label:"Done",w:1,align:"right"},{label:"Active",w:1.1,align:"right"},{label:"Offered",w:1.2,align:"right"}],g),d.length||re(l,"Contract metadata not found in this checkout (contracts/manifest/contract-meta.json)",c*.04,u*.9,u*.026,F.dim)}}return["timeline","trend","phases"]},monitor(i,e){const t=e.store.career?.summary,n=e.data.planning;if(!t)return{rows:[["Career",e.store.careerError?"unavailable":"loading"]],level:"nodata"};const s=Ra(n,t.contracts),r=a=>[...s.values()].filter(o=>o.state===a).length;switch(i){case"MANIFEST":return{rows:[["Missions",String(n?.manifest?.missions?.length??"—")],["Completed",String(r("completed"))],["Active",String(r("active"))],["Offered",String(r("offered"))]],level:n?.manifest?"nominal":"nodata"};case"CONTRACTS":return{rows:[["Active",String(t.contracts.active.length)],["Offered",String(t.contracts.offered.length)],["Completed",String(t.contracts.completedCount)],["Failed",String(t.contracts.failedCount)]],level:"nominal"};case"BUDGET":return{rows:[["Funds",Wt(t.funds)],["Science",ee(t.science,1)],["Reputation",ee(t.reputation)],["Trend points",String(e.data.history?.length??"—")]],level:"nominal"};case"BASE":{const a=(n?.manifest?.missions??[]).filter(l=>l.phase?.startsWith("moon_base")),o=a.filter(l=>s.get(l.id)?.state==="completed").length;return{rows:[["Base missions",String(a.length)],["Completed",String(o)],["Goal","Permanent lunar base"]],level:n?.manifest?"nominal":"nodata"}}case"FACILITIES":return{rows:t.facilities.slice(0,6).map(a=>[a.id.replace(/^SpaceCenter\//,""),a.level===null?"—":`${Math.round(a.level*100)}%`]),level:"nominal"};default:return{rows:[["Save",e.store.career?.save??"—"],["Mode",t.mode??"—"],["Game date",Uc(e)?.toISOString().slice(0,10)??"—"],["Funds",Wt(t.funds)]],level:"nominal"}}},panel(i,e){const t=e.store.career?.summary,n=e.data.planning,s=(a,o,l="nominal",c="OK")=>`<header><div><div class="pos">${a}</div><div class="ptitle">${Q(o)}</div></div><div class="lamp ${l}">${c}</div></header>`;if(!i||i==="PM")return Nu(e.store);const r=Ra(n,t?.contracts);if(i==="MANIFEST"||i==="BASE"){const a=Nc(e);if(a)return s(i,i==="BASE"?"Lunar base goal":"Manifest","nodata","NO DATA")+`<p class="muted">${Q(a)}</p>`;let o=n.manifest.missions??[];i==="BASE"&&(o=o.filter(u=>u.phase?.startsWith("moon_base")));const l=o.map(u=>{const d=r.get(u.id);return`<div class="contract"><div class="ct">${Q(u.name)} <span class="pill" style="border-color:${_s[d?.state??"no contract"]};color:${_s[d?.state??"no contract"]}">${d?.state??"—"}</span></div>
          <div class="row"><span class="k">Window</span><span class="v small">${Q(u.window?.start??"?")}${u.window?.end&&u.window.end!==u.window.start?` to ${Q(u.window.end)}`:""} · ${Q(u.status??"")} · ${Q(u.confidence??"")}</span></div>
          ${u.launch_vehicle?`<div class="row"><span class="k">Vehicle</span><span class="v small">${Q(u.launch_vehicle)}</span></div>`:""}
          ${u.destination?`<div class="row"><span class="k">Destination</span><span class="v small">${Q(u.destination)}</span></div>`:""}
          ${i==="BASE"&&u.base_contribution?`<div class="muted small">${Q(u.base_contribution)}</div>`:""}
          ${u.dependencies?.length?`<div class="muted small">Needs: ${u.dependencies.map(Q).join(", ")}</div>`:""}
          ${d?.contracts.length?`<div class="muted small">Contracts: ${d.contracts.map(Q).join(", ")}</div>`:""}</div>`}).join(""),c=i==="BASE"?`<p>${Q(n.manifest.career_goal??"Permanent lunar base")}</p>`:"";return s(i,i==="BASE"?"Lunar base goal":`Manifest (${o.length} missions)`)+c+l}if(!t)return s(i,Fu.consoles.find(a=>a.id===i)?.title??"","nodata","NO DATA")+'<p class="muted">Career save not loaded yet.</p>';if(i==="CONTRACTS"){const a=o=>`<div class="contract"><div class="ct">${Q(o.title)}</div><div class="row"><span class="k">Phase</span><span class="v small">${Q(n?.contractMeta?.phases?.find(l=>l.id===pi(n,o.subtype))?.label??"not a myKSP contract")}</span></div><div class="row"><span class="k">Reward</span><span class="v small">${Wt(o.fundsCompletion)}</span></div></div>`;return s(i,"Contracts by phase")+`<h3>Active (${t.contracts.active.length})</h3>${t.contracts.active.map(a).join("")||'<div class="muted">None</div>'}<h3>Offered (${t.contracts.offered.length})</h3>${t.contracts.offered.slice(0,30).map(a).join("")||'<div class="muted">None</div>'}`}if(i==="BUDGET"){const a=e.data.history??[],o=a.slice(-20).reverse().map(l=>`<div class="row"><span class="k mono">${Ki(l.ut).toISOString().slice(0,10)}</span><span class="v small">${Wt(l.funds)} · ${ee(l.science,1)} sci · ${ee(l.reputation)} rep · ${l.source}</span></div>`).join("");return s(i,"Budget and trends")+`<div class="kpis"><div><span>Funds</span><b>${Wt(t.funds)}</b></div><div><span>Science</span><b>${ee(t.science,1)}</b></div><div><span>Reputation</span><b>${ee(t.reputation)}</b></div></div><h3>History (${a.length} points)</h3>${o||'<div class="muted">No history yet</div>'}<p class="muted foot">Points come from KSP's own Backup/ saves and every state the bridge has seen since it started logging.</p>`}return s(i,"Facilities")+'<p class="muted small">Upgrade level as KSP stores it (0 = first level, 100% = fully upgraded). CustomBarnKit sets how many levels each building has.</p>'+t.facilities.map(a=>`<div class="row"><span class="k">${Q(a.id.replace(/^SpaceCenter\//,""))}</span><span class="v">${a.level===null?"—":`${Math.round(a.level*100)}% of top level`}</span></div>`).join("")}};let Ca="";const ko=2e5,Pa=1e5,zo=(i,e,t)=>Math.sqrt(t*t+2*i/e)-Math.sqrt(i/e);function Da(i,e){const t=i.get("Earth"),n=i.get("Moon");if(!t?.gm||!t.radius||!n?.gm||!n.radius||!n.orbit)return null;const s=t.radius+ko,r=i.relPos("Moon",e),a=r?Math.hypot(...r):n.orbit.sma,o=Va(t.gm,s,a),l=Math.sqrt(t.gm*(2/a-2/(s+a))),c=Math.sqrt(t.gm/a),u=zo(n.gm,n.radius+Pa,Math.abs(c-l)),d=Math.sqrt(n.gm/(n.radius+Pa))*1.08,h=[{label:"Launch to LEO (200 km)",dv:9300,note:"typical RSS ascent incl. losses (LCC profile)"},{label:"Trans-lunar injection",dv:o.dv1,note:`from ${ko/1e3} km LEO, ${ee(o.tof/86400,1)} d coast`},{label:"Lunar orbit insertion",dv:u,note:`${Pa/1e3} km circular`},{label:"Lunar descent",dv:d,note:"from 100 km LLO, ~8% losses"}],f=i.get("Sun");for(const g of["Mars","Venus"]){const v=i.get(g);if(!f?.gm||!t.orbit||!v?.orbit)continue;const m=Va(f.gm,t.orbit.sma,v.orbit.sma);h.push({label:`Trans-${g==="Mars"?"Mars":"Venus"} injection`,dv:zo(t.gm,s,m.dv1),note:`from LEO, Hohmann, ${ee(m.tof/86400,0)} d`})}return h}const Ou={id:"mdc",code:"MDC",name:"Mission Design Center",purpose:"Moon geometry, interplanetary windows and a Δv budget from this install's body orbits",consoles:[{id:"TRAJ",title:"Lunar trajectory"},{id:"WINDOWS",title:"Departure windows"},{id:"BUDGET",title:"Δv budget"},{id:"CONTRACTS",title:"Mission requirements"}],screens:[{key:"moon",w:2048,h:768,label:"Moon, next 30 days"},{key:"windows",w:1024,h:768,label:"Departure windows"},{key:"budget",w:1024,h:768,label:"Δv budget"}],build(){return Ca="",Bs({W:20,D:14,H:4.6,wall:"#262b31",floor:"#22262b",coffer:"#4f5a63",screens:[{key:"moon",cw:2048,ch:768,w:8.4,h:3.15,x:0,y:2.5},{key:"windows",cw:1024,ch:768,w:4,h:3,x:-2,y:2.4,wall:"left"},{key:"budget",cw:1024,ch:768,w:4,h:3,x:-2,y:2.4,wall:"right"}],tiers:[-1.8,2.2],seats:[{id:"TRAJ",x:-3,z:-1.8},{id:"WINDOWS",x:3,z:-1.8},{id:"BUDGET",x:-3,z:2.2,row:1},{id:"CONTRACTS",x:3,z:2.2,row:1}],overview:{pos:[0,3.4,6.2],look:[0,2.4,-7]}})},draw(i,e){const t=e.data.system,n=bn(e),s=e.store.frame,r=`${!!t}|${n===null?"":Math.floor(n/3600)}|${s?.prop.totalDv===null||s?.prop.totalDv===void 0?"":Math.round(s.prop.totalDv/10)}`;if(r===Ca)return[];Ca=r;const a=t?n===null?"No game time yet (no live data or save)":null:e.data.errors.install?`Install facts unavailable: ${e.data.errors.install}`:e.data.install?"No RSS body configs found in this install":"Loading body orbits…";if(a){for(const o of["moon","windows","budget"])_t(i[o],o.toUpperCase(),""),St(i[o],a);return["moon","windows","budget"]}{const{g:o,w:l,h:c}=_t(i.moon,"MOON · NEXT 30 DAYS",`from ${Is(n).slice(0,10)} · this install's orbit elements`),u=[];for(let m=n;m<=n+30*86400;m+=3*3600){const p=mi(t,m);p&&u.push({t:m,dec:p.dec,dist:p.dist/1e3,ill:p.illuminated,el:p.elongation,wax:p.waxing})}const d=l*.04,h=l*.97,f=c*.14,g=c*.84;for(let m=0;m<u.length-1;m++){const p=d+(u[m].t-n)/2592e3*(h-d),S=d+(u[m+1].t-n)/(30*86400)*(h-d);o.fillStyle=`rgba(220,230,240,${.03+u[m].ill*.1})`,o.fillRect(p,f,S-p+1,g-f)}const v=u.map(m=>[m.t,m.dec+30]);kr(o,d,f,h,g,[{pts:v,color:F.predicted,max:60},{pts:u.map(m=>[m.t,m.dist]),color:F.caution,dash:!0,min:35e4,max:41e4}],[n,n+30*86400]);for(let m=1;m<u.length;m++){const p=u[m-1],S=u[m],E=d+(S.t-n)/(30*86400)*(h-d);p.el>170!=S.el>170&&S.el>170&&re(o,"○ FULL",E,f+c*.05,c*.03,F.text,"center",700),p.el<10!=S.el<10&&S.el<10&&re(o,"● NEW",E,f+c*.05,c*.03,F.dim,"center",700)}for(let m=0;m<=30;m+=5)re(o,`+${m} d`,d+m/30*(h-d),g+c*.05,c*.026,F.dim,"center");is(o,d,c*.96,c*.03,[["Declination (−30° to +30°)",F.predicted],["Distance (350,000 to 410,000 km)",F.caution],["Brightness = illuminated fraction","#8090a0"]])}{const{g:o,w:l,h:c}=_t(i.windows,"DEPARTURE WINDOWS FROM EARTH","Hohmann, circular coplanar"),u=t.get("Earth"),d=[];for(const h of["Mars","Venus"]){const f=Wr(t,"Earth",h,n,94608e3,2),g=Sr(t,"Earth",h,n);for(const v of f)d.push([h,xn(v.ut),ee(zo(u.gm,u.radius+ko,v.dv1),0),ee(v.tof/86400,0),`${ee(g,1)}° → ${ee(v.phase,1)}°`]);f.length||d.push([h,"none in 3 years","—","—","—"])}wn(o,l*.04,c*.16,l*.92,c*.08,[{label:"Target",w:1.2},{label:"Depart",w:2.2,mono:!0},{label:"Δv from LEO",w:1.6,align:"right"},{label:"Days",w:.9,align:"right"},{label:"Phase now → needed",w:2.6,align:"right"}],d),re(o,"Real porkchop minima differ by days to weeks (eccentric, inclined orbits).",l*.04,c*.94,c*.028,F.dim)}{const{g:o,w:l,h:c}=_t(i.budget,"Δv BUDGET",s?.vessel.name?`vs ${s.vessel.name}`:"no live vehicle"),u=Da(t,n)??[],d=s?.prop.totalDv??null;u.forEach((h,f)=>{const g=c*.15+f*c*.12;re(o,h.label,l*.05,g,c*.032,F.text,"left",600),re(o,`${ee(h.dv,0)} m/s`,l*.95,g,c*.032,F.text,"right",600,!0),re(o,h.note,l*.05,g+c*.038,c*.022,F.dim),Uu(o,l*.05,g+c*.05,l*.9,c*.015,d===null?null:Math.min(1,d/h.dv),d!==null&&d>=h.dv?"#7fd19b":F.caution)}),re(o,d===null?"Bars fill with the live vehicle's Δv when KSP is in a flight scene":`Live vehicle: ${ee(d,0)} m/s total (vacuum)`,l*.05,c*.95,c*.028,F.dim)}return["moon","windows","budget"]},monitor(i,e){const t=e.data.system,n=bn(e);if(!t||n===null)return{rows:[["Body orbits",t?"no game time":"loading"]],level:"nodata"};if(i==="TRAJ"){const r=mi(t,n);return{rows:r?[["Phase",`${Math.round(r.illuminated*100)}% ${r.waxing?"waxing":"waning"}`],["Declination",`${ee(r.dec,2)}°`],["Distance",`${ee(r.dist/1e3,0)} km`]]:[["Moon","no data"]],level:r?"nominal":"nodata"}}if(i==="WINDOWS"){const r=[];for(const a of["Mars","Venus"]){const o=Wr(t,"Earth",a,n,94608e3,1)[0];r.push([a,o?xn(o.ut):"none"])}return{rows:r,level:"nominal"}}if(i==="BUDGET")return{rows:(Da(t,n)??[]).slice(0,4).map(a=>[a.label.replace("Trans-lunar injection","TLI").replace("Lunar orbit insertion","LOI"),`${ee(a.dv,0)} m/s`]),level:"nominal"};const s=e.store.career?.summary.contracts.active??[];return{rows:[["Active contracts",String(s.length)],["Next deadline",s.filter(r=>r.dueUT).sort((r,a)=>r.dueUT-a.dueUT)[0]?.dueUT?xn(s.filter(r=>r.dueUT).sort((r,a)=>r.dueUT-a.dueUT)[0].dueUT):"—"]],level:e.store.career?"nominal":"nodata"}},panel(i,e){const t=e.data.system,n=bn(e),s=i??"TRAJ",r=Ou.consoles.find(c=>c.id===s)?.title??"",a=!!t&&n!==null,o=`<header><div><div class="pos">${s}</div><div class="ptitle">${Q(r)}</div></div><div class="lamp ${a?"nominal":"nodata"}">${a?"OK":"NO DATA"}</div></header>`;if(!a&&s!=="CONTRACTS")return o+`<p class="muted">${t?"No game time yet.":"Body orbits not loaded (needs the RSS Kopernicus configs from the install)."}</p>`;if(s==="WINDOWS"){const c=["Mars","Venus"].flatMap(u=>Wr(t,"Earth",u,n,126144e3,3).map(d=>`<div class="row"><span class="k">${u}</span><span class="v small">${xn(d.ut)} · ${ee(d.tof/86400,0)} d</span></div>`)).join("");return o+c+`<p class="muted foot">Times when Earth–target phase matches the Hohmann phase, from this install's orbit elements. Use Transfer Window Planner in KSP for exact porkchop plots.</p>`}if(s==="BUDGET"){const c=Da(t,n)??[],u=e.store.frame?.prop.totalDv??null;return o+c.map(d=>`<div class="row"><span class="k">${Q(d.label)}</span><span class="v small">${ee(d.dv,0)} m/s ${u===null?"":u>=d.dv?"✓":"✗"}</span></div><div class="muted small">${Q(d.note)}</div>`).join("")+`<p class="muted foot">${u===null?"No live vehicle.":`Live vehicle ${Q(e.store.frame?.vessel.name)}: ${ee(u,0)} m/s.`} Ideal (impulsive) values from the body orbits; add margins for steering and boil-off.</p>`}if(s==="CONTRACTS"){const c=e.store.career?.summary.contracts.active??[];return o+(c.map(u=>`<div class="contract"><div class="ct">${Q(u.title)}</div>${u.dueUT?`<div class="row"><span class="k">Deadline</span><span class="v small">${xn(u.dueUT)}</span></div>`:""}${u.parameters.map(d=>`<div class="row"><span class="k">${Q(d.title)}</span><span class="v small">${Q(d.state)}</span></div>`).join("")}</div>`).join("")||'<p class="muted">No active contracts.</p>')}const l=Array.from({length:15},(c,u)=>n+u*2*86400).map(c=>{const u=mi(t,c);return`<div class="row"><span class="k mono">${xn(c)}</span><span class="v small">${Math.round(u.illuminated*100)}% · dec ${ee(u.dec,1)}° · ${ee(u.dist/1e3,0)} km</span></div>`}).join("");return o+l+`<p class="muted foot">Launch-to-TLI timing depends on the Moon's declination against the launch site latitude: low-declination days allow lower-inclination parking orbits.</p>`}};function Bu(i,e,t={body:"#d9d4c7",accent:"#c7792f"}){const n=new Fn;if(!i.parts.length)return n;const s=e?Math.max(e[0],e[2]):5,r=[],a=Math.max(.6,s*.06);for(const E of i.parts){const[M,w,R]=E.pos;let A=r.find(L=>Math.hypot(L.x-M,L.z-R)<a);A||(A={x:M,z:R,y0:w,y1:w,n:0},r.push(A)),A.y0=Math.min(A.y0,w),A.y1=Math.max(A.y1,w),A.n++}r.sort((E,M)=>M.y1-M.y0-(E.y1-E.y0));const o=r[0],l=Math.min(...i.parts.map(E=>E.pos[1])),c=Math.max(...i.parts.map(E=>E.pos[1])),u=e?e[1]:c-l+4,d=(u-(c-l))/2,h=r.slice(1).filter(E=>E.n>=2&&E.y1-E.y0>u*.08),f=h.length?Math.min(...h.map(E=>Math.hypot(E.x-o.x,E.z-o.z))):s,g=Math.max(.6,Math.min(s/2,f*.55)*(h.length?.8:1))*(h.length?1:.9),v=new ns({color:t.body,roughness:.55,metalness:.1}),m=new ns({color:t.accent,roughness:.6,metalness:.1}),p=(E,M,w,R)=>{const A=E.y0-l,L=E.y1-l+d*2,b=Math.max(1,L-A),y=new $e(new Fr(M,M,b,24),w);y.position.set(E.x-o.x,A+b/2,E.z-o.z),n.add(y);const P=Math.min(M*(R?2.2:1.4),b*.25),B=new $e(new rl(M,P,24),w);B.position.set(E.x-o.x,A+b+P/2,E.z-o.z),n.add(B)};p(o,g,v,!0);const S=Math.max(.4,Math.min(g*.6,f-g-.1));for(const E of h)p(E,S,m,!1);return n.userData.height=u,n}function ku(i){return i?i.replace(/\s+(Ship|Probe|Lander|Rover|Debris|Station|Base|Relay|Plane|Lander)$/i,"").trim():null}const zu="myksp.vih";let _i=null;try{_i=localStorage.getItem(zu)}catch{}let La="",xs="";function gr(i){const e=i.data.craft??[];if(!e.length)return null;const t=_i?e.find(s=>s.file===_i):void 0;if(t)return t;const n=ku(i.store.frame?.vessel.name??null);return e.find(s=>s.name===n)??e.find(s=>s.facility==="VAB")??e[0]}const Hu={id:"vih",code:"VIH",name:"Vehicle Integration Hall",purpose:"Every vehicle design in the install, stacked at true scale with its mass, cost and load",consoles:[{id:"VI",title:"Vehicle integration lead"},{id:"STACK",title:"Stack and stages"},{id:"LOAD",title:"Propellant and consumables"},{id:"INVENTORY",title:"Design inventory"}],screens:[{key:"inventory",w:1024,h:1024,label:"Design inventory"},{key:"detail",w:1024,h:1024,label:"Selected vehicle"}],build(){const s=new Os("#0a0c0f",[160,420]);s.shell({w:64,d:130,h:140,front:-40,wall:"#3b3e42",floor:"#2e2f31",ceil:"#1a1b1d",frontColor:"#33363a"});for(let o=-30;o<90;o+=18)for(const l of[-1,1])s.box("column",()=>s.std("#4a4d52",.7,.4),2,140,2,l*(64/2-1),140/2,o);for(const o of[20,36,52,68,84,100]){for(const l of[-1,1])s.box("platform",()=>s.std("#6b5e45",.8,.3),9,1.2,22,l*27,o,0);for(const l of[-1,1])s.box("rail",()=>s.std("#c79a3a",.6,.5),.15,1.1,22,l*22.6,o+1.15,0)}s.box("ml",()=>s.std("#4b4f54",.75,.45),40,8,34,0,4,0),s.box("ml",()=>s.std("#4b4f54",.75,.45),8,120,8,-22,68,-10),s.box("floorStripe",()=>s.std("#b48a2c",.9),64,.05,.6,0,.03,24),s.screen("inventory",1024,1024,11,11,-64/2+.2,9,40,Math.PI/2),s.screen("detail",1024,1024,11,11,64/2-.2,9,40,-Math.PI/2);const r=[["INVENTORY",-22,40,Math.PI/2],["VI",-5,52,0],["STACK",5,52,0],["LOAD",22,40,-Math.PI/2]];for(const[o,l,c,u]of r)s.console(o,l,0,c,{rotY:u,width:3.4,view:u===0?{pos:vt(l*.6,3,c+5),look:vt(0,30,0)}:{pos:vt(l*.6+Math.sign(-l)*2,3.2,c+3),look:vt(Math.sign(l)*64/2,8,40)}});s.scene.add(new Eu("#c9d6e2","#2a2620",.45));for(const o of[130,70])for(const l of[-20,20]){const c=new ol("#ffe9c8",1400,400,.5,.6,1.2);c.position.set(l,o,40),c.target.position.set(0,o*.5,0),s.scene.add(c,c.target)}const a=new Fn;return a.position.set(0,8,0),a.name="vehicle",s.scene.add(a),La="",xs="",s.finish({pos:vt(0,34,88),look:vt(0,48,0)})},enter(i){i.data.loadCraft(),xs=""},draw(i,e){const t=e.data.craft,n=gr(e),s=n?e.data.craftDetail.get(n.file):void 0;n&&!s&&e.data.loadCraftDetail(n.file);const r=`${t?.length}|${n?.file}|${!!s}`;if(r===xs)return[];xs=r;{const{g:a,w:o,h:l}=_t(i.inventory,"DESIGN INVENTORY",t?`${t.length} designs`:"");if(!t)St(i.inventory,e.data.errors.craft?`Craft unavailable: ${e.data.errors.craft}`:"Loading craft…");else if(!t.length)St(i.inventory,"No craft files in this install");else{const c=t.slice(0,18).map(u=>[u.name,u.facility??"—",u.totalMass===null?"—":ee(u.totalMass,1),Wt(u.totalCost),u.partCount===null?"—":String(u.partCount),u.size?ee(u.size[1],1):"—"]);wn(a,o*.04,l*.12,o*.92,l*.045,[{label:"Design",w:4},{label:"Bldg",w:.9},{label:"Mass t",w:1.3,align:"right"},{label:"Cost",w:1.5,align:"right"},{label:"Parts",w:1,align:"right"},{label:"Height m",w:1.4,align:"right"}],c,t.map(u=>u.file===n?.file?F.predicted:void 0)),re(a,"Mass and cost are KSP's editor figures (.loadmeta).",o*.04,l*.97,l*.024,F.dim)}}{const{g:a,w:o,h:l}=_t(i.detail,n?n.name.toUpperCase():"SELECTED VEHICLE",n?.save?`save ${n.save}`:n?.facility??"");if(!n)St(i.detail,"No design selected");else{if(Gt(a,o*.05,l*.13,l*.055,"Mass",n.totalMass===null?"—":`${ee(n.totalMass,1)} t`),Gt(a,o*.52,l*.13,l*.055,"Cost",Wt(n.totalCost)),Gt(a,o*.05,l*.25,l*.055,"Height × width",n.size?`${ee(n.size[1],1)} × ${ee(Math.max(n.size[0],n.size[2]),1)} m`:"—"),Gt(a,o*.52,l*.25,l*.055,"Parts · stages",`${n.partCount??"—"} · ${s?.stages??n.stageCount??"—"}`),!s)re(a,e.data.errors[`craft:${n.file}`]??"Reading the craft file…",o*.05,l*.42,l*.03,F.dim);else{const c=Object.entries(s.resources).filter(([,u])=>u.max>0).sort((u,d)=>d[1].max-u[1].max).slice(0,13);wn(a,o*.05,l*.4,o*.9,l*.042,[{label:"Resource",w:3},{label:"Loaded",w:2,align:"right"},{label:"Capacity",w:2,align:"right"},{label:"Fill",w:1,align:"right"}],c.map(([u,d])=>[Xr[u]??u,ee(d.amount,0),ee(d.max,0),`${Math.round(d.amount/d.max*100)}%`])),c.length||re(a,"No resources in this design",o*.05,l*.45,l*.03,F.dim)}n.description&&re(a,n.description.slice(0,80),o*.05,l*.97,l*.024,F.dim)}}return["inventory","detail"]},sceneUpdate(i,e){const t=i.scene.getObjectByName("vehicle"),n=gr(e);if(!t)return!1;const s=n?.file??"none";if(s===La)return!1;if(n){const r=e.data.craftDetail.get(n.file);if(!r)return e.data.loadCraftDetail(n.file),!1;t.clear(),t.add(Bu(r,n.size))}else t.clear();return La=s,!0},monitor(i,e){const t=gr(e);if(!t)return{rows:[["Designs",e.data.craft?"none":"loading"]],level:"nodata"};const n=e.data.craftDetail.get(t.file);if(i==="INVENTORY")return{rows:[["Designs",String(e.data.craft?.length??0)],["VAB",String(e.data.craft?.filter(s=>s.facility==="VAB").length??0)],["SPH",String(e.data.craft?.filter(s=>s.facility==="SPH").length??0)]],level:"nominal"};if(i==="LOAD"){const s=n?Object.entries(n.resources).filter(([,r])=>r.max>0).sort((r,a)=>a[1].max-r[1].max).slice(0,5):[];return{rows:s.length?s.map(([r,a])=>[Xr[r]??r,`${Math.round(a.amount/a.max*100)}%`]):[["Load",n?"none":"reading"]],level:n?"nominal":"nodata"}}return i==="STACK"?{rows:[["Height",t.size?`${ee(t.size[1],1)} m`:"—"],["Parts",String(t.partCount??"—")],["Stages",String(n?.stages??t.stageCount??"—")]],level:"nominal"}:{rows:[["Design",t.name],["Mass",t.totalMass===null?"—":`${ee(t.totalMass,1)} t`],["Cost",Wt(t.totalCost)]],level:"nominal"}},panel(i,e){const t=gr(e),n=t?e.data.craftDetail.get(t.file):void 0,s=Hu.consoles.find(l=>l.id===(i??"VI"))?.title??"",r=`<header><div><div class="pos">${i??"VI"}</div><div class="ptitle">${Q(s)}</div></div><div class="lamp ${t?"nominal":"nodata"}">${t?"OK":"NO DATA"}</div></header>`,a=(e.data.craft??[]).map(l=>`<button class="item ${l.file===t?.file?"sel":""}" data-act="pick" data-file="${Q(l.file)}"><div class="t">${Q(l.name)}</div><div class="m"><span>${l.facility??""}${l.save?` · ${Q(l.save)}`:""}</span><span>${l.totalMass===null?"":`${ee(l.totalMass,1)} t`}</span></div></button>`).join("");let o="";if(!t)o=`<p class="muted">${e.data.craft?"No craft files in this install.":"Loading craft…"}</p>`;else if(i==="LOAD")o=(n?Object.entries(n.resources).filter(([,c])=>c.max>0).sort((c,u)=>u[1].max-c[1].max):[]).map(([c,u])=>`<div class="row"><span class="k">${Q(Xr[c]??c)}</span><span class="v small">${ee(u.amount,1)} / ${ee(u.max,1)}</span></div>`).join("")||`<p class="muted">${n?"No resources":"Reading the craft file…"}</p>`;else if(i==="STACK"){const l=new Map;for(const c of n?.parts??[])l.set(c.stage,(l.get(c.stage)??0)+1);o=`<p class="muted small">Parts by decouple stage (KSP's dstg; 0 is the payload end).</p>`+[...l.entries()].sort((c,u)=>u[0]-c[0]).map(([c,u])=>`<div class="row"><span class="k">Stage ${c}</span><span class="v small">${u} parts</span></div>`).join("")}else o=`<div class="kpis"><div><span>Mass</span><b class="small">${t.totalMass===null?"—":ee(t.totalMass,1)+" t"}</b></div><div><span>Cost</span><b class="small">${Wt(t.totalCost)}</b></div><div><span>Height</span><b class="small">${t.size?ee(t.size[1],1)+" m":"—"}</b></div><div><span>Parts</span><b class="small">${t.partCount??"—"}</b></div></div>${t.description?`<p>${Q(t.description)}</p>`:""}
      <p class="muted foot">The stack is drawn from the craft file's part positions: each vertical column of parts becomes one cylinder. Part shapes are not in the craft file, so this is a silhouette, not the in-game model.</p>`;return r+o+`<h3>Designs (${e.data.craft?.length??0})</h3><div class="list">${a||'<div class="muted">None</div>'}</div>`},action(i,e,t){if(i.dataset.act==="pick"&&t.type==="click"){_i=i.dataset.file??null;try{localStorage.setItem(zu,_i??"")}catch{}return _i&&e.data.loadCraftDetail(_i),xs="",e.refresh(),!0}return!1}};let Ia="";const Ua=i=>(i.store.career?.summary.crew??[]).filter(e=>e.type==="Crew"||e.type===null);function Ms(i,e){return i.state==="Dead"?{text:"Deceased",color:F.warning}:i.state==="Missing"?{text:"Missing",color:F.caution}:i.vessel||i.state==="Assigned"?{text:i.vessel?`Flying: ${i.vessel}`:"Assigned",color:F.predicted}:i.inactive&&i.inactiveUntil!==null&&(e===null||i.inactiveUntil>e)?{text:`Unavailable to ${xn(i.inactiveUntil)}`,color:F.caution}:{text:"Available",color:"#7fd19b"}}const Ss=i=>i.map(e=>Vo(e)??e).filter((e,t,n)=>n.indexOf(e)===t),Gu={id:"astro",code:"CB",name:"Astronaut Office",purpose:"Crew roster, flight records, assignments and availability from the save",consoles:[{id:"CHIEF",title:"Chief of the Astronaut Office"},{id:"ROSTER",title:"Roster"},{id:"ASSIGN",title:"Crew assignments"},{id:"RECORDS",title:"Flight records"}],screens:[{key:"roster",w:2048,h:1024,label:"Roster"},{key:"stats",w:1024,h:1024,label:"Corps statistics"}],build(){return Ia="",Bs({W:16,D:12,H:4.2,wall:"#2c2d30",floor:"#25262a",coffer:"#5d574d",screens:[{key:"roster",cw:2048,ch:1024,w:6.8,h:3.4,x:-1.6,y:2.25},{key:"stats",cw:1024,ch:1024,w:3,h:3,x:4.6,y:2.25}],table:[0,.6,6,2],seats:[{id:"CHIEF",x:0,z:3.2,rotY:Math.PI,width:2.4},{id:"ROSTER",x:-2.2,z:-1.4,width:2.4},{id:"ASSIGN",x:.6,z:-1.4,width:2.4},{id:"RECORDS",x:3.4,z:-1.4,width:2.4}],overview:{pos:[0,2.9,5.6],look:[0,2.1,-6]}})},draw(i,e){const t=Ua(e),n=bn(e),s=`${e.store.career?.summary.savedAt}|${t.length}|${n===null?"":Math.floor(n/3600)}`;if(s===Ia)return[];Ia=s;{const{g:r,w:a,h:o}=_t(i.roster,"ASTRONAUT ROSTER",e.store.career?`${t.length} astronauts · ${e.store.career.save}`:"");if(!e.store.career)St(i.roster,e.store.careerError?"Career save unavailable":"Loading career…");else if(!t.length)St(i.roster,"No astronauts in this save");else{const l=[...t].sort((u,d)=>+!!d.vessel-+!!u.vessel||d.flights-u.flights||u.name.localeCompare(d.name)),c=l.map(u=>Ms(u,n));wn(r,a*.03,o*.13,a*.94,o*.05,[{label:"Name",w:3},{label:"Role",w:1.6},{label:"Status",w:3.2},{label:"Flights",w:.9,align:"right"},{label:"Flown to",w:2.4},{label:"Landed on",w:2}],l.map((u,d)=>[u.name+(u.veteran?" ★":""),u.trait??"—",c[d].text,String(u.flights),Ss(u.visited).join(", ")||"—",Ss(u.landed).join(", ")||"—"]),c.map(u=>u.color),16),l.length>16&&re(r,`+ ${l.length-16} more in the ROSTER console`,a*.03,o*.97,o*.026,F.dim)}}{const{g:r,w:a,h:o}=_t(i.stats,"CORPS","");if(t.length){const l=f=>t.filter(g=>g.trait===f).length,c=t.filter(f=>Ms(f,n).text==="Available").length,u=t.filter(f=>f.vessel).length,d=t.filter(f=>f.state==="Dead"||f.state==="Missing").length;[["Active corps",String(t.length-d)],["Available now",String(c),"#7fd19b"],["In flight",String(u),F.predicted],["Pilots · Engineers · Scientists",`${l("Pilot")} · ${l("Engineer")} · ${l("Scientist")}`],["Flown in space",String(t.filter(f=>f.flights>0).length)],["Walked on the Moon",String(t.filter(f=>Ss(f.landed).includes("Moon")).length)],["Lost",String(d),d?F.warning:void 0]].forEach(([f,g,v],m)=>Gt(r,a*.07,o*.15+m*o*.115,o*.055,f,g,v))}else St(i.stats,"No crew data")}return["roster","stats"]},monitor(i,e){const t=Ua(e);if(!e.store.career)return{rows:[["Career",e.store.careerError?"unavailable":"loading"]],level:"nodata"};const n=bn(e);if(i==="ASSIGN"){const r=t.filter(a=>a.vessel);return{rows:r.length?r.slice(0,5).map(a=>[a.name.split(" ")[0],a.vessel.slice(0,22)]):[["In flight","none"]],level:"nominal"}}if(i==="RECORDS")return{rows:[...t].sort((a,o)=>o.flights-a.flights).slice(0,5).map(a=>[a.name,`${a.flights} flights`]),level:"nominal"};const s=t.filter(r=>Ms(r,n).text==="Available").length;return{rows:[["Astronauts",String(t.length)],["Available",String(s)],["In flight",String(t.filter(r=>r.vessel).length)],["Veterans",String(t.filter(r=>r.veteran).length)]],level:"nominal"}},panel(i,e){const t=Ua(e),n=bn(e),s=Gu.consoles.find(l=>l.id===(i??"CHIEF"))?.title??"",r=`<header><div><div class="pos">${i??"CHIEF"}</div><div class="ptitle">${Q(s)}</div></div><div class="lamp ${e.store.career?"nominal":"nodata"}">${e.store.career?"OK":"NO DATA"}</div></header>`;if(!e.store.career)return r+'<p class="muted">Career save not loaded yet.</p>';const a=l=>{const c=Ms(l,n);return`<div class="contract"><div class="ct">${Q(l.name)}${l.veteran?" ★":""} <span class="pill" style="border-color:${c.color};color:${c.color}">${Q(c.text)}</span></div>
        <div class="row"><span class="k">Role</span><span class="v small">${Q(l.trait??"—")}${l.gender?` · ${Q(l.gender)}`:""}</span></div>
        <div class="row"><span class="k">Flights</span><span class="v small">${l.flights}</span></div>
        <div class="row"><span class="k">Flown to</span><span class="v small">${Q(Ss(l.visited).join(", ")||"—")}</span></div>
        <div class="row"><span class="k">Landed on</span><span class="v small">${Q(Ss(l.landed).join(", ")||"—")}</span></div></div>`};if(i==="ASSIGN"){const l=(e.store.career.summary.vessels??[]).filter(c=>c.crewNames.length);return r+(l.map(c=>`<div class="contract"><div class="ct">${Q(c.name)}</div><div class="row"><span class="k">Where</span><span class="v small">${Q(c.situation??"")} · ${Q(Vo(c.bodyIdent)??"—")}</span></div>${c.crewNames.map(u=>`<div class="row"><span class="k">Crew</span><span class="v small">${Q(u)}</span></div>`).join("")}</div>`).join("")||'<p class="muted">No crew are aboard any vessel in this save.</p>')+'<p class="muted foot">Assignments are the crew KSP has aboard each vessel. Crew for a vessel still in the editor are not in the save.</p>'}if(i==="RECORDS")return r+([...t].sort((l,c)=>c.flights-l.flights).filter(l=>l.flights>0).map(a).join("")||'<p class="muted">Nobody has flown yet.</p>');if(i==="ROSTER")return r+[...t].sort((l,c)=>l.name.localeCompare(c.name)).map(a).join("");const o=t.filter(l=>Ms(l,n).text==="Available");return r+`<div class="kpis"><div><span>Astronauts</span><b>${t.length}</b></div><div><span>Available</span><b>${o.length}</b></div><div><span>In flight</span><b>${t.filter(l=>l.vessel).length}</b></div><div><span>Veterans</span><b>${t.filter(l=>l.veteran).length}</b></div></div>
      <h3>Available for assignment</h3>${o.map(l=>`<div class="row"><span class="k">${Q(l.name)}</span><span class="v small">${Q(l.trait??"")} · ${l.flights} flights</span></div>`).join("")||'<div class="muted">Nobody</div>'}
      <p class="muted foot">From the save's roster and CAREER_LOG. ${ee(t.reduce((l,c)=>l+c.flights,0))} flights logged in total.</p>`}},Vu="myksp.lcc";function l2(){try{const i=JSON.parse(localStorage.getItem(Vu)??"null");if(i?.count)return i}catch{}return{count:Qc(-1200,[-600],-33),profile:"leo",autoHandoff:!0,lastPoll:null,holdMins:30}}let Pe=l2();const Fc=()=>{try{localStorage.setItem(Vu,JSON.stringify(Pe))}catch{}},c2=[[-1200,"Terminal count begins (T-20 min)"],[-600,"Built-in hold, T-10 min (planned 30 min). Launch Director polls the team"],[-600,"Ground launch sequencer starts at release of the hold"],[-480,"Crew access arm retracts"],[-33,"Hand-off to the automated launch sequencer (poll must be GO)"],[-6.36,"Core-stage engine start (SLS-type vehicles)"],[0,"Booster ignition, liftoff. Control passes to Houston (FCR)"]];function ys(i){return i.store.frame?.source==="live"&&i.store.frame.ut!==null?i.store.frame.ut:performance.now()/1e3}function Es(i){return pd(i.store.frame,di[Pe.profile]??di.leo,i.store.status?.commNet??null)}let vr=!1,Ho="";const Wu={id:"lcc",code:"LCC-FR1",name:"Launch Control Center",purpose:"Terminal count, built-in holds and a GO/NO-GO poll answered from live vehicle data",consoles:[{id:"LD",title:"Launch Director"},...Jc.map(i=>({id:i,title:El[i]}))],screens:[{key:"clock",w:2560,h:220,label:"Countdown"},{key:"poll",w:1024,h:768,label:"Poll board"},{key:"pad",w:1024,h:768,label:"Vehicle on the pad"}],build(){const s=new Os("#04060a",[400,2600]);s.shell({w:34,d:24,h:9,front:-12,skipFront:!0,wall:"#262a2f",floor:"#202328"}),s.box("wallLow",()=>s.std("#15181c",.9),34,1.6,.4,0,.8,-12),s.box("wallLow",()=>s.std("#15181c",.9),34,1,.4,0,9-.5,-12),s.glass(-34/2,34/2,1.6,8,-12,10),s.screen("clock",2560,220,15,1.29,0,9-.5,-12+.25),s.screen("poll",1024,768,5.2,3.9,-34/2+.25,4.6,-6,Math.PI/2),s.screen("pad",1024,768,5.2,3.9,34/2-.25,4.6,-6,-Math.PI/2);const r=[-6.5,-2.5,1.5,5.5];s.tiers(34,r,.45,12),s.coffers([-9,-3,3,9],r,9,"#4d473d");const a=[["RANGE",-6.6,0],["VEHICLE",-2.2,0],["PROP",2.2,0],["GNC",6.6,0],["COMM",-4.4,1],["CREW",0,1],["THERMAL",4.4,1],["LD",0,2]];for(const[f,g,v]of a){const m=.45*v,p=r[v];s.console(f,g,m,p,{view:{pos:vt(g*.85,m+2.4,p+3.2),look:vt(g*.4,m+3.2,-52)}})}s.lights(r,9,-12,{warm:"#ffcf9a",spill:"#9fb7cc",spillI:25,hemi:.28});const o=new $e(new sn(4e3,3e3),s.std("#0a0d0f",1));o.rotation.x=-Math.PI/2,o.position.set(0,-.05,-1512),s.scene.add(o);const l=-612;s.box("pad",()=>s.std("#3a3a38",.95),90,6,90,0,3,l),s.box("tower",()=>s.std("#4a3b32",.8,.4),12,120,12,-22,66,l);for(const[f,g]of[[-40,-40],[40,-40],[0,50]])s.box("masts",()=>s.std("#5b5b5b",.7,.5),2,180,2,f,96,l+g);const c=new mn,u=[];for(let f=0;f<1400;f++){const g=Math.random()*Math.PI,v=Math.random()*.9+.04;u.push(Math.cos(g)*2400,Math.sin(v)*2e3+60,-Math.sin(g)*2400+-12)}c.setAttribute("position",new hn(u,3)),s.scene.add(new Hh(c,new Mu({color:"#cfd8e0",size:2,sizeAttenuation:!1})));const d=new $e(new sn(5e3,300),new vn({color:"#0f1a26",transparent:!0,opacity:.6,fog:!1}));d.position.set(0,140,-2412),s.scene.add(d);for(const f of[-60,60]){const g=new ol("#e8f0ff",9e5,900,.32,.4,1.4);g.position.set(f,30,l+160),g.target.position.set(0,50,l),s.scene.add(g,g.target)}const h=new Fn;return h.position.set(0,6,l),h.name="vehicle",s.scene.add(h),Ho="",s.finish({pos:vt(0,5.6,12.5),look:vt(0,4.2,-62)})},enter(i){i.data.loadCraft(),vr=!1},tick(i){const e=ys(i),t=!!i.store.events.find(s=>s.kind==="liftoff"&&Date.now()-s.t<12e4),n=Pe.count.state;return Pe.count=xd(Pe.count,e,cs(Es(i)),t),Pe.count.state!==n&&(Fc(),Pe.count.state==="hold"&&(i.toast(Pe.count.holdReason??"Hold"),i.audio.quindar()),Pe.count.state==="launched"&&!vr&&(vr=!0,i.toast("Liftoff. Control passes to the Flight Control Room."),Pe.autoHandoff&&setTimeout(()=>i.go("fcr"),2500))),Pe.count.state==="counting"||Pe.count.state==="hold"},draw(i,e){const t=e.store.frame,n=Es(e),s=Xi(Pe.count,ys(e));{const r=i.clock.getContext("2d"),{width:a,height:o}=i.clock;r.fillStyle="#020406",r.fillRect(0,0,a,o);const l=Pe.count.state==="hold"?F.caution:Pe.count.state==="scrubbed"?F.warning:Pe.count.state==="launched"?"#7fd19b":F.text;re(r,"COUNTDOWN",a*.01,o*.28,o*.17,F.dim,"left",700),re(r,`T${Vi(s)}`,a*.01,o*.84,o*.52,l,"left",600,!0),re(r,"STATUS",a*.33,o*.28,o*.17,F.dim,"left",700),re(r,Pe.count.state==="idle"?"STANDBY":Pe.count.state.toUpperCase(),a*.33,o*.7,o*.32,l,"left",800),re(r,Pe.count.holdReason??di[Pe.profile]?.label??"",a*.33,o*.93,o*.14,F.dim),re(r,"POLL",a*.62,o*.28,o*.17,F.dim,"left",700);const c=cs(n);re(r,n[0]?.level==="nodata"?"NO VEHICLE":c?"GO FOR LAUNCH":"NO-GO",a*.62,o*.7,o*.32,n[0]?.level==="nodata"?F.dim:c?"#7fd19b":F.warning,"left",800),re(r,"GAME DATE (UTC)",a*.83,o*.28,o*.17,F.dim,"left",700),re(r,Is(t?.ut??null).slice(0,16),a*.83,o*.7,o*.17,F.text,"left",600,!0)}{const{g:r,w:a,h:o}=_t(i.poll,"GO / NO-GO POLL",Pe.lastPoll?`last poll ${Pe.lastPoll.at}`:"live answers"),l=n.map(c=>[c.station,c.level==="nodata"?"NO DATA":c.go?"GO":"NO-GO",c.detail]);wn(r,a*.04,o*.16,a*.92,o*.095,[{label:"Station",w:2},{label:"Answer",w:1.6},{label:"Basis",w:6}],l,n.map(c=>c.level==="nominal"?"#7fd19b":c.level==="caution"?F.caution:c.level==="warning"?F.warning:F.dim)),re(r,"Answers come from live telemetry; nothing is sent to KSP.",a*.04,o*.95,o*.03,F.dim)}{const{g:r,w:a,h:o}=_t(i.pad,"VEHICLE ON THE PAD",t?.vessel.name??"none");if(!t||t.paused===5||!t.vessel.situation)St(i.pad,"No vehicle: KSP is not in a flight scene");else{const l=di[Pe.profile]??di.leo;Gt(r,a*.05,o*.18,o*.07,"Situation",t.vessel.situation??"—"),Gt(r,a*.55,o*.18,o*.07,"Mass",t.vessel.mass===null?"—":`${ee(t.vessel.mass/1e3,1)} t`),Gt(r,a*.05,o*.36,o*.07,"Δv (vac)",`${ee(t.prop.totalDv,0)} m/s`),Gt(r,a*.55,o*.36,o*.07,"Required",`${ee(l.requiredDv)} m/s`),Uu(r,a*.05,o*.5,a*.9,o*.04,t.prop.totalDv===null?null:t.prop.totalDv/l.requiredDv,(t.prop.totalDv??0)>=l.requiredDv?"#7fd19b":F.caution);const c=t.prop.stages;Gt(r,a*.05,o*.64,o*.07,"Liftoff TWR",c.length?ee(c[c.length-1].twr,2):"—"),Gt(r,a*.55,o*.64,o*.07,"Stages",ee(t.prop.stageCount));const u=t.power.ec!==null&&t.power.ecMax?t.power.ec/t.power.ecMax:null;Gt(r,a*.05,o*.82,o*.07,"Electric charge",Mn(u)),Gt(r,a*.55,o*.82,o*.07,"Crew",ee(t.vessel.crew))}}return["clock","poll","pad"]},monitor(i,e){const t=Es(e);if(i==="LD"){const s=cs(t);return{rows:[["Count",`T${Vi(Xi(Pe.count,ys(e)))}`],["State",Pe.count.state.toUpperCase()],["Poll",s?"GO":"NO-GO"],["Profile",di[Pe.profile]?.label??""]],level:t[0]?.level==="nodata"?"nodata":s?"nominal":"caution"}}const n=t.find(s=>s.station===i);return{rows:[["Answer",n?n.level==="nodata"?"NO DATA":n.go?"GO":"NO-GO":"—"],["Basis",n?.detail??"—"]],level:n?.level??"nodata"}},panel(i,e){const t=Es(e);if(i&&i!=="LD"){const l=t.find(c=>c.station===i);return`<header><div><div class="pos">${i}</div><div class="ptitle">${El[i]??""}</div></div><div class="lamp ${l?.level??"nodata"}">${l?l.level==="nodata"?"NO DATA":l.go?"GO":"NO-GO":"—"}</div></header>
        <p>${Q(l?.detail??"No data")}</p>
        <p class="muted">This station answers the Launch Director's poll from live telemetry against the selected mission profile.</p>`}const n=Xi(Pe.count,ys(e)),s=cs(t),r=Object.entries(di).map(([l,c])=>`<option value="${l}" ${l===Pe.profile?"selected":""}>${Q(c.label)} (${c.requiredDv} m/s${c.crewed?", crewed":""})</option>`).join(""),a=c2.map(([l,c])=>`<div class="row ${n>=l?"":"muted"}"><span class="k mono">T${Vi(l)}</span><span class="v small">${n>=l&&Pe.count.state!=="idle"?"✓ ":""}${Q(c)}</span></div>`).join(""),o=(Pe.lastPoll?.answers??t).map(l=>`<div class="poll ${l.level}"><span>${l.station}</span><b>${l.level==="nodata"?"NO DATA":l.go?"GO":"NO-GO"}</b></div>`).join("");return`<header><div><div class="pos">LD</div><div class="ptitle">Launch Director</div></div><div class="lamp ${t[0]?.level==="nodata"?"nodata":s?"nominal":"warning"}">${t[0]?.level==="nodata"?"NO VEHICLE":s?"GO":"NO-GO"}</div></header>
      <div class="kpis"><div><span>Count</span><b>T${Vi(n)}</b></div><div><span>State</span><b class="small">${Pe.count.state.toUpperCase()}</b></div></div>
      ${Pe.count.holdReason?`<div class="alert caution">${Q(Pe.count.holdReason)}</div>`:""}
      <h3>Mission profile</h3>
      <select data-act="profile" class="wide">${r}</select>
      <h3>Count control</h3>
      <div class="btns">
        <button data-act="start">${Pe.count.state==="hold"?"Resume count":"Start count"}</button>
        <button data-act="hold">Hold</button>
        <button data-act="poll">Poll the team</button>
        <button data-act="recycle">Recycle to T-10:00</button>
        <button data-act="scrub">Scrub</button>
        <button data-act="reset">Reset to T-20:00</button>
      </div>
      <label class="chk"><input type="checkbox" data-act="handoff" ${Pe.autoHandoff?"checked":""}> Hand over to the Flight Control Room at liftoff</label>
      <h3>${Pe.lastPoll?`Poll at ${Q(Pe.lastPoll.at)}`:"Live answers"}</h3><div class="pollgrid">${o}</div>
      <h3>Terminal count (Artemis II as flown)</h3>${a}
      <p class="muted foot">The count runs on game time while KSP is live, so time warp advances it. At T-33 s the count holds automatically unless every station is GO. Launch the vehicle yourself in KSP: myKSP never sends commands to the game.</p>`},action(i,e,t){const n=i.dataset.act;if(!n)return!1;const s=ys(e);if(n==="profile"&&t.type==="change")Pe.profile=i.value;else if(n==="handoff"&&t.type==="change")Pe.autoHandoff=i.checked;else{if(t.type!=="click")return!1;if(n==="start")Pe.count=md(Pe.count,s);else if(n==="hold")Pe.count=gd(Pe.count,s,"Hold called by the Launch Director");else if(n==="recycle")Pe.count=vd(Pe.count,-600);else if(n==="scrub")Pe.count=_d(Pe.count,"Launch scrubbed by the Launch Director");else if(n==="reset")Pe.count=Qc(-1200,[-600],-33),vr=!1;else if(n==="poll"){const r=Es(e);Pe.lastPoll={at:Is(e.store.frame?.ut??null).slice(11,19)||new Date().toISOString().slice(11,19),answers:r},r.forEach((a,o)=>setTimeout(()=>{e.toast(`${a.station}: ${a.level==="nodata"?"no data":a.go?"GO":"NO-GO"}`),e.audio.quindar()},o*900)),setTimeout(()=>e.toast(cs(r)?"Launch Director: we are GO for launch.":"Launch Director: we are NO-GO. Holding."),r.length*900+300)}}return Fc(),e.refresh(),!0}};Wu.sceneUpdate=(i,e)=>{const t=i.scene.getObjectByName("vehicle");if(!t)return!1;const n=ku(e.store.frame?.vessel.name??null),s=/pre.?launch|landed/i.test(e.store.frame?.vessel.situation??""),r=n&&s?e.data.craft?.find(o=>o.name===n):void 0,a=r?r.file:"none";if(a===Ho)return!1;if(r){const o=e.data.craftDetail.get(r.file);if(!o)return e.data.loadCraftDetail(r.file),!1;t.clear(),t.add(Bu(o,r.size))}else t.clear();return Ho=a,!0};const Oc={w:30,d:22,h:10,front:-10},Bc=.42,_r=[-3.2,.6,4.4],u2=[{id:"FDO",x:-4.4,row:0},{id:"GNC",x:0,row:0},{id:"PROP",x:4.4,row:0},{id:"EECOM",x:-4.4,row:1},{id:"INCO",x:0,row:1},{id:"CAPCOM",x:4.4,row:1},{id:"PROGRAM",x:-4.4,row:2},{id:"FLIGHT",x:0,row:2}];let kc=0,zc="";const d2={id:"fcr",code:"FCR-1",name:"Flight Control Room",purpose:"Live flight: trajectory, systems and limit checks for the active vessel",consoles:["FLIGHT","FDO","GNC","PROP","EECOM","INCO","CAPCOM","PROGRAM"].map(i=>({id:i,title:i==="PROGRAM"?"Program summary":Kc[i]})),screens:[{key:"ground",w:2048,h:1152,label:"Ground track"},{key:"traj",w:1024,h:576,label:"Trajectory"},{key:"orbit",w:1024,h:576,label:"Orbit"},{key:"clocks",w:2560,h:176,label:"Clocks"}],build(){const{w:i,d:e,h:t,front:n}=Oc,s=new Os;s.shell(Oc),s.sidePanels(i,n,n+e),s.tiers(i,_r,Bc,n+e),s.coffers([-6.6,-2.2,2.2,6.6],_r,t);const r=n+.02;s.screen("ground",2048,1152,13.6,7.65,0,4.9,r),s.screen("traj",1024,576,6.6,3.71,-10.6,5.2,r),s.screen("orbit",1024,576,6.6,3.71,10.6,5.2,r),s.screen("clocks",2560,176,13.6,.935,0,9.3,r);for(const a of u2){const o=Bc*a.row,l=_r[a.row];s.console(a.id,a.x,o,l,{view:{pos:vt(a.x*.9,o+2.45,l+3.3),look:vt(a.x*.45,o+2.9,n)}})}return s.lights(_r,t,n),s.finish({pos:vt(0,5.2,11.2),look:vt(0,3.7,n)})},draw(i,e,t){const{store:n}=e,s=n.frame,r=n.linkState(),a=r.cls==="nominal"?"#7fd19b":r.cls==="sim"?F.sim:r.cls==="caution"?F.caution:r.cls==="warning"?F.warning:F.dim,o=["clocks"],l=`${s?.source}|${s?.vessel.name}|${s?.paused===5}|${s?.vessel.situation===null}|${Math.min(n.history.length,2)}`;return(t-kc>1e3||l!==zc)&&(kc=t,zc=l,Z1(i.ground,s,n.history),J1(i.traj,s,n.history),Q1(i.orbit,s),o.push("ground","traj","orbit")),e2(i.clocks,s,r.label,a),o},monitor(i,e){const{store:t}=e;if(i==="PROGRAM"){const n=t.career?.summary;return{rows:n?[["Funds",Wt(n.funds)],["Science",ee(n.science,1)],["Reputation",ee(n.reputation)],["Active contracts",String(n.contracts.active.length)],["Offered",String(n.contracts.offered.length)],["Crew",String(n.crew.filter(r=>r.type==="Crew").length)]]:[["Career",t.careerError?"unavailable":"loading"]],level:n?"nominal":"nodata"}}return{rows:n2(i,t),level:t.levels?.[i]??"nodata"}},panel(i,e){const t=i??"FLIGHT";return t==="PROGRAM"?Nu(e.store):i2(t,e.store)}};let Hc=0,Na="";const $u=6371e3;function Fa(i,e){const t=i.data.install?.stations??[],n=i.data.system?.get("Earth")?.radius??$u;if(!e||e.vessel.body!=="Earth"||e.vessel.lat===null||e.vessel.lon===null||e.vessel.alt===null)return null;const s=Math.min(Math.max((e.orbit.period??5400)*2,3*3600),12*3600),r=ul(e,s,30);return t.map(a=>{const o=yl(a,e.vessel.lat,e.vessel.lon,e.vessel.alt,n),l=o>0;let c=null,u=null;for(let d=1;d<r.length;d++){const h=yl(a,r[d][0],r[d][1],e.vessel.alt,n);if(l&&u===null&&h<=0){u=d*30;break}if(!l&&c===null&&h>0&&(c=d*30),!l&&c!==null&&h<=0){u=d*30;break}}return{station:a,el:o,aos:c,los:u,visible:l}})}function h2(i,e,t){const n=Math.acos(t/(t+e)),s=i.lat*Math.PI/180,r=i.lon*Math.PI/180,a=[];for(let o=0;o<=360;o+=6){const l=o*Math.PI/180,c=Math.asin(Math.sin(s)*Math.cos(n)+Math.cos(s)*Math.sin(n)*Math.cos(l)),u=r+Math.atan2(Math.sin(l)*Math.sin(n)*Math.cos(s),Math.cos(n)-Math.sin(s)*Math.sin(c));a.push([c*180/Math.PI,(u*180/Math.PI+540)%360-180])}return a}const Xu={id:"netops",code:"NET",name:"Network Operations",purpose:"Ground stations from RealAntennas, coverage and predicted AOS/LOS for the active vessel",consoles:[{id:"NETWORK",title:"Network controller"},{id:"PASSES",title:"Station passes"},{id:"LINK",title:"Link status"}],screens:[{key:"map",w:2048,h:1024,label:"Network map"},{key:"passes",w:1024,h:1024,label:"Station passes"}],build(){return Na="",Bs({W:18,D:12,H:4.4,wall:"#22272c",floor:"#1e2226",coffer:"#3e4952",bg:"#05070a",screens:[{key:"map",cw:2048,ch:1024,w:8,h:4,x:-2,y:2.4},{key:"passes",cw:1024,ch:1024,w:3.6,h:3.6,x:5.6,y:2.4}],tiers:[-1.2,2.4],seats:[{id:"PASSES",x:-3.2,z:-1.2},{id:"LINK",x:3.2,z:-1.2},{id:"NETWORK",x:0,z:2.4,row:1}],overview:{pos:[0,3.2,5.4],look:[0,2.3,-6]}})},draw(i,e,t){const n=e.store.frame,s=e.data.install?.stations??[],r=`${s.length}|${n?.vessel.name}|${n?.vessel.body}|${n?.source}`;if(r===Na&&t-Hc<2e3)return[];Na=r,Hc=t;const a=e.data.system?.get("Earth")?.radius??$u,o=Fa(e,n);{const l=i.map.getContext("2d"),{width:c,height:u}=i.map;l.drawImage(Lu(c,u,!1),0,0);const d=g=>(g+180)/360*c,h=g=>(90-g)/180*u,f=n?.vessel.body==="Earth"&&n.vessel.alt!==null&&n.vessel.alt>5e4?n.vessel.alt:4e5;for(const g of s){const v=o?.find(m=>m.station===g)?.visible;l.strokeStyle=v?"rgba(127,209,155,0.8)":"rgba(95,179,217,0.35)",l.lineWidth=v?3:1.5,Ir(l,h2(g,f,a),c,u)}l.font=`600 ${Math.round(u*.02)}px sans-serif`;for(const g of s)l.fillStyle=o?.find(v=>v.station===g)?.visible?"#7fd19b":F.text,l.fillRect(d(g.lon)-4,h(g.lat)-4,8,8),l.fillText(g.name.replace(/\s*-\s*.*$/,""),d(g.lon)+7,h(g.lat)+5);n&&n.vessel.body==="Earth"&&n.vessel.lat!==null&&n.vessel.lon!==null&&(l.strokeStyle=F.predicted,l.lineWidth=2,l.setLineDash([10,8]),Ir(l,ul(n,Math.min((n.orbit.period??5400)*1.5,6*3600),30),c,u),l.setLineDash([]),l.fillStyle="#fff",l.beginPath(),l.arc(d(n.vessel.lon),h(n.vessel.lat),u*.012,0,Math.PI*2),l.fill(),re(l,n.vessel.name??"",d(n.vessel.lon)+u*.02,h(n.vessel.lat)-u*.015,u*.024,F.text,"left",700)),l.fillStyle="rgba(5,8,12,0.75)",l.fillRect(0,0,c,u*.07),re(l,"GROUND NETWORK",c*.015,u*.048,u*.03,F.text,"left",700),re(l,s.length?`${s.length} stations · RealAntennas RSS planet pack`:"No ground stations found in this install",c*.985,u*.048,u*.024,F.dim,"right"),is(l,c*.015,u*.975,u*.022,[["In view now","#7fd19b"],[`Coverage at ${ee(f/1e3,0)} km (0° mask)`,F.predicted],["Predicted track",F.predicted]])}{const{g:l,w:c,h:u}=_t(i.passes,"STATION PASSES",n?.vessel.name??"no vessel");if(!s.length)St(i.passes,"No ground stations","Needs GameData/RealAntennas/PlanetPacks/RealSolarSystem.cfg");else if(!o)St(i.passes,n?.vessel.body&&n.vessel.body!=="Earth"?`Vessel is at ${n.vessel.body}`:"No vessel in Earth flight",n?.vessel.body&&n.vessel.body!=="Earth"?"Pass prediction covers Earth orbit only":"Passes appear when KSP is in a flight scene");else{const d=[...o].sort((h,f)=>Number(f.visible)-Number(h.visible)||(h.aos??1e12)-(f.aos??1e12));wn(l,c*.04,u*.13,c*.92,u*.05,[{label:"Station",w:3.4},{label:"Elev",w:1,align:"right"},{label:"AOS in",w:1.4,align:"right"},{label:"LOS in",w:1.4,align:"right"}],d.map(h=>[h.station.name,`${ee(h.el,1)}°`,h.visible?"in view":h.aos===null?"—":pt(h.aos),h.los===null?"—":pt(h.los)]),d.map(h=>h.visible?"#7fd19b":void 0),16),re(l,"Geometry only: spherical Earth, 0° mask, altitude held at current value.",c*.04,u*.97,u*.024,F.dim)}}return["map","passes"]},monitor(i,e){const t=e.store.frame,n=Fa(e,t),s=e.data.install?.stations??[];if(i==="LINK"){const r=e.store.status?.commNet;return{rows:[["CommNet",r===!1?"off in this save":r?"on":"—"],["Signal",r===!1?"n/a":Mn(t?.comm.signal??null)],["Source",t?.source.toUpperCase()??"—"]],level:t?"nominal":"nodata"}}if(!s.length)return{rows:[["Stations",e.data.install?"none found":"loading"]],level:"nodata"};if(i==="PASSES"){const r=n?.filter(a=>!a.visible&&a.aos!==null).sort((a,o)=>a.aos-o.aos)[0];return{rows:[["In view",String(n?.filter(a=>a.visible).length??"—")],["Next AOS",r?`${r.station.name.slice(0,14)} ${pt(r.aos)}`:"—"]],level:n?"nominal":"nodata"}}return{rows:[["Stations",String(s.length)],["In view",String(n?.filter(r=>r.visible).length??"—")],["Vessel",t?.vessel.name??"—"]],level:"nominal"}},panel(i,e){const t=e.store.frame,n=Fa(e,t),s=e.data.install?.stations??[],r=i??"NETWORK",a=`<header><div><div class="pos">${r}</div><div class="ptitle">${Q(Xu.consoles.find(l=>l.id===r)?.title)}</div></div><div class="lamp ${s.length?"nominal":"nodata"}">${s.length?"OK":"NO DATA"}</div></header>`;if(r==="LINK"){const l=e.store.status?.commNet;return a+`<div class="row"><span class="k">CommNet</span><span class="v">${l===!1?"Off in this save":l?"On":"Unknown"}</span></div><div class="row"><span class="k">Signal (Telemachus)</span><span class="v">${l===!1?"n/a":Mn(t?.comm.signal??null)}</span></div>
        <p class="muted foot">${l===!1?"With CommNet off, KSP models no link: every vessel has control and telemetry. Turn it on in the save's difficulty settings to fly with RealAntennas link budgets.":"Signal strength is KSP's own link value; station geometry here does not include antenna gain or power."}</p>`}const o=s.map(l=>{const c=n?.find(u=>u.station===l);return`<div class="row"><span class="k">${Q(l.name)}</span><span class="v small">${ee(l.lat,2)}°, ${ee(l.lon,2)}°${c?` · el ${ee(c.el,1)}°${c.visible?" · IN VIEW":c.aos!==null?` · AOS ${pt(c.aos)}`:""}`:""}</span></div>`}).join("");return a+(o||'<p class="muted">No ground stations found in this install.</p>')+'<p class="muted foot">Stations and positions are read from the RealAntennas RSS planet pack in the install.</p>'}},qu="myksp.mer";let At=null,nn=null;try{At=localStorage.getItem(qu)}catch{}function Oa(i){const e=i.store.recordings;if((!At||!e.some(n=>n.file===At))&&(At=e[0]?.file??null),!At)return null;const t=i.data.analyses.get(At);return t||i.data.loadAnalysis(At),t??null}const Gc={caution:F.caution,warning:F.warning};let bs="";const Yu={id:"mer",code:"MER",name:"Mission Evaluation Room",purpose:"Post-flight: scrub any recorded flight, with its events and limit violations",consoles:[{id:"SUMMARY",title:"Flight summary"},{id:"EVENTS",title:"Events (flight loop)"},{id:"LIMITS",title:"Limit violations"},{id:"TRAJ",title:"Trajectory engineer"},{id:"OBJ",title:"Contract objectives"}],screens:[{key:"plot",w:2048,h:1024,label:"Flight plot"},{key:"events",w:1024,h:1024,label:"Events and violations"},{key:"summary",w:1024,h:1024,label:"Summary"}],build(){const s=new Os("#07090c",[20,40]);s.shell({w:20,d:16,h:5.5,front:-8,wall:"#2a2e33",floor:"#24272b",ceil:"#15171a"}),s.sidePanels(20,-8,8,2.6,2.4),s.screen("plot",2048,1024,8,4,0,3,-8+.02),s.screen("events",1024,1024,3.6,3.6,-6.6,2.9,-8+.02),s.screen("summary",1024,1024,3.6,3.6,6.6,2.9,-8+.02),s.table(0,-.5,9,2.6);const r=[["SUMMARY",-3.2,-2.6,0],["TRAJ",0,-2.6,0],["EVENTS",3.2,-2.6,0],["LIMITS",-2.4,2.6,0],["OBJ",2.4,2.6,0]];for(const[a,o,l,c]of r)s.console(a,o,0,l+1.2,{rotY:c,width:2.6,view:{pos:vt(o*.8,2.6,l+4.6),look:vt(o*.3,2.6,-8)}});return s.coffers([-5,0,5],[-4,0,4],5.5,"#6a6152",[3,1]),s.lights([-4,1],5.5,-8,{spillI:18}),bs="",s.finish({pos:vt(0,3.4,9.5),look:vt(0,2.6,-8)})},enter(i){At&&i.data.loadAnalysis(At)},draw(i,e){const t=Oa(e),n=`${At}|${!!t}|${nn}|${e.store.recordings.length}`;if(n===bs)return[];if(bs=n,!t){for(const s of["plot","events","summary"])_t(i[s],s.toUpperCase(),""),St(i[s],e.store.recordings.length?"Loading recording…":"No recorded flights yet",e.store.recordings.length?void 0:"The bridge records every live flight to data/recordings/");return["plot","events","summary"]}{const{g:s,w:r,h:a}=_t(i.plot,`FLIGHT PLOT · ${t.vessel??""}`,At??""),o=r*.05,l=r*.97,c=a*.14,u=a*.86,d=t.series,h=[t.startMet??0,Math.max(t.endMet??1,(t.startMet??0)+1)];for(const g of t.violations){if(g.startMet===null)continue;const v=o+(g.startMet-h[0])/(h[1]-h[0])*(l-o),m=o+((g.endMet??g.startMet)-h[0])/(h[1]-h[0])*(l-o);s.fillStyle=g.level==="warning"?"rgba(255,77,77,0.14)":"rgba(242,177,52,0.12)",s.fillRect(v,c,Math.max(2,m-v),u-c)}const f=kr(s,o,c,l,u,[{pts:d.filter(g=>g.alt!==null).map(g=>[g.met,g.alt]),color:F.track},{pts:d.filter(g=>g.vel!==null).map(g=>[g.met,g.vel]),color:F.accent},{pts:d.filter(g=>g.q!==null).map(g=>[g.met,g.q]),color:F.caution,dash:!0},{pts:d.filter(g=>g.g!==null).map(g=>[g.met,g.g]),color:"#b58cff",dash:!0}],h);if(f){for(const g of t.events){if(g.met===null)continue;const v=f.X(g.met);s.strokeStyle="rgba(216,225,232,0.35)",s.lineWidth=1,s.beginPath(),s.moveTo(v,c),s.lineTo(v,u),s.stroke(),s.save(),s.translate(v+4,c+8),s.rotate(Math.PI/2),re(s,g.kind.toUpperCase(),0,0,a*.022,F.dim,"left",700),s.restore()}if(nn!==null){const g=f.X(nn);s.strokeStyle=F.text,s.lineWidth=2,s.beginPath(),s.moveTo(g,c),s.lineTo(g,u),s.stroke()}}is(s,o,a*.95,a*.03,[["Altitude",F.track],["Orbital velocity",F.accent],["Dynamic pressure",F.caution],["G-load","#b58cff"]]),re(s,`${gt(h[0])} → ${gt(h[1])}`,l,a*.95,a*.03,F.dim,"right")}{const{g:s,w:r,h:a}=_t(i.events,"EVENTS · VIOLATIONS",`${t.events.length} · ${t.violations.length}`),o=t.events.slice(0,14).map(d=>[gt(d.met).replace("T+ ",""),d.text]),l=wn(s,r*.04,a*.13,r*.92,a*.045,[{label:"MET",w:1.3,mono:!0},{label:"Event",w:4}],o),c=a*.13+a*.045*(l+2),u=t.violations.slice(0,12).map(d=>[`${d.position} ${d.label}`,`${gt(d.startMet).replace("T+ ","")}–${gt(d.endMet).replace("T+ ","")}`,d.worst]);u.length?wn(s,r*.04,c,r*.92,a*.045,[{label:"Violation",w:2},{label:"Interval",w:2.2,mono:!0},{label:"Worst",w:2.6}],u,t.violations.map(d=>Gc[d.level])):re(s,"No limit violations in this flight",r*.04,c,a*.035,"#7fd19b","left",600)}{const{g:s,w:r,h:a}=_t(i.summary,"FLIGHT SUMMARY",t.reachedOrbit?"REACHED ORBIT":"SUBORBITAL / INCOMPLETE");if([["Duration",pt(t.duration)],["Max altitude",Kt(t.maxAlt)],["Max orbital speed",Nn(t.maxSpeed)],["Max Q",t.maxQ?`${ee(t.maxQ.value,1)} kPa at ${gt(t.maxQ.met)}`:"—"],["Max G",t.maxG?`${ee(t.maxG.value,2)} g at ${gt(t.maxG.met)}`:"—"],["Bodies",t.bodies.join(", ")||"—"],["Frames",ee(t.frames)]].forEach(([l,c],u)=>Gt(s,r*.05,a*.15+u*a*.105,a*.05,l,c)),nn!==null){const l=t.series.reduce((c,u)=>Math.abs(u.met-nn)<Math.abs(c.met-nn)?u:c,t.series[0]);l&&re(s,`At ${gt(l.met)}: alt ${Kt(l.alt)}, v ${Nn(l.vel)}, q ${ee(l.q,1)} kPa`,r*.05,a*.95,a*.03,F.text,"left",600)}}return["plot","events","summary"]},monitor(i,e){const t=Oa(e);if(!t)return{rows:[["Recording",e.store.recordings.length?"loading":"none yet"]],level:"nodata"};switch(i){case"SUMMARY":return{rows:[["Vessel",t.vessel??"—"],["Duration",pt(t.duration)],["Orbit",t.reachedOrbit?"YES":"NO"],["Max alt",Kt(t.maxAlt)]],level:"nominal"};case"EVENTS":return{rows:t.events.slice(-5).map(n=>[gt(n.met).replace("T+ ",""),n.text.slice(0,26)]),level:"nominal"};case"LIMITS":return{rows:t.violations.length?t.violations.slice(0,5).map(n=>[`${n.position} ${n.label}`,n.level.toUpperCase(),Gc[n.level]]):[["Violations","none"]],level:t.violations.some(n=>n.level==="warning")?"warning":t.violations.length?"caution":"nominal"};case"TRAJ":return{rows:[["Max Q",t.maxQ?`${ee(t.maxQ.value,1)} kPa`:"—"],["Max G",t.maxG?`${ee(t.maxG.value,2)} g`:"—"],["Max v",Nn(t.maxSpeed)]],level:"nominal"};default:return{rows:[["Active contracts",String(e.store.career?.summary.contracts.active.length??"—")]],level:e.store.career?"nominal":"nodata"}}},panel(i,e){const t=Oa(e),n=e.store.recordings,s=n.map(l=>`<button class="item ${l.file===At?"sel":""}" data-act="pick" data-file="${Q(l.file)}"><div class="t">${Q(l.file.replace(/\.jsonl$/,""))}</div><div class="m"><span>${(l.bytes/1024).toFixed(0)} KB</span><span>${Q(l.modified.slice(0,16).replace("T"," "))}</span></div></button>`).join(""),r=t&&t.startMet!==null&&t.endMet!==null?`<h3>Scrub</h3><input class="wide" type="range" data-act="scrub" min="${t.startMet}" max="${t.endMet}" step="${Math.max(.25,(t.endMet-t.startMet)/1e3)}" value="${nn??t.startMet}"><div class="muted small">${nn===null?"Drag to place a cursor on the wall plot":gt(nn)}</div>
         <div class="btns"><button data-act="replay">Replay in the Flight Control Room</button><button data-act="clear">Clear cursor</button></div>`:"";let a="";t?i==="EVENTS"?a=`<div class="log">${t.events.map(l=>`<div><span class="met">${Q(gt(l.met))}</span> ${Q(l.text)}</div>`).join("")||'<div class="muted">No events</div>'}</div>`:i==="LIMITS"?a=t.violations.length?t.violations.map(l=>`<div class="alert ${l.level}"><b>${l.position}</b> ${Q(l.label)} ${Q(gt(l.startMet))} to ${Q(gt(l.endMet))}: ${Q(l.worst)}</div>`).join(""):"<p>No limit violations: every check stayed within caution limits.</p>":i==="OBJ"?a=`<p class="muted small">Active contracts and the state KSP has recorded for each objective, next to this flight's facts. KSP decides completion; this room only shows it.</p>`+((e.store.career?.summary.contracts.active??[]).map(c=>`<div class="contract"><div class="ct">${Q(c.title)}</div>${c.parameters.map(u=>`<div class="row"><span class="k">${Q(u.title)}</span><span class="v small">${Q(u.state)}</span></div>`).join("")}</div>`).join("")||'<div class="muted">No active contracts</div>'):a=`<div class="kpis"><div><span>Duration</span><b class="small">${pt(t.duration)}</b></div><div><span>Max altitude</span><b class="small">${Kt(t.maxAlt)}</b></div><div><span>Max Q</span><b class="small">${t.maxQ?ee(t.maxQ.value,1)+" kPa":"—"}</b></div><div><span>Orbit</span><b class="small">${t.reachedOrbit?"Reached":"No"}</b></div></div>`:a=`<p class="muted">${n.length?"Loading the selected recording…":"No recordings yet. Every live flight is recorded automatically."}</p>`;const o=Yu.consoles.find(l=>l.id===(i??"SUMMARY"))?.title??"";return`<header><div><div class="pos">${i??"MER"}</div><div class="ptitle">${Q(o)}</div></div><div class="lamp ${t?"nominal":"nodata"}">${t?"LOADED":"NO DATA"}</div></header>
      ${a}${r}<h3>Recorded flights (${n.length})</h3><div class="list">${s||'<div class="muted">None</div>'}</div>`},action(i,e,t){const n=i.dataset.act;if(n==="pick"&&t.type==="click"){At=i.dataset.file??null,nn=null;try{localStorage.setItem(qu,At??"")}catch{}return At&&e.data.loadAnalysis(At),e.refresh(),!0}return n==="scrub"&&(t.type==="input"||t.type==="change")?(nn=Number(i.value),bs="",!0):n==="clear"&&t.type==="click"?(nn=null,bs="",e.refresh(),!0):n==="replay"&&t.type==="click"&&At?(Wa("replay",At,1).then(()=>e.go("fcr")),!0):!1}};let xr="";const li="SP-CONNECTING-RIDGE",Mr=i=>i.data.planning?.manifest?.sites??[],Ba=i=>(i.store.career?.summary.vessels??[]).filter(e=>Vo(e.bodyIdent)==="Moon"&&e.type!=="Debris"&&e.type!=="SpaceObject");function ka(i,e){const t=i.store.career?.summary.tacRates,n=e.resources,s=(r,a)=>{const o=n[r]?.amount;return o===void 0?null:!a||!e.crew?{amount:o,days:null}:{amount:o,days:o/(a*e.crew)/86400}};return{food:s("Food",t?.food),water:s("Water",t?.water),oxygen:s("Oxygen",t?.oxygen),ec:n.ElectricCharge?n.ElectricCharge.amount/Math.max(1,n.ElectricCharge.max):null,rates:!!t}}const Vc=i=>{const e=[i.food?.days,i.water?.days,i.oxygen?.days].filter(t=>t!=null);return e.length?Math.min(...e):null};function Wc(i,e,t,n=30){const s=document.createElement("canvas");s.width=i,s.height=e;const r=s.getContext("2d"),a=r.createImageData(i,e);for(let o=0;o<e;o++)for(let l=0;l<i;l++){const c=t((l+.5)/i,(o+.5)/e),u=(o*i+l)*4;if(Number.isNaN(c)){a.data[u+3]=0;continue}const d=c<=0?0:Math.min(1,.25+c/n);a.data[u]=12+160*d,a.data[u+1]=15+150*d,a.data[u+2]=20+128*d,a.data[u+3]=255}return r.putImageData(a,0,0),s}const $c=i=>i===null?void 0:i<3?F.warning:i<14?F.caution:"#7fd19b",Ku={id:"lsoc",code:"LSOC",name:"Lunar Surface Operations",purpose:"Lunar assets, base sites and sunlight, TAC LS consumables and base contracts",consoles:[{id:"SURFACE",title:"Surface operations lead"},{id:"CONSUMABLES",title:"Consumables (TAC LS)"},{id:"SITES",title:"Sites and sunlight"},{id:"BASE",title:"Base build and resupply"}],screens:[{key:"map",w:2048,h:1024,label:"Moon"},{key:"pole",w:1024,h:1024,label:"South polar region"},{key:"supplies",w:1024,h:1024,label:"Consumables"},{key:"sun",w:2048,h:512,label:"Sun at the base site"}],build(){return xr="",Bs({W:24,D:14,H:5.4,wall:"#24282d",floor:"#202327",coffer:"#4c5157",bg:"#05070a",screens:[{key:"map",cw:2048,ch:1024,w:7.2,h:3.6,x:-2.8,y:3.5},{key:"sun",cw:2048,ch:512,w:5.6,h:1.4,x:-2.8,y:.85},{key:"pole",cw:1024,ch:1024,w:3.8,h:3.8,x:3.4,y:3.15},{key:"supplies",cw:1024,ch:1024,w:3.6,h:3.6,x:-1.5,y:2.6,wall:"right"}],tiers:[-1,3],seats:[{id:"SITES",x:-3.6,z:-1},{id:"CONSUMABLES",x:2.2,z:-1},{id:"SURFACE",x:-1.2,z:3,row:1},{id:"BASE",x:3.6,z:3,row:1}],overview:{pos:[0,3.6,6.4],look:[0,2.6,-7]}})},enter(i){i.data.loadPlanning(),xr=""},draw(i,e){const t=e.data.system,n=bn(e),s=Ba(e),r=Mr(e),a=e.store.frame,o=`${!!t}|${n===null?"":Math.floor(n/1800)}|${s.length}|${r.length}|${e.store.career?.summary.savedAt}|${a?.vessel.body==="Moon"?`${a.vessel.lat?.toFixed(1)},${a.vessel.lon?.toFixed(1)}`:""}`;if(o===xr)return[];xr=o;const l=t&&n!==null?mi(t,n):null,c=(u,d)=>l?Vs(l.elongation,l.waxing,u,d):null;{const{g:u,w:d,h}=_t(i.map,"MOON · SELENOGRAPHIC",l?`${Math.round(l.illuminated*100)}% lit from Earth · ${l.waxing?"waxing":"waning"}`:"no Moon geometry"),f=h*.08,g=h*.93,v=S=>(S+180)/360*d,m=S=>f+(90-S)/180*(g-f);l&&u.drawImage(Wc(256,128,(S,E)=>c(90-E*180,S*360-180)),0,f,d,g-f),u.strokeStyle=F.grid,u.lineWidth=1;for(let S=-180;S<=180;S+=30)u.beginPath(),u.moveTo(v(S),f),u.lineTo(v(S),g),u.stroke();for(let S=-60;S<=60;S+=30)u.beginPath(),u.moveTo(0,m(S)),u.lineTo(d,m(S)),u.stroke(),re(u,`${S}°`,6,m(S)-4,h*.02,F.dim);u.strokeStyle=F.gridStrong,u.strokeRect(v(-90),f,v(90)-v(-90),g-f),re(u,"NEAR SIDE (faces Earth)",v(0),f+h*.035,h*.024,F.dim,"center",700),re(u,"FAR SIDE",v(-135),f+h*.035,h*.024,F.dim,"center",700),re(u,"FAR SIDE",v(135),f+h*.035,h*.024,F.dim,"center",700);for(const S of r)u.fillStyle=S.id===li?F.caution:F.predicted,u.fillRect(v(S.lon)-5,m(S.lat)-5,10,10);const p=s.filter(S=>S.lat!==null&&S.lon!==null).map(S=>({name:S.name,lat:S.lat,lon:S.lon,landed:/LANDED|SPLASHED/.test(S.situation??"")}));a?.vessel.body==="Moon"&&a.vessel.lat!==null&&a.vessel.lon!==null&&p.push({name:`${a.vessel.name} (live)`,lat:a.vessel.lat,lon:a.vessel.lon,landed:/landed/i.test(a.vessel.situation??"")});for(const S of p)u.fillStyle=S.landed?"#7fd19b":"#ffffff",u.beginPath(),u.arc(v(S.lon),m(S.lat),h*.01,0,Math.PI*2),u.fill(),re(u,S.name,v(S.lon)+h*.016,m(S.lat)+h*.008,h*.022,F.text,"left",600);l||St(i.map,t?"No game time yet":"Moon orbit not loaded from the install"),is(u,d*.01,h*.975,h*.022,[["Landed asset","#7fd19b"],["In lunar orbit","#ffffff"],["Candidate site",F.predicted],["Base anchor site",F.caution],["Sunlit","#a89f8c"]])}{const{g:u,w:d,h}=_t(i.pole,"SOUTH POLE · 83°S TO POLE",l?"Sun elevation now":""),f=7,g=d*.36,v=h*.53,m=d*.33,p=(E,M)=>{const w=(90+E)/f*m,R=M*Math.PI/180;return[g+w*Math.sin(R),v-w*Math.cos(R)]};if(l){const E=Wc(256,256,(M,w)=>{const R=(M-.5)*2,A=(w-.5)*2,L=Math.hypot(R,A);return L>1?NaN:c(-90+L*f,Math.atan2(R,-A)*180/Math.PI)},4);u.drawImage(E,g-m,v-m,m*2,m*2)}u.strokeStyle=F.gridStrong,u.lineWidth=1;for(const E of[-83,-85,-87,-89]){const M=(90+E)/f*m;u.beginPath(),u.arc(g,v,M,0,Math.PI*2),u.stroke(),re(u,`${-E}°`,g+4,v-M-4,h*.02,F.dim)}for(let E=-180;E<180;E+=45){const[M,w]=p(-83,E);u.beginPath(),u.moveTo(g,v),u.lineTo(M,w),u.stroke();const[R,A]=p(-82.4,E);re(u,`${E}°`,R,A+h*.008,h*.02,F.dim,"center")}r.filter(E=>E.lat<=-90+f).sort((E,M)=>E.lat-M.lat).forEach((E,M)=>{const[w,R]=p(E.lat,E.lon);u.fillStyle=E.id===li?F.caution:F.predicted,u.beginPath(),u.arc(w,R,h*.011,0,Math.PI*2),u.fill(),re(u,String(M+1),w,R+h*.007,h*.016,"#05080c","center",800);const A=c(E.lat,E.lon),L=h*.15+M*h*.055;re(u,`${M+1}`,d*.73,L,h*.024,E.id===li?F.caution:F.predicted,"left",800),re(u,E.name.replace(/\s*\(.*\)$/,"").slice(0,20),d*.76,L,h*.022,F.text,"left",600),A!==null&&re(u,`${A>.25?"sunlit":A>-.25?"grazing":"dark"} ${ee(A,1)}°`,d*.76,L+h*.024,h*.018,A>.25?"#d8cfb4":A>-.25?F.caution:F.dim)}),r.length||St(i.pole,"No sites (needs the research manifest)"),re(u,"Sun elevation ignores libration (±1.5°): near 0° is grazing light.",d*.04,h*.98,h*.022,F.dim)}{const{g:u,w:d,h}=_t(i.supplies,"CONSUMABLES · TAC LS",e.store.career?.summary.savedAt?"as of last save":"");if(!e.store.career)St(i.supplies,"Career save not loaded");else if(!s.length)St(i.supplies,"No vessels at the Moon","Lunar assets appear here from the save");else{const f=s.map(g=>{const v=ka(e,g),m=Vc(v);return{v:g,s:v,d:m}});wn(u,d*.04,h*.13,d*.92,h*.055,[{label:"Vessel",w:3},{label:"Crew",w:.8,align:"right"},{label:"Food d",w:1.1,align:"right"},{label:"Water d",w:1.1,align:"right"},{label:"O₂ d",w:1,align:"right"},{label:"EC",w:1,align:"right"}],f.map(({v:g,s:v})=>[g.name,String(g.crew),v.food?.days!=null?ee(v.food.days,1):v.food?"stock":"—",v.water?.days!=null?ee(v.water.days,1):v.water?"stock":"—",v.oxygen?.days!=null?ee(v.oxygen.days,1):v.oxygen?"stock":"—",Mn(v.ec)]),f.map(g=>$c(g.d)),14),re(u,e.store.career.summary.tacRates?`Days at the save's TAC LS rates for the crew aboard. "stock": uncrewed.`:"TAC LS rates not found in the save: days cannot be computed.",d*.04,h*.97,h*.024,F.dim)}}{const{g:u,w:d,h}=_t(i.sun,"SUN AT THE BASE SITE · NEXT 30 DAYS",r.find(g=>g.id===li)?.name??""),f=r.find(g=>g.id===li)??r[0];if(!l||!f||!t)St(i.sun,f?"No Moon geometry":"No base site (needs the research manifest)");else{const g=[];for(let m=n;m<=n+30*86400;m+=6*3600){const p=mi(t,m);g.push([m,Vs(p.elongation,p.waxing,f.lat,f.lon)+3])}kr(u,d*.04,h*.2,d*.97,h*.82,[{pts:g,color:F.caution,min:0,max:6}],[n,n+30*86400]);const v=h*.82-3/6*(h*.62);u.strokeStyle=F.dim,u.setLineDash([6,6]),u.beginPath(),u.moveTo(d*.04,v),u.lineTo(d*.97,v),u.stroke(),u.setLineDash([]),re(u,"horizon",d*.045,v-6,h*.05,F.dim),re(u,"+3°",d*.035,h*.22,h*.05,F.dim,"right"),re(u,"−3°",d*.035,h*.82,h*.05,F.dim,"right"),re(u,`${xn(n)} → ${xn(n+30*86400)}`,d*.97,h*.95,h*.055,F.dim,"right")}}return["map","pole","supplies","sun"]},monitor(i,e){const t=Ba(e);if(!e.store.career)return{rows:[["Career",e.store.careerError?"unavailable":"loading"]],level:"nodata"};if(i==="CONSUMABLES"){const n=t.map(r=>({v:r,d:Vc(ka(e,r))})).filter(r=>r.d!==null).sort((r,a)=>r.d-a.d),s=n[0]?.d??null;return{rows:n.length?n.slice(0,4).map(r=>[r.v.name,`${ee(r.d,1)} d`,$c(r.d)]):[["Crewed lunar vessels","none"]],level:s===null?"nominal":s<3?"warning":s<14?"caution":"nominal"}}if(i==="SITES"){const n=e.data.system,s=bn(e),r=Mr(e).find(o=>o.id===li),a=n&&s!==null?mi(n,s):null;return{rows:[["Sites",String(Mr(e).length)],["Base site Sun",a&&r?`${ee(Vs(a.elongation,a.waxing,r.lat,r.lon),1)}°`:"—"]],level:a?"nominal":"nodata"}}if(i==="BASE"){const n=e.data.planning,s=e.store.career.summary.contracts,r=a=>pi(n,a)?.startsWith("moon_base")??!1;return{rows:[["Base contracts active",String(s.active.filter(a=>r(a.subtype)).length)],["Offered",String(s.offered.filter(a=>r(a.subtype)).length)]],level:n?.contractMeta?"nominal":"nodata"}}return{rows:[["Lunar vessels",String(t.length)],["Landed",String(t.filter(n=>/LANDED/.test(n.situation??"")).length)],["Crew at Moon",String(t.reduce((n,s)=>n+s.crew,0))]],level:"nominal"}},panel(i,e){const t=i??"SURFACE",n=Ba(e),s=`<header><div><div class="pos">${t}</div><div class="ptitle">${Q(Ku.consoles.find(a=>a.id===t)?.title)}</div></div><div class="lamp ${e.store.career?"nominal":"nodata"}">${e.store.career?"OK":"NO DATA"}</div></header>`;if(!e.store.career)return s+'<p class="muted">Career save not loaded yet.</p>';const r=e.store.career.summary.tacRates;if(t==="CONSUMABLES"){const a=r?`<p class="muted small">Per crew member per day (this save's TAC LS settings): food ${ee(r.food*86400,2)}, water ${ee(r.water*86400,2)}, oxygen ${ee(r.oxygen*86400,0)} units. Limits without supply: food ${pt(r.maxNoFood)}, water ${pt(r.maxNoWater)}, oxygen ${pt(r.maxNoOxygen)}.</p>`:'<p class="muted">TAC LS rates not found in the save.</p>',o=n.map(l=>{const c=ka(e,l),u=(d,h)=>h?`<div class="row"><span class="k">${d}</span><span class="v small">${ee(h.amount,1)}${h.days!==null?` · ${ee(h.days,1)} days`:""}</span></div>`:"";return`<div class="contract"><div class="ct">${Q(l.name)}</div><div class="row"><span class="k">Crew</span><span class="v small">${l.crew}${l.crewNames.length?` (${l.crewNames.map(Q).join(", ")})`:""}</span></div>${u("Food",c.food)}${u("Water",c.water)}${u("Oxygen",c.oxygen)}<div class="row"><span class="k">Electric charge</span><span class="v small">${Mn(c.ec)}</span></div></div>`}).join("");return s+a+(o||'<p class="muted">No vessels at the Moon in this save.</p>')+'<p class="muted foot">As of the last save. TAC LS keeps consuming in the background between saves.</p>'}if(t==="SITES"){const a=e.data.system,o=bn(e),l=a&&o!==null?mi(a,o):null;return s+(Mr(e).map(c=>`<div class="contract"><div class="ct">${Q(c.name)}${c.id===li?" · base anchor":""}</div><div class="row"><span class="k">Position</span><span class="v small">${ee(c.lat,2)}°, ${ee(c.lon,2)}° (${Q(c.precision??"")})</span></div>${l?`<div class="row"><span class="k">Sun now</span><span class="v small">${ee(Vs(l.elongation,l.waxing,c.lat,c.lon),1)}°</span></div>`:""}${c.role?`<div class="muted small">${Q(c.role)}</div>`:""}</div>`).join("")||'<p class="muted">No sites: needs the research manifest.</p>')}if(t==="BASE"){const a=e.data.planning,o=e.store.career.summary.contracts,l=u=>pi(a,u)?.startsWith("moon_base")??!1,c=u=>`<div class="contract"><div class="ct">${Q(u.title)}</div>${u.dueUT?`<div class="row"><span class="k">Deadline</span><span class="v small">${xn(u.dueUT)}</span></div>`:""}${u.parameters.map(d=>`<div class="row"><span class="k">${Q(d.title)}</span><span class="v small">${Q(d.state)}</span></div>`).join("")}</div>`;return s+`<h3>Active</h3>${o.active.filter(u=>l(u.subtype)).map(c).join("")||'<div class="muted">None</div>'}<h3>Offered</h3>${o.offered.filter(u=>l(u.subtype)).map(c).join("")||'<div class="muted">None</div>'}${a?.contractMeta?"":'<p class="muted">Contract metadata not found, so base contracts cannot be told apart.</p>'}`}return s+(n.map(a=>`<div class="contract"><div class="ct">${Q(a.name)}</div><div class="row"><span class="k">State</span><span class="v small">${Q(a.situation??"")}${a.landedAt?` · ${Q(a.landedAt)}`:""}</span></div>${a.lat!==null?`<div class="row"><span class="k">Position</span><span class="v small">${ee(a.lat,2)}°, ${ee(a.lon,2)}°</span></div>`:""}<div class="row"><span class="k">Crew</span><span class="v small">${a.crew}</span></div></div>`).join("")||'<p class="muted">No vessels at the Moon yet. The permanent base starts with the first lander.</p>')}},fn={program:Fu,mdc:Ou,vih:Hu,astro:Gu,lcc:Wu,fcr:d2,netops:Xu,mer:Yu,lsoc:Ku},$i=Object.keys(fn),ke=i=>document.querySelector(i),zr=new s2;document.body.innerHTML=`
  <header id="opsbar" role="banner">
    <div class="brand"><b>myKSP</b> <span id="roomcode">Mission Operations</span></div>
    <select id="roomsel" aria-label="Room" title="Room ([ and ])"></select>
    <div id="link" class="badge nodata" aria-live="polite">…</div>
    <div class="cell"><span>Vessel</span><b id="vessel">—</b></div>
    <div class="cell"><span>MET</span><b id="met" class="mono">—</b></div>
    <div class="cell"><span>Flight</span><b id="flight" class="lampword nodata">—</b></div>
    <div class="cell hide-s"><span>Funds</span><b id="funds">—</b></div>
    <div class="cell hide-s"><span>Rep</span><b id="rep">—</b></div>
    <div class="spacer"></div>
    <div class="ctl">
      <select id="source" aria-label="Telemetry source">
        <option value="live">Live (KSP)</option>
        <option value="sim">Simulator (demo)</option>
        <option value="replay" disabled>Replay…</option>
      </select>
      <button id="flatbtn" title="Flat mode (F)">Flat</button>
      <button id="soundbtn" title="Sound (M)" aria-pressed="false">Sound off</button>
      <button id="helpbtn" title="Keys (?)">?</button>
    </div>
  </header>
  <main id="stage">
    <div id="room" aria-hidden="true"></div>
    <nav id="consoles" aria-label="Consoles"></nav>
    <aside id="panel" tabindex="-1" aria-live="off"></aside>
    <section id="flat" hidden aria-label="Flat mode"></section>
    <div id="toast" role="status" aria-live="polite"></div>
    <div id="help" hidden></div>
    <div id="perf" hidden></div>
  </main>`;const ks=ke("#consoles"),As=ke("#roomsel");As.innerHTML=$i.map(i=>`<option value="${i}">${Q(fn[i].code)} · ${Q(fn[i].name)}</option>`).join("");ke("#help").innerHTML=`
  <h2>Keys</h2>
  <p><b>[</b> / <b>]</b> previous / next room · <b>1–9</b> go to a console · <b>Esc</b> room overview · <b>Tab</b> next console · <b>F</b> flat mode · <b>M</b> sound · <b>P</b> Program Office · <b>L</b> Launch Control · <b>I</b> performance</p>
  <h2>Rooms</h2>
  ${$i.map(i=>`<p><b>${Q(fn[i].code)}</b> ${Q(fn[i].name)}: ${Q(fn[i].purpose)}</p>`).join("")}
  <p>Badges: <b class="tag sim">SIM</b> and <b class="tag sim">REPLAY</b> are never live game data. Amber is caution, red is warning, grey is no data.</p>
  <p>The bridge never writes to KSP or its saves, and never sends commands to the vessel.</p>`;let It=null;try{It=new N1(ke("#room"))}catch(i){console.warn("WebGL unavailable, using flat mode",i)}const Hr={get(i){try{return localStorage.getItem(i)}catch{return null}},set(i,e){try{localStorage.setItem(i,e)}catch{}}};let it=fn.fcr,jt=null,Ur={},Zt=null,Ot=!It||Hr.get("myksp.flat")==="1";const Bn={store:st,data:Xn,audio:zr,toast:i=>Ju(i),refresh:()=>{Zn=!0,os()},go:(i,e=null)=>xi(i,e),get focus(){return Zt}};function xi(i,e=null){it=fn[i]??fn.fcr,Hr.set("myksp.env",it.id),location.hash!==`#${it.id}`&&history.replaceState(null,"",`#${it.id}`),As.value=it.id,ke("#roomcode").textContent=it.code,document.title=`myKSP · ${it.name}`,It?(jt=it.build(),It.load(jt),Ur=Object.fromEntries(Object.entries(jt.screens).map(([n,s])=>[n,s.canvas]))):(jt=null,Ur=Object.fromEntries(it.screens.map(n=>[n.key,ws(n.w,n.h)]))),ks.innerHTML=it.consoles.map((n,s)=>`<button data-id="${n.id}" class="cbtn" title="${Q(n.title)}"><kbd>${s+1}</kbd>${n.id}<i class="dot nodata"></i></button>`).join(""),ke("#flat").dataset.built="",it.enter?.(Bn),Zt=null,ji(e),Ot&&fl(),Zu(!0)}function ji(i){Zt=i&&jt?.consoles.has(i)||i&&!jt?i:null;for(const e of ks.querySelectorAll(".cbtn"))e.classList.toggle("active",e.dataset.id===Zt);It&&jt&&It.setView(Zt?jt.consoles.get(Zt).view:jt.overview),Zn=!0,ju()}let Zn=!0;function ju(){const i=ke("#panel"),e=document.activeElement;if(!Zn&&e&&i.contains(e)&&/SELECT|INPUT|TEXTAREA/.test(e.tagName))return;Zn=!1;const t=i.scrollTop;i.innerHTML=it.panel(Zt,Bn),i.scrollTop=t,i.classList.toggle("overview",!Zt)}function hl(i){Ot=i||!It,Hr.set("myksp.flat",Ot?"1":"0"),ke("#flat").hidden=!Ot,ke("#room").style.visibility=Ot?"hidden":"visible",ke("#panel").hidden=Ot,ks.hidden=Ot,ke("#flatbtn").textContent=Ot?"3D":"Flat",Ot&&fl()}function fl(){if(!Ot)return;const i=ke("#flat");if(!i.dataset.built){i.dataset.built="1",i.innerHTML='<div class="fscreens"></div><div class="fgrid"></div>';const t=i.querySelector(".fscreens");for(const n of it.screens){const s=document.createElement("figure");s.className=n.w/n.h>6?"fstrip":n.w>=2e3?"fbig":"fsmall",s.append(Ur[n.key]),t.append(s)}}const e=document.activeElement;e&&i.contains(e)&&/SELECT|INPUT/.test(e.tagName)||(i.querySelector(".fgrid").innerHTML=it.consoles.map(t=>`<article class="fpanel">${it.panel(t.id,Bn)}</article>`).join(""))}let Xc=new Set;function Zu(i=!1){const e=performance.now(),t=it.draw(Ur,Bn,e);if(It&&jt){for(const o of t)It.refresh(jt.screens[o]?.texture);it.sceneUpdate?.(jt,Bn)&&It.markDirty()}for(const o of it.consoles){const l=it.monitor(o.id,Bn),c=jt?.consoles.get(o.id);c&&It&&(t2(c.canvas,o.id,l.rows,Bo[l.level]),It.refresh(c.texture),It.setLamp(o.id,Bo[l.level]));const u=ks.querySelector(`[data-id="${o.id}"] .dot`);u&&(u.className=`dot ${l.level}`)}const n=st.frame,s=st.linkState();ke("#link").textContent=s.label,ke("#link").className=`badge ${s.cls}`,ke("#vessel").textContent=n?.vessel.name??"—",ke("#met").textContent=n?gt(n.vessel.met):"—";const r=st.levels?.FLIGHT??"nodata";ke("#flight").textContent=r==="nominal"?"GO":r.toUpperCase().replace("NODATA","NO DATA"),ke("#flight").className=`lampword ${r}`;const a=new Set(st.checks.filter(o=>o.level==="warning").map(o=>o.id));for(const o of a)if(!Xc.has(o)){zr.masterCaution();break}Xc=a,i&&(Zn=!0),ju(),Ot&&fl()}let za=!1;function os(){za||(za=!0,requestAnimationFrame(()=>{za=!1,Zu()}))}st.on(i=>{if(i==="career"&&(ke("#funds").textContent=Wt(st.career?.summary.funds),ke("#rep").textContent=ee(st.career?.summary.reputation)),i==="event"){const e=st.events[st.events.length-1];e&&(Ju(`${gt(e.met)}  ${e.text}`),zr.quindar())}i==="status"&&Qu(),os()});Xn.on(()=>{Zn=!0,os()});setInterval(()=>{it.tick?.(Bn),os()},1e3);let qc=0;function Ju(i){const e=ke("#toast");e.textContent=i,e.classList.add("show"),clearTimeout(qc),qc=window.setTimeout(()=>e.classList.remove("show"),4500)}function Qu(){const i=ke("#source"),e=st.status;e&&(i.value=e.mode==="replay"?`replay:${e.replayFile}`:e.mode)}async function ed(){const i=ke("#source");try{const e=await Sd();st.recordings=e,i.querySelectorAll("option[data-rec]").forEach(t=>t.remove());for(const t of e){const n=document.createElement("option");n.value=`replay:${t.file}`,n.dataset.rec="1",n.textContent=`Replay: ${t.file.replace(/\.jsonl$/,"")}`,i.append(n)}Qu(),Zn=!0,os()}catch{}}ke("#source").addEventListener("change",async i=>{const e=i.target,t=e.value;e.blur(),t.startsWith("replay:")?await Wa("replay",t.slice(7),1):await Wa(t)});As.addEventListener("change",()=>{const i=As.value;As.blur(),xi(i)});ke("#flatbtn").addEventListener("click",()=>hl(!Ot));ke("#soundbtn").addEventListener("click",()=>{const i=zr.toggle();ke("#soundbtn").textContent=i?"Sound on":"Sound off",ke("#soundbtn").setAttribute("aria-pressed",String(i))});ke("#helpbtn").addEventListener("click",()=>{ke("#help").hidden=!ke("#help").hidden});ks.addEventListener("click",i=>{const e=i.target.closest(".cbtn");e&&ji(Zt===e.dataset.id?null:e.dataset.id)});It&&(It.onPick=i=>ji(Zt===i?null:i));for(const i of["click","change","input"])for(const e of[ke("#panel"),ke("#flat")])e.addEventListener(i,t=>{const n=t.target.closest("[data-act]");n&&it.action?.(n,Bn,t)&&(Zn=i==="click",os())});document.addEventListener("keydown",i=>{const e=i.target.tagName;if(e==="SELECT"||e==="INPUT"||e==="TEXTAREA"||i.metaKey||i.ctrlKey||i.altKey)return;const t=Number(i.key),n=it.consoles.map(s=>s.id);if(t>=1&&t<=n.length)ji(n[t-1]);else if(i.key==="Escape"||i.key==="0")ji(null),ke("#help").hidden=!0;else if(i.key==="Tab"){i.preventDefault();const s=Zt?n.indexOf(Zt):-1;ji(n[(s+(i.shiftKey?n.length-1:1))%n.length])}else if(i.key==="["||i.key==="]"){const s=$i.indexOf(it.id);xi($i[(s+(i.key==="]"?1:$i.length-1))%$i.length])}else i.key==="f"||i.key==="F"?hl(!Ot):i.key==="m"||i.key==="M"?ke("#soundbtn").click():i.key==="p"||i.key==="P"?xi("program"):i.key==="l"||i.key==="L"?xi("lcc"):i.key==="?"?ke("#help").hidden=!ke("#help").hidden:(i.key==="i"||i.key==="I")&&(ke("#perf").hidden=!ke("#perf").hidden)});window.addEventListener("hashchange",()=>{const i=location.hash.slice(1);fn[i]&&i!==it.id&&xi(i)});setInterval(()=>{const i=It?.perf;window.__myksp={env:it.id,perf:i,flat:Ot,focus:Zt,link:st.linkState(),events:st.events.length,career:!!st.career,data:{install:!!Xn.install,craft:Xn.craft?.length??null,planning:!!Xn.planning?.manifest,errors:Xn.errors}},i&&!ke("#perf").hidden&&(ke("#perf").innerHTML=`${it.code} · render ${i.frameMs.toFixed(2)} ms (CPU submit) · ${i.calls} draw calls · ${(i.triangles/1e3).toFixed(1)}k tris · ${i.textures} textures · ${i.frames} frames rendered`)},500);Xn.loadInstall();hl(Ot);const Yc=location.hash.slice(1)||Hr.get("myksp.env")||"fcr";xi(fn[Yc]?Yc:"fcr");Md();let Ha=!1;st.on(i=>{i==="status"&&st.bridgeConnected!==Ha&&(Ha=st.bridgeConnected,Ha&&(ed(),Xn.loadInstall(!0),it.enter?.(Bn)))});ed();
