const STORAGE_KEY='growwithhr:view-mode';
const media=window.matchMedia('(max-width:1024px)');
const validModes=new Set(['compact','wide']);

function readStoredMode(){
  try{const value=window.localStorage.getItem(STORAGE_KEY);return validModes.has(value)?value:null;}catch(_){return null;}
}
function systemMode(){return media.matches?'compact':'wide';}
function resolvedMode(){const current=document.documentElement.dataset.gwhViewMode;return validModes.has(current)?current:(readStoredMode()||systemMode());}
function syncButtons(mode){
  document.querySelectorAll('[data-gwh-view-mode-choice]').forEach((button)=>{
    button.setAttribute('aria-pressed',String(button.getAttribute('data-gwh-view-mode-choice')===mode));
  });
}
function applyMode(mode,{persist=false}={}){
  if(!validModes.has(mode))return;
  document.documentElement.dataset.gwhViewMode=mode;
  if(document.body)document.body.dataset.gwhViewMode=mode;
  if(persist){try{window.localStorage.setItem(STORAGE_KEY,mode);}catch(_){}}
  syncButtons(mode);
  window.dispatchEvent(new CustomEvent('growwithhr:viewmodechange',{detail:{mode}}));
}

export function initViewModeSwitcher(){
  applyMode(resolvedMode());
  document.querySelectorAll('[data-gwh-view-mode-choice]').forEach((button)=>{
    if(button.dataset.gwhViewModeBound==='true')return;
    button.dataset.gwhViewModeBound='true';
    button.addEventListener('click',()=>applyMode(button.getAttribute('data-gwh-view-mode-choice'),{persist:true}));
  });
  syncButtons(resolvedMode());
  const autoUpdate=()=>{if(!readStoredMode())applyMode(systemMode());};
  if(typeof media.addEventListener==='function')media.addEventListener('change',autoUpdate);
  else if(typeof media.addListener==='function')media.addListener(autoUpdate);
}
