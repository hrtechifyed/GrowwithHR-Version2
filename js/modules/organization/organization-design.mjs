// A proposed accountability design, not a claim about existing reporting lines.
export function buildOrganizationDesign(data={}){
  const org=data.organization||{};
  const names=[...(Array.isArray(org.departments)?org.departments:[]),...(Array.isArray(org.functionOwnership)?org.functionOwnership.map(x=>x?.name):[])];
  const seen=new Set();
  const functions=names.map(x=>String(x??"").trim()).filter(x=>x&&!seen.has(x.toLowerCase())&&seen.add(x.toLowerCase()));
  const nodes=functions.map((name,i)=>({id:"F"+(i+1),label:name,owner:"Accountable owner for "+name}));
  const safe=s=>String(s).replace(/[^a-zA-Z0-9 .,&()/_-]/g," ").replace(/\s+/g," ").trim().slice(0,100)||"Function";
  const lines=['flowchart TD','  CEO["Founder / CEO"]'];
  for(const n of nodes)lines.push('  CEO -.-> '+n.id+'["'+safe(n.owner)+'"]');
  lines.push('  classDef lead fill:#142238,color:#ffffff,stroke:#142238;','  classDef unit fill:#eef4ff,color:#172033,stroke:#526782;','  class CEO lead;');
  if(nodes.length)lines.push('  class '+nodes.map(n=>n.id).join(",")+' unit;');
  return {nodes,mermaid:lines.join("\n"),note:nodes.length?"Illustrative target accountability map based on supplied functions. Dotted lines are proposed accountability, not verified direct reports or new hires. Validate reporting relationships and consolidate ownership where appropriate.":"No functions supplied. Add the actual functions before proposing a structure."};
}
export function mountOrganizationDesign(container,payload){
  if(!container||container.querySelector("#orgDesignEditor"))return;
  const design=buildOrganizationDesign(payload.data);
  const section=document.createElement("section");
  section.className="org-design-editor";
  section.id="orgDesignEditor";
  section.innerHTML='<h2>Proposed organization design</h2><p data-design-note></p><label for="orgMermaidSource">Editable Mermaid source</label><textarea id="orgMermaidSource" rows="10" spellcheck="false"></textarea><div class="org-actions"><button type="button" class="org-secondary" data-design-render>Render diagram</button><button type="button" class="org-secondary" data-design-copy>Copy Mermaid</button><button type="button" class="org-secondary" data-design-save>Download .mmd</button><button type="button" class="org-secondary" data-design-reset>Reset proposal</button></div><p role="status" data-design-status></p><div data-design-preview class="org-design-preview" aria-label="Proposed organization chart"></div>';
  section.querySelector("[data-design-note]").textContent=design.note;
  const input=section.querySelector("textarea"),status=section.querySelector("[data-design-status]"),preview=section.querySelector("[data-design-preview]");
  input.value=design.mermaid;
  // Local fallback is always visible even if the optional Mermaid library fails.
  const showFallback=()=>{preview.replaceChildren();const root=document.createElement("strong");root.textContent="Founder / CEO";root.className="org-design-root";preview.append(root);const grid=document.createElement("div");grid.className="org-design-nodes";design.nodes.forEach(n=>{const item=document.createElement("span");item.textContent=n.owner;grid.append(item);});preview.append(grid);};
  showFallback();
  let sequence=0;
  async function render(){
    const id=++sequence;status.textContent="Rendering…";
    try{
      const {default:mermaid}=await import("https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs");
      mermaid.initialize({startOnLoad:false,securityLevel:"strict",theme:"base",themeVariables:{primaryColor:"#eef4ff",primaryTextColor:"#172033",lineColor:"#526782",background:"#ffffff"}});
      // Only flowcharts; do not permit directives or front matter to override security settings.
      if(!/^flowchart\s+(TD|TB|LR|RL|BT)\b/.test(input.value.trim())||/%%\s*\{|^\s*---|^\s*click\b/im.test(input.value))throw Error("Use a flowchart without configuration directives or click actions.");
      const result=await mermaid.render("gwhOrgDesign"+id,input.value);
      if(id!==sequence)return;
      preview.innerHTML=result.svg;status.textContent="Diagram rendered locally.";
    }catch(error){if(id===sequence)status.textContent="Could not render this Mermaid source. Check syntax or download the source; the original proposal remains available.";}
  }
  section.querySelector("[data-design-render]").addEventListener("click",render);
  section.querySelector("[data-design-copy]").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(input.value);status.textContent="Mermaid copied.";}catch(_){input.select();status.textContent="Source selected; copy it manually."; }});
  section.querySelector("[data-design-save]").addEventListener("click",()=>{const url=URL.createObjectURL(new Blob([input.value],{type:"text/plain"}));const a=document.createElement("a");a.href=url;a.download="GrowWithHR-organization-design.mmd";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  section.querySelector("[data-design-reset]").addEventListener("click",()=>{sequence++;input.value=design.mermaid;showFallback();status.textContent="Original proposal restored.";});
  container.append(section);
}
