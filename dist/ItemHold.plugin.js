!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).ItemHold=t()}(this,(function(){"use strict";
/**
   * Gantt-Schedule-Timeline-Calendar
   *
   * @copyright Rafal Pospiech <https://neuronet.io>
   * @author    Rafal Pospiech <neuronet.io@gmail.com>
   * @package   gantt-schedule-timeline-calendar
   * @license   GPL-3.0
   */return function(e={}){e={...{time:1e3,movementThreshold:2,action(e,t){}},...e};const t={},n={x:0,y:0},o=[],i=[];function d(d,u){function m(){var e;e=u.item.id,void 0!==t[e]&&delete t[e]}function s(e){n.x=e.x,n.y=e.y}return d.addEventListener("mousedown",o=>{!function(o,i,d){void 0===t[o.id]&&(t[o.id]={x:d.x,y:d.y},setTimeout(()=>{if(void 0!==t[o.id]){let d=!0,u=t[o.id].x-n.x;-1===Math.sign(u)&&(u=-u);let m=t[o.id].y-n.y;-1===Math.sign(m)&&(m=-m),u>e.movementThreshold&&(d=!1),m>e.movementThreshold&&(d=!1),delete t[o.id],d&&e.action(i,o)}},e.time))}(u.item,d,o)}),o.push(m),document.addEventListener("mouseup",m),i.push(s),document.addEventListener("mousemove",s),{destroy(e,t){o.forEach(e=>document.removeEventListener("mouseup",e)),i.forEach(e=>document.removeEventListener("mousemove",e))}}}return function(e,t){e.update("config.actions.chart-gantt-items-row-item",e=>(e.push(d),e))}}}));
//# sourceMappingURL=ItemHold.plugin.js.map
