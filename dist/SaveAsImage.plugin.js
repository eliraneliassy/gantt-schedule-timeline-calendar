!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).SaveAsImage=t()}(this,(function(){"use strict";
/**
   * Gantt-Schedule-Timeline-Calendar
   *
   * @copyright Rafal Pospiech <https://neuronet.io>
   * @author    Rafal Pospiech <neuronet.io@gmail.com>
   * @package   gantt-schedule-timeline-calendar
   * @license   GPL-3.0
   */return function(e={}){function t(t){const n=t.target,o=n.clientWidth,i=n.clientHeight,s=unescape(encodeURIComponent(n.outerHTML));let c="";for(const e of document.styleSheets)if("gstc"===e.title)for(const t of e.rules)c+=t.cssText;const a=`<svg xmlns="http://www.w3.org/2000/svg" width="${o}" height="${i}" viewBox="0 0 ${o} ${i}">\n      <foreignObject x="0" y="0" width="${o}" height="${i}">\n        <div xmlns="http://www.w3.org/1999/xhtml">\n          ${c=`<style>* {${e.style}} ${c}</style>`}\n          ${s}\n        </div>\n      </foreignObject>\n    </svg>`,l=document.createElement("canvas");l.width=o,l.height=i;const d=l.getContext("2d");d.fillStyle="white",d.fillRect(0,0,o,i);const f="data:image/svg+xml;base64,"+btoa(a),m=new Image;m.onload=function(){d.drawImage(m,0,0),function(e,t){const n=document.createElement("a");n.href=e,n.download=t,document.body.appendChild(n),n.click()}(l.toDataURL("image/jpeg",1),e.filename)},m.src=f}return e={style:"font-family: sans-serif;",filename:"gantt-schedule-timeline-calendar.jpeg",options:e},function(e,n){e.subscribe("_internal.elements.main",e=>{e&&e.addEventListener("save-as-image",t)})}}}));
//# sourceMappingURL=SaveAsImage.plugin.js.map
