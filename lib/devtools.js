function t(t){const e=window.__REDUX_DEVTOOLS_EXTENSION__;if(e){const s=e.connect();let n=!1;t.addEventListener("state",e=>{const{action:a}=e.detail;n?n=!1:s.send(a,t.state)}),s.subscribe(e=>{"DISPATCH"===e.type&&e.state&&(n=!0,t.state=JSON.parse(e.state),t.dispatch({}))}),s.init(t.state)}return t}export{t as devtools};
//# sourceMappingURL=devtools.js.map
