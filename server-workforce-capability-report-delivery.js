"use strict";

const crypto = require("crypto");
const { google } = require("googleapis");

const DELIVERY_ROUTE = "/api/workforce-capability-report/deliver";
const ACTIVITY_ROUTE = "/api/workforce-capability-report/activity";
const ROUTES = new Set([DELIVERY_ROUTE, ACTIVITY_ROUTE]);
const MAX_REQUEST_BYTES = 16 * 1024 * 1024;
const MAX_PDF_BYTES = 12 * 1024 * 1024;
const FOUNDER_NAME = "Anurag Sinha";
const FOUNDER_LINKEDIN_URL = "https://www.linkedin.com/in/anuragsinha1009/";

function cleanText(value, fallback = "") { return String(value ?? "").trim() || fallback; }
function validEmail(value) { return /^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]+$/.test(cleanText(value)); }
function safeHeader(value) { return cleanText(value).replace(/[\r\n]+/g, " "); }
function escapeHtml(value) { return cleanText(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
function encodeHeader(value) { return `=?UTF-8?B?${Buffer.from(safeHeader(value),"utf8").toString("base64")}?=`; }
function wrapBase64(value) { return String(value).match(/.{1,76}/g)?.join("\r\n") || ""; }
function encodeBase64Url(value) { return Buffer.from(value,"utf8").toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""); }
function safeFilename(value) { let name=cleanText(value,"GrowWithHR-Workforce-Capability-Plan.pdf").replace(/[^a-zA-Z0-9._-]/g,"-").replace(/-+/g,"-").slice(0,170); if(!name.toLowerCase().endsWith(".pdf"))name+=".pdf"; return name; }

function decodePdf(pdf={}) {
  const raw=cleanText(pdf.base64||pdf.dataUri||pdf.data).replace(/^data:application\/pdf;base64,/i,"").replace(/\s/g,"");
  if(!raw||!/^[a-zA-Z0-9+/=]+$/.test(raw))throw Object.assign(new Error("The Workforce & Capability PDF is missing or invalid."),{statusCode:400});
  const content=Buffer.from(raw,"base64");
  if(!content.length||content.subarray(0,5).toString("ascii")!=="%PDF-")throw Object.assign(new Error("The generated Workforce & Capability attachment is not a valid PDF."),{statusCode:400});
  if(content.length>MAX_PDF_BYTES)throw Object.assign(new Error("The generated Workforce & Capability report is larger than the supported delivery limit."),{statusCode:413});
  return {filename:safeFilename(pdf.filename),content};
}

function gmailConfigured() { return ["GMAIL_USER","GOOGLE_CLIENT_ID","GOOGLE_CLIENT_SECRET","GOOGLE_REFRESH_TOKEN"].every((name)=>cleanText(process.env[name])); }
function gmailClient() { const oauth=new google.auth.OAuth2(cleanText(process.env.GOOGLE_CLIENT_ID),cleanText(process.env.GOOGLE_CLIENT_SECRET)); oauth.setCredentials({refresh_token:cleanText(process.env.GOOGLE_REFRESH_TOKEN)}); return google.gmail({version:"v1",auth:oauth}); }

function rawEmail({from,to,replyTo,subject,text,html,attachment=null}) {
  const mixed=`mixed_${crypto.randomUUID()}`; const alt=`alt_${crypto.randomUUID()}`;
  const lines=[`From: ${safeHeader(from)}`,`To: ${safeHeader(to)}`,...(replyTo?[`Reply-To: ${safeHeader(replyTo)}`]:[]),`Subject: ${encodeHeader(subject)}`,`Date: ${new Date().toUTCString()}`,"MIME-Version: 1.0",`Content-Type: multipart/mixed; boundary="${mixed}"`,"",`--${mixed}`,`Content-Type: multipart/alternative; boundary="${alt}"`,"",`--${alt}`,'Content-Type: text/plain; charset="UTF-8"',"Content-Transfer-Encoding: base64","",wrapBase64(Buffer.from(cleanText(text),"utf8").toString("base64")),"",`--${alt}`,'Content-Type: text/html; charset="UTF-8"',"Content-Transfer-Encoding: base64","",wrapBase64(Buffer.from(cleanText(html),"utf8").toString("base64")),"",`--${alt}--`,""];
  if(attachment){const filename=safeFilename(attachment.filename);lines.push(`--${mixed}`,`Content-Type: application/pdf; name="${filename}"`,`Content-Disposition: attachment; filename="${filename}"`,"Content-Transfer-Encoding: base64","",wrapBase64(attachment.content.toString("base64")),"");}
  lines.push(`--${mixed}--`,""); return encodeBase64Url(lines.join("\r\n"));
}

async function send(gmail,message) { const result=await gmail.users.messages.send({userId:"me",requestBody:{raw:rawEmail(message)}}); return result.data||{}; }

function customerMessage(lead={},report={},filename="") {
  const name=cleanText(lead.name,"there"); const company=cleanText(report.companyName||lead.companyName,"your organisation"); const ruleset=cleanText(report.rulesetVersion,"WCP-2026.1"); const engine=cleanText(report.engineVersion,"1.0.0"); const approach=cleanText(report.selectedApproach,"Hybrid plan"); const reportId=cleanText(report.reportId,"Local analysis"); const methodologyUrl=cleanText(report.methodologyUrl,"https://hrtechifyed.github.io/GrowwithHR-Version2/workforce-capability-methodology.html");
  const subject=`Your GrowWithHR Workforce & Capability Plan for ${company}`;
  const text=[`Hello ${name},`,"",`Your GrowWithHR Workforce & Capability Planning Report for ${company} is attached as ${filename}.`,"",`Selected planning approach: ${approach}`,`Engine: ${engine}`,`Rule set: ${ruleset}`,`Report ID: ${reportId}`,`Methodology and rules: ${methodologyUrl}`,"","The report retains the framework comparison, capability and capacity findings, implementation options, time and cost basis, scenarios, 12–36 month roadmap, facts used, rule IDs, confidence and sources.","","Scenario values and implementation timing are planning assumptions, not forecasts. Current cost estimates are produced only from company-supplied cost inputs. The analysis evaluates organization-level workforce and capability planning; it does not score individual employees or decide dismissals or compensation.","","Warm Wishes,",FOUNDER_NAME,"Founder, HRTechify",FOUNDER_LINKEDIN_URL].join("\n");
  const html=`<!doctype html><html><body style="margin:0;background:#05070B;font-family:Inter,Segoe UI,Arial,sans-serif;color:#223347"><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 14px"><table role="presentation" width="100%" style="max-width:680px;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="height:7px;background:linear-gradient(90deg,#FFB000,#FF7A00,#FF4D00)"></td></tr><tr><td style="padding:32px 38px;background:#0A1020"><div style="color:#FFB000;font-size:12px;font-weight:800;letter-spacing:.14em">HRTECHIFY · GROWWITHHR</div><h1 style="margin:10px 0 0;color:#fff;font-size:28px">Your Workforce &amp; Capability Plan</h1><p style="color:#CBD5E1;line-height:1.6">Strategy → capability → workforce → implementation for ${escapeHtml(company)}</p></td></tr><tr><td style="padding:34px 38px"><p>Hello ${escapeHtml(name)},</p><p>Your complete GrowWithHR Workforce &amp; Capability Planning Report is attached as one PDF.</p><div style="padding:18px 20px;background:#FFF7ED;border-left:4px solid #FF7A00;line-height:1.65"><strong>Planning approach</strong><br>${escapeHtml(approach)}<br><strong>Rule set</strong><br>${escapeHtml(ruleset)}</div><p style="line-height:1.7">The report includes framework comparison, all capability / capacity findings, Build · Buy · Borrow · Bind · Bot · Move options, implementation economics, scenario comparison, roadmap and a full decision trace.</p><p><a href="${escapeHtml(methodologyUrl)}" style="color:#B45309">View methodology and rules</a><br>Report ID: ${escapeHtml(reportId)}</p><p style="color:#64748B;font-size:14px;line-height:1.7">Scenario values and implementation timing are planning assumptions, not forecasts. Cost estimates are only produced from company-supplied inputs in this ruleset. Individual employees are not scored.</p><p>Warm Wishes,<br>${FOUNDER_NAME}<br>Founder, HRTechify<br><a href="${FOUNDER_LINKEDIN_URL}">${FOUNDER_LINKEDIN_URL}</a></p></td></tr></table></td></tr></table></body></html>`;
  return {subject,text,html};
}

function readJsonBody(request) { return new Promise((resolve,reject)=>{let size=0;const chunks=[];request.on("data",chunk=>{size+=chunk.length;if(size>MAX_REQUEST_BYTES){reject(Object.assign(new Error("The Workforce & Capability report request is too large."),{statusCode:413}));request.destroy();return;}chunks.push(chunk);});request.on("end",()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")||"{}"));}catch(_error){reject(Object.assign(new Error("The Workforce & Capability request contains invalid JSON."),{statusCode:400}));}});request.on("error",reject);}); }
function writeJson(response,status,payload){if(response.writableEnded)return;response.statusCode=status;response.setHeader("Content-Type","application/json; charset=utf-8");response.setHeader("Cache-Control","no-store");response.end(JSON.stringify(payload));}

async function processDelivery(request,response){
  try{
    if(request.method!=="POST"){writeJson(response,405,{error:"Method not allowed."});return;}
    if(!gmailConfigured()){writeJson(response,503,{error:"Gmail API is not configured on the server."});return;}
    const body=await readJsonBody(request); const lead=body.lead||{}; const report=body.report||{}; const recipient=cleanText(lead.email||report.recipientEmail).toLowerCase();
    if(!validEmail(recipient)){writeJson(response,400,{error:"A valid recipient email address is required."});return;}
    const attachment=decodePdf(body.pdf||{}); const sender=cleanText(process.env.GMAIL_USER).toLowerCase(); if(!validEmail(sender)){writeJson(response,503,{error:"GMAIL_USER is not a valid email address."});return;}
    const message=customerMessage(lead,report,attachment.filename); const result=await send(gmailClient(),{from:`"GrowWithHR" <${sender}>`,to:recipient,replyTo:cleanText(process.env.REPLY_TO_EMAIL,sender),subject:message.subject,text:message.text,html:message.html,attachment});
    writeJson(response,200,{ok:true,customerSent:true,messageId:result.id||"",filename:attachment.filename});
  }catch(error){console.error("Workforce & Capability report delivery failed",error?.response?.data||error);writeJson(response,Number(error.statusCode)||500,{error:cleanText(error.message,"The Workforce & Capability report could not be delivered.")});}
}

async function processActivity(request,response){
  try{if(request.method!=="POST"){writeJson(response,405,{error:"Method not allowed."});return;}const body=await readJsonBody(request);writeJson(response,200,{ok:true,recorded:true,event:cleanText(body.event,"unknown"),reportId:cleanText(body.reportId)});}catch(error){writeJson(response,Number(error.statusCode)||400,{error:cleanText(error.message,"Report activity could not be recorded.")});}
}

function handleWorkforceCapabilityReportRequest(request,response){const path=cleanText(request.url).split("?")[0];if(!ROUTES.has(path))return false;if(path===DELIVERY_ROUTE)processDelivery(request,response);else processActivity(request,response);return true;}

module.exports={DELIVERY_ROUTE,ACTIVITY_ROUTE,ROUTES,handleWorkforceCapabilityReportRequest,decodePdf,customerMessage};
