import{s as e}from"./rolldown-runtime-zSbnoVup.js";import{n as t}from"./monaco-COg51UHI.js";import{i as n,r}from"./utils-DGsDHJQS.js";import{a as i,i as a,n as o,r as s,t as c}from"./select-CNN7qmmL.js";import{t as l}from"./CopyButton-HLYXZusJ.js";import{t as u}from"./button-D25DGHGu.js";import{n as d}from"./js-yaml-DBo5irrq.js";import{n as f,t as p}from"./json2xml-BRmnSUVc.js";import{t as m}from"./CodeEditor-CcqpUdZk.js";import{t as h}from"./badge-Dd_OXbxE.js";var g=n(`ArrowRight`,[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]]),_=e(t(),1),v=r(),y={json:`json`,yaml:`yaml`,xml:`xml`},b={json:`{
  "name": "ToolGarage",
  "version": "1.0",
  "tools": ["JSON", "YAML", "XML"],
  "meta": {
    "author": "developer-team",
    "year": 2026
  }
}`,yaml:`name: ToolGarage
version: "1.0"
tools:
  - JSON
  - YAML
  - XML
meta:
  author: developer-team
  year: 2026`,xml:`<?xml version="1.0" encoding="UTF-8"?>
<root>
  <name>ToolGarage</name>
  <version>1.0</version>
  <tools>
    <item>JSON</item>
    <item>YAML</item>
    <item>XML</item>
  </tools>
  <meta>
    <author>developer-team</author>
    <year>2026</year>
  </meta>
</root>`};function x(e,t){switch(t){case`json`:return JSON.parse(e);case`yaml`:return d.load(e);case`xml`:return new f({ignoreAttributes:!1,parseTagValue:!0,trimValues:!0}).parse(e)}}function S(e,t){switch(t){case`json`:return JSON.stringify(e,null,2);case`yaml`:return d.dump(e,{indent:2,lineWidth:120,noRefs:!0});case`xml`:return new p({ignoreAttributes:!1,format:!0,indentBy:`  `,suppressEmptyNode:!1}).build(e)}}function C(){let[e,t]=(0,_.useState)(`json`),[n,r]=(0,_.useState)(`yaml`),[d,f]=(0,_.useState)(b.json),[p,C]=(0,_.useState)(``),[w,T]=(0,_.useState)(``),E=()=>{if(T(``),C(``),d.trim())try{C(S(x(d,e),n))}catch(t){T(t instanceof Error?`Conversion failed: ${t.message}. Make sure the input really is valid ${e.toUpperCase()}.`:`Conversion failed — please double-check that the input is valid ${e.toUpperCase()}.`)}},D=()=>{t(n),r(e),p&&f(p),C(``),T(``)},O=e=>{t(e),f(b[e]),C(``),T(``)};return(0,v.jsxs)(`div`,{className:`flex h-full flex-col gap-3`,children:[(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`h1`,{className:`text-lg font-semibold`,children:`JSON ⇄ YAML ⇄ XML`}),(0,v.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:`Convert configuration and payloads between JSON, YAML and XML in a single click.`})]}),(0,v.jsxs)(`div`,{className:`flex items-center gap-3 flex-wrap`,children:[(0,v.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,v.jsx)(`span`,{className:`text-sm font-medium`,children:`From`}),(0,v.jsxs)(c,{value:e,onValueChange:e=>O(e),children:[(0,v.jsx)(a,{className:`w-24`,children:(0,v.jsx)(i,{})}),(0,v.jsxs)(o,{children:[(0,v.jsx)(s,{value:`json`,children:`JSON`}),(0,v.jsx)(s,{value:`yaml`,children:`YAML`}),(0,v.jsx)(s,{value:`xml`,children:`XML`})]})]})]}),(0,v.jsxs)(u,{variant:`outline`,size:`sm`,onClick:D,className:`gap-1.5`,title:`Swap input and output formats`,children:[(0,v.jsx)(g,{className:`h-3.5 w-3.5`}),` Swap direction`]}),(0,v.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,v.jsx)(`span`,{className:`text-sm font-medium`,children:`To`}),(0,v.jsxs)(c,{value:n,onValueChange:e=>r(e),children:[(0,v.jsx)(a,{className:`w-24`,children:(0,v.jsx)(i,{})}),(0,v.jsxs)(o,{children:[(0,v.jsx)(s,{value:`json`,children:`JSON`}),(0,v.jsx)(s,{value:`yaml`,children:`YAML`}),(0,v.jsx)(s,{value:`xml`,children:`XML`})]})]})]}),(0,v.jsx)(u,{onClick:E,children:`Convert now`}),w&&(0,v.jsx)(h,{variant:`destructive`,children:`Conversion failed`})]}),(0,v.jsxs)(`div`,{className:`grid grid-cols-2 gap-3 flex-1 min-h-0`,children:[(0,v.jsxs)(`div`,{className:`flex flex-col gap-1 min-h-0`,children:[(0,v.jsxs)(`span`,{className:`text-xs font-medium text-muted-foreground uppercase tracking-wide`,children:[`Your `,e.toUpperCase()]}),(0,v.jsx)(`div`,{className:`flex-1 min-h-0 rounded-md border border-border overflow-hidden`,children:(0,v.jsx)(m,{value:d,onChange:f,language:y[e],height:`400px`})})]}),(0,v.jsxs)(`div`,{className:`flex flex-col gap-1 min-h-0`,children:[(0,v.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,v.jsxs)(`span`,{className:`text-xs font-medium text-muted-foreground uppercase tracking-wide`,children:[`As `,n.toUpperCase()]}),p&&(0,v.jsx)(l,{text:p,size:`sm`})]}),(0,v.jsx)(`div`,{className:`flex-1 min-h-0 rounded-md border border-border overflow-hidden`,children:(0,v.jsx)(m,{value:w?`// ${w}`:p,language:y[n],readOnly:!0,height:`400px`})})]})]})]})}export{C as default};