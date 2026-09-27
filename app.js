let state;

function load(){ state = URElection.load(); render(); }
window.addEventListener("storage", load);
window.addEventListener("ur-election-update", load);

function render(){
  const s=state.settings, p=state.parties;
  const a=p[0], b=p[1];
  document.getElementById("electionDate").textContent=s.electionDate.toUpperCase();
  document.getElementById("headline").textContent=state.projectedWinner ? `${state.projectedWinner} — PROJECTED ${s.office.toUpperCase()}` : state.headline;
  document.getElementById("leaderA").textContent=a.leader;
  document.getElementById("leaderB").textContent=b.leader;
  document.getElementById("partyA").textContent=a.name.toUpperCase();
  document.getElementById("partyB").textContent=b.name.toUpperCase();
  document.getElementById("seatA").textContent=a.seats||0;
  document.getElementById("seatB").textContent=b.seats||0;
  document.getElementById("majorityNumber").textContent=s.majority;
  document.getElementById("landslideLabel").textContent=`${s.landslide} = LANDSLIDE`;
  document.getElementById("trackA").style.width=`${Math.min(50,(a.seats/s.majority)*50)}%`;
  document.getElementById("trackB").style.width=`${Math.min(50,(b.seats/s.majority)*50)}%`;
  document.querySelector(".candidate-a .candidate-star").style.color=a.color;
  document.querySelector(".candidate-b .candidate-star").style.color=b.color;
  const declared=state.seats.filter(x=>x.declared).length;
  document.getElementById("declaredCount").textContent=`${declared} / ${s.totalSeats} DECLARED`;
  document.getElementById("tickerText").textContent=state.ticker;

  const map=document.getElementById("hexMap");
  map.innerHTML="";
  state.seats.forEach(seat=>{
    const el=document.createElement("div"); el.className="hex";
    if(seat.declared){
      const party=p.find(x=>x.id===seat.winner);
      if(party) el.style.background=party.color;
    }
    el.title=`${seat.name}${seat.declared ? " — "+(p.find(x=>x.id===seat.winner)?.name||"Declared") : " — Undeclared"}`;
    map.appendChild(el);
  });

  const slide=state.slides.find(x=>x.id===state.liveSlide)||state.slides[0];
  document.getElementById("slideTitle").textContent=slide?.title||"Latest Analysis";
  document.getElementById("slideKicker").textContent=slide?.kicker||"National Picture";
  const stage=document.getElementById("slideStage");
  stage.innerHTML="";
  if(!slide) return;
  if(slide.type==="bars"){
    const sorted=[...p].sort((x,y)=>y.seats-x.seats).slice(0,4);
    stage.innerHTML=`<div class="slide-bars">${sorted.map(x=>`<div class="bar-row"><strong>${x.name}</strong><div class="bar"><div class="bar-fill" style="width:${Math.min(100,(x.seats/Math.max(1,s.majority))*100)}%;background:${x.color}"></div></div><b>${x.seats}</b></div>`).join("")}</div>`;
  } else {
    const val=slide.id==="national"?`${declared} / ${s.totalSeats}`:slide.value;
    stage.innerHTML=`<div class="slide-title">${slide.title}</div><div class="slide-subtitle">${slide.kicker}</div><div class="slide-number">${val}</div>`;
  }
}
load();