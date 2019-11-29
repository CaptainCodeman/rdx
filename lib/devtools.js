import{s as t}from"./const-39efaaf8.js";function e(e){const s=window.__REDUX_DEVTOOLS_EXTENSION__;if(s){const n=s.connect();let a=!1;e.addEventListener(t,t=>{const{action:s}=t.detail;a?a=!1:n.send(s,e.state)}),n.subscribe(t=>{"DISPATCH"===t.type&&t.state&&(a=!0,e.state=JSON.parse(t.state),e.dispatch({}))}),n.init(e.state)}return e}export{e as devtools};
//# sourceMappingURL=devtools.js.map
