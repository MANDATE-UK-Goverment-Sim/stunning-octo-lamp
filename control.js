let state=URElection.load();

const $=id=>document.getElementById(id);

document.querySelectorAll(".nav-btn").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll(".control-panel").forEach(p=>p.classList.remove("active-panel"));
  btn.classList.add("active"); $(btn.dataset.panel).classList.add("active-panel");
});

function recalc(){
  state.parties.forEach(p=>p.seats=0);
  state.seats.filter(s=>s.declared).forEach(seat=>{
    const p=state.parties.find(p=>p.id===seat.winner); if(p) p.seats++;
  });
}
function save(){ URElection.save(state); render(); }
function snapshot(label){
  state.history.push({label, state: JSON.stringify({...state,history:[]})});
  if(state.history.length>25) state.history.shift();
}
function render(){
  recalc();
  const declared=state.seats.filter(s=>s.declared).length;
  $("cDeclared").textContent=`${declared} / ${state.settings.totalSeats}`;
  $("cMajority").textContent=state.settings.majority;
  $("cLandslide").textContent=state.settings.landslide;
  const sorted=[...state.parties].sort((a,b)=>b.seats-a.seats);
  $("cLeader").textContent=sorted[0].seats===sorted[1].seats?"Tied":`${sorted[0].name} (${sorted[0].seats})`;

  $("headlineInput").value=state.headline;
  $("tickerInput").value=state.ticker;

  $("winnerSelect").innerHTML=state.parties.map(p=>`<option value="${p.id}">${p.leader} — ${p.name}</option>`).join("");

  $("electionDateInput").value=state.settings.electionDate;
  $("totalSeatsInput").value=state.settings.totalSeats;
  $("majorityInput").value=state.settings.majority;
  $("landslideInput").value=state.settings.landslide;
  $("chamberInput").value=state.settings.chamber;
  $("secondChamberInput").value=state.settings.secondChamber;
  $("officeInput").value=state.settings.office;
  renderPartyEditor(); renderSeats(); renderSlides();
}

function renderPartyEditor(){
  $("partyEditor").innerHTML=state.parties.map((p,i)=>`
    <div class="party-row">
      <input data-i="${i}" data-f="name" value="${esc(p.name)}">
      <input data-i="${i}" data-f="leader" value="${esc(p.leader)}">
      <input data-i="${i}" data-f="color" value="${p.color}">
      <input type="color" data-i="${i}" data-f="color" value="${p.color}">
    </div>`).join("");
}

function renderSeats(){
  const q=($("seatSearch")?.value||"").toLowerCase();
  const rows=state.seats.filter(s=>s.name.toLowerCase().includes(q)).slice(0,650);
  $("seatTableWrap").innerHTML=`<table><thead><tr><th>#</th><th>Constituency</th><th>Region</th><th>Status</th><th>Action</th></tr></thead><tbody>${
    rows.map(s=>{
      const party=state.parties.find(p=>p.id===s.winner);
      return `<tr><td>${s.id}</td><td>${esc(s.name)}</td><td>${s.region}</td><td>${s.declared?(party?.name||"Declared"):"Undeclared"}</td><td><div class="seat-actions">${
        s.declared?`<button data-undo-seat="${s.id}">Undo</button>`:
        state.parties.map(p=>`<button data-seat="${s.id}" data-party="${p.id}" style="border-color:${p.color}">${p.name.slice(0,7)}</button>`).join("")
      }</div></td></tr>`
    }).join("")
  }</tbody></table>`;
  document.querySelectorAll("[data-seat]").forEach(b=>b.onclick=()=>declareSeat(Number(b.dataset.seat),b.dataset.party));
  document.querySelectorAll("[data-undo-seat]").forEach(b=>b.onclick=()=>undoSeat(Number(b.dataset.undoSeat)));
}

function declareSeat(id,partyId){
  const seat=state.seats.find(s=>s.id===id); if(!seat||seat.declared)return;
  snapshot(`Declare ${seat.name}`);
  seat.declared=true; seat.winner=partyId; seat.resultType="WIN";
  save();
}
function undoSeat(id){
  const seat=state.seats.find(s=>s.id===id); if(!seat||!seat.declared)return;
  snapshot(`Undo ${seat.name}`);
  seat.declared=false; seat.winner=null; seat.resultType="";
  save();
}
function randomSeat(){
  const undec=state.seats.filter(s=>!s.declared); if(!undec.length)return;
  const seat=undec[Math.floor(Math.random()*undec.length)];
  const weighted=[];
  state.parties.forEach((p,i)=>{for(let n=0;n<Math.max(1,8-i);n++)weighted.push(p.id)});
  declareSeat(seat.id, weighted[Math.floor(Math.random()*weighted.length)]);
}

function renderSlides(){
  $("slideEditor").innerHTML=state.slides.map((s,i)=>`
    <div class="slide-row">
      <input data-slide="${i}" data-f="title" value="${esc(s.title)}">
      <input data-slide="${i}" data-f="kicker" value="${esc(s.kicker)}">
      <select data-slide="${i}" data-f="type"><option ${s.type==="summary"?"selected":""}>summary</option><option ${s.type==="number"?"selected":""}>number</option><option ${s.type==="bars"?"selected":""}>bars</option></select>
      <button data-live-slide="${s.id}">${state.liveSlide===s.id?"LIVE":"Take Live"}</button>
    </div>`).join("");
  document.querySelectorAll("[data-live-slide]").forEach(b=>b.onclick=()=>{state.liveSlide=b.dataset.liveSlide;save()});
  document.querySelectorAll("[data-slide]").forEach(el=>el.onchange=()=>{
    state.slides[Number(el.dataset.slide)][el.dataset.f]=el.value; save();
  });
}

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

$("saveHeadline").onclick=()=>{state.headline=$("headlineInput").value;save()};
$("saveTicker").onclick=()=>{state.ticker=$("tickerInput").value;save()};
$("randomBtn").onclick=randomSeat;
$("resetBtn").onclick=()=>{if(confirm("Reset the entire election?")){state=URElection.reset();render()}};
$("undoBtn").onclick=()=>{
  const last=state.history.pop(); if(!last)return;
  const history=state.history;
  state=JSON.parse(last.state); state.history=history; save();
};
$("projectWinner").onclick=()=>{
  const p=state.parties.find(p=>p.id===$("winnerSelect").value);
  if(p){state.projectedWinner=p.leader;save()}
};
$("clearWinner").onclick=()=>{state.projectedWinner=null;save()};
$("saveParties").onclick=()=>{
  document.querySelectorAll("[data-i]").forEach(el=>{
    const p=state.parties[Number(el.dataset.i)];
    p[el.dataset.f]=el.value;
  }); save();
};
$("seatSearch").oninput=renderSeats;
$("saveSettings").onclick=()=>{
  state.settings.electionDate=$("electionDateInput").value;
  state.settings.totalSeats=Number($("totalSeatsInput").value)||650;
  state.settings.majority=Number($("majorityInput").value)||326;
  state.settings.landslide=Number($("landslideInput").value)||400;
  state.settings.chamber=$("chamberInput").value;
  state.settings.secondChamber=$("secondChamberInput").value;
  state.settings.office=$("officeInput").value;
  save();
};
$("addSlide").onclick=()=>{
  const id="slide_"+Date.now(); state.slides.push({id,title:"New Analysis",kicker:"Custom Slide",type:"number",value:"0"}); state.liveSlide=id; save();
};
$("exportBtn").onclick=()=>{$("jsonBox").value=JSON.stringify(state,null,2)};
$("importBtn").onclick=()=>{
  try{const next=JSON.parse($("jsonBox").value); state=next; save()}
  catch(e){alert("That JSON is not valid.")}
};
window.addEventListener("storage",()=>{state=URElection.load();render()});
render();