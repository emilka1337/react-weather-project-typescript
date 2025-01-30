import{R as o,u,r as l,s as h,a as d,b as x,j as t,c as p,d as j,k as S}from"./index-m9qdbOil.js";function b({citiesList:a}){const s=u(),c=l.useCallback(e=>{s(h(e.name)),s(d({lat:e.lat,lon:e.lon}))},[]),r=l.useCallback(e=>{s(x(e))},[]);return t.jsxs("ul",{className:"cities-list",children:[a.length>0&&t.jsx("h5",{children:"Search"}),a.map((e,i)=>t.jsxs("li",{children:[t.jsxs("button",{className:"set-city",onClick:()=>c(e),children:[e.name,", ",e.country]}),t.jsx("button",{onClick:()=>r(e),children:t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-star",viewBox:"0 0 16 16",children:t.jsx("path",{d:"M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"})})})]},i))]})}const g=o.memo(b);function L(){const a=p(e=>e.starredCities),s=u(),c=l.useCallback(e=>{s(h(e.name)),s(d({lat:e.lat,lon:e.lon}))},[]),r=l.useCallback(e=>{s(j(e))},[]);return t.jsxs("ul",{className:"cities-list starred-cities-list",children:[a.length>0&&t.jsx("h5",{children:"Starred"}),a.map((e,i)=>t.jsxs("li",{children:[t.jsxs("button",{className:"set-city",onClick:()=>c(e),children:[e.name,", ",e.country]}),t.jsx("button",{onClick:()=>r(i),children:t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-star-fill",viewBox:"0 0 16 16",children:t.jsx("path",{d:"M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"})})})]},i))]})}const f=o.memo(L);function k({showCitySearch:a}){const[s,c]=l.useState(""),[r,e]=l.useState([]),i=n=>{c(n.target.value)};return l.useEffect(()=>{const n=setTimeout(()=>{if(s){const m=`https://api.openweathermap.org/geo/1.0/direct?q=${s}&limit=3&appid=e13101adaa937ed23720689cf95cba15`;S.get(m).json().then(C=>{e(C)})}else e([])},500);return()=>clearTimeout(n)},[s]),t.jsxs("section",{className:a?"city-search show":"city-search",children:[t.jsx("input",{type:"text",placeholder:"Search city...",value:s,onChange:i}),t.jsx(f,{}),t.jsx(g,{citiesList:r})]})}const w=o.memo(k);export{w as default};
