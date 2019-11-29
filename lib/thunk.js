import{d as t}from"./const-39efaaf8.js";function e(e){const n=e.dispatch.bind(e);return e.addEventListener(t,t=>{const o=t,{action:a}=o.detail;if("function"==typeof a){a(n,e.state),o.stopImmediatePropagation(),o.preventDefault()}}),e}export{e as thunk};
//# sourceMappingURL=thunk.js.map
