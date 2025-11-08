const MAX_PER_PAGE = 99;
const PAGE_OFFSET = 0;
let allPages = [];
let currentPage = 1;

const inputLinksEl = document.getElementById('inputLinks');
const statsEl = document.getElementById('stats');
const outputEl = document.getElementById('output');
const paginationEl = document.getElementById('pagination');
const dropdownEl = document.getElementById('fileDropdown');

/* Toast */
function showToast(msg, color='#333') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = color;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 4000);
}

/* Storage */
function getStorageKey() { return 'appData_' + (dropdownEl.value || 'default'); }
function saveAppData() { 
  localStorage.setItem(getStorageKey(), JSON.stringify({ inputList: inputLinksEl.value, currentPage })); 
}
function loadAppData() {
  const data = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
  if (data.inputList) inputLinksEl.value = data.inputList;
  currentPage = data.currentPage || 1;
}

/* Init */
window.addEventListener('load', () => {
  const saved = localStorage.getItem('selectedFile');
  if (saved) dropdownEl.value = saved;
  loadAppData();
  processLinks();
  showPage(currentPage);
  setTimeout(checkForUpdates, 2000);
});

dropdownEl.addEventListener('change', () => {
  localStorage.setItem('selectedFile', dropdownEl.value);
  loadAppData();
  processLinks();
  showPage(currentPage);
  checkForUpdates();
});

/* Input Buttons */
inputLinksEl.addEventListener('input', () => { processLinks(); saveAppData(); });

document.getElementById('clearInputLinksBtn').addEventListener('click', () => {
  inputLinksEl.value=''; saveAppData(); processLinks(); showToast('Input dikosongkan','#b36b00');
});
document.getElementById('copyInputLinksBtn').addEventListener('click', () => {
  if(!inputLinksEl.value.trim()) return showToast('Input kosong','#cc0000');
  navigator.clipboard.writeText(inputLinksEl.value).then(()=>showToast('✅ Input disalin','#008000'));
});
document.getElementById('hapusDuplikatBtn').addEventListener('click', () => {
  const lines=[...new Set(inputLinksEl.value.split('\n').map(l=>l.trim()).filter(Boolean))];
  inputLinksEl.value = lines.join('\n');
  processLinks(); saveAppData(); showToast('✅ Duplikat dihapus','#008000');
});
document.getElementById('sortirPerTokoBtn').addEventListener('click', () => {
  const lines = inputLinksEl.value.split('\n').map(l=>l.trim()).filter(Boolean);
  const map = new Map();
  lines.forEach(l=>{ const m=l.match(/product\/(\d+)\/(\d+)/); if(m) map.set(m[1],l); });
  inputLinksEl.value = Array.from(map.values()).join('\n');
  processLinks(); saveAppData(); showToast(`✅ Sortir selesai\nToko unik: ${map.size}`,'#008000');
});

/* Process Links */
function processLinks(){
  const raw=inputLinksEl.value.split('\n').map(l=>l.trim()).filter(Boolean);
  const unique=[...new Set(raw)];
  allPages=[];
  for(let i=0;i<unique.length;i+=MAX_PER_PAGE) allPages.push(unique.slice(i,i+MAX_PER_PAGE));
  if(currentPage>allPages.length) currentPage=1;
  renderStats(raw.length,unique.length,raw.length-unique.length);
  renderPagination();
}
function renderStats(total,uniq,dup){ statsEl.textContent=`Total link: ${total}\nUnik: ${uniq}\nDuplikat: ${dup}\nHalaman: ${allPages.length}`; }

/* Pagination & Page */
function showPage(page){
  if(!allPages.length){ outputEl.style.display='none'; return; }
  currentPage=page;
  const fileNow = dropdownEl.value || 'default.txt';
  outputEl.innerHTML = allPages[page-1].map(l=>{
    const report=`https://niddumulu.github.io/shope-tools/lapor/index.html?link=${encodeURIComponent(l)}&file=${encodeURIComponent(fileNow)}`;
    return `<div class="link-item"><a class="link" href="${l}" target="_blank">${l}</a><a class="report" href="${report}" target="_blank">Laporkan</a></div>`;
  }).join('');
  outputEl.style.display='block';
  highlightActivePage(); saveAppData();
}
function renderPagination(){
  paginationEl.innerHTML='';
  for(let i=1;i<=allPages.length;i++){
    const btn=document.createElement('button'); btn.textContent=i+PAGE_OFFSET; btn.className='page-btn';
    if(i===currentPage) btn.classList.add('active');
    btn.onclick=()=>showPage(i);
    paginationEl.appendChild(btn);
  }
}
function highlightActivePage(){ document.querySelectorAll('.page-btn').forEach((b,i)=>b.classList.toggle('active',i+1===currentPage)); }
document.getElementById('copyBtn').addEventListener('click',()=>{
  if(!allPages.length)return showToast('Tidak ada link','#cc0000');
  navigator.clipboard.writeText(allPages[currentPage-1].join('\n')).then(()=>showToast('✅ Link halaman ini disalin','#008000'));
});

/* Backup & Import */
document.getElementById('backupBtn').addEventListener('click', exportLocalStorage);
document.getElementById('importBtn').addEventListener('click', importLocalStorage);
document.getElementById('resetBtn').addEventListener('click', resetLocalStorage);

function exportLocalStorage(){
  const data={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); data[k]=localStorage.getItem(k);}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='madgazan_backup.json'; a.click();
  showToast('✅ Data tersimpan','green');
}
function importLocalStorage(){
  const file=document.getElementById('importFile').files[0]; if(!file)return showToast('Pilih file JSON','#cc0000');
  const reader=new FileReader(); reader.onload=function(e){
    try{ const data=JSON.parse(e.target.result); Object.keys(data).forEach(k=>localStorage.setItem(k,data[k])); showToast('✅ Data diimport', 'green'); setTimeout(()=>location.reload(),1500);}
    catch(err){showToast('❌ File tidak valid: '+err.message,'#cc0000');}
  }; reader.readAsText(file);
}
function resetLocalStorage(){ if(confirm('Hapus semua data?')){ localStorage.clear(); showToast('Semua data dihapus','#b36b00'); setTimeout(()=>location.reload(),1000);}}

/* Sinkron Semua File */
async function syncAllFiles(){
  const opts=Array.from(dropdownEl.options).filter(o=>o.value);
  if(!opts.length)return showToast('Tidak ada file','#cc0000');
  let success=0,fail=0,lastText='',lastFile='';
  for(const o of opts){
    try{ const res=await fetch(o.value+'?t='+Date.now(),{cache:'no-store'}); if(!res.ok)throw new Error('HTTP '+res.status);
      const text=await res.text(); localStorage.setItem('appData_'+o.value,JSON.stringify({inputList:text.trim(),currentPage:1}));
      success++; lastText=text.trim(); lastFile=o.value;
    }catch(e){console.warn('Gagal',o.value,e); fail++; }
  }
  if(lastText){ inputLinksEl.value=lastText; dropdownEl.value=lastFile; localStorage.setItem('selectedFile',lastFile); processLinks(); showPage(1); }
  showToast(`✅ Sinkron selesai\nBerhasil:${success}\nGagal:${fail}\nTerakhir:${lastFile}`,fail>0?'#b36b00':'#008000');
}
document.getElementById('syncAllBtn').addEventListener('click', syncAllFiles);
document.getElementById('ambilFileListLinksBtn').addEventListener('click', syncAllFiles);

/* Cek Update */
async function checkForUpdates(){
  const file=dropdownEl.value; const notice=document.getElementById('updateNotice'); if(!file){notice.textContent='';return;}
  notice.textContent=`⏳ Memeriksa versi server "${file}"...`; notice.style.color='#666';
  try{
    const res=await fetch(file+'?check='+Date.now(),{cache:'no-store'}); if(!res.ok)throw new Error('HTTP '+res.status);
    const serverText=(await res.text()).trim();
    const localData=JSON.parse(localStorage.getItem('appData_'+file)||'{}'); const localText=(localData.inputList||'').trim();
    if(serverText!==localText){ notice.textContent=`⚠️ Data lokal berbeda`; notice.style.color='#b30000'; }
    else { notice.textContent=`✅ Data lokal terbaru`; notice.style.color='#008000'; setTimeout(()=>{notice.textContent='';},5000);}
  }catch(err){ notice.textContent=`❌ Tidak dapat hubungi server`; notice.style.color='#b30000'; }
}
