(() => {
const KEY = "ur_election_night_v1";

const makeSeats = () => Array.from({length:650},(_,i)=>({
  id:i+1,
  name:`Usher Constituency ${String(i+1).padStart(3,"0")}`,
  region:["North","South","East","West","Central"][i%5],
  declared:false,
  winner:null,
  candidate:"",
  votes:0,
  voteShare:0,
  majority:0,
  turnout:0,
  swing:0,
  resultType:""
}));

const defaultState = {
  settings:{
    electionDate:"Friday 2 October 2026",
    totalSeats:650,
    majority:326,
    landslide:400,
    chamber:"House of Senate",
    secondChamber:"House of Representatives",
    office:"Prime Minister"
  },
  parties:[
    {id:"libdem",name:"Liberal Democrats",leader:"Maison Sanders",color:"#1382d1",secondary:"#59b8ff",seats:0,previous:0},
    {id:"lab",name:"Labour",leader:"Hala Ramen",color:"#df2534",secondary:"#ff6672",seats:0,previous:0},
    {id:"con",name:"Conservative",leader:"Edward Langster",color:"#2464d5",secondary:"#5d8ef0",seats:0,previous:0},
    {id:"green",name:"Green",leader:"Oscar Fielding",color:"#29a067",secondary:"#64c994",seats:0,previous:0},
    {id:"uip",name:"UIP",leader:"Megan Crosster",color:"#7f56d9",secondary:"#a88bef",seats:0,previous:0},
    {id:"reform",name:"Reform",leader:"Issac Rowe",color:"#3aa6a0",secondary:"#71d2cd",seats:0,previous:0},
    {id:"other",name:"Other",leader:"Various",color:"#8e9bad",secondary:"#b9c2ce",seats:0,previous:0}
  ],
  seats: makeSeats(),
  slides:[
    {id:"national",title:"Latest Analysis",kicker:"National Picture",type:"summary",value:"0 / 650"},
    {id:"majority",title:"Race to 326",kicker:"Majority Tracker",type:"number",value:"326"},
    {id:"landslide",title:"Landslide Territory",kicker:"400+ Seats",type:"number",value:"400"},
    {id:"poll",title:"Opinion Poll",kicker:"Preferred Prime Minister",type:"bars",value:""}
  ],
  liveSlide:"national",
  headline:"Race to 326",
  ticker:"Election Night Live • House of Senate: 650 seats • 326 needed for a majority • 400+ is landslide territory",
  projectedWinner:null,
  history:[]
};

window.URElection = {
  KEY,
  load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return structuredClone(defaultState);
      const s = JSON.parse(raw);
      if(!Array.isArray(s.seats) || s.seats.length !== 650) s.seats = makeSeats();
      return s;
    }catch(e){ return structuredClone(defaultState); }
  },
  save(s){
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("ur-election-update"));
  },
  reset(){
    localStorage.setItem(KEY, JSON.stringify(defaultState));
    window.dispatchEvent(new CustomEvent("ur-election-update"));
    return structuredClone(defaultState);
  },
  defaults: defaultState
};
})();