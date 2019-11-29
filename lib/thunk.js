function t(t){const e=t.dispatch.bind(t);return t.addEventListener("dispatch",n=>{const i=n,{action:a}=i.detail;if("function"==typeof a){a(e,t.state),i.stopImmediatePropagation(),i.preventDefault()}}),t}export{t as thunk};
//# sourceMappingURL=thunk.js.map
