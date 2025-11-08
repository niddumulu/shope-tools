const MAX_PER_PAGE = 99;
let allPages = [], habisPages = [];
let currentPage = 1, currentHabisPage = 1;

const inputLinksEl = document.getElementById('inputLinks');
const inputHabisEl = document.getElementById('inputHabis');
const statsEl = document.getElementById('stats');
const outputEl = document.getElementById('output');
const outputHabisEl = document.getElementById('outputHabis');
const paginationEl = document.getElementById('pagination');
const dropdownEl = document.getElementById('fileDropdown');

/* ===== Toast ===== */
function showToast(msg, color='#333') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = color;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 3000);
}

/* ===== LocalStorage Key ===== */
function getStorageKey(type='input') {
  const f = dropdownEl.value || 'default';
  return `appData_${f}_${type}`;
}
function saveAppData() {
  localStorage.setItem(getStorageKey('input'), inputLinksEl.value);
  localStorage.setItem(getStorageKey('habis'), inputHabisEl.value);
}
function loadAppData() {
  inputLinksEl.value = localStorage.getItem(getStorageKey('input')) || '';
  inputHabisEl.value = localStorage.getItem(getStorageKey('habis')) || '';
}

/* ===== Event Load ===== */
window.addEventListener('load', () => {
  const savedDropdown = localStorage.getItem('selectedFile');
  if(savedDropdown) dropdownEl.value = savedDropdown;
  loadAppData();
  processAllLinks();
});

/* ===== Dropdown Change ===== */
dropdownEl.addEventListener('change', () => {
  localStorage.setItem('selectedFile', dropdownEl.value);
  loadAppData();
  processAllLinks();
});

/* ===== Input Events ===== */
inputLinksEl.addEventListener('input', () => { processAllLinks(); saveAppData(); });
inputHabisEl.addEventListener('input', () => { processAllLinks(); saveAppData(); });

/* ===== Tombol ===== */
document.getElementById('clearInputLinksBtn').addEventListener('click', () => {
  inputLinksEl.value = '';
  processAllLinks(); saveAppData();
  showToast('Input utama dikosongkan','#b36b00');
});
document.getElementById('copyInputLinksBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(inputLinksEl.value).then(()=> showToast('Input utama disalin','#008000'));
});
document.getElementById('hapusDuplikatBtn').addEventListener('click', () => {
  inputLinksEl.value = [...new Set(inputLinksEl.value.split('\n').map(l=>l.trim()).filter(Boolean))].join('\n');
  processAllLinks(); saveAppData(); showToast('Duplikat dihapus','#008000');
});

document.getElementById('clearHabisBtn').addEventListener('click', () => {
  inputHabisEl.value = '';
  processAllLinks(); saveAppData();
  showToast('Input produk habis dikosongkan','#b36b00');
});
document.getElementById('copyHabisBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(inputHabisEl.value).then(()=> showToast('Input produk habis disalin','#008000'));
});

/* ===== Process Links ===== */
function processAllLinks() {
  const raw = inputLinksEl.value.split('\n').map(l=>l.trim()).filter(Boolean);
  const habisRaw = inputHabisEl.value.split('\n').map(l=>l.trim()).filter(Boolean);

  // Filter link utama: hapus yg ada di habis
  const availableLinks = raw.filter(l => !habisRaw.includes(l));

  // Paging
  allPages = [], habisPages = [];
  for(let i=0;i<availableLinks.length;i+=MAX_PER_PAGE) allPages.push(availableLinks.slice(i,i+MAX_PER_PAGE));
  for(let i=0;i<habisRaw.length;i+=MAX_PER_PAGE) habisPages.push(habisRaw.slice(i,i+MAX_PER_PAGE));

  if(currentPage>allPages.length) currentPage=1;
  if(currentHabisPage>habisPages.length) currentHabisPage=1;

  renderStats(availableLinks.length, habisRaw.length);
  showPage(currentPage);
  showHabisPage(currentHabisPage);
  renderPagination();
}

/* ===== Stats ===== */
function renderStats(available, habis) {
  statsEl.textContent = `Produk tersedia: ${available}\nProduk habis: ${habis}\nHalaman tersedia: ${allPages.length}, halaman habis: ${habisPages.length}`;
}

/* ===== Show Pages ===== */
function showPage(page){
  if(!allPages.length){ outputEl.style.display='none'; return;}
  currentPage = page;
  outputEl.innerHTML = allPages[page-1].map(l=> `<div class="link-item"><a class="link" href="${l}" target="_blank">${l}</a></div>`).join('');
  outputEl.style.display='block';
}
function showHabisPage(page){
  if(!habisPages.length){ outputHabisEl.style.display='none'; return;}
  currentHabisPage = page;
  outputHabisEl.innerHTML = habisPages[page-1].map(l=> `<div class="link-item"><a class="link" href="${l}" target="_blank">${l}</a></div>`).join('');
  outputHabisEl.style.display='block';
}

/* ===== Pagination ===== */
function renderPagination(){
  paginationEl.innerHTML='';
  const total = Math.max(allPages.length, habisPages.length);
  for(let i=1;i<=total;i++){
    const btn = document.createElement('button');
    btn.textContent=i;
    btn.className='page-btn';
    if(i===currentPage) btn.classList.add('active');
    btn.onclick=()=>{ showPage(i); showHabisPage(i); highlightActivePage(i); };
    paginationEl.appendChild(btn);
  }
}
function highlightActivePage(page){
  document.querySelectorAll('.page-btn').forEach((btn,index)=>{
    btn.classList.toggle('active', index+1===page);
  });
}

/* ===== Copy Current Page ===== */
document.getElementById('copyBtn').addEventListener('click', ()=>{
  if(!allPages.length) return showToast('Tidak ada link','#cc0000');
  const text = allPages[currentPage-1].join('\n');
  navigator.clipboard.writeText(text).then(()=>showToast('✅ Link halaman ini disalin','#008000'));
});
document.getElementById('copyHabisBtn').addEventListener('click', ()=>{
  if(!habisPages.length) return showToast('Tidak ada link habis','#cc0000');
  const text = habisPages[currentHabisPage-1].join('\n');
  navigator.clipboard.writeText(text).then(()=>showToast('✅ Link habis halaman ini disalin','#008000'));
});
