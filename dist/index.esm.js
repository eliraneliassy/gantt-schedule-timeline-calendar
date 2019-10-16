/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const t=new WeakMap,e=e=>(...n)=>{const i=e(...n);return t.set(i,!0),i},n=e=>"function"==typeof e&&t.has(e),i=void 0!==window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,s=(t,e,n=null,i=null)=>{for(;e!==n;){const n=e.nextSibling;t.insertBefore(e,i),e=n}},o=(t,e,n=null)=>{for(;e!==n;){const n=e.nextSibling;t.removeChild(e),e=n}},r={},a={},l=`{{lit-${String(Math.random()).slice(2)}}}`,c=`\x3c!--${l}--\x3e`,d=new RegExp(`${l}|${c}`),h="$lit$";class u{constructor(t,e){this.parts=[],this.element=e;const n=[],i=[],s=document.createTreeWalker(e.content,133,null,!1);let o=0,r=-1,a=0;const{strings:c,values:{length:u}}=t;for(;a<u;){const t=s.nextNode();if(null!==t){if(r++,1===t.nodeType){if(t.hasAttributes()){const e=t.attributes,{length:n}=e;let i=0;for(let t=0;t<n;t++)p(e[t].name,h)&&i++;for(;i-- >0;){const e=c[a],n=g.exec(e)[2],i=n.toLowerCase()+h,s=t.getAttribute(i);t.removeAttribute(i);const o=s.split(d);this.parts.push({type:"attribute",index:r,name:n,strings:o}),a+=o.length-1}}"TEMPLATE"===t.tagName&&(i.push(t),s.currentNode=t.content)}else if(3===t.nodeType){const e=t.data;if(e.indexOf(l)>=0){const i=t.parentNode,s=e.split(d),o=s.length-1;for(let e=0;e<o;e++){let n,o=s[e];if(""===o)n=m();else{const t=g.exec(o);null!==t&&p(t[2],h)&&(o=o.slice(0,t.index)+t[1]+t[2].slice(0,-h.length)+t[3]),n=document.createTextNode(o)}i.insertBefore(n,t),this.parts.push({type:"node",index:++r})}""===s[o]?(i.insertBefore(m(),t),n.push(t)):t.data=s[o],a+=o}}else if(8===t.nodeType)if(t.data===l){const e=t.parentNode;null!==t.previousSibling&&r!==o||(r++,e.insertBefore(m(),t)),o=r,this.parts.push({type:"node",index:r}),null===t.nextSibling?t.data="":(n.push(t),r--),a++}else{let e=-1;for(;-1!==(e=t.data.indexOf(l,e+1));)this.parts.push({type:"node",index:-1}),a++}}else s.currentNode=i.pop()}for(const t of n)t.parentNode.removeChild(t)}}const p=(t,e)=>{const n=t.length-e.length;return n>=0&&t.slice(n)===e},f=t=>-1!==t.index,m=()=>document.createComment(""),g=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class v{constructor(t,e,n){this.__parts=[],this.template=t,this.processor=e,this.options=n}update(t){let e=0;for(const n of this.__parts)void 0!==n&&n.setValue(t[e]),e++;for(const t of this.__parts)void 0!==t&&t.commit()}_clone(){const t=i?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),e=[],n=this.template.parts,s=document.createTreeWalker(t,133,null,!1);let o,r=0,a=0,l=s.nextNode();for(;r<n.length;)if(o=n[r],f(o)){for(;a<o.index;)a++,"TEMPLATE"===l.nodeName&&(e.push(l),s.currentNode=l.content),null===(l=s.nextNode())&&(s.currentNode=e.pop(),l=s.nextNode());if("node"===o.type){const t=this.processor.handleTextExpression(this.options);t.insertAfterNode(l.previousSibling),this.__parts.push(t)}else this.__parts.push(...this.processor.handleAttributeExpressions(l,o.name,o.strings,this.options));r++}else this.__parts.push(void 0),r++;return i&&(document.adoptNode(t),customElements.upgrade(t)),t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const b=` ${l} `;class y{constructor(t,e,n,i){this.strings=t,this.values=e,this.type=n,this.processor=i}getHTML(){const t=this.strings.length-1;let e="",n=!1;for(let i=0;i<t;i++){const t=this.strings[i],s=t.lastIndexOf("\x3c!--");n=(s>-1||n)&&-1===t.indexOf("--\x3e",s+1);const o=g.exec(t);e+=null===o?t+(n?b:c):t.substr(0,o.index)+o[1]+o[2]+h+o[3]+l}return e+=this.strings[t]}getTemplateElement(){const t=document.createElement("template");return t.innerHTML=this.getHTML(),t}}class w extends y{getHTML(){return`<svg>${super.getHTML()}</svg>`}getTemplateElement(){const t=super.getTemplateElement(),e=t.content,n=e.firstChild;return e.removeChild(n),s(e,n.firstChild),t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const _=t=>null===t||!("object"==typeof t||"function"==typeof t),$=t=>Array.isArray(t)||!(!t||!t[Symbol.iterator]);class x{constructor(t,e,n){this.dirty=!0,this.element=t,this.name=e,this.strings=n,this.parts=[];for(let t=0;t<n.length-1;t++)this.parts[t]=this._createPart()}_createPart(){return new M(this)}_getValue(){const t=this.strings,e=t.length-1;let n="";for(let i=0;i<e;i++){n+=t[i];const e=this.parts[i];if(void 0!==e){const t=e.value;if(_(t)||!$(t))n+="string"==typeof t?t:String(t);else for(const e of t)n+="string"==typeof e?e:String(e)}}return n+=t[e]}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class M{constructor(t){this.value=void 0,this.committer=t}setValue(t){t===r||_(t)&&t===this.value||(this.value=t,n(t)||(this.committer.dirty=!0))}commit(){for(;n(this.value);){const t=this.value;this.value=r,t(this)}this.value!==r&&this.committer.commit()}}class C{constructor(t){this.value=void 0,this.__pendingValue=void 0,this.options=t}appendInto(t){this.startNode=t.appendChild(m()),this.endNode=t.appendChild(m())}insertAfterNode(t){this.startNode=t,this.endNode=t.nextSibling}appendIntoPart(t){t.__insert(this.startNode=m()),t.__insert(this.endNode=m())}insertAfterPart(t){t.__insert(this.startNode=m()),this.endNode=t.endNode,t.endNode=this.startNode}setValue(t){this.__pendingValue=t}commit(){for(;n(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=r,t(this)}const t=this.__pendingValue;t!==r&&(_(t)?t!==this.value&&this.__commitText(t):t instanceof y?this.__commitTemplateResult(t):t instanceof Node?this.__commitNode(t):$(t)?this.__commitIterable(t):t===a?(this.value=a,this.clear()):this.__commitText(t))}__insert(t){this.endNode.parentNode.insertBefore(t,this.endNode)}__commitNode(t){this.value!==t&&(this.clear(),this.__insert(t),this.value=t)}__commitText(t){const e=this.startNode.nextSibling,n="string"==typeof(t=null==t?"":t)?t:String(t);e===this.endNode.previousSibling&&3===e.nodeType?e.data=n:this.__commitNode(document.createTextNode(n)),this.value=t}__commitTemplateResult(t){const e=this.options.templateFactory(t);if(this.value instanceof v&&this.value.template===e)this.value.update(t.values);else{const n=new v(e,t.processor,this.options),i=n._clone();n.update(t.values),this.__commitNode(i),this.value=n}}__commitIterable(t){Array.isArray(this.value)||(this.value=[],this.clear());const e=this.value;let n,i=0;for(const s of t)void 0===(n=e[i])&&(n=new C(this.options),e.push(n),0===i?n.appendIntoPart(this):n.insertAfterPart(e[i-1])),n.setValue(s),n.commit(),i++;i<e.length&&(e.length=i,this.clear(n&&n.endNode))}clear(t=this.startNode){o(this.startNode.parentNode,t.nextSibling,this.endNode)}}class A{constructor(t,e,n){if(this.value=void 0,this.__pendingValue=void 0,2!==n.length||""!==n[0]||""!==n[1])throw new Error("Boolean attributes can only contain a single expression");this.element=t,this.name=e,this.strings=n}setValue(t){this.__pendingValue=t}commit(){for(;n(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=r,t(this)}if(this.__pendingValue===r)return;const t=!!this.__pendingValue;this.value!==t&&(t?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=t),this.__pendingValue=r}}class N extends x{constructor(t,e,n){super(t,e,n),this.single=2===n.length&&""===n[0]&&""===n[1]}_createPart(){return new T(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class T extends M{}let O=!1;try{const t={get capture(){return O=!0,!1}};window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){}class P{constructor(t,e,n){this.value=void 0,this.__pendingValue=void 0,this.element=t,this.eventName=e,this.eventContext=n,this.__boundHandleEvent=t=>this.handleEvent(t)}setValue(t){this.__pendingValue=t}commit(){for(;n(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=r,t(this)}if(this.__pendingValue===r)return;const t=this.__pendingValue,e=this.value,i=null==t||null!=e&&(t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive),s=null!=t&&(null==e||i);i&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),s&&(this.__options=D(t),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=t,this.__pendingValue=r}handleEvent(t){"function"==typeof this.value?this.value.call(this.eventContext||this.element,t):this.value.handleEvent(t)}}const D=t=>t&&(O?{capture:t.capture,passive:t.passive,once:t.once}:t.capture);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const I=new class{handleAttributeExpressions(t,e,n,i){const s=e[0];if("."===s){return new N(t,e.slice(1),n).parts}return"@"===s?[new P(t,e.slice(1),i.eventContext)]:"?"===s?[new A(t,e.slice(1),n)]:new x(t,e,n).parts}handleTextExpression(t){return new C(t)}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */function E(t){let e=S.get(t.type);void 0===e&&(e={stringsArray:new WeakMap,keyString:new Map},S.set(t.type,e));let n=e.stringsArray.get(t.strings);if(void 0!==n)return n;const i=t.strings.join(l);return void 0===(n=e.keyString.get(i))&&(n=new u(t,t.getTemplateElement()),e.keyString.set(i,n)),e.stringsArray.set(t.strings,n),n}const S=new Map,L=new WeakMap,V=(t,e,n)=>{let i=L.get(e);void 0===i&&(o(e,e.firstChild),L.set(e,i=new C(Object.assign({templateFactory:E},n))),i.appendInto(e)),i.setValue(t),i.commit()};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.1.2");const k=(t,...e)=>new y(t,e,"html",I),R=(t,...e)=>new w(t,e,"svg",I),H=new WeakMap,Y=e(t=>e=>{if(!(e instanceof C))throw new Error("cache can only be used in text bindings");let n=H.get(e);void 0===n&&(n=new WeakMap,H.set(e,n));const i=e.value;if(i instanceof v){if(t instanceof y&&i.template===e.options.templateFactory(t))return void e.setValue(t);{let t=n.get(i.template);void 0===t&&(t={instance:i,nodes:document.createDocumentFragment()},n.set(i.template,t)),s(t.nodes,e.startNode.nextSibling,e.endNode)}}if(t instanceof y){const i=e.options.templateFactory(t),s=n.get(i);void 0!==s&&(e.setValue(s.nodes),e.commit(),e.value=s.instance)}e.setValue(t)}),W=new WeakMap,j=e(t=>e=>{if(!(e instanceof M)||e instanceof T||"class"!==e.committer.name||e.committer.parts.length>1)throw new Error("The `classMap` directive must be used in the `class` attribute and must be the only part in the attribute.");const{committer:n}=e,{element:i}=n;W.has(e)||(i.className=n.strings.join(" "));const{classList:s}=i,o=W.get(e);for(const e in o)e in t||s.remove(e);for(const e in t){const n=t[e];if(!o||n!==o[e]){s[n?"add":"remove"](e)}}W.set(e,t)}),z=new WeakMap,G=e((t,e)=>n=>{const i=z.get(n);if(Array.isArray(t)){if(Array.isArray(i)&&i.length===t.length&&t.every((t,e)=>t===i[e]))return}else if(i===t&&(void 0!==t||z.has(n)))return;n.setValue(e()),z.set(n,Array.isArray(t)?Array.from(t):t)}),F=e(t=>e=>{if(void 0===t&&e instanceof M){if(t!==e.value){const t=e.committer.name;e.committer.element.removeAttribute(t)}}else e.setValue(t)}),B=(t,e)=>{const n=t.startNode.parentNode,i=void 0===e?t.endNode:e.startNode,s=n.insertBefore(m(),i);n.insertBefore(m(),i);const o=new C(t.options);return o.insertAfterNode(s),o},U=(t,e)=>(t.setValue(e),t.commit(),t),J=(t,e,n)=>{const i=t.startNode.parentNode,o=n?n.startNode:t.endNode,r=e.endNode.nextSibling;r!==o&&s(i,e.startNode,r,o)},q=t=>{o(t.startNode.parentNode,t.startNode,t.endNode.nextSibling)},Z=(t,e,n)=>{const i=new Map;for(let s=e;s<=n;s++)i.set(t[s],s);return i},X=new WeakMap,K=new WeakMap,Q=e((t,e,n)=>{let i;return void 0===n?n=e:void 0!==e&&(i=e),e=>{if(!(e instanceof C))throw new Error("repeat can only be used in text bindings");const s=X.get(e)||[],o=K.get(e)||[],r=[],a=[],l=[];let c,d,h=0;for(const e of t)l[h]=i?i(e,h):h,a[h]=n(e,h),h++;let u=0,p=s.length-1,f=0,m=a.length-1;for(;u<=p&&f<=m;)if(null===s[u])u++;else if(null===s[p])p--;else if(o[u]===l[f])r[f]=U(s[u],a[f]),u++,f++;else if(o[p]===l[m])r[m]=U(s[p],a[m]),p--,m--;else if(o[u]===l[m])r[m]=U(s[u],a[m]),J(e,s[u],r[m+1]),u++,m--;else if(o[p]===l[f])r[f]=U(s[p],a[f]),J(e,s[p],s[u]),p--,f++;else if(void 0===c&&(c=Z(l,f,m),d=Z(o,u,p)),c.has(o[u]))if(c.has(o[p])){const t=d.get(l[f]),n=void 0!==t?s[t]:null;if(null===n){const t=B(e,s[u]);U(t,a[f]),r[f]=t}else r[f]=U(n,a[f]),J(e,n,s[u]),s[t]=null;f++}else q(s[p]),p--;else q(s[u]),u++;for(;f<=m;){const t=B(e,r[m+1]);U(t,a[f]),r[f++]=t}for(;u<=p;){const t=s[u++];null!==t&&q(t)}X.set(e,r),K.set(e,l)}}),tt=new WeakMap,et=e(t=>e=>{if(!(e instanceof M)||e instanceof T||"style"!==e.committer.name||e.committer.parts.length>1)throw new Error("The `styleMap` directive must be used in the style attribute and must be the only part in the attribute.");const{committer:n}=e,{style:i}=n.element;tt.has(e)||(i.cssText=n.strings.join(" "));const s=tt.get(e);for(const e in s)e in t||(-1===e.indexOf("-")?i[e]=null:i.removeProperty(e));for(const e in t)-1===e.indexOf("-")?i[e]=t[e]:i.setProperty(e,t[e]);tt.set(e,t)}),nt=new WeakMap,it=e(t=>e=>{if(!(e instanceof C))throw new Error("unsafeHTML can only be used in text bindings");const n=nt.get(e);if(void 0!==n&&_(t)&&t===n.value&&e.value===n.fragment)return;const i=document.createElement("template");i.innerHTML=t;const s=document.importNode(i.content,!0);e.setValue(s),nt.set(e,{value:t,fragment:s})}),st=new WeakMap,ot=e((...t)=>e=>{let n=st.get(e);void 0===n&&(n={lastRenderedIndex:2147483647,values:[]},st.set(e,n));const i=n.values;let s=i.length;n.values=t;for(let o=0;o<t.length&&!(o>n.lastRenderedIndex);o++){const r=t[o];if(_(r)||"function"!=typeof r.then){e.setValue(r),n.lastRenderedIndex=o;break}o<s&&r===i[o]||(n.lastRenderedIndex=2147483647,s=0,Promise.resolve(r).then(t=>{const i=n.values.indexOf(r);i>-1&&i<n.lastRenderedIndex&&(n.lastRenderedIndex=i,e.setValue(t),e.commit())}))}});function rt(t,n){let i=0;const s={};let o,r,a=[],l=0;const c=Promise.resolve();function d(t){return e((function(e,n){return function(i){const s=i.committer.element;for(const i of e)if("function"==typeof i){const e=a.find(e=>e.instance===t&&e.componentAction.create===i&&e.element===s);if(e)e.props=n;else{void 0!==s.__vido__&&delete s.__vido__;const e={create:i,update(){},destroy(){}};a.push({instance:t,componentAction:e,element:s,props:n})}}}}))}const h={state:t,api:n,html:k,svg:R,directive:e,cache:Y,classMap:j,guard:G,ifDefined:F,repeat:Q,styleMap:et,unsafeHTML:it,until:ot,actions(t,e){},createComponent(t,e){const n=t.name+":"+i++,o=function(t){return{instance:t,destroy:()=>h.destroyComponent(t),update:()=>h.updateTemplate(),html:(e={})=>s[t].update(e)}}(n);const r=[];const a=Object.assign(Object.assign({},h),{update:function(){h.updateTemplate()},onDestroy:function(t){r.push(t)},instance:n,actions:d(n)});let l,c;if("function"==typeof(l=e?t(e,a):t(a))){c={update:l,destroy:()=>{r.forEach(t=>t())}}}else{const t=c.destroy,e=()=>{r.forEach(t=>t()),t()};c=Object.assign(Object.assign({},l),{destroy:e})}return s[n]=c,o},destroyComponent(t){"function"==typeof s[t].destroy&&s[t].destroy(),a=a.filter(e=>(e.instance===t&&"function"==typeof e.componentAction.destroy&&e.componentAction.destroy(e.element,e.props),e.instance!==t)),delete s[t]},updateTemplate(){const t=++l,e=this;c.then((function(){t===l&&(e.render(),l=0)}))},createApp(t,e){r=e;const n=this.createComponent(t);return o=n.instance,this.render(),n},executeActions(){for(const t of a)if(void 0===t.element.__vido__){if("function"==typeof t.componentAction.create){const e=t.componentAction.create(t.element,t.props);void 0!==e&&("function"==typeof e.update&&(t.componentAction.update=e.update),"function"==typeof e.destroy&&(t.componentAction.destroy=e.destroy))}}else"function"==typeof t.componentAction.update&&t.componentAction.update(t.element,t.props);for(const t of a)t.element.__vido__={instance:t.instance,props:t.props}},render(){V(s[o].update(),r),h.executeActions()}};return h}var at=function(){if("undefined"!=typeof Map)return Map;function t(t,e){var n=-1;return t.some((function(t,i){return t[0]===e&&(n=i,!0)})),n}return(function(){function e(){this.__entries__=[]}return Object.defineProperty(e.prototype,"size",{get:function(){return this.__entries__.length},enumerable:!0,configurable:!0}),e.prototype.get=function(e){var n=t(this.__entries__,e),i=this.__entries__[n];return i&&i[1]},e.prototype.set=function(e,n){var i=t(this.__entries__,e);~i?this.__entries__[i][1]=n:this.__entries__.push([e,n])},e.prototype.delete=function(e){var n=this.__entries__,i=t(n,e);~i&&n.splice(i,1)},e.prototype.has=function(e){return!!~t(this.__entries__,e)},e.prototype.clear=function(){this.__entries__.splice(0)},e.prototype.forEach=function(t,e){void 0===e&&(e=null);for(var n=0,i=this.__entries__;n<i.length;n++){var s=i[n];t.call(e,s[1],s[0])}},e}())}(),lt="undefined"!=typeof window&&"undefined"!=typeof document&&window.document===document,ct="undefined"!=typeof global&&global.Math===Math?global:"undefined"!=typeof self&&self.Math===Math?self:"undefined"!=typeof window&&window.Math===Math?window:Function("return this")(),dt="function"==typeof requestAnimationFrame?requestAnimationFrame.bind(ct):function(t){return setTimeout((function(){return t(Date.now())}),1e3/60)},ht=2;var ut=20,pt=["top","right","bottom","left","width","height","size","weight"],ft="undefined"!=typeof MutationObserver,mt=function(){function t(){this.connected_=!1,this.mutationEventsAdded_=!1,this.mutationsObserver_=null,this.observers_=[],this.onTransitionEnd_=this.onTransitionEnd_.bind(this),this.refresh=function(t,e){var n=!1,i=!1,s=0;function o(){n&&(n=!1,t()),i&&a()}function r(){dt(o)}function a(){var t=Date.now();if(n){if(t-s<ht)return;i=!0}else n=!0,i=!1,setTimeout(r,e);s=t}return a}(this.refresh.bind(this),ut)}return t.prototype.addObserver=function(t){~this.observers_.indexOf(t)||this.observers_.push(t),this.connected_||this.connect_()},t.prototype.removeObserver=function(t){var e=this.observers_,n=e.indexOf(t);~n&&e.splice(n,1),!e.length&&this.connected_&&this.disconnect_()},t.prototype.refresh=function(){this.updateObservers_()&&this.refresh()},t.prototype.updateObservers_=function(){var t=this.observers_.filter((function(t){return t.gatherActive(),t.hasActive()}));return t.forEach((function(t){return t.broadcastActive()})),t.length>0},t.prototype.connect_=function(){lt&&!this.connected_&&(document.addEventListener("transitionend",this.onTransitionEnd_),window.addEventListener("resize",this.refresh),ft?(this.mutationsObserver_=new MutationObserver(this.refresh),this.mutationsObserver_.observe(document,{attributes:!0,childList:!0,characterData:!0,subtree:!0})):(document.addEventListener("DOMSubtreeModified",this.refresh),this.mutationEventsAdded_=!0),this.connected_=!0)},t.prototype.disconnect_=function(){lt&&this.connected_&&(document.removeEventListener("transitionend",this.onTransitionEnd_),window.removeEventListener("resize",this.refresh),this.mutationsObserver_&&this.mutationsObserver_.disconnect(),this.mutationEventsAdded_&&document.removeEventListener("DOMSubtreeModified",this.refresh),this.mutationsObserver_=null,this.mutationEventsAdded_=!1,this.connected_=!1)},t.prototype.onTransitionEnd_=function(t){var e=t.propertyName,n=void 0===e?"":e;pt.some((function(t){return!!~n.indexOf(t)}))&&this.refresh()},t.getInstance=function(){return this.instance_||(this.instance_=new t),this.instance_},t.instance_=null,t}(),gt=function(t,e){for(var n=0,i=Object.keys(e);n<i.length;n++){var s=i[n];Object.defineProperty(t,s,{value:e[s],enumerable:!1,writable:!1,configurable:!0})}return t},vt=function(t){return t&&t.ownerDocument&&t.ownerDocument.defaultView||ct},bt=Mt(0,0,0,0);function yt(t){return parseFloat(t)||0}function wt(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];return e.reduce((function(e,n){return e+yt(t["border-"+n+"-width"])}),0)}function _t(t){var e=t.clientWidth,n=t.clientHeight;if(!e&&!n)return bt;var i=vt(t).getComputedStyle(t),s=function(t){for(var e={},n=0,i=["top","right","bottom","left"];n<i.length;n++){var s=i[n],o=t["padding-"+s];e[s]=yt(o)}return e}(i),o=s.left+s.right,r=s.top+s.bottom,a=yt(i.width),l=yt(i.height);if("border-box"===i.boxSizing&&(Math.round(a+o)!==e&&(a-=wt(i,"left","right")+o),Math.round(l+r)!==n&&(l-=wt(i,"top","bottom")+r)),!function(t){return t===vt(t).document.documentElement}(t)){var c=Math.round(a+o)-e,d=Math.round(l+r)-n;1!==Math.abs(c)&&(a-=c),1!==Math.abs(d)&&(l-=d)}return Mt(s.left,s.top,a,l)}var $t="undefined"!=typeof SVGGraphicsElement?function(t){return t instanceof vt(t).SVGGraphicsElement}:function(t){return t instanceof vt(t).SVGElement&&"function"==typeof t.getBBox};function xt(t){return lt?$t(t)?function(t){var e=t.getBBox();return Mt(0,0,e.width,e.height)}(t):_t(t):bt}function Mt(t,e,n,i){return{x:t,y:e,width:n,height:i}}var Ct=function(){function t(t){this.broadcastWidth=0,this.broadcastHeight=0,this.contentRect_=Mt(0,0,0,0),this.target=t}return t.prototype.isActive=function(){var t=xt(this.target);return this.contentRect_=t,t.width!==this.broadcastWidth||t.height!==this.broadcastHeight},t.prototype.broadcastRect=function(){var t=this.contentRect_;return this.broadcastWidth=t.width,this.broadcastHeight=t.height,t},t}(),At=function(t,e){var n,i,s,o,r,a,l,c=(i=(n=e).x,s=n.y,o=n.width,r=n.height,a="undefined"!=typeof DOMRectReadOnly?DOMRectReadOnly:Object,l=Object.create(a.prototype),gt(l,{x:i,y:s,width:o,height:r,top:s,right:i+o,bottom:r+s,left:i}),l);gt(this,{target:t,contentRect:c})},Nt=function(){function t(t,e,n){if(this.activeObservations_=[],this.observations_=new at,"function"!=typeof t)throw new TypeError("The callback provided as parameter 1 is not a function.");this.callback_=t,this.controller_=e,this.callbackCtx_=n}return t.prototype.observe=function(t){if(!arguments.length)throw new TypeError("1 argument required, but only 0 present.");if("undefined"!=typeof Element&&Element instanceof Object){if(!(t instanceof vt(t).Element))throw new TypeError('parameter 1 is not of type "Element".');var e=this.observations_;e.has(t)||(e.set(t,new Ct(t)),this.controller_.addObserver(this),this.controller_.refresh())}},t.prototype.unobserve=function(t){if(!arguments.length)throw new TypeError("1 argument required, but only 0 present.");if("undefined"!=typeof Element&&Element instanceof Object){if(!(t instanceof vt(t).Element))throw new TypeError('parameter 1 is not of type "Element".');var e=this.observations_;e.has(t)&&(e.delete(t),e.size||this.controller_.removeObserver(this))}},t.prototype.disconnect=function(){this.clearActive(),this.observations_.clear(),this.controller_.removeObserver(this)},t.prototype.gatherActive=function(){var t=this;this.clearActive(),this.observations_.forEach((function(e){e.isActive()&&t.activeObservations_.push(e)}))},t.prototype.broadcastActive=function(){if(this.hasActive()){var t=this.callbackCtx_,e=this.activeObservations_.map((function(t){return new At(t.target,t.broadcastRect())}));this.callback_.call(t,e,t),this.clearActive()}},t.prototype.clearActive=function(){this.activeObservations_.splice(0)},t.prototype.hasActive=function(){return this.activeObservations_.length>0},t}(),Tt="undefined"!=typeof WeakMap?new WeakMap:new at,Ot=function t(e){if(!(this instanceof t))throw new TypeError("Cannot call a class as a function.");if(!arguments.length)throw new TypeError("1 argument required, but only 0 present.");var n=mt.getInstance(),i=new Nt(e,n,this);Tt.set(this,i)};["observe","unobserve","disconnect"].forEach((function(t){Ot.prototype[t]=function(){var e;return(e=Tt.get(this))[t].apply(e,arguments)}}));var Pt=void 0!==ct.ResizeObserver?ct.ResizeObserver:Ot;
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */function Dt(t){const{api:e,state:n,onDestroy:i,actions:s,update:o,createComponent:r,html:a}=t,l=e.name,c=n.get("config.components.List"),d=n.get("config.components.Chart"),h=r(c);i(h.destroy);const u=r(d);i(u.destroy),i(n.subscribe("config.plugins",t=>{if(void 0!==t&&Array.isArray(t))for(const i of t)i(n,e)}));const p=e.getActions("");let f,m,g,v,b,y,w=0,_=!1;i(n.subscribe("config.classNames",t=>{const i=n.get("config");f=e.getClass(l,{config:i}),_&&(f+=` ${l}__list-column-header-resizer--active`),m=e.getClass("vertical-scroll",{config:i}),o()})),i(n.subscribeAll(["config.height","config.headerHeight","_internal.scrollBarHeight"],()=>{const t=n.get("config"),e=n.get("_internal.scrollBarHeight"),i=t.height-t.headerHeight-e;n.update("_internal.height",i),g=`--height: ${t.height}px`,v=`height: ${i}px; width: ${e}px; margin-top: ${t.headerHeight}px;`,o()})),i(n.subscribe("_internal.list.columns.resizer.active",t=>{_=t,f=e.getClass(e.name),_&&(f+=` ${e.name}__list-column-header-resizer--active`),o()})),i(n.subscribeAll(["config.list.rows;","config.chart.items;","config.list.rows.*.parentId","config.chart.items.*.rowId"],(t,i)=>{if(n.get("_internal.flatTreeMap").length&&"subscribe"===i.type)return;const s=n.get("config.list.rows"),r=[];for(const t in s)r.push(s[t]);e.fillEmptyRowValues(r);const a=n.get("config.chart.items"),l=[];for(const t in a)l.push(a[t]);const c=e.makeTreeMap(r,l);n.update("_internal.treeMap",c),n.update("_internal.flatTreeMapById",e.getFlatTreeMapById(c)),n.update("_internal.flatTreeMap",e.flattenTreeMap(c)),o()},{bulk:!0})),i(n.subscribeAll(["config.list.rows.*.expanded","_internal.treeMap;"],t=>{const i=n.get("config.list.rows"),s=e.getRowsFromIds(e.getRowsWithParentsExpanded(n.get("_internal.flatTreeMap"),n.get("_internal.flatTreeMapById"),i),i);w=e.getRowsHeight(s),n.update("_internal.list.rowsHeight",w),n.update("_internal.list.rowsWithParentsExpanded",s),o()},{bulk:!0})),i(n.subscribeAll(["_internal.list.rowsWithParentsExpanded","config.scroll.top"],()=>{const t=e.getVisibleRows(n.get("_internal.list.rowsWithParentsExpanded"));n.update("_internal.list.visibleRows",t),o()})),i(n.subscribeAll(["config.scroll.top","_internal.list.visibleRows"],()=>{const t=n.get("config.scroll.top");b=`height: ${w}px; width: 1px`,y&&y.scrollTop!==t&&(y.scrollTop=t),o()})),i(n.subscribeAll(["config.chart.time","_internal.dimensions.width","config.scroll.left","_internal.scrollBarHeight","_internal.list.width"],(function(){const t=n.get("_internal.dimensions.width")-n.get("_internal.list.width"),i=t-n.get("_internal.scrollBarHeight"),s=n.get("_internal.dimensions.height")-n.get("config.headerHeight");n.update("_internal.chart.dimensions",{width:t,innerWidth:i,height:s});let r=e.mergeDeep({},n.get("config.chart.time"));const a=.01*(r=e.time.recalculateFromTo(r)).zoom;let l=n.get("config.scroll.left");if(r.timePerPixel=a+Math.pow(2,r.zoom),r.totalViewDurationMs=e.time.date(r.to).diff(r.from,"milliseconds"),r.totalViewDurationPx=r.totalViewDurationMs/r.timePerPixel,l>r.totalViewDurationPx&&(l=r.totalViewDurationPx-t),r.leftGlobal=l*r.timePerPixel+r.from,r.rightGlobal=r.leftGlobal+t*r.timePerPixel,r.leftInner=r.leftGlobal-r.from,r.rightInner=r.rightGlobal-r.from,r.leftPx=r.leftInner/r.timePerPixel,r.rightPx=r.rightInner/r.timePerPixel,Math.round(r.rightGlobal/r.timePerPixel)>Math.round(r.to/r.timePerPixel)){const t=(r.rightGlobal-r.to)/(r.rightGlobal-r.from);r.timePerPixel=r.timePerPixel-r.timePerPixel*t,r.leftGlobal=l*r.timePerPixel+r.from,r.rightGlobal=r.to,r.rightInner=r.rightGlobal-r.from,r.totalViewDurationMs=r.to-r.from,r.totalViewDurationPx=r.totalViewDurationMs/r.timePerPixel,r.rightInner=r.rightGlobal-r.from,r.rightPx=r.rightInner/r.timePerPixel,r.leftPx=r.leftInner/r.timePerPixel}!function(t,n){const i=[];let s=t.leftGlobal;const o=t.rightGlobal,r=t.timePerPixel,a=t.period;let l=s-e.time.date(s).startOf(a),c=l/r,d=0,h=0,u=0;for(;s<o;){const t={id:u++,sub:l,subPx:c,leftGlobal:s,rightGlobal:e.time.date(s).endOf(a).valueOf(),width:0,leftPx:0,rightPx:0};t.width=(t.rightGlobal-t.leftGlobal+l)/r,t.width>n&&(t.width=n),h=t.width>h?t.width:h,t.leftPx=d,d+=t.width,t.rightPx=d,i.push(t),s=t.rightGlobal+1,l=0,c=0}t.maxWidth=h,t.dates=i}(r,t),n.update("_internal.chart.time",r),o()}))),n.update("_internal.scrollBarHeight",e.getScrollBarHeight());const $={handleEvent(t){t.stopPropagation(),t.preventDefault(),n.update("config.scroll",e=>{e.top=t.target.scrollTop;const i=n.get("_internal.elements.verticalScrollInner");if(i){const t=i.clientHeight;e.percent.top=e.top/t}return e},{only:["top","percent.top"]})},passive:!1},x={width:0,height:0};function M(t){y=t,n.update("_internal.elements.verticalScroll",t)}function C(t){n.update("_internal.elements.verticalScrollInner",t)}return p.push(t=>{new Pt((e,i)=>{const s=t.clientWidth,o=t.clientHeight;x.width===s&&x.height===o||(x.width=s,x.height=o,n.update("_internal.dimensions",x))}).observe(t),n.update("_internal.elements.main",t)}),t=>a`
      <div class=${f} style=${g} @scroll=${$} data-actions=${s(p)}>
        ${h.html()}${u.html()}
        <div
          class=${m}
          style=${v}
          @scroll=${$}
          data-action=${s([M])}
        >
          <div style=${b} data-actions=${s([C])} />
        </div>
      </div>
    `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */function It(t,e){const{api:n,state:i,onDestroy:s,actions:o,update:r,html:a,unsafeHTML:l}=e,c="list-expander-toggle",d=n.getActions(c);let h,u,p,f,m,g,v=!1;function b(){v=!v,t.row?i.update(`config.list.rows.${t.row.id}.expanded`,v):i.update("config.list.rows",t=>{for(const e in t)t[e].expanded=v;return t},{only:["*.expanded"]})}return s(i.subscribe("config.classNames",e=>{t.row?(h=n.getClass(c,{row:t.row}),p=n.getClass(c+"-open",{row:t.row}),f=n.getClass(c+"-closed",{row:t.row})):(h=n.getClass(c),p=n.getClass(c+"-open"),f=n.getClass(c+"-closed")),r()})),s(i.subscribeAll(["config.list.expander.size","config.list.expander.icons"],()=>{const t=i.get("config.list.expander");u=`--size: ${t.size}px`,m=t.icons.open,g=t.icons.closed,r()})),t.row?s(i.subscribe(`config.list.rows.${t.row.id}.expanded`,t=>{v=t,r()})):s(i.subscribe("config.list.rows.*.expanded",t=>{for(const e of t)if(e.value){v=!0;break}r()},{bulk:!0})),()=>a`
    <div
      class=${h}
      data-actions=${o(d,{row:t.row,api:n,state:i})}
      style=${u}
      @click=${b}
    >
      ${v?a`
            <div class=${p}>
              ${l(m)}
            </div>
          `:a`
            <div class=${f}>
              ${l(g)}
            </div>
          `}
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */function Et(t,e){const{api:n,state:i,onDestroy:s,actions:o,update:r,html:a,createComponent:l}=e,c=n.getActions("list-expander");let d,h,u,p,f=[];s(i.subscribe("config.classNames",e=>{t.row?(d=n.getClass("list-expander",{row:t.row}),p=n.getClass("list-expander-padding",{row:t.row})):(d=n.getClass("list-expander"),p=n.getClass("list-expander-padding")),r()})),s(i.subscribeAll(["config.list.expander.padding"],t=>{h=t,r()})),t.row?s(i.subscribe(`_internal.list.rows.${t.row.id}.parentId`,e=>{u="width:"+t.row._internal.parents.length*h+"px",f=t.row._internal.children,r()})):(u="width:0px",f=[]);const m=l(It,t.row?{row:t.row}:{});return s(m.destroy),()=>a`
    <div class=${d} data-action=${o(c,{row:t.row,api:n,state:i})}>
      <div class=${p} style=${u}></div>
      ${f.length||!t.row?m.html():""}
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */function St({rowId:t,columnId:e},n){const{api:i,state:s,onDestroy:o,actions:r,update:a,html:l,createComponent:c}=n;let d,h,u=`config.list.rows.${t}`;o(s.subscribe(u,t=>{h=`--height: ${(d=t).height}px`,a()}));let p,f=`config.list.columns.data.${e}`;o(s.subscribe(f,t=>{p=t,a()}));const m=i.getActions("list-column-row");let g;o(s.subscribe("config.classNames",t=>{g=i.getClass("list-column-row",{row:d,column:p}),a()}));const v=c(Et,{row:d});return o(v.destroy),t=>l`
    <div
      class=${g}
      style=${h}
      data-actions=${r(m,{column:p,row:d,api:i,state:s})}
    >
      ${"boolean"==typeof p.expander&&p.expander?v.html():""}
      ${"string"==typeof p.html?"function"==typeof p.data?l`
        ${p.data(d)}
      `:l`
      ${d[p.data]}
    `:"function"==typeof p.data?p.data(d):d[p.data]}
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */function Lt({columnId:t},e){const{api:n,state:i,onDestroy:s,update:o,html:r,actions:a}=e,l="list-column-header-resizer",c=n.getActions(l);let d,h,u,p,f,m,g,v;s(i.subscribe(`config.list.columns.data.${t}`,t=>{d=t,o()}));let b=!1;s(i.subscribe("config.classNames",t=>{h=n.getClass(l,{column:d}),u=n.getClass(l+"-container",{column:d}),p=n.getClass(l+"-dots",{column:d}),f=n.getClass(l+"-dots-dot",{column:d}),m=n.getClass(l+"-line",{column:d}),o()})),s(i.subscribeAll([`config.list.columns.data.${d.id}.width`,"config.list.columns.percent","config.list.columns.resizer.width","config.list.columns.resizer.inRealTime"],(t,e)=>{const n=i.get("config.list");g=d.width*n.columns.percent*.01,v=`width: ${n.columns.resizer.width}px`,b=n.columns.resizer.inRealTime,o()}));let y=[1,2,3,4,5,6,7,8];s(i.subscribe("config.list.columns.resizer.dots",t=>{y=[];for(let e=0;e<t;e++)y.push(e);o()}));let w=!1,_=g;const $=`config.list.columns.data.${d.id}.width`;function x(t){w=!0,i.update("_internal.list.columns.resizer.active",!0)}function M(t){w&&((_+=t.movementX)<0&&(_=0),b&&i.update($,_))}function C(t){w&&(i.update("_internal.list.columns.resizer.active",!1),i.update($,_),w=!1)}return document.body.addEventListener("mousemove",M),s(()=>document.body.removeEventListener("mousemove",M)),document.body.addEventListener("mouseup",C),s(()=>document.body.removeEventListener("mouseup",C)),t=>r`
    <div class=${h} data-actions=${a(c,{column:d,api:n,state:i})}>
      <div class=${u}>
        ${d.header.html?r`
              ${d.header.html}
            `:d.header.content}
      </div>
      <div class=${p} style=${"--"+v} @mousedown=${x}>
        ${y.map(t=>r`
              <div class=${f} />
            `)}
      </div>
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */function Vt({columnId:t},e){const{api:n,state:i,onDestroy:s,actions:o,update:r,createComponent:a,html:l}=e,c=n.getActions("list-column-header");let d,h,u,p;s(i.subscribe(`config.list.columns.data.${t}`,t=>{d=t,r()})),s(i.subscribeAll(["config.classNames","config.headerHeight"],()=>{const t=i.get("config");h=n.getClass("list-column-header",{column:d}),u=n.getClass("list-column-header-content",{column:d}),p=`--height: ${t.headerHeight}px;`,r()}));const f=a(Lt,{columnId:t});s(f.destroy);const m=a(Et,{});return s(m.destroy),function(){return l`
      <div class=${h} style=${p} data-actions=${o(c,{column:d,api:n,state:i})}>
        ${"boolean"==typeof d.expander&&d.expander?l`
      <div class=${u}>
        ${m.html()}${f.html(d)}
      </div>
    `:l`
      <div class=${u}>
        ${f.html(d)}
      </div>
    `}
      </div>
    `}}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */function kt({columnId:t},e){const{api:n,state:i,onDestroy:s,actions:o,update:r,createComponent:a,html:l,repeat:c}=e;let d,h=`config.list.columns.data.${t}`;s(i.subscribe(h,t=>{d=t,r()}));const u=n.getActions("list-column"),p=n.getActions("list-column-rows");let f,m,g,v,b;s(i.subscribe("config.classNames",t=>{f=n.getClass("list-column",{column:d}),m=n.getClass("list-column-rows",{column:d}),r()}));let y=[];s(i.subscribe("_internal.list.visibleRows;",e=>{y.forEach(t=>t.component.destroy()),y=e.map(e=>({id:e.id,component:a(St,{columnId:t,rowId:e.id})})),r()})),s(()=>{y.forEach(t=>t.component.destroy())}),s(i.subscribeAll(["config.list.columns.percent","config.list.columns.resizer.width",`config.list.columns.data.${d.id}.width`,"config.height","config.headerHeight"],t=>{const e=i.get("config.list");g=e.columns.data[d.id].width*e.columns.percent*.01,v=`width: ${g+e.columns.resizer.width}px`,b=`height: ${i.get("config.height")}px`},{bulk:!0}));const w=a(Vt,{columnId:t});return s(w.destroy),t=>l`
    <div
      class=${f}
      data-actions=${o(u,{column:d,state:i,api:n})}
      style=${v}
    >
      ${w.html()}
      <div class=${m} style=${b} data-actions=${o(p,{api:n,state:i})}>
        ${y.map(t=>t.component.html())}
      </div>
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */
const Rt=["","list","list-column","list-column-header","list-expander","list-expander-toggle","list-column-header-resizer","list-column-row","chart","chart-calendar","chart-gantt","chart-gantt-grid","chart-gantt-grid-row","chart-gantt-items","chart-gantt-items-row","chart-gantt-items-row-item","chart-calendar-date","chart-gantt-grid-column","chart-gantt-grid-block"];const Ht={height:740,headerHeight:86,components:{Main:Dt,List:function(t){const{api:e,state:n,onDestroy:i,actions:s,update:o,createComponent:r,html:a,repeat:l}=t,c=e.getActions("list");let d,h,u;i(n.subscribe("config.list",()=>{h=n.get("config.list"),u=h.columns.percent,o()})),i(n.subscribe("config.classNames",()=>{d=e.getClass("list",{list:h}),o()}));let p,f,m,g=[];function v(t){if(t.stopPropagation(),t.preventDefault(),"scroll"===t.type)n.update("config.scroll.top",t.target.scrollTop);else{const i=e.normalizeMouseWheelEvent(t);n.update("config.scroll.top",t=>e.limitScroll("top",t+=i.y*n.get("config.scroll.yMultiplier")))}}function b(t){m||(m=t.clientWidth,0===u&&(m=0),n.update("_internal.list.width",m),n.update("_internal.elements.list",t))}return i(n.subscribe("config.list.columns.data;",t=>{g.forEach(t=>t.component.destroy()),p=Object.keys(t),g=p.map(t=>{return{id:t,component:r(kt,{columnId:t})}}),o()})),i(()=>{g.forEach(t=>t.component.destroy())}),i(n.subscribe("config.height",t=>{f=`height: ${t}px`,o()})),c.push(t=>(n.update("_internal.elements.list",t),b(t),{update:b})),t=>h.columns.percent>0?a`
          <div
            class=${d}
            data-actions=${s(c)}
            style=${f}
            @scroll=${v}
            @wheel=${v}
          >
            ${g.map(t=>t.component.html())}
          </div>
        `:null}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */,ListColumn:kt,ListColumnHeader:Vt,ListColumnHeaderResizer:Lt,ListColumnRow:St,ListExpander:Et,ListToggle:It,Chart:function(t){const{api:e,state:n,onDestroy:i,actions:s,update:o,html:r,createComponent:a}=t,l=n.get("config.components.ChartCalendar"),c=n.get("config.components.ChartTimeline"),d=a(l);i(d.destroy);const h=a(c);i(h.destroy);let u,p,f,m,g="",v="",b=e.getActions("chart");i(n.subscribe("config.classNames",t=>{u=e.getClass("chart"),p=e.getClass("horizontal-scroll"),f=e.getClass("horizontal-scroll-inner"),o()})),i(n.subscribe("config.scroll.left",t=>{m&&m.scrollLeft!==t&&(m.scrollLeft=t),o()})),i(n.subscribeAll(["_internal.chart.dimensions.width","_internal.chart.time.totalViewDurationPx"],(function(t,e){g=`width: ${n.get("_internal.chart.dimensions.width")}px`,v=`width: ${n.get("_internal.chart.time.totalViewDurationPx")}px; height:1px`,o()})));const y={handleEvent(t){let i,s;if(t.stopPropagation(),t.preventDefault(),"scroll"===t.type)n.update("config.scroll.left",t.target.scrollLeft),i=t.target.scrollLeft;else{const o=e.normalizeMouseWheelEvent(t),r=n.get("config.scroll.xMultiplier"),a=n.get("config.scroll.yMultiplier");t.shiftKey&&o.y?n.update("config.scroll.left",t=>i=e.limitScroll("left",t+=o.y*r)):o.x?n.update("config.scroll.left",t=>i=e.limitScroll("left",t+=o.x*r)):n.update("config.scroll.top",t=>s=e.limitScroll("top",t+=o.y*a))}const o=n.get("_internal.elements.chart"),r=n.get("_internal.elements.horizontalScrollInner");if(o){const t=n.get("config.scroll.left");let e=0;t&&((e=Math.round(t/(r.clientWidth-o.clientWidth)*100))>100&&(e=100),console.log(`scrollLeft: ${t} percent: ${e} chart clientWidth: ${o.clientWidth}`)),n.update("config.scroll.percent.left",e)}},passive:!1};function w(t){m=t,n.update("_internal.elements.horizontalScroll",t)}function _(t){n.update("_internal.elements.horizontalScrollInner",t)}return b.push(t=>{n.update("_internal.elements.chart",t)}),t=>r`
    <div class=${u} data-actions=${s(b,{api:e,state:n})} @wheel=${y}>
      ${d.html()}${h.html()}
      <div class=${p} style=${g} data-actions=${s([w])} @scroll=${y}>
        <div class=${f} style=${v} data-actions=${s([_])} />
      </div>
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */,ChartCalendar:function(t){const{api:e,state:n,onDestroy:i,actions:s,update:o,createComponent:r,html:a,repeat:l}=t,c=e.getActions("chart-calendar"),d=n.get("config.components.ChartCalendarDate");let h;i(n.subscribe("config.classNames",t=>{h=e.getClass("chart-calendar"),o()}));let u,p="";i(n.subscribe("config.headerHeight",t=>{p=`height: ${u=t}px;`,o()}));let f,m=[];return i(n.subscribe("_internal.chart.time.dates",t=>{f=t,m.forEach(t=>t.component.destroy()),m=[];for(const t of f)m.push({id:t.id,component:r(d,{date:t})});o()})),i(()=>{m.forEach(t=>t.component.destroy())}),c.push(t=>{n.update("_internal.elements.calendar",t)}),t=>a`
    <div class=${h} data-actions=${s(c)} style=${p}>
      ${l(m,t=>t.id,t=>t.component.html())}
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */,ChartCalendarDate:function({date:t},e){const{api:n,state:i,onDestroy:s,actions:o,update:r,html:a}=e,l="chart-calendar-date",c=n.getActions(l);let d,h,u,p,f,m,g,v,b,y,w,_,$,x,M;return s(i.subscribe("config.classNames",()=>{d=n.getClass(l,{date:t}),n.time.date(t.leftGlobal).format("YYYY-MM-DD")===n.time.date().format("YYYY-MM-DD")&&(d+=" current"),n.time.date(t.leftGlobal).subtract(1,"day").format("YYYY-MM-DD")===n.time.date().format("YYYY-MM-DD")&&(d+=" next"),n.time.date(t.leftGlobal).add(1,"day").format("YYYY-MM-DD")===n.time.date().format("YYYY-MM-DD")&&(d+=" previous"),h=n.getClass(`${l}-formatted`,{date:t}),u=n.getClass(`${l}-formatted-year`,{date:t}),p=n.getClass(`${l}-formatted-month`,{date:t}),f=n.getClass(`${l}-formatted-day`,{date:t}),m=n.getClass(`${l}-formatted-day-word`,{date:t}),r()})),s(i.subscribeAll(["_internal.chart.time","config.chart.calendar.vertical.smallFormat"],(function(){g=i.get("_internal.chart.time"),M=g.zoom<=22?18:13;const e=n.time.date(t.leftGlobal),s=g.maxWidth;v=s<=40;const o=i.get("config.chart.calendar.vertical.smallFormat");b=e.format(o),y=e.format("YYYY"),w=e.format("MMMM"),_=e.format("DD"),$=e.format("dddd"),s<=70?(y=e.format("YY"),w=e.format("MMM"),_=e.format("DD"),$=e.format("ddd")):s<=150&&($=e.format("ddd")),x=`width: ${t.width}px; margin-left:-${t.subPx}px; --day-size: ${M}px`,r()}),{bulk:!0})),e=>a`
    <div class=${d} style=${x} data-actions=${o(c,{date:t,api:n,state:i})}>
      ${v?a`
            <div class=${h} style="transform: rotate(90deg);">${b}</div>
          `:a`
            <div class=${h}>
              <div class=${u}>${y}</div>
              <div class=${p}>${w}</div>
              <div class=${f}>${_}</div>
              <div class=${m}>${$}</div>
            </div>
          `}
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */,ChartTimeline:function(t){const{api:e,state:n,onDestroy:i,actions:s,update:o,html:r,createComponent:a}=t,l=e.getActions("chart-gantt"),c=n.get("config.components.ChartTimelineGrid"),d=n.get("config.components.ChartTimelineItems"),h=a(c);i(h.destroy);const u=a(d);let p,f;i(u.destroy),i(n.subscribe("config.classNames",t=>{p=e.getClass("chart-gantt"),f=e.getClass("chart-gantt-inner"),o()}));let m="",g="";return i(n.subscribeAll(["_internal.height","_internal.list.rowsHeight"],()=>{m=`height: ${n.get("_internal.height")}px`,g=`height: ${n.get("_internal.list.rowsHeight")}px;`,o()})),l.push(t=>{n.update("_internal.elements.gantt",t)}),t=>r`
    <div class=${p} style=${m} data-actions=${s(l)} @wheel=${e.onScroll}>
      <div class=${f} style=${g}>
        ${h.html()}${u.html()}
      </div>
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */,ChartTimelineGrid:function(t){const{api:e,state:n,onDestroy:i,actions:s,update:o,html:r,createComponent:a,repeat:l}=t,c=e.getActions("chart-gantt-grid"),d=n.get("config.components.ChartTimelineGridRow");let h,u,p;i(n.subscribe("config.classNames",()=>{h=e.getClass("chart-gantt-grid"),o()})),i(n.subscribe("_internal.height",t=>{p=`height: ${u=t}px`,o()}));let f,m=[];return i(n.subscribeAll(["_internal.chart.time.dates","_internal.list.visibleRows","config.chart.grid.block"],(function(){const t=n.get("_internal.list.visibleRows"),e=n.get("_internal.chart.time.dates");m.forEach(t=>t.component.destroy()),m=[];let i=0;f=[];for(const n in t){const s=t[n],r=[];let l=0;for(const t of e)r.push({id:l++,date:t,row:s,top:i});const c={id:s.id,blocks:r,rowData:s,top:i};f.push(c),m.push({id:s.id,component:a(d,{row:c})}),i+=s.height,o()}}),{bulk:!0})),c.push(t=>{n.update("_internal.elements.grid")}),i(()=>{m.forEach(t=>t.component.destroy())}),t=>r`
    <div class=${h} data-actions=${s(c,{api:e,state:n})} style=${p}>
      ${m.map(t=>t.component.html())}
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */,ChartTimelineGridBlock:function({row:t,time:e,top:n},i){const{api:s,state:o,onDestroy:r,actions:a,update:l,html:c}=i,d=s.getActions("chart-gantt-grid-block",{row:t,time:e,top:n});let h=s.getClass("chart-gantt-grid-block",{row:t});r(o.subscribe("config.classNames",()=>{h=s.getClass("chart-gantt-grid-block"),e.leftGlobal===s.time.date().startOf("day").valueOf()&&(h+=" current"),l()}));let u=`width: ${e.width}px;height: 100%;margin-left:-${e.subPx}px`;return i=>c`
      <div
        class=${h}
        data-actions=${a(d,{row:t,time:e,top:n,api:s,state:o})}
        style=${u}
      />
    `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */,ChartTimelineGridRow:function({row:t},e){const{api:n,state:i,onDestroy:s,actions:o,update:r,html:a,createComponent:l,repeat:c}=e,d=i.get("config.components.ChartTimelineGridBlock"),h=n.getActions("chart-gantt-grid-row");let u;s(i.subscribe("config.classNames",e=>{u=n.getClass("chart-gantt-grid-row",{row:t}),r()}));let p=[];for(const e of t.blocks)p.push({id:e.id,component:l(d,{row:t,time:e.date,top:e.top})});s(()=>{p.forEach(t=>t.component.destroy())});let f=`height: ${t.rowData.height}px;`;return e=>a`
    <div class=${u} data-actions=${o(h,{row:t,api:n,state:i})} style=${f}>
      ${p.map(t=>t.component.html())}
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */,ChartTimelineItems:function(t){const{api:e,state:n,onDestroy:i,actions:s,update:o,html:r,createComponent:a,repeat:l}=t,c=e.getActions("chart-gantt-items"),d=n.get("config.components.ChartTimelineItemsRow");let h;i(n.subscribe("config.classNames",()=>{h=e.getClass("chart-gantt-items"),o()}));let u=[],p=[];return i(n.subscribe("_internal.list.visibleRows;",t=>{u=t,p.forEach(t=>t.component.destroy()),p=[];for(const t of u)p.push({id:t.id,component:a(d,{rowId:t.id})});o()})),i(()=>{p.forEach(t=>t.component.destroy())}),t=>r`
    <div class=${h} data-actions=${s(c,{api:e,state:n})}>
      ${p.map(t=>t.component.html())}
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */,ChartTimelineItemsRow:function({rowId:t},e){const{api:n,state:i,onDestroy:s,actions:o,update:r,html:a,createComponent:l,repeat:c}=e,d=i.get("config.components.ChartTimelineItemsRowItem");let h,u,p,f=`_internal.flatTreeMapById.${t}`;s(i.subscribeAll([f,"_internal.chart"],t=>{h=i.get(f);const e=i.get("_internal.chart");u=`width:${e.dimensions.width}px;height:${h.height}px;--row-height:${h.height}px;`,p=`width: ${e.time.totalViewDurationPx}px;height: 100%;`,r()}));let m,g=[];s(i.subscribe(`_internal.flatTreeMapById.${t}._internal.items;`,e=>{m=e,g.forEach(t=>t.component.destroy()),g=[];for(const e of m)g.push({id:e.id,component:l(d,{rowId:t,itemId:e.id})});r()})),s(()=>{g.forEach(t=>t.component.destroy())});const v=n.getActions("chart-gantt-items-row");let b,y;return s(i.subscribe("config.classNames",()=>{b=n.getClass("chart-gantt-items-row",{row:h}),y=n.getClass("chart-gantt-items-row-inner",{row:h}),r()})),t=>a`
    <div class=${b} data-actions=${o(v)} style=${u}>
      <div class=${y} style=${p}>
        ${c(g,t=>t.id,t=>t.component.html())}
      </div>
    </div>
  `}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */,ChartTimelineItemsRowItem:function({rowId:t,itemId:e},n){const{api:i,state:s,onDestroy:o,actions:r,update:a,html:l}=n;let c,d=`config.list.rows.${t}`;o(s.subscribe(d,t=>{c=t,a()}));let h,u=`config.chart.items.${e}`;o(s.subscribe(u,t=>{h=t,a()}));const p="chart-gantt-items-row-item",f=i.getActions(p);let m,g,v;o(s.subscribe("config.classNames",()=>{m=i.getClass(p,{row:c,item:h}),g=i.getClass(p+"-content",{row:c,item:h}),v=i.getClass(p+"-content-label",{row:c,item:h}),a()}));let b,y=0,w=0;return o(s.subscribeAll(["_internal.chart.time","config.scroll",u],t=>{h=s.get(u);let e=s.get("_internal.chart.time");y=(h.time.start-e.leftGlobal)/e.timePerPixel,w=(h.time.end-h.time.start)/e.timePerPixel,w-=s.get("config.chart.spacing");i.isItemInViewport(h,e.leftGlobal,e.rightGlobal);b=`left:${y}px;width:${w}px;`,a()},{bulk:!0})),t=>l`
    <div
      class=${m}
      data-actions=${r(f,{item:h,row:c,left:y,width:w,api:i,state:s})}
      style=${b}
    >
      <div class=${g}>
        <div class=${v}">${h.label}</div>
      </div>
    </div>
  `}},list:{rows:{},rowHeight:40,columns:{percent:100,resizer:{width:10,inRealTime:!0,dots:6},data:{}},expander:{padding:20,size:20,icons:{open:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>',closed:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>'}}},scroll:{top:0,left:0,xMultiplier:1.5,yMultiplier:1,percent:{top:0,left:0}},chart:{time:{from:0,to:0,zoom:21,period:"day",dates:[]},calendar:{vertical:{smallFormat:"YYYY-MM-DD"}},grid:{},items:{}},classNames:{},actions:function(){const t={};return Rt.forEach(e=>t[e]=[]),t}(),locale:{name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),weekStart:1,relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},ordinal:t=>{const e=["th","st","nd","rd"],n=t%100;return`[${t}${e[(n-20)%10]||e[n]||e[0]}]`}}};"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var Yt=function(t,e){return t(e={exports:{}},e.exports),e.exports}((function(t,e){t.exports=function(){var t="millisecond",e="second",n="minute",i="hour",s="day",o="week",r="month",a="quarter",l="year",c=/^(\d{4})-?(\d{1,2})-?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d{1,3})?$/,d=/\[([^\]]+)]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,h=function(t,e,n){var i=String(t);return!i||i.length>=e?t:""+Array(e+1-i.length).join(n)+t},u={s:h,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),i=Math.floor(n/60),s=n%60;return(e<=0?"+":"-")+h(i,2,"0")+":"+h(s,2,"0")},m:function(t,e){var n=12*(e.year()-t.year())+(e.month()-t.month()),i=t.clone().add(n,r),s=e-i<0,o=t.clone().add(n+(s?-1:1),r);return Number(-(n+(e-i)/(s?i-o:o-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(c){return{M:r,y:l,w:o,d:s,h:i,m:n,s:e,ms:t,Q:a}[c]||String(c||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},p={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},f="en",m={};m[f]=p;var g=function(t){return t instanceof w},v=function(t,e,n){var i;if(!t)return f;if("string"==typeof t)m[t]&&(i=t),e&&(m[t]=e,i=t);else{var s=t.name;m[s]=t,i=s}return n||(f=i),i},b=function(t,e,n){if(g(t))return t.clone();var i=e?"string"==typeof e?{format:e,pl:n}:e:{};return i.date=t,new w(i)},y=u;y.l=v,y.i=g,y.w=function(t,e){return b(t,{locale:e.$L,utc:e.$u})};var w=function(){function h(t){this.$L=this.$L||v(t.locale,null,!0),this.parse(t)}var u=h.prototype;return u.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(y.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var i=e.match(c);if(i)return n?new Date(Date.UTC(i[1],i[2]-1,i[3]||1,i[4]||0,i[5]||0,i[6]||0,i[7]||0)):new Date(i[1],i[2]-1,i[3]||1,i[4]||0,i[5]||0,i[6]||0,i[7]||0)}return new Date(e)}(t),this.init()},u.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},u.$utils=function(){return y},u.isValid=function(){return!("Invalid Date"===this.$d.toString())},u.isSame=function(t,e){var n=b(t);return this.startOf(e)<=n&&n<=this.endOf(e)},u.isAfter=function(t,e){return b(t)<this.startOf(e)},u.isBefore=function(t,e){return this.endOf(e)<b(t)},u.$g=function(t,e,n){return y.u(t)?this[e]:this.set(n,t)},u.year=function(t){return this.$g(t,"$y",l)},u.month=function(t){return this.$g(t,"$M",r)},u.day=function(t){return this.$g(t,"$W",s)},u.date=function(t){return this.$g(t,"$D","date")},u.hour=function(t){return this.$g(t,"$H",i)},u.minute=function(t){return this.$g(t,"$m",n)},u.second=function(t){return this.$g(t,"$s",e)},u.millisecond=function(e){return this.$g(e,"$ms",t)},u.unix=function(){return Math.floor(this.valueOf()/1e3)},u.valueOf=function(){return this.$d.getTime()},u.startOf=function(t,a){var c=this,d=!!y.u(a)||a,h=y.p(t),u=function(t,e){var n=y.w(c.$u?Date.UTC(c.$y,e,t):new Date(c.$y,e,t),c);return d?n:n.endOf(s)},p=function(t,e){return y.w(c.toDate()[t].apply(c.toDate(),(d?[0,0,0,0]:[23,59,59,999]).slice(e)),c)},f=this.$W,m=this.$M,g=this.$D,v="set"+(this.$u?"UTC":"");switch(h){case l:return d?u(1,0):u(31,11);case r:return d?u(1,m):u(0,m+1);case o:var b=this.$locale().weekStart||0,w=(f<b?f+7:f)-b;return u(d?g-w:g+(6-w),m);case s:case"date":return p(v+"Hours",0);case i:return p(v+"Minutes",1);case n:return p(v+"Seconds",2);case e:return p(v+"Milliseconds",3);default:return this.clone()}},u.endOf=function(t){return this.startOf(t,!1)},u.$set=function(o,a){var c,d=y.p(o),h="set"+(this.$u?"UTC":""),u=(c={},c[s]=h+"Date",c.date=h+"Date",c[r]=h+"Month",c[l]=h+"FullYear",c[i]=h+"Hours",c[n]=h+"Minutes",c[e]=h+"Seconds",c[t]=h+"Milliseconds",c)[d],p=d===s?this.$D+(a-this.$W):a;if(d===r||d===l){var f=this.clone().set("date",1);f.$d[u](p),f.init(),this.$d=f.set("date",Math.min(this.$D,f.daysInMonth())).toDate()}else u&&this.$d[u](p);return this.init(),this},u.set=function(t,e){return this.clone().$set(t,e)},u.get=function(t){return this[y.p(t)]()},u.add=function(t,a){var c,d=this;t=Number(t);var h=y.p(a),u=function(e){var n=b(d);return y.w(n.date(n.date()+Math.round(e*t)),d)};if(h===r)return this.set(r,this.$M+t);if(h===l)return this.set(l,this.$y+t);if(h===s)return u(1);if(h===o)return u(7);var p=(c={},c[n]=6e4,c[i]=36e5,c[e]=1e3,c)[h]||1,f=this.valueOf()+t*p;return y.w(f,this)},u.subtract=function(t,e){return this.add(-1*t,e)},u.format=function(t){var e=this;if(!this.isValid())return"Invalid Date";var n=t||"YYYY-MM-DDTHH:mm:ssZ",i=y.z(this),s=this.$locale(),o=this.$H,r=this.$m,a=this.$M,l=s.weekdays,c=s.months,h=function(t,i,s,o){return t&&(t[i]||t(e,n))||s[i].substr(0,o)},u=function(t){return y.s(o%12||12,t,"0")},p=s.meridiem||function(t,e,n){var i=t<12?"AM":"PM";return n?i.toLowerCase():i},f={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:y.s(a+1,2,"0"),MMM:h(s.monthsShort,a,c,3),MMMM:c[a]||c(this,n),D:this.$D,DD:y.s(this.$D,2,"0"),d:String(this.$W),dd:h(s.weekdaysMin,this.$W,l,2),ddd:h(s.weekdaysShort,this.$W,l,3),dddd:l[this.$W],H:String(o),HH:y.s(o,2,"0"),h:u(1),hh:u(2),a:p(o,r,!0),A:p(o,r,!1),m:String(r),mm:y.s(r,2,"0"),s:String(this.$s),ss:y.s(this.$s,2,"0"),SSS:y.s(this.$ms,3,"0"),Z:i};return n.replace(d,(function(t,e){return e||f[t]||i.replace(":","")}))},u.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},u.diff=function(t,c,d){var h,u=y.p(c),p=b(t),f=6e4*(p.utcOffset()-this.utcOffset()),m=this-p,g=y.m(this,p);return g=(h={},h[l]=g/12,h[r]=g,h[a]=g/3,h[o]=(m-f)/6048e5,h[s]=(m-f)/864e5,h[i]=m/36e5,h[n]=m/6e4,h[e]=m/1e3,h)[u]||m,d?g:y.a(g)},u.daysInMonth=function(){return this.endOf(r).$D},u.$locale=function(){return m[this.$L]},u.locale=function(t,e){if(!t)return this.$L;var n=this.clone();return n.$L=v(t,e,!0),n},u.clone=function(){return y.w(this.toDate(),this)},u.toDate=function(){return new Date(this.$d)},u.toJSON=function(){return this.isValid()?this.toISOString():null},u.toISOString=function(){return this.$d.toISOString()},u.toString=function(){return this.$d.toUTCString()},h}();return b.prototype=w.prototype,b.extend=function(t,e){return t(e,w,b),b},b.locale=v,b.isDayjs=g,b.unix=function(t){return b(1e3*t)},b.en=m[f],b.Ls=m,b}()}));
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */function Wt(t,e){const n=t.get("config.locale");return Yt.locale(n,null,!0),{date:t=>t?Yt(t).locale(n.name):Yt().locale(n.name),recalculateFromTo(e){0!==(e={...e}).from&&(e.from=this.date(e.from).startOf("day").valueOf()),0!==e.to&&(e.to=this.date(e.to).endOf("day").valueOf());let n=Number.MAX_SAFE_INTEGER,i=0;const s=t.get("config.chart.items");if(0===Object.keys(s).length)return e;if(0===e.from||0===e.to){for(let t in s){const e=s[t];n>e.time.start&&(n=e.time.start),i<e.time.end&&(i=e.time.end)}0===e.from&&(e.from=this.date(n).startOf("day").valueOf()),0===e.to&&(e.to=this.date(i).endOf("day").valueOf())}return e}}}class jt{constructor(t,e="*"){this.wchar=e,this.pattern=t,this.segments=[],this.starCount=0,this.minLength=0,this.maxLength=0,this.segStartIndex=0;for(let n=0,i=t.length;n<i;n+=1){const i=t[n];i===e&&(this.starCount+=1,n>this.segStartIndex&&this.segments.push(t.substring(this.segStartIndex,n)),this.segments.push(i),this.segStartIndex=n+1)}this.segStartIndex<t.length&&this.segments.push(t.substring(this.segStartIndex)),this.starCount?(this.minLength=t.length-this.starCount,this.maxLength=1/0):this.maxLength=this.minLength=t.length}match(t){if(this.pattern===this.wchar)return!0;if(0===this.segments.length)return this.pattern===t;const{length:e}=t;if(e<this.minLength||e>this.maxLength)return!1;let n=this.segments.length-1,i=t.length-1,s=!1;for(;;){const e=this.segments[n];if(n-=1,e===this.wchar)s=!0;else{const n=i+1-e.length,o=t.lastIndexOf(e,n);if(-1===o||o>n)return!1;if(s)i=o-1,s=!1;else{if(o!==n)return!1;i-=e.length}}if(0>n)break}return!0}}class zt{constructor(t,e,n){this.obj=t,this.delimeter=e,this.wildcard=n}simpleMatch(t,e){if(t===e)return!0;if(t===this.wildcard)return!0;const n=t.indexOf(this.wildcard);if(n>-1){const i=t.substr(n+1);if(0===n||e.substring(0,n)===t.substring(0,n)){const t=i.length;return!(t>0)||e.substr(-t)===i}}return!1}match(t,e){return t===e||t===this.wildcard||e===this.wildcard||this.simpleMatch(t,e)||new jt(t).match(e)}handleArray(t,e,n,i,s={}){let o=t.indexOf(this.delimeter,n),r=!1;-1===o&&(r=!0,o=t.length);const a=t.substring(n,o);let l=0;for(const n of e){const e=l.toString(),c=""===i?e:i+this.delimeter+l;(a===this.wildcard||a===e||this.simpleMatch(a,e))&&(r?s[c]=n:this.goFurther(t,n,o+1,c,s)),l++}return s}handleObject(t,e,n,i,s={}){let o=t.indexOf(this.delimeter,n),r=!1;-1===o&&(r=!0,o=t.length);const a=t.substring(n,o);for(let n in e){n=n.toString();const l=""===i?n:i+this.delimeter+n;(a===this.wildcard||a===n||this.simpleMatch(a,n))&&(r?s[l]=e[n]:this.goFurther(t,e[n],o+1,l,s))}return s}goFurther(t,e,n,i,s={}){return Array.isArray(e)?this.handleArray(t,e,n,i,s):this.handleObject(t,e,n,i,s)}get(t){return this.goFurther(t,this.obj,0,"")}}class Gt{static get(t,e,n=null){if(null===n&&(n=t.slice()),0===n.length||void 0===e)return e;const i=n.shift();return e.hasOwnProperty(i)?0===n.length?e[i]:Gt.get(t,e[i],n):void 0}static set(t,e,n,i=null){if(null===i&&(i=t.slice()),0===i.length){for(const t in n)delete n[t];for(const t in e)n[t]=e[t];return}const s=i.shift();0!==i.length?(n.hasOwnProperty(s)||(n[s]={}),Gt.set(t,e,n[s],i)):n[s]=e}}const Ft={delimeter:".",notRecursive:";",param:":",wildcard:"*",log:function(t,e){console.debug(t,e)}},Bt={bulk:!1,debug:!1,source:"",data:void 0},Ut={only:[],source:"",debug:!1,data:void 0};class Jt{constructor(t={},e=Ft){this.listeners={},this.data=t,this.options=Object.assign(Object.assign({},Ft),e),this.id=0,this.pathGet=Gt.get,this.pathSet=Gt.set,this.scan=new zt(this.data,this.options.delimeter,this.options.wildcard)}getListeners(){return this.listeners}destroy(){this.data=void 0,this.listeners={}}match(t,e){return t===e||(t===this.options.wildcard||e===this.options.wildcard||this.scan.match(t,e))}cutPath(t,e){return this.split(this.cleanNotRecursivePath(t)).slice(0,this.split(this.cleanNotRecursivePath(e)).length).join(this.options.delimeter)}trimPath(t){return this.cleanNotRecursivePath(t).replace(new RegExp(`^\\${this.options.delimeter}{1}`),"")}split(t){return""===t?[]:t.split(this.options.delimeter)}isWildcard(t){return t.includes(this.options.wildcard)}isNotRecursive(t){return t.endsWith(this.options.notRecursive)}cleanNotRecursivePath(t){return this.isNotRecursive(t)?t.slice(0,-this.options.notRecursive.length):t}hasParams(t){return t.includes(this.options.param)}getParamsInfo(t){let e={replaced:"",original:t,params:{}},n=0,i=[];for(const s of this.split(t)){e.params[n]={original:s,replaced:"",name:""};const t=new RegExp(`\\${this.options.param}([^\\${this.options.delimeter}\\${this.options.param}]+)`,"g");let o=t.exec(s);o?(e.params[n].name=o[1],t.lastIndex=0,e.params[n].replaced=s.replace(t,this.options.wildcard),i.push(e.params[n].replaced),n++):(delete e.params[n],i.push(s),n++)}return e.replaced=i.join(this.options.delimeter),e}getParams(t,e){if(!t)return;const n=this.split(e),i={};for(const e in t.params){i[t.params[e].name]=n[e]}return i}subscribeAll(t,e,n=Bt){let i=[];for(const s of t)i.push(this.subscribe(s,e,n));return()=>{for(const t of i)t();i=[]}}getCleanListenersCollection(t={}){return Object.assign({listeners:{},isRecursive:!1,isWildcard:!1,hasParams:!1,match:void 0,paramsInfo:void 0,path:void 0,count:0},t)}getCleanListener(t,e=Bt){return{fn:t,options:Object.assign(Object.assign({},Bt),e)}}getListenerCollectionMatch(t,e,n){return t=this.cleanNotRecursivePath(t),i=>(e&&(i=this.cutPath(i,t)),!(!n||!this.match(t,i))||t===i)}getListenersCollection(t,e){if(void 0!==this.listeners[t]){let n=this.listeners[t];return this.id++,n.listeners[this.id]=e,n}let n={isRecursive:!0,isWildcard:!1,hasParams:!1,paramsInfo:void 0,originalPath:t,path:t};this.hasParams(n.path)&&(n.paramsInfo=this.getParamsInfo(n.path),n.path=n.paramsInfo.replaced,n.hasParams=!0),n.isWildcard=this.isWildcard(n.path),this.isNotRecursive(n.path)&&(n.isRecursive=!1);let i=this.listeners[n.path]=this.getCleanListenersCollection(Object.assign(Object.assign({},n),{match:this.getListenerCollectionMatch(n.path,n.isRecursive,n.isWildcard)}));return this.id++,i.listeners[this.id]=e,i}subscribe(t,e,n=Bt,i="subscribe"){let s=this.getCleanListener(e,n);const o=this.getListenersCollection(t,s);if(o.count++,t=o.path,o.isWildcard){const r=this.scan.get(this.cleanNotRecursivePath(t));if(n.bulk){const a=[];for(const t in r)a.push({path:t,params:this.getParams(o.paramsInfo,t),value:r[t]});e(a,{type:i,listener:s,listenersCollection:o,path:{listener:t,update:void 0,resolved:void 0},options:n,params:void 0})}else for(const a in r)e(r[a],{type:i,listener:s,listenersCollection:o,path:{listener:t,update:void 0,resolved:this.cleanNotRecursivePath(a)},params:this.getParams(o.paramsInfo,a),options:n})}else e(this.pathGet(this.split(this.cleanNotRecursivePath(t)),this.data),{type:i,listener:s,listenersCollection:o,path:{listener:t,update:void 0,resolved:this.cleanNotRecursivePath(t)},params:this.getParams(o.paramsInfo,t),options:n});return this.debugSubscribe(s,o,t),this.unsubscribe(t,this.id)}unsubscribe(t,e){const n=this.listeners,i=n[t];return function(){delete i.listeners[e],i.count--,0===i.count&&delete n[t]}}same(t,e){return(["number","string","undefined","boolean"].includes(typeof t)||null===t)&&e===t}notifyListeners(t,e=[],n=!0){const i=[];for(const s in t){let{single:o,bulk:r}=t[s];for(const t of o){if(e.includes(t))continue;const s=this.debugTime(t);t.listener.fn(t.value(),t.eventInfo),n&&i.push(t),this.debugListener(s,t)}for(const t of r){if(e.includes(t))continue;const s=this.debugTime(t),o=t.value.map(t=>Object.assign(Object.assign({},t),{value:t.value()}));t.listener.fn(o,t.eventInfo),n&&i.push(t),this.debugListener(s,t)}}return i}getSubscribedListeners(t,e,n,i="update",s=null){n=Object.assign(Object.assign({},Ut),n);const o={};for(let r in this.listeners){const a=this.listeners[r];if(o[r]={single:[],bulk:[],bulkData:[]},a.match(t)){const l=a.paramsInfo?this.getParams(a.paramsInfo,t):void 0,c=a.isRecursive||a.isWildcard?()=>this.get(this.cutPath(t,r)):()=>e,d=[{value:c,path:t,params:l}];for(const e in a.listeners){const h=a.listeners[e];h.options.bulk?o[r].bulk.push({listener:h,listenersCollection:a,eventInfo:{type:i,listener:h,path:{listener:r,update:s||t,resolved:void 0},params:l,options:n},value:d}):o[r].single.push({listener:h,listenersCollection:a,eventInfo:{type:i,listener:h,path:{listener:r,update:s||t,resolved:this.cleanNotRecursivePath(t)},params:l,options:n},value:c})}}}return o}notifySubscribedListeners(t,e,n,i="update",s=null){return this.notifyListeners(this.getSubscribedListeners(t,e,n,i,s))}getNestedListeners(t,e,n,i="update",s=null){const o={};for(let r in this.listeners){o[r]={single:[],bulk:[]};const a=this.listeners[r],l=this.cutPath(r,t);if(this.match(l,t)){const c=this.trimPath(r.substr(l.length)),d=new zt(e,this.options.delimeter,this.options.wildcard).get(c),h=a.paramsInfo?this.getParams(a.paramsInfo,t):void 0,u=[],p={};for(const e in d){const l=()=>d[e],c=[t,e].join(this.options.delimeter);for(const e in a.listeners){const d=a.listeners[e],f={type:i,listener:d,listenersCollection:a,path:{listener:r,update:s||t,resolved:this.cleanNotRecursivePath(c)},params:h,options:n};d.options.bulk?(u.push({value:l,path:c,params:h}),p[e]=d):o[r].single.push({listener:d,listenersCollection:a,eventInfo:f,value:l})}}for(const e in p){const s=p[e],l={type:i,listener:s,listenersCollection:a,path:{listener:r,update:t,resolved:void 0},options:n,params:h};o[r].bulk.push({listener:s,listenersCollection:a,eventInfo:l,value:u})}}}return o}notifyNestedListeners(t,e,n,i="update",s,o=null){return this.notifyListeners(this.getNestedListeners(t,e,n,i,o),s,!1)}getNotifyOnlyListeners(t,e,n,i="update",s=null){const o={};if("object"!=typeof n.only||!Array.isArray(n.only)||void 0===n.only[0]||!this.canBeNested(e))return o;for(const r of n.only){const a=new zt(e,this.options.delimeter,this.options.wildcard).get(r);o[r]={bulk:[],single:[]};for(const e in a){const l=t+this.options.delimeter+e;for(const c in this.listeners){const d=this.listeners[c],h=d.paramsInfo?this.getParams(d.paramsInfo,l):void 0;if(this.match(c,l)){const u=()=>a[e],p=[{value:u,path:l,params:h}];for(const e in d.listeners){const a=d.listeners[e],f={type:i,listener:a,listenersCollection:d,path:{listener:c,update:s||t,resolved:this.cleanNotRecursivePath(l)},params:h,options:n};a.options.bulk?o[r].bulk.some(t=>t.listener===a)||o[r].bulk.push({listener:a,listenersCollection:d,eventInfo:f,value:p}):o[r].single.push({listener:a,listenersCollection:d,eventInfo:f,value:u})}}}}}return o}notifyOnly(t,e,n,i="update",s=null){return void 0!==this.notifyListeners(this.getNotifyOnlyListeners(t,e,n,i,s))[0]}canBeNested(t){return"object"==typeof t&&null!==t}getUpdateValues(t,e,n){"object"==typeof t&&null!==t&&(t=Array.isArray(t)?t.slice():Object.assign({},t));let i=n;return"function"==typeof n&&(i=n(this.pathGet(e,this.data))),{newValue:i,oldValue:t}}wildcardUpdate(t,e,n=Ut){n=Object.assign(Object.assign({},Ut),n);const i=this.scan.get(t),s={};for(const t in i){const n=this.split(t),{oldValue:o,newValue:r}=this.getUpdateValues(i[t],n,e);this.same(r,o)||(s[t]=r)}const o=[];for(const e in s){const i=s[e];n.only.length?o.push(this.getNotifyOnlyListeners(e,i,n,"update",t)):(o.push(this.getSubscribedListeners(e,i,n,"update",t)),this.canBeNested(i)&&o.push(this.getNestedListeners(e,i,n,"update",t))),n.debug&&this.options.log("Wildcard update",{path:e,newValue:i}),this.pathSet(this.split(e),i,this.data)}let r=[];for(const t of o)r=[...r,...this.notifyListeners(t,r)]}update(t,e,n=Ut){if(this.isWildcard(t))return this.wildcardUpdate(t,e,n);const i=this.split(t),{oldValue:s,newValue:o}=this.getUpdateValues(this.pathGet(i,this.data),i,e);if(n.debug&&this.options.log(`Updating ${t} ${n.source?`from ${n.source}`:""}`,s,o),this.same(o,s))return o;if(this.pathSet(i,o,this.data),n=Object.assign(Object.assign({},Ut),n),this.notifyOnly(t,o,n))return o;const r=this.notifySubscribedListeners(t,o,n);return this.canBeNested(o)&&this.notifyNestedListeners(t,o,n,"update",r),o}get(t){return void 0===t||""===t?this.data:this.pathGet(this.split(t),this.data)}debugSubscribe(t,e,n){t.options.debug&&this.options.log("listener subscribed",n,t,e)}debugListener(t,e){(e.eventInfo.options.debug||e.listener.options.debug)&&this.options.log("Listener fired",{time:Date.now()-t,info:e})}debugTime(t){return t.listener.options.debug||t.eventInfo.options.debug?Date.now():0}}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */const qt="gantt-schedule-timeline-calendar";function Zt(t){return t&&"object"==typeof t&&!Array.isArray(t)}function Xt(t,...e){const n=e.shift();if(Zt(t)&&Zt(n))for(const e in n)if(Zt(n[e]))void 0===t[e]&&(t[e]={}),t[e]=Xt(t[e],n[e]);else if(Array.isArray(n[e])){t[e]=[];for(let i of n[e])Zt(i)?t[e].push(Xt({},i)):t[e].push(i)}else t[e]=n[e];return e.length?Xt(t,...e):t}
/**
 * Gantt-Schedule-Timeline-Calendar
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   GPL-3.0
 */
const Kt={components:{Main:Dt},scrollBarHeight:17,height:0,treeMap:{},flatTreeMap:[],flatTreeMapById:{},list:{expandedHeight:0,visibleRows:[],rows:{},width:0},dimensions:{width:0,height:0},chart:{dimensions:{width:0,innerWidth:0},visibleItems:[],time:{dates:[],timePerPixel:0,firstTaskTime:0,lastTaskTime:0,totalViewDurationMs:0,totalViewDurationPx:0,leftGlobal:0,rightGlobal:0,leftPx:0,rightPx:0,leftInner:0,rightInner:0}},elements:{}},Qt=t=>{const e=t.state,n=function(t){let e=t.get(),n=[];const i={name:qt,debug:!1,log(...t){this.debug&&console.log.call(console,...t)},mergeDeep:Xt,getComponentData(t,e){const n={};return n.componentName=t,n.className=this.getClass(t,e),n.action=this.getAction(t),n},getClass(n,i){let s=`${qt}__${n}`;n===this.name&&(s=this.name);let o=`${s} `,r="-";if(void 0!==i)for(const t in i){if("Object"===i[t].constructor.name&&void 0!==i[t].id)return r+=`-${t}_${i[t].id}`,o+o.trim()+r;"string"!=typeof i[t]&&"number"!=typeof i[t]||(r+=`-${t}_${i[t]}`)}return"-"!=r&&(o+=s+r+" "),void 0!==e.config.classNames[n]&&t.get(`config.classNames.${n}`).forEach(t=>o+=t+" "),void 0!==e.config.classNames[n+r]&&t.get(`config.classNames.${n+r}`).forEach(t=>o+=t+" "),o.trim()},allActions:[],getActions(e){this.allActions.includes(e)||this.allActions.push(e);let n=t.get("config.actions."+e);return void 0===n&&(n=[]),n},isItemInViewport:(t,e,n)=>t.time.start>=e&&t.time.start<n||t.time.end>=e&&t.time.end<n,fillEmptyRowValues(t){let n=0;for(const i in t){const s=t[i];s._internal={parents:[],children:[],items:[]},"number"!=typeof s.height&&(s.height=e.config.list.rowHeight),"boolean"!=typeof s.expanded&&(s.expanded=!1),s.top=n,n+=s.height}return t},generateParents(t,e="parentId"){const n={};for(const i of t){const t=void 0!==i[e]?i[e]:"";void 0===n[t]&&(n[t]={}),n[t][i.id]=i}return n},fastTree(t,e,n=[]){const i=t[e.id];if(e._internal.parents=n,void 0===i)return e._internal.children=[],e;""!==e.id&&(n=[...n,e.id]),e._internal.children=Object.values(i);for(const e in i){const s=i[e];this.fastTree(t,s,n)}return e},makeTreeMap(t,e){const n=this.generateParents(e,"rowId");for(const e of t)e._internal.items=void 0!==n[e.id]?Object.values(n[e.id]):[];const i=this.generateParents(t);return this.fastTree(i,{id:"",_internal:{children:[],parents:[],items:[]}})},getFlatTreeMapById(t,e={}){for(const n of t._internal.children)e[n.id]=n,this.getFlatTreeMapById(n,e);return e},flattenTreeMap(t,e=[]){for(const n of t._internal.children)e.push(n.id),this.flattenTreeMap(n,e);return e},getRowsFromMap:(t,e)=>t.map(t=>e[t.id]),getRowsFromIds(t,e){const n=[];for(const i of t)n.push(e[i]);return n},getRowsWithParentsExpanded(t,e,n){const i=[];t:for(const s of t){for(const t of e[s]._internal.parents){if(!n[t].expanded)continue t}i.push(s)}return i},getRowsHeight(t){let e=0;for(let n of t)e+=n.height;return e},getVisibleRows(t){const n=[];let i=0,s=0;for(const o of t){if(i+o.height>e.config.scroll.top&&i<e.config.scroll.top+e._internal.height&&(o.top=s,s+=o.height,n.push(o)),i>e.config.scroll.top+e._internal.height)break;i+=o.height}return n},normalizeMouseWheelEvent(t){let e=t.deltaX||0,n=t.deltaY||0,i=t.deltaZ||0;const s=t.deltaMode,o=parseInt(getComputedStyle(t.target).getPropertyValue("line-height"));let r=1;switch(s){case 1:r=o;break;case 2:r=window.height}return{x:e*=r,y:n*=r,z:i*=r}},limitScroll(e,n){if("top"===e){const e=t.get("_internal.list.rowsHeight")-t.get("_internal.height");return n<0?n=0:n>e&&(n=e),n}{const e=t.get("_internal.chart.time.totalViewDurationPx")-t.get("_internal.chart.dimensions.width");return n<0?n=0:n>e&&(n=e),n}},time:Wt(t),getScrollBarHeight(){const t=document.createElement("div");t.style.visibility="hidden",t.style.height="100px",t.style.msOverflowStyle="scrollbar",document.body.appendChild(t);var e=t.offsetHeight;t.style.overflow="scroll";var n=document.createElement("div");n.style.height="100%",t.appendChild(n);var i=n.offsetHeight;return t.parentNode.removeChild(t),e-i+1},destroy(){e=void 0;for(const t of n)t();n=[],i.debug&&delete window.state}};return i.debug&&(window.state=t,window.api=i),i}(e);window.state=e,e.update("",t=>({config:t.config,_internal:Kt}));rt(e,n).createApp(Dt,t.element);return{state:e}};Qt.api={name:qt,stateFromConfig:function(t){const e=function(t){const e=Xt({},Ht.actions),n=Xt({},t.actions),i=[Object.keys(e),Object.keys(n)].flatMap((t,e,n)=>1===e?t.filter(t=>!n[0].includes(t)):t),s={};for(const t of i)s[t]=[],void 0!==e[t]&&Array.isArray(e[t])&&(s[t]=[...e[t]]),void 0!==n[t]&&Array.isArray(n[t])&&(s[t]=[...s[t],...n[t]]);return delete t.actions,delete Ht.actions,s}(t),n={config:Xt({},Ht,t)};return n.config.actions=e,new Jt(n,{delimeter:"."})},mergeDeep:Xt,date:t=>t?Yt(t):Yt(),dayjs:Yt};export default Qt;
//# sourceMappingURL=index.esm.js.map
