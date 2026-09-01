const BRAND = Object.freeze({
    navy: [10, 16, 32],
    navySoft: [24, 34, 53],
    gold: [255, 176, 0],
    orange: [255, 122, 0],
    redOrange: [255, 77, 0],
    text: [23, 32, 51],
    muted: [92, 103, 122],
    line: [216, 221, 230],
    paper: [255, 255, 255],
    soft: [247, 248, 250],
    goldSoft: [255, 248, 232],
    blueSoft: [238, 244, 255],
    greenSoft: [236, 253, 243],
    redSoft: [254, 242, 242]
});

const PAGE = Object.freeze({ width: 210, height: 297, left: 18, right: 18, top: 22, bottom: 20 });
const CONTENT_W = PAGE.width - PAGE.left - PAGE.right;
const LOGO_ASSET = "assets/hrtechify-logo.png";
let logoDataPromise = null;

function cleanText(value, fallback = "") {
    return String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
}

function cleanFilename(value) {
    return cleanText(value, "Organization").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "Organization";
}

function jsPDFConstructor() { return window.jspdf?.jsPDF || window.jsPDF || null; }

function formatDate(value) {
    const date = new Date(value || Date.now());
    const safe = Number.isFinite(date.getTime()) ? date : new Date();
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(safe);
}

function statusLabel(status) {
    return ({ action: "Action", watch: "Watch", stable: "Stable", "needs-information": "Needs information" })[status] || cleanText(status, "Unknown");
}

function statusColor(status) {
    if (status === "action") return [185, 28, 28];
    if (status === "watch") return [180, 83, 9];
    if (status === "stable") return [21, 128, 61];
    return [37, 99, 235];
}

function statusSoft(status) {
    if (status === "action") return BRAND.redSoft;
    if (status === "watch") return BRAND.goldSoft;
    if (status === "stable") return BRAND.greenSoft;
    return BRAND.blueSoft;
}

function normalizePayload(payload = {}) {
    const analysis = payload.analysis || {};
    const reportModel = payload.reportModel || analysis.reportModel || {};
    const facts = analysis.facts || {};
    return {
        analysis,
        reportModel,
        facts,
        findings: Array.isArray(analysis.findings) ? analysis.findings : [],
        scenario: analysis.scenario || reportModel.scenario || {},
        changeIntelligence: payload.changeIntelligence || reportModel.changeIntelligence || null,
        reportId: cleanText(payload.reportId || reportModel.reportId, "Local analysis"),
        companyName: cleanText(reportModel.company?.name || facts.companyName || payload.data?.shared?.companyName, "Your Organisation"),
        generatedAt: reportModel.generatedAt || analysis.generatedAt || new Date().toISOString(),
        framework: reportModel.framework || analysis.methodology || {},
        sample: Boolean(payload.sample)
    };
}

function assetUrl(path) {
    try { return new URL(path, window.location.href).href; }
    catch (_error) { return path; }
}

async function loadLogoDataUrl() {
    if (logoDataPromise) return logoDataPromise;
    logoDataPromise = (async () => {
        try {
            const response = await fetch(assetUrl(LOGO_ASSET), { cache: "force-cache" });
            if (!response.ok) return "";
            const blob = await response.blob();
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
                reader.onerror = () => resolve("");
                reader.readAsDataURL(blob);
            });
        } catch (_error) { return ""; }
    })();
    return logoDataPromise;
}

function pageHeader(doc, title, pageNumber, logoData = "") {
    doc.setFillColor(...BRAND.navy);
    doc.rect(0, 0, PAGE.width, 14, "F");
    doc.setFillColor(...BRAND.gold); doc.rect(0, 14, PAGE.width * .42, 1.4, "F");
    doc.setFillColor(...BRAND.orange); doc.rect(PAGE.width * .42, 14, PAGE.width * .34, 1.4, "F");
    doc.setFillColor(...BRAND.redOrange); doc.rect(PAGE.width * .76, 14, PAGE.width * .24, 1.4, "F");
    if (logoData && typeof doc.addImage === "function") {
        try { doc.addImage(logoData, "PNG", PAGE.left, 3.1, 22, 7.5, undefined, "FAST"); }
        catch (_error) { doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(255,255,255); doc.text("HRTECHIFY · GROWWITHHR", PAGE.left, 8.8); }
    } else {
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(255,255,255); doc.text("HRTECHIFY · GROWWITHHR", PAGE.left, 8.8);
    }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(203,213,225);
    doc.text(cleanText(title), PAGE.width - PAGE.right, 8.8, { align: "right", maxWidth: 88 });
    doc.setDrawColor(...BRAND.line); doc.line(PAGE.left, PAGE.height - 13, PAGE.width - PAGE.right, PAGE.height - 13);
    doc.setFontSize(7.2); doc.setTextColor(...BRAND.muted);
    doc.text("GrowWithHR · Organization Structure & Growth", PAGE.left, PAGE.height - 8);
    doc.text(`Page ${pageNumber}`, PAGE.width - PAGE.right, PAGE.height - 8, { align: "right" });
}

function addPage(doc, state, title, logoData) {
    if (state.page > 0) doc.addPage();
    state.page += 1;
    pageHeader(doc, title, state.page, logoData);
    state.y = 24;
}

function ensureSpace(doc, state, needed, title, logoData) {
    if (state.y + needed <= PAGE.height - PAGE.bottom - 11) return;
    addPage(doc, state, title, logoData);
}

function wrap(doc, text, width, size = 9.4) {
    doc.setFontSize(size);
    return doc.splitTextToSize(cleanText(text), Math.max(12, width));
}

function paragraph(doc, state, text, options = {}, logoData = "") {
    const size = options.size || 9.4;
    const width = options.width || CONTENT_W;
    const lineHeight = options.lineHeight || 4.55;
    const lines = wrap(doc, text, width, size);
    ensureSpace(doc, state, lines.length * lineHeight + 3, options.pageTitle || "Organization Structure & Growth", logoData);
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(size); doc.setTextColor(...(options.color || BRAND.text));
    doc.text(lines, options.x || PAGE.left, state.y, { lineHeightFactor: 1.14 });
    state.y += lines.length * lineHeight + (options.after ?? 2.5);
}

function heading(doc, state, text, level = 2, pageTitle = "Organization Structure & Growth", logoData = "") {
    const size = level === 1 ? 20 : level === 2 ? 14 : 10.5;
    ensureSpace(doc, state, 12, pageTitle, logoData);
    doc.setFont("helvetica", "bold"); doc.setFontSize(size); doc.setTextColor(...BRAND.navy);
    const lines = doc.splitTextToSize(cleanText(text), CONTENT_W);
    doc.text(lines, PAGE.left, state.y, { lineHeightFactor: 1.08 });
    state.y += lines.length * (level === 1 ? 8 : level === 2 ? 6.5 : 5) + 2;
}

function labelValue(doc, state, label, value, pageTitle, logoData = "") {
    const labelW = 39;
    const valueW = CONTENT_W - labelW - 3;
    const valueLines = wrap(doc, cleanText(value, "Not provided"), valueW, 8.5);
    const height = Math.max(5, valueLines.length * 4.1);
    ensureSpace(doc, state, height + 2, pageTitle, logoData);
    doc.setFontSize(8.2); doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND.muted); doc.text(`${cleanText(label)}:`, PAGE.left, state.y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...BRAND.text); doc.text(valueLines, PAGE.left + labelW, state.y, { lineHeightFactor: 1.15 });
    state.y += height + 1.5;
}

function statusChip(doc, state, status, pageTitle, logoData = "") {
    const label = statusLabel(status).toUpperCase();
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.2);
    const measured = typeof doc.getTextWidth === "function" ? doc.getTextWidth(label) : label.length * 1.8;
    const width = Math.min(CONTENT_W, Math.max(24, measured + 8));
    ensureSpace(doc, state, 10, pageTitle, logoData);
    doc.setFillColor(...statusColor(status)); doc.roundedRect(PAGE.left, state.y - 4.6, width, 7.3, 2, 2, "F");
    doc.setTextColor(255,255,255); doc.text(label, PAGE.left + 4, state.y, { maxWidth: width - 8 });
    state.y += 7.8;
}

function statusOverview(doc, state, summary = {}, pageTitle, logoData = "") {
    const items = [
        ["Action", summary.action || 0, "action"],
        ["Watch", summary.watch || 0, "watch"],
        ["Stable", summary.stable || 0, "stable"],
        ["Needs information", summary["needs-information"] || 0, "needs-information"]
    ];
    const gap = 3;
    const cardW = (CONTENT_W - gap * 3) / 4;
    const cardH = 24;
    ensureSpace(doc, state, cardH + 4, pageTitle, logoData);
    items.forEach(([label, value, status], index) => {
        const x = PAGE.left + index * (cardW + gap);
        doc.setFillColor(...statusSoft(status)); doc.setDrawColor(...BRAND.line); doc.roundedRect(x, state.y - 3, cardW, cardH, 2.5, 2.5, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(...statusColor(status)); doc.text(String(value), x + 5, state.y + 6);
        doc.setFontSize(7.1); doc.setTextColor(...BRAND.muted);
        const lines = doc.splitTextToSize(label.toUpperCase(), cardW - 10).slice(0, 2);
        doc.text(lines, x + 5, state.y + 13, { lineHeightFactor: 1.05, maxWidth: cardW - 10 });
    });
    state.y += cardH + 3;
}

function infoBox(doc, state, title, body, fill, pageTitle, logoData = "") {
    const innerW = CONTENT_W - 14;
    doc.setFontSize(9); const bodyLines = doc.splitTextToSize(cleanText(body), innerW);
    const h = 14 + bodyLines.length * 4.2 + 6;
    ensureSpace(doc, state, h + 4, pageTitle, logoData);
    doc.setFillColor(...fill); doc.setDrawColor(...BRAND.line); doc.roundedRect(PAGE.left, state.y - 4, CONTENT_W, h, 3, 3, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.6); doc.setTextColor(...BRAND.navy); doc.text(cleanText(title), PAGE.left + 7, state.y + 4, { maxWidth: innerW });
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.6); doc.setTextColor(...BRAND.text); doc.text(bodyLines, PAGE.left + 7, state.y + 11, { lineHeightFactor: 1.14, maxWidth: innerW });
    state.y += h + 3;
}

function linkLine(doc, state, label, title, url, pageTitle, logoData = "") {
    const text = `${cleanText(label)}: ${cleanText(title)}`;
    const lines = wrap(doc, text, CONTENT_W, 8);
    ensureSpace(doc, state, lines.length * 4 + 3, pageTitle, logoData);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(154,52,18); doc.text(lines, PAGE.left, state.y, { lineHeightFactor: 1.12 });
    if (/^https?:\/\//.test(cleanText(url))) {
        try { doc.link(PAGE.left, state.y - 3.5, CONTENT_W, Math.max(5, lines.length * 4), { url }); } catch (_error) {}
    }
    state.y += lines.length * 4 + 2;
}

function drawCoverLogo(doc, logoData) {
    if (!logoData || typeof doc.addImage !== "function") return;
    try { doc.addImage(logoData, "PNG", PAGE.width - PAGE.right - 31, 19, 31, 31, undefined, "FAST"); } catch (_error) {}
}

function cover(doc, state, payload, logoData) {
    state.page = 1;
    doc.setFillColor(...BRAND.navy); doc.rect(0,0,PAGE.width,PAGE.height,"F");
    doc.setFillColor(...BRAND.gold); doc.rect(0,0,PAGE.width*.42,4,"F");
    doc.setFillColor(...BRAND.orange); doc.rect(PAGE.width*.42,0,PAGE.width*.34,4,"F");
    doc.setFillColor(...BRAND.redOrange); doc.rect(PAGE.width*.76,0,PAGE.width*.24,4,"F");
    drawCoverLogo(doc, logoData);
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(...BRAND.gold); doc.text("GROWWITHHR BY HRTECHIFY",PAGE.left,28);
    doc.setFontSize(27); doc.setTextColor(255,255,255); doc.text(["Organization Structure", "& Growth Report"],PAGE.left,52,{lineHeightFactor:1.05});
    doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(203,213,225);
    doc.text(doc.splitTextToSize("Executive structural diagnostic, Change Intelligence and a 12-month planning scenario with transparent rules and public evidence.",135),PAGE.left,78,{lineHeightFactor:1.2});

    const identityY = 111;
    doc.setFillColor(...BRAND.navySoft); doc.roundedRect(PAGE.left,identityY,CONTENT_W,56,4,4,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...BRAND.gold); doc.text("REPORT IDENTITY",PAGE.left+8,identityY+13);
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(255,255,255);
    const identity = [
        `Company: ${payload.companyName}`,
        `Report ID: ${payload.reportId}`,
        `Generated: ${formatDate(payload.generatedAt)}`,
        `Framework: ${cleanText(payload.framework.name,"GrowWithHR Organization Structure Assessment Framework")} v${cleanText(payload.framework.version,"1.1")}`
    ];
    identity.forEach((line,index)=>doc.text(doc.splitTextToSize(line,CONTENT_W-16),PAGE.left+8,identityY+24+index*8,{maxWidth:CONTENT_W-16}));

    doc.setFillColor(255,248,232); doc.roundedRect(PAGE.left,184,CONTENT_W,45,4,4,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(9.5); doc.setTextColor(146,64,14); doc.text("HOW TO READ THIS REPORT",PAGE.left+8,197);
    doc.setFont("helvetica","normal"); doc.setFontSize(8.6); doc.setTextColor(67,43,20);
    doc.text(doc.splitTextToSize("Public sources support the underlying organisation-design principle. GrowWithHR's deterministic rule explains how that principle was applied to the facts supplied. Prototype guardrails are not presented as universal external benchmarks.",CONTENT_W-16),PAGE.left+8,207,{lineHeightFactor:1.15});
    doc.setFontSize(8); doc.setTextColor(203,213,225); doc.text(payload.sample ? "Illustrative sample · Fictional company data" : "Complete personalised PDF · Delivered by authenticated email",PAGE.left,270);
}

function executiveSection(doc,state,payload,logoData){
    const model=payload.reportModel; addPage(doc,state,"Executive Overview",logoData);
    heading(doc,state,"Executive Overview",1,"Executive Overview",logoData);
    paragraph(doc,state,cleanText(model.executiveSummary,"No executive summary is available."),{size:10.8,bold:true,color:BRAND.navy,pageTitle:"Executive Overview"},logoData);
    labelValue(doc,state,"Company",payload.companyName,"Executive Overview",logoData); labelValue(doc,state,"Report ID",payload.reportId,"Executive Overview",logoData);
    heading(doc,state,"Status overview",2,"Executive Overview",logoData); statusOverview(doc,state,model.statusSummary||{},"Executive Overview",logoData);
    heading(doc,state,"Key structural metrics",2,"Executive Overview",logoData);
    const m=model.metrics||{}; labelValue(doc,state,"Employees",m.employees??payload.facts.employees,"Executive Overview",logoData); labelValue(doc,state,"People managers",m.peopleManagers??"Not provided","Executive Overview",logoData); labelValue(doc,state,"Employees per manager",m.currentEmployeeToManagerRatio??"Not available","Executive Overview",logoData); labelValue(doc,state,"12-month headcount",m.expectedEmployees12Months??"Not provided","Executive Overview",logoData); labelValue(doc,state,"Management context",cleanText(m.managementContextBand,"Not enough context").replaceAll("-"," "),"Executive Overview",logoData);
    const primary=model.primaryConstraint; if(primary){heading(doc,state,"Primary constraint",2,"Executive Overview",logoData);statusChip(doc,state,primary.status,"Executive Overview",logoData);paragraph(doc,state,primary.title,{bold:true,size:10.5,pageTitle:"Executive Overview"},logoData);paragraph(doc,state,primary.whyItMatters,{pageTitle:"Executive Overview"},logoData);infoBox(doc,state,"What to do next",primary.action,BRAND.goldSoft,"Executive Overview",logoData);}
    heading(doc,state,"Top priorities",2,"Executive Overview",logoData); (model.priorities||[]).slice(0,3).forEach((item,index)=>infoBox(doc,state,`${index+1}. ${item.title}`,item.action,BRAND.soft,"Executive Overview",logoData));
}

function changeSection(doc,state,payload,logoData){
    const change=payload.changeIntelligence; if(!change?.baselineAvailable && !(change?.changes||[]).length)return;
    addPage(doc,state,"Change Intelligence",logoData); heading(doc,state,"Change Intelligence",1,"Change Intelligence",logoData);
    paragraph(doc,state,"What materially changed since the previous confirmed company baseline. GrowWithHR compares structured facts and deterministic findings, not generated report wording.",{color:BRAND.muted,pageTitle:"Change Intelligence"},logoData);
    labelValue(doc,state,"Previous report",change.previousReportId||"Previous confirmed baseline","Change Intelligence",logoData);
    labelValue(doc,state,"Changed company facts",String((change.factChanges||change.changes||[]).length),"Change Intelligence",logoData);
    if(change.summary){statusOverview(doc,state,{action:change.summary.increased||0,watch:change.summary.newPriority||0,stable:change.summary.improved||0,"needs-information":change.summary.informationGap||0},"Change Intelligence",logoData);}
    const factChanges=change.factChanges||change.changes||[]; factChanges.slice(0,10).forEach((item)=>infoBox(doc,state,cleanText(item.label||item.field,"Company fact"),`${cleanText(item.before,"Not recorded")} → ${cleanText(item.after,"Not recorded")}`,BRAND.soft,"Change Intelligence",logoData));
    const findingChanges=change.findingChanges||[]; if(findingChanges.length){heading(doc,state,"Finding movement",2,"Change Intelligence",logoData);findingChanges.slice(0,8).forEach((item)=>infoBox(doc,state,item.title,`${statusLabel(item.beforeStatus)} → ${statusLabel(item.afterStatus)} · ${cleanText(item.direction).replaceAll("-"," ")}`,item.direction==="improved"?BRAND.greenSoft:BRAND.goldSoft,"Change Intelligence",logoData));}
}

function findingSection(doc,state,payload,logoData){
    addPage(doc,state,"Detailed Findings",logoData); heading(doc,state,"Detailed Structural Findings",1,"Detailed Findings",logoData);
    paragraph(doc,state,"Each finding separates the GrowWithHR rule from the public source supporting the underlying organisation-design principle.",{color:BRAND.muted,pageTitle:"Detailed Findings"},logoData);
    payload.findings.forEach((item,index)=>{
        ensureSpace(doc,state,38,"Detailed Findings",logoData); statusChip(doc,state,item.status,"Detailed Findings",logoData); paragraph(doc,state,`${index+1}. ${item.title}`,{bold:true,size:10.5,pageTitle:"Detailed Findings"},logoData); paragraph(doc,state,item.whyItMatters,{pageTitle:"Detailed Findings"},logoData); infoBox(doc,state,"What to do next",item.action,statusSoft(item.status),"Detailed Findings",logoData); paragraph(doc,state,`Reassess when: ${cleanText(item.growthTrigger)}`,{size:8.3,color:BRAND.muted,pageTitle:"Detailed Findings"},logoData); labelValue(doc,state,"Confidence",`${cleanText(item.confidence)} — fact completeness / deterministic rule path, not statistical confidence`,"Detailed Findings",logoData); labelValue(doc,state,"Facts used",(item.factsUsed||[]).join(", ")||"No confirmed fact used yet","Detailed Findings",logoData); if((item.missingFacts||[]).length)labelValue(doc,state,"Missing",item.missingFacts.join(", "),"Detailed Findings",logoData); labelValue(doc,state,"GrowWithHR rule",`${cleanText(item.ruleId||item.id)} v${cleanText(item.ruleVersion,"1.1")}`,"Detailed Findings",logoData); paragraph(doc,state,item.ruleBasis,{size:8.2,color:[92,60,20],pageTitle:"Detailed Findings"},logoData); (item.sources||[]).forEach((source)=>{linkLine(doc,state,"Public source",`${source.title} — ${source.publisher} — ${source.section}`,source.url,"Detailed Findings",logoData);paragraph(doc,state,`What this source supports: ${source.supports}`,{size:7.7,color:BRAND.muted,pageTitle:"Detailed Findings"},logoData);}); state.y+=4;
    });
}

function scenarioSection(doc,state,payload,logoData){
    addPage(doc,state,"12-Month Growth Scenario",logoData); heading(doc,state,"12-Month Growth Scenario",1,"12-Month Growth Scenario",logoData); paragraph(doc,state,"What changes if headcount grows as planned and manager count stays the same? This is a deterministic planning scenario, not a forecast.",{color:BRAND.muted,pageTitle:"12-Month Growth Scenario"},logoData);
    const model=payload.reportModel,m=model.metrics||{}; labelValue(doc,state,"Current employees",m.employees??"Not provided","12-Month Growth Scenario",logoData);labelValue(doc,state,"Current people managers",m.peopleManagers??"Not provided","12-Month Growth Scenario",logoData);labelValue(doc,state,"Current employees per manager",m.currentEmployeeToManagerRatio??"Not available","12-Month Growth Scenario",logoData);labelValue(doc,state,"12-month headcount assumption",m.expectedEmployees12Months??"Not provided","12-Month Growth Scenario",logoData);labelValue(doc,state,"Projected employees per manager",payload.scenario.projectedEmployeeToManagerRatio??"Not available","12-Month Growth Scenario",logoData);labelValue(doc,state,"Projected status",statusLabel(payload.scenario.projectedStatus),"12-Month Growth Scenario",logoData);
    heading(doc,state,"What this means",2,"12-Month Growth Scenario",logoData); paragraph(doc,state,payload.scenario.interpretation,{bold:true,size:10.5,pageTitle:"12-Month Growth Scenario"},logoData); paragraph(doc,state,payload.scenario.disclaimer,{size:8.3,color:BRAND.muted,pageTitle:"12-Month Growth Scenario"},logoData); (payload.scenario.sources||[]).forEach((source)=>linkLine(doc,state,"Public source",`${source.title} — ${source.publisher}`,source.url,"12-Month Growth Scenario",logoData));
    heading(doc,state,"Priorities before the next hiring wave",2,"12-Month Growth Scenario",logoData); (model.priorities||[]).slice(0,5).forEach((item,index)=>infoBox(doc,state,`${index+1}. ${item.title}`,item.action,BRAND.soft,"12-Month Growth Scenario",logoData));
}

function evidenceSection(doc,state,payload,logoData){
    addPage(doc,state,"Framework & Evidence",logoData); heading(doc,state,"Framework & Evidence",1,"Framework & Evidence",logoData); const f=payload.framework||{};
    labelValue(doc,state,"Framework",cleanText(f.name,"GrowWithHR Organization Structure Assessment Framework"),"Framework & Evidence",logoData); labelValue(doc,state,"Version",cleanText(f.version,"1.1"),"Framework & Evidence",logoData); labelValue(doc,state,"Access",cleanText(f.access,"Free public methodology"),"Framework & Evidence",logoData); labelValue(doc,state,"Last reviewed",cleanText(f.lastReviewed,"Not recorded"),"Framework & Evidence",logoData); paragraph(doc,state,f.statement,{color:BRAND.muted,pageTitle:"Framework & Evidence"},logoData);
    if(f.methodologyUrl)linkLine(doc,state,"Methodology","GrowWithHR Organization Structure methodology and source library",f.methodologyUrl,"Framework & Evidence",logoData);
    heading(doc,state,"Public source library used",2,"Framework & Evidence",logoData); (payload.reportModel.sources||[]).forEach((source)=>{paragraph(doc,state,source.title,{bold:true,pageTitle:"Framework & Evidence"},logoData);labelValue(doc,state,"Publisher",source.publisher,"Framework & Evidence",logoData);paragraph(doc,state,`Used for: ${source.supports}`,{size:8.2,color:BRAND.muted,pageTitle:"Framework & Evidence"},logoData);linkLine(doc,state,"Link",source.url,source.url,"Framework & Evidence",logoData);state.y+=2;});
    heading(doc,state,"Important boundary",2,"Framework & Evidence",logoData); paragraph(doc,state,"Public sources do not endorse GrowWithHR. They support the underlying organisation-design principles. GrowWithHR remains responsible for its disclosed deterministic interpretation. This report evaluates organisation-level structure and does not score people, determine compensation or decide legal applicability.",{pageTitle:"Framework & Evidence"},logoData);
}

function absoluteMethodologyUrl(framework={}){const current=cleanText(framework.methodologyUrl);if(/^https?:\/\//.test(current))return current;try{return new URL(current||"organization-structure-methodology.html",window.location.href).href;}catch(_error){return current||"organization-structure-methodology.html";}}

async function generateOrganizationStructurePdf(payload={},options={}){
    const JsPDF=jsPDFConstructor(); if(!JsPDF)throw new Error("The GrowWithHR PDF library is unavailable.");
    const normalized=normalizePayload(payload); normalized.framework={...normalized.framework,methodologyUrl:absoluteMethodologyUrl(normalized.framework)};
    const logoData=await loadLogoDataUrl(); const doc=new JsPDF({orientation:"portrait",unit:"mm",format:"a4",compress:true}); const state={page:0,y:0};
    cover(doc,state,normalized,logoData); executiveSection(doc,state,normalized,logoData); changeSection(doc,state,normalized,logoData); findingSection(doc,state,normalized,logoData); scenarioSection(doc,state,normalized,logoData); evidenceSection(doc,state,normalized,logoData);
    const filename=`GrowWithHR-Organization-Growth-${cleanFilename(normalized.companyName)}.pdf`; const mode=cleanText(options.mode,"download");
    if(mode==="download"){doc.save(filename);return{filename,pageCount:doc.getNumberOfPages()};}
    if(mode==="blob")return{filename,blob:doc.output("blob"),pageCount:doc.getNumberOfPages()};
    if(mode==="base64"){const dataUri=doc.output("datauristring");return{filename,base64:dataUri.replace(/^data:application\/pdf;filename=.*?;base64,/i,"").replace(/^data:application\/pdf;base64,/i,""),dataUri,pageCount:doc.getNumberOfPages()};}
    throw new Error("Unsupported Organization Structure PDF mode.");
}

export { generateOrganizationStructurePdf };
export default generateOrganizationStructurePdf;