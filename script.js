
const modules=[...document.querySelectorAll(".module")];
const nameInput=document.getElementById("studentName");
const classInput=document.getElementById("studentClass");
const KEY="cloudNativeLaborV1";

function stateRead(){
  try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}
}
function stateWrite(){
  const state={
    name:nameInput.value,
    cls:classInput.value,
    modules:modules.map(m=>m.querySelector("input[type=checkbox]").checked),
    evidence:[...document.querySelectorAll(".evidence-check input")].map(x=>x.checked)
  };
  localStorage.setItem(KEY,JSON.stringify(state));
  updateProgress();
}
function updateProgress(){
  const done=modules.filter(m=>m.querySelector("input[type=checkbox]").checked).length;
  const pct=Math.round(done/modules.length*100);
  document.getElementById("progressBar").style.width=pct+"%";
  document.getElementById("progressLabel").textContent=pct+"%";
  document.getElementById("moduleCount").textContent=`${done} / ${modules.length} modul kész`;
}
function applySaved(){
  const s=stateRead();
  nameInput.value=s.name||"";
  classInput.value=s.cls||"";
  modules.forEach((m,i)=>{
    const c=m.querySelector("input[type=checkbox]");
    c.checked=!!(s.modules&&s.modules[i]);
    m.classList.toggle("completed",c.checked);
  });
  document.querySelectorAll(".evidence-check input").forEach((c,i)=>c.checked=!!(s.evidence&&s.evidence[i]));
  updateProgress();
}

const evidence=document.getElementById("evidenceChecklist");
for(let i=1;i<=18;i++){
  const label=document.createElement("label");
  label.className="evidence-check";
  const cb=document.createElement("input");
  cb.type="checkbox";
  cb.addEventListener("change",stateWrite);
  const text=document.createElement("span");
  text.textContent=`Bizonyíték ${String(i).padStart(2,"0")} elkészült`;
  label.append(cb,text);
  evidence.append(label);
}

nameInput.addEventListener("input",stateWrite);
classInput.addEventListener("input",stateWrite);
modules.forEach(m=>{
  const cb=m.querySelector("input[type=checkbox]");
  cb.addEventListener("change",()=>{
    m.classList.toggle("completed",cb.checked);
    stateWrite();
  });
});

document.getElementById("resetProgress").addEventListener("click",()=>{
  if(confirm("Biztosan törlöd a mentett nevet, osztályt, modul- és bizonyítékjelöléseket?")){
    localStorage.removeItem(KEY);
    location.reload();
  }
});
document.getElementById("printBtn").addEventListener("click",()=>window.print());

document.querySelectorAll("[data-copy]").forEach(box=>{
  const btn=box.querySelector("button");
  btn.addEventListener("click",async()=>{
    const text=box.querySelector("code").innerText;
    try{await navigator.clipboard.writeText(text)}catch(e){
      const ta=document.createElement("textarea");
      ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();
    }
    const old=btn.textContent;
    btn.textContent="Másolva";
    setTimeout(()=>btn.textContent=old,900);
  });
});

const QUIZ=[["Mi a Docker image?", ["Egy futó konténer", "Egy sablon, amelyből konténer indítható", "Egy virtuális hálózat", "Egy Kubernetes node"], 1], ["Mit csinál a -p 8080:80 paraméter?", ["Volume-ot hoz létre", "A host 8080 portját a container 80 portjára továbbítja", "Két konténert összeköt", "Privát registryt állít be"], 1], ["Mire szolgál a Dockerfile?", ["Konténer image reprodukálható leírására", "Kubernetes cluster létrehozására", "DNS rekord tárolására", "Git commit készítésére"], 0], ["Mi a Docker Compose fő célja?", ["Csak image törlés", "Több konténeres alkalmazások deklaratív kezelése", "Kubernetes node skálázása", "GitHub Pages publikálás"], 1], ["Mi a volume előnye?", ["A konténer adatainak tartós tárolása", "Gyorsabb CPU", "Titkosítja az image-et", "Automatikus DNS"], 0], ["Mi a container registry?", ["Futó container lista", "Image-ek központi tárolója és terjesztési helye", "Linux shell", "Kubernetes Service"], 1], ["Mit tart fenn egy Kubernetes Deployment?", ["DNS zónát", "Kívánt számú podot és rollout állapotot", "Docker Hub jelszót", "Git branchet"], 1], ["Mi történik, ha egy Deployment által kezelt podot törlünk?", ["A Kubernetes jellemzően újat hoz létre", "A teljes cluster leáll", "Az image törlődik", "Semmi sem történik"], 0], ["Mire szolgál a Kubernetes Service?", ["Podok stabil hálózati elérésére", "Image buildre", "Git commit készítésére", "Volume törlésére"], 0], ["Mit jelent a horizontal scaling ebben a laborban?", ["Több pod példány futtatása", "Nagyobb lemez", "Új Git branch", "Erősebb jelszó"], 0], ["Mi a CI egyik tipikus feladata?", ["Build és automatikus teszt futtatása push után", "IP-cím kiosztása", "BIOS frissítése", "Felhasználó törlése"], 0], ["Melyik állítás írja le a Cloudflare Pages szerepét?", ["Statikus webes tartalom felhőalapú publikálása Git repositoryból", "Kubernetes scheduler", "Docker daemon", "MariaDB szolgáltatás"], 0]];
const quizBox=document.getElementById("quiz");
QUIZ.forEach((q,qi)=>{
  const item=document.createElement("div");
  item.className="quiz-item";
  item.dataset.correct=q[2];
  let html=`<h4>${qi+1}. ${q[0]}</h4>`;
  q[1].forEach((a,ai)=>{
    html+=`<label><input type="radio" name="q${qi}" value="${ai}"> ${a}</label>`;
  });
  item.innerHTML=html;
  quizBox.append(item);
});
document.getElementById("gradeQuiz").addEventListener("click",()=>{
  let score=0;
  document.querySelectorAll(".quiz-item").forEach(item=>{
    item.classList.remove("correct","wrong");
    const picked=item.querySelector("input:checked");
    if(picked && Number(picked.value)===Number(item.dataset.correct)){
      score++;
      item.classList.add("correct");
    } else {
      item.classList.add("wrong");
    }
  });
  document.getElementById("quizResult").textContent=`Eredmény: ${score} / ${QUIZ.length} pont (${Math.round(score/QUIZ.length*100)}%)`;
});

applySaved();
