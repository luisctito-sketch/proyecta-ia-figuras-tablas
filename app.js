
const $ = id => document.getElementById(id);
const clean = s => (s ?? "").toString().replace(/\s+/g," ").trim();
const norm = s => clean(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const esc = s => (s ?? "").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function show(el, cls, html){el.className=`output-box ${cls}`;el.innerHTML=html;el.classList.remove("hidden");}
function parseNum(s){if(clean(s)==="")return NaN;return Number(String(s).trim().replace(",", "."));}
function hasAny(t,arr){const n=norm(t);return arr.some(x=>n.includes(norm(x)));}

/* DPI */
let imgInfo=null;
$("figureImage").addEventListener("change",()=>{
  const f=$("figureImage").files[0];
  if(!f){imgInfo=null;$("imagePreviewWrap").classList.add("hidden");$("imageMeta").textContent="";return;}
  const url=URL.createObjectURL(f);
  $("imagePreview").src=url;$("imagePreviewWrap").classList.remove("hidden");
  const im=new Image();
  im.onload=()=>{
    imgInfo={name:f.name,w:im.naturalWidth,h:im.naturalHeight,size:f.size,type:f.type};
    $("imageMeta").textContent=`${f.name} · ${im.naturalWidth} × ${im.naturalHeight} px · ${(f.size/1024).toFixed(1)} KB`;
  };
  im.src=url;
});
$("checkDpiBtn").addEventListener("click",()=>{
  if(!imgInfo){show($("dpiOutput"),"bad","<b>Primero carga una imagen.</b>");return;}
  const wcm=parseNum($("printWidthCm").value),hcm=parseNum($("printHeightCm").value);
  if(!Number.isFinite(wcm)||wcm<=0){show($("dpiOutput"),"bad","<b>Introduce un ancho de impresión válido.</b>");return;}
  const win=wcm/2.54, dpiW=imgInfo.w/win;
  const proportionalH=wcm*imgInfo.h/imgInfo.w;
  const finalH=Number.isFinite(hcm)&&hcm>0?hcm:proportionalH;
  const hin=finalH/2.54,dpiH=imgInfo.h/hin;
  const dpi=Math.min(dpiW,dpiH);
  const minPxW=Math.ceil(win*300), minPxH=Math.ceil(hin*300);
  let cls,title;
  if(dpi>=300){cls="good";title="🟢 ADECUADA PARA IMPRESIÓN A 300 ppp";}
  else if(dpi>=220){cls="warn";title="🟡 RESOLUCIÓN INTERMEDIA: CONVIENE MEJORARLA";}
  else{cls="bad";title="🔴 RESOLUCIÓN INSUFICIENTE PARA IMPRESIÓN DE CALIDAD";}
  show($("dpiOutput"),cls,`<h4>${title}</h4>
    <p><b>Tamaño de impresión:</b> ${wcm.toFixed(2)} cm × ${finalH.toFixed(2)} cm</p>
    <p><b>Resolución efectiva horizontal:</b> ${dpiW.toFixed(0)} ppp</p>
    <p><b>Resolución efectiva vertical:</b> ${dpiH.toFixed(0)} ppp</p>
    <p><b>Resolución efectiva limitante:</b> ${dpi.toFixed(0)} ppp</p>
    <p>Para ese tamaño, una imagen de 300 ppp debería tener al menos <b>${minPxW} × ${minPxH} px</b>.</p>
    <p class="small">Este cálculo usa dimensiones en píxeles y tamaño de impresión. Es más útil que confiar solamente en un metadato “DPI” incrustado en el archivo.</p>`);
});

/* Citation before */
function expectedRef(type,c,n){
  return type==="fig"?`Fig. ${c}.${n}`:`Tabla ${c}.${n}`;
}
$("checkCitationBtn").addEventListener("click",()=>{
  const t=$("beforeText").value,type=$("itemType").value,c=$("chapterNumber").value,n=$("itemNumber").value;
  const ref=expectedRef(type,c,n), nt=norm(t);
  const exact=nt.includes(norm(ref));
  const generic=type==="fig"?hasAny(t,["figura","fig.","como se observa","como se muestra","se presenta"]):hasAny(t,["tabla","como se observa","se presenta","se resume"]);
  const firstPerson=findFirstPerson(t);
  const checks=[
    [exact?"good":"bad",exact?`Se detecta la referencia exacta ${ref}.`:`No se detecta la referencia exacta ${ref}.`],
    [generic?"good":"warn",generic?"El párrafo introduce visualmente el elemento.":"Conviene integrar la referencia de forma natural en la oración."],
    [firstPerson.length?"warn":"good",firstPerson.length?"Se detectan posibles formas de primera persona.":"No se detecta primera persona evidente."]
  ];
  const bad=checks.some(x=>x[0]==="bad"),warn=checks.some(x=>x[0]==="warn");
  show($("citationOutput"),bad?"bad":warn?"warn":"good",`<h4>${bad?"🔴 FALTA REFERENCIA":warn?"🟡 REVISAR REDACCIÓN":"🟢 REFERENCIA CORRECTA"}</h4><ul>${checks.map(x=>`<li class="status-${x[0]}">${x[1]}</li>`).join("")}</ul>
  <p><b>Modelo:</b> “Como se observa en la ${ref}, [explica brevemente qué muestra y por qué se presenta].”</p>`);
});

/* Interpretation after */
$("checkAfterBtn").addEventListener("click",()=>{
  const t=clean($("afterText").value);
  if(!t){show($("afterOutput"),"bad","<b>Pega el párrafo posterior.</b>");return;}
  const fp=findFirstPerson(t);
  const checks=[
    [t.split(/\s+/).length>=25?"good":"warn","El párrafo debe desarrollar una interpretación suficiente, no una frase aislada."],
    [hasAny(t,["se observa","se identifica","muestra","evidencia","representa","presenta","indica"])?"good":"warn","Conviene señalar qué información relevante se observa."],
    [hasAny(t,["por tanto","por consiguiente","debido","lo cual","esto permite","implica","por esta razón","por esta razon","en consecuencia"])?"good":"warn","Conviene explicar qué significa técnicamente la información."],
    [hasAny(t,["objetivo","diseño","selección","seleccion","sistema","proceso","resultado","requerimiento","decisión","decision"])?"good":"warn","Vincula la interpretación con una decisión, objetivo o etapa del proyecto."],
    [fp.length?"warn":"good",fp.length?"Se detecta posible primera persona; usa redacción impersonal.":"La redacción parece impersonal."]
  ];
  const warn=checks.some(x=>x[0]==="warn");
  show($("afterOutput"),warn?"warn":"good",`<h4>${warn?"🟡 INTERPRETACIÓN MEJORABLE":"🟢 INTERPRETACIÓN ADECUADA"}</h4><ul>${checks.map(x=>`<li class="status-${x[0]}">${x[1]}</li>`).join("")}</ul>`);
});

/* First person */
const explicitFirstPerson = [
  /\b(yo|nosotros|nosotras|nuestro|nuestra|nuestros|nuestras)\b/gi,
  /\b(hice|hicimos|realicé|realice|realizamos|desarrollé|desarrolle|desarrollamos|diseñé|diseñe|diseñamos|implementé|implemente|implementamos|medí|medi|medimos|seleccioné|seleccione|seleccionamos|elegí|elegi|elegimos|usé|use|usamos|obtuvimos|obtuve|calculamos|calculé|calcule|comprobamos|comprobé|comprobe|programamos|programé|programe|construimos|construí|construi|analizamos|analicé|analice)\b/gi,
  /\b(podemos|debemos|queremos|consideramos|observamos|vemos|notamos|concluimos|proponemos|planteamos)\b/gi
];
function findFirstPerson(text){
  const hits=[];
  explicitFirstPerson.forEach(rx=>{
    const r=new RegExp(rx.source,rx.flags);
    let m; while((m=r.exec(text))!==null){hits.push(m[0]); if(m.index===r.lastIndex)r.lastIndex++;}
  });
  // Endings in -amos/-emos/-imos: warning only; exclude common nouns/adjectives if obvious.
  const tokens=(text.match(/\b[\p{L}áéíóúüñÁÉÍÓÚÜÑ]+(?:amos|emos|imos)\b/gu)||[]);
  const exclusions=new Set(["sistemas","problemas","programas","diagramas","teoremas","esquemas"]);
  tokens.forEach(x=>{if(!exclusions.has(norm(x))&&!hits.some(h=>norm(h)===norm(x)))hits.push(x);});
  return [...new Set(hits.map(x=>x.toLowerCase()))];
}
function suggestImpersonal(word){
  const map={
    "desarrollamos":"se desarrolló","hicimos":"se realizó","realizamos":"se realizó","diseñamos":"se diseñó",
    "implementamos":"se implementó","medimos":"se midió / se realizaron mediciones","seleccionamos":"se seleccionó",
    "elegimos":"se seleccionó","usamos":"se utilizó","obtuvimos":"se obtuvo","calculamos":"se calculó",
    "comprobamos":"se comprobó","programamos":"se programó","construimos":"se construyó","analizamos":"se analizó",
    "podemos":"se puede","observamos":"se observa","vemos":"se observa","notamos":"se identifica","concluimos":"se concluye",
    "proponemos":"se propone","planteamos":"se plantea","consideramos":"se considera"
  };
  return map[norm(word)]||"reformular en tercera persona o forma impersonal";
}
$("checkPersonBtn").addEventListener("click",()=>{
  const t=$("personText").value;if(!clean(t)){show($("personOutput"),"bad","<b>Pega un fragmento del documento.</b>");return;}
  const hits=findFirstPerson(t);
  if(!hits.length){show($("personOutput"),"good","<h4>🟢 NO SE DETECTA PRIMERA PERSONA EVIDENTE</h4><p>La revisión automática no encontró patrones frecuentes de primera persona. Revisa también el sentido completo de las oraciones.</p>");return;}
  show($("personOutput"),"warn",`<h4>🟡 POSIBLES FORMAS DE PRIMERA PERSONA</h4>
    <table class="review-table"><thead><tr><th>Detectado</th><th>Sugerencia</th></tr></thead><tbody>${hits.map(h=>`<tr><td>${esc(h)}</td><td>${esc(suggestImpersonal(h))}</td></tr>`).join("")}</tbody></table>
    <p><b>Ejemplo:</b> “Implementamos el sistema y medimos la salida” → “Se implementó el sistema y la salida fue medida...”</p>`);
});

/* Full review */
function fullTitleExpected(type,c,n,title){
  const label=type==="fig"?`Fig. ${c}.${n}.`:`Tabla ${c}.${n}.`;
  const ttl=clean(title).replace(/\.+$/,"");
  return `${label} ${ttl}.`;
}
function row(name,status,detail){
  const cls=status==="CUMPLE"?"good":status==="PARCIAL"?"warn":"bad";
  return `<tr><td>${name}</td><td class="status-${cls}">${status}</td><td>${detail}</td></tr>`;
}
$("runFullReviewBtn").addEventListener("click",()=>{
  const type=$("fullType").value,c=$("fullChapter").value,n=$("fullNumber").value,title=clean($("fullTitle").value),
        source=clean($("fullSource").value),note=clean($("fullNote").value),before=$("fullBefore").value,after=$("fullAfter").value;
  const ref=expectedRef(type,c,n);
  const expected=fullTitleExpected(type,c,n,title||"[título]");
  const rows=[];
  rows.push(row("Numeración",c&&n?"CUMPLE":"NO CUMPLE",`Debe corresponder al capítulo y al consecutivo: ${ref}.`));
  rows.push(row("Título",title?(title.endsWith(".")?"CUMPLE":"PARCIAL"):"NO CUMPLE",title?`Modelo recomendado: ${esc(expected)}`:"Falta el título."));
  rows.push(row("Fuente",source?( /\(\d{4}\)/.test(source)?"CUMPLE":"PARCIAL"):"NO CUMPLE",source?`Fuente declarada: ${esc(source)}`:"Falta indicar procedencia o elaboración propia."));
  rows.push(row("Nota",note?"CUMPLE":"PARCIAL",note?"Existe una nota aclaratoria.":"La nota es opcional; úsala solo si aporta información."));
  rows.push(row("Referencia anterior",norm(before).includes(norm(ref))?"CUMPLE":"NO CUMPLE",`El párrafo anterior debe citar ${ref}.`));
  rows.push(row("Explicación posterior",clean(after).split(/\s+/).length>=25?"CUMPLE":clean(after)?"PARCIAL":"NO CUMPLE","Debe interpretarse qué muestra y por qué es importante."));
  const fp=[...findFirstPerson(before),...findFirstPerson(after)];
  rows.push(row("Tercera persona",fp.length?"PARCIAL":"CUMPLE",fp.length?`Posibles formas detectadas: ${esc([...new Set(fp)].join(", "))}.`:"No se detecta primera persona evidente."));
  const failures=rows.filter(x=>x.includes("NO CUMPLE")).length,partial=rows.filter(x=>x.includes("PARCIAL")).length;
  show($("fullReviewOutput"),failures?"bad":partial?"warn":"good",`<h4>${failures?"🔴 REQUIERE CORRECCIÓN":partial?"🟡 CUMPLE PARCIALMENTE":"🟢 CUMPLE"}</h4>
    <table class="review-table"><thead><tr><th>Criterio</th><th>Estado</th><th>Observación</th></tr></thead><tbody>${rows.join("")}</tbody></table>
    <p><b>Título normalizado:</b> ${esc(expected)}</p>
    <p><b>Recordatorio tipográfico:</b> título, fuente, nota y texto de tabla en Times New Roman 10; título centrado en negrilla; Fuente/Nota alineadas a la izquierda con solo la etiqueta en negrilla.</p>`);
});

/* Prompt */
function deepPrompt(){
  return `ACTÚA COMO REVISOR METODOLÓGICO Y EDITOR ACADÉMICO DE UN PROYECTO DE GRADO DE INGENIERÍA.

REVISA LA FIGURA O TABLA QUE ADJUNTO Y APLICA ESTAS REGLAS INSTITUCIONALES:

FIGURAS
- El título se ubica encima.
- Formato: Fig. C.N. Título de la figura.
- C es el capítulo y N el consecutivo de la figura dentro de ese capítulo.
- Times New Roman 10, negrilla, centrado, con punto final.
- La figura está enmarcada con línea negra.
- Para impresión se requiere una resolución efectiva mínima de 300 ppp al tamaño final en Word.
- Debe conservarse color si el color aporta información; blanco y negro puede usarse cuando corresponda.
- Debajo: Fuente: [autor/empresa/institución] (año).
- Si es propia: Fuente: Elaboración propia (año).
- Nota: se utiliza solo si hace falta explicar adaptación, modificación, URL, condiciones u otra aclaración.
- Fuente y Nota: alineadas a la izquierda, Times New Roman 10, renglón seguido; únicamente “Fuente:” y “Nota:” en negrilla.

TABLAS
- Título encima: Tabla C.N. Título de la tabla.
- Times New Roman 10, negrilla y centrado.
- Encabezados de columnas centrados, negrilla, Times New Roman 10.
- Cuerpo de tabla Times New Roman 10, sin negrilla.
- Sin líneas horizontales internas entre filas del cuerpo; conservar líneas verticales y la estructura externa según la plantilla.
- Si la tabla continúa en otra página: escribir “(continuación).” en el título de la segunda parte y repetir los encabezados.

RELACIÓN CON EL TEXTO
- Toda figura o tabla debe ser citada desde un párrafo anterior con su número: “como se observa en la Fig. 3.4...”, “los datos se presentan en la Tabla 3.6...”.
- Debajo debe existir un párrafo que interprete lo mostrado; no basta repetir el título.
- El párrafo posterior debe explicar qué se observa, qué significa técnicamente y qué relación tiene con el objetivo, problema o decisión de diseño.

REDACCIÓN
- No usar primera persona singular ni plural.
- Detectar especialmente: hicimos, desarrollamos, diseñamos, implementamos, medimos, seleccionamos, elegimos, usamos, obtuvimos, calculamos, comprobamos, observamos, podemos, etc.
- Preferir: se realizó, se desarrolló, se diseñó, se implementó, se midió, se seleccionó, se obtuvo, se calculó, se observa.
- No inventes la fuente. Si la fuente no puede establecerse con la información dada, indica FALTA INFORMACIÓN.
- Si la imagen fue modificada pero no es original, NO aceptar “Elaboración propia” como única fuente.

DATOS DEL ELEMENTO:
Tipo: ${$("fullType")?.value==="table"?"Tabla":"Figura"}
Capítulo: ${$("fullChapter")?.value||"[NO INDICADO]"}
Número: ${$("fullNumber")?.value||"[NO INDICADO]"}
Título: ${$("fullTitle")?.value||"[NO INDICADO]"}
Fuente: ${$("fullSource")?.value||"[NO INDICADA]"}
Nota: ${$("fullNote")?.value||"[NO INDICADA]"}
Párrafo anterior:
${$("fullBefore")?.value||"[NO INGRESADO]"}
Párrafo posterior:
${$("fullAfter")?.value||"[NO INGRESADO]"}

RESPONDE CON:
1. DICTAMEN GENERAL.
2. REVISIÓN DEL TÍTULO Y NUMERACIÓN.
3. REVISIÓN VISUAL Y LEGIBILIDAD.
4. RESOLUCIÓN / CALIDAD PARA IMPRESIÓN (si puede inferirse; si no, pedir píxeles y tamaño de impresión).
5. REVISIÓN DE FUENTE Y NOTA.
6. REVISIÓN DE LA CITA EN EL PÁRRAFO ANTERIOR.
7. REVISIÓN DE LA INTERPRETACIÓN POSTERIOR.
8. DETECCIÓN DE PRIMERA PERSONA.
9. CORRECCIONES CONCRETAS.
10. MODELO FINAL DE TÍTULO, FUENTE Y NOTA SIN INVENTAR DATOS.`;
}
$("copyPromptBtn").addEventListener("click",async()=>{
  await navigator.clipboard.writeText(deepPrompt());
  $("promptStatus").textContent="Prompt copiado. Adjunta la captura de tu figura o tabla en ChatGPT.";
});
