import{R as o,u as h,r as c,s as d,a as u,b as p,j as s,c as j,d as g,k as b}from"./index-Hx9C3j4V.js";function w({citiesList:l}){const t=h(),a=c.useCallback(e=>{t(d(e.name)),t(u({lat:e.lat,lon:e.lon}))},[]),r=c.useCallback(e=>{t(p(e))},[]);return s.jsxs("ul",{className:"cities-list",children:[l.length>0&&s.jsx("h5",{children:"Search"}),l.map((e,i)=>s.jsxs("li",{children:[s.jsxs("button",{className:"set-city",onClick:()=>a(e),children:[e.name,", ",e.country]}),s.jsx("button",{onClick:()=>r(e),children:s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-star",viewBox:"0 0 16 16",children:s.jsx("path",{d:"M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"})})})]},i))]})}const L=o.memo(w);function v(){const l=j(e=>e.starredCities),t=h(),a=c.useCallback(e=>{t(d(e.name)),t(u({lat:e.lat,lon:e.lon}))},[]),r=c.useCallback(e=>{t(g(e))},[]);return s.jsxs("ul",{className:"cities-list starred-cities-list",children:[l.length>0&&s.jsx("h5",{children:"Starred"}),l.map((e,i)=>s.jsxs("li",{children:[s.jsxs("button",{className:"set-city",onClick:()=>a(e),children:[e.name,", ",e.country]}),s.jsx("button",{onClick:()=>r(i),children:s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-star-fill",viewBox:"0 0 16 16",children:s.jsx("path",{d:"M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"})})})]},i))]})}const S=o.memo(v);function f({showCitySearch:l,setShowCitySearch:t}){const[a,r]=c.useState(""),[e,i]=c.useState([]),m=n=>{r(n.target.value)};return c.useEffect(()=>{const n=setTimeout(()=>{if(a){const x=`https://api.openweathermap.org/geo/1.0/direct?q=${a}&limit=3&appid=e13101adaa937ed23720689cf95cba15`;b.get(x).json().then(C=>{i(C)})}else i([])},500);return()=>clearTimeout(n)},[a]),s.jsxs("section",{className:l?"city-search show":"city-search",children:[s.jsx("div",{className:"close-container",children:s.jsx("button",{onClick:()=>t(!1),children:s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-x-lg",viewBox:"0 0 16 16",children:s.jsx("path",{d:"M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"})})})}),s.jsx("input",{type:"text",placeholder:"Search city...",value:a,onChange:m}),s.jsx(S,{}),s.jsx(L,{citiesList:e})]})}const N=o.memo(f);export{N as default};
