import{R as o,u as h,j as t,s as d,g as u,h as C,a as p,i as j,r as n,k as g}from"./index-CNDfFNJZ.js";function S({citiesList:a}){const s=h(),l=e=>{s(d(e.name)),s(u({lat:e.lat,lon:e.lon}))},r=e=>{s(C(e))};return t.jsxs("ul",{className:"cities-list",children:[a.length>0&&t.jsx("h5",{children:"Search"}),a.map((e,i)=>t.jsxs("li",{children:[t.jsxs("button",{className:"set-city",onClick:()=>l(e),children:[e.name,", ",e.country]}),t.jsx("button",{onClick:()=>r(e),children:t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-star",viewBox:"0 0 16 16",children:t.jsx("path",{d:"M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"})})})]},i))]})}const L=o.memo(S);function f(){const a=p(e=>e.starredCities),s=h(),l=e=>{s(d(e.name)),s(u({lat:e.lat,lon:e.lon}))},r=e=>{s(j(e))};return t.jsxs("ul",{className:"cities-list starred-cities-list",children:[a.length>0&&t.jsx("h5",{children:"Starred"}),a.map((e,i)=>t.jsxs("li",{children:[t.jsxs("button",{className:"set-city",onClick:()=>l(e),children:[e.name,", ",e.country]}),t.jsx("button",{onClick:()=>r(i),children:t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-star-fill",viewBox:"0 0 16 16",children:t.jsx("path",{d:"M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"})})})]},i))]})}const v=o.memo(f);function w({showCitySearch:a}){const[s,l]=n.useState(""),[r,e]=n.useState([]),i=c=>{l(c.target.value)};return n.useEffect(()=>{const c=setTimeout(()=>{if(s){const m=`https://api.openweathermap.org/geo/1.0/direct?q=${s}&limit=3&appid=e13101adaa937ed23720689cf95cba15`;g.get(m).json().then(x=>{e(x)})}else e([])},500);return()=>clearTimeout(c)},[s]),t.jsxs("section",{className:a?"city-search show":"city-search",children:[t.jsx("input",{type:"text",placeholder:"Search city...",value:s,onChange:i}),t.jsx(v,{}),t.jsx(L,{citiesList:r})]})}const k=o.memo(w);export{k as default};
