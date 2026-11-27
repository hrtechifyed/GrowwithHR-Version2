/* Shared syntax and common domain typo guard. Mailbox ownership still requires email verification. */
(function(root){
  "use strict";
  function isValidEmail(value){
    const email=String(value??"").trim();
    if(email.length>254||/[\s,;<>]/.test(email))return false;
    const parts=email.split("@");
    if(parts.length!==2)return false;
    const [local,domain]=parts;
    if(!local||local.length>64||!(/^[A-Za-z0-9.!#$%&'*+/=?^_\x60{|}~-]+$/).test(local)||local.startsWith(".")||local.endsWith(".")||local.includes(".."))return false;
    const labels=domain.toLowerCase().split(".");
    if(labels.length<2||labels.some(label=>!(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/).test(label)))return false;
    const tld=labels[labels.length-1];
    if(!(/^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/).test(tld)||["con","cmo","ocm","comm","coom","comn","nte","ogr","orgg","nett"].includes(tld))return false;
    return !["gmai.com","gmial.com","gmal.com","gmail.co","hotnail.com","outlok.com","yaho.com","yahooo.com"].includes(domain.toLowerCase());
  }
  const api=Object.freeze({isValidEmail,message:"Enter a valid work email address. Check the spelling of the domain (for example, .com rather than .con)."});
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.GrowWithHREmailValidation=api;
})(typeof globalThis==="object"?globalThis:this);
