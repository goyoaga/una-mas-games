import './styles.css';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import helvetiker from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { games } from './games.js';

const palette=['#d8b16a','#c98770','#80948f','#7d88a4','#b1848e'][Math.floor(Math.random()*5)];
document.documentElement.style.setProperty('--hero-bg',palette);
document.documentElement.dataset.catalogSize=games.length>=9?'large':games.length>=5?'medium':'small';
renderGames(); initHero();

function renderGames(){
 const grid=document.querySelector('#games-grid');
 games.forEach(game=>{
  const article=document.createElement('article'); article.className='game-card'; article.style.setProperty('--card-accent',game.accent);
  const link=document.createElement('a'); link.className='game-card__link'; link.href=game.url; link.setAttribute('aria-label',`Jugar a ${game.title}`);
  link.innerHTML=`<div class="game-card__visual" aria-hidden="true"><span>${game.icon}</span></div><div class="game-card__body"><h3>${game.title}</h3><p>${game.description}</p><span class="game-card__cta">Jugar <span aria-hidden="true">→</span></span></div>`;
  article.append(link); grid.append(article);
 });
}

function initHero(){
 const mount=document.querySelector('#hero-scene'); const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let renderer; try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2)); renderer.setClearAlpha(0); renderer.outputColorSpace=THREE.SRGBColorSpace; mount.append(renderer.domElement);
 const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(31,1,.1,100); camera.position.set(0,0,12.5);
 scene.add(new THREE.HemisphereLight(0xffffff,0x8c6949,2.7)); const key=new THREE.DirectionalLight(0xffffff,4); key.position.set(-4,6,8); scene.add(key); const rim=new THREE.DirectionalLight(0xffe6c7,2); rim.position.set(5,-2,5); scene.add(rim);
 const white=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.28,clearcoat:.55,clearcoatRoughness:.2});
 const cream=new THREE.MeshPhysicalMaterial({color:0xf5eee4,roughness:.4,clearcoat:.2});
 const red=new THREE.MeshPhysicalMaterial({color:0xc85645,roughness:.32,clearcoat:.45});
 const blue=new THREE.MeshPhysicalMaterial({color:0x75aaf2,roughness:.18,clearcoat:.8});
 const gold=new THREE.MeshPhysicalMaterial({color:0xf0c86a,roughness:.3,clearcoat:.4});
 const dark=new THREE.MeshStandardMaterial({color:0x6a4f34,roughness:.6});
 const objects=[];

 const font=new FontLoader().parse(helvetiker);
 const title=new THREE.Group();
 const makeText=(text,size,depth,y)=>{
  const g=new TextGeometry(text,{font,size,depth,curveSegments:10,bevelEnabled:true,bevelThickness:.035,bevelSize:.025,bevelSegments:3});
  g.computeBoundingBox(); const w=g.boundingBox.max.x-g.boundingBox.min.x; g.translate(-w/2,0,0);
  const m=new THREE.Mesh(g,white); m.position.y=y; title.add(m);
 };
 makeText('UNA MAS',1.15,.18,-.05); makeText('GAMES',.28,.08,-.72); title.rotation.x=-.04; scene.add(title);

 const apple=new THREE.Group();
 const ab=new THREE.Mesh(new THREE.SphereGeometry(.62,32,24),red); ab.scale.set(1,.9,.95); apple.add(ab);
 const al=new THREE.Mesh(new THREE.SphereGeometry(.38,24,18),red); al.position.set(-.3,.05,.12); apple.add(al);
 const ar=al.clone(); ar.position.x=.3; apple.add(ar);
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.045,.065,.35,10),dark); stem.position.y=.68; stem.rotation.z=-.25; apple.add(stem);
 addFloat(apple,[-3.75,.85,.1],.82);

 const drop=new THREE.Group();
 const pts=[new THREE.Vector2(0,.88),new THREE.Vector2(.25,.68),new THREE.Vector2(.48,.12),new THREE.Vector2(.42,-.55),new THREE.Vector2(.08,-.82)];
 const dm=new THREE.Mesh(new THREE.LatheGeometry(pts,40),blue); drop.add(dm); addFloat(drop,[-2.8,-1.0,.5],.72);

 const plane=new THREE.Group();
 const shape=new THREE.Shape(); shape.moveTo(-.9,-.12);shape.lineTo(1.05,0);shape.lineTo(-.18,.32);shape.lineTo(-.26,.06);shape.closePath();
 const pg=new THREE.ExtrudeGeometry(shape,{depth:.07,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:2});pg.center();
 const pm=new THREE.Mesh(pg,cream);pm.rotation.set(.35,.5,-.2);plane.add(pm);addFloat(plane,[3.65,.75,.3],.86);

 const ring=new THREE.Group(); const torus=new THREE.Mesh(new THREE.TorusGeometry(.64,.17,20,48),gold); torus.rotation.set(.85,.25,.15);ring.add(torus);
 const inner=new THREE.Mesh(new THREE.TorusGeometry(.35,.055,14,36),white);inner.rotation.copy(torus.rotation);ring.add(inner);addFloat(ring,[3.0,-1.05,-.2],.75);

 const starShape=new THREE.Shape(); for(let i=0;i<10;i++){const r=i%2===0?.55:.25,a=-Math.PI/2+i*Math.PI/5,x=Math.cos(a)*r,y=Math.sin(a)*r;i?starShape.lineTo(x,y):starShape.moveTo(x,y)}starShape.closePath();
 const sg=new THREE.ExtrudeGeometry(starShape,{depth:.16,bevelEnabled:true,bevelSize:.055,bevelThickness:.055,bevelSegments:2});sg.center();
 const star=new THREE.Mesh(sg,white);addFloat(star,[0,1.45,-1],.55);

 function addFloat(group,pos,scale){group.position.set(...pos);group.scale.setScalar(scale);group.userData={base:[...pos],phase:objects.length*.95};scene.add(group);objects.push(group)}

 const ro=new ResizeObserver(()=>{const {width,height}=mount.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();const mobile=width<620;camera.position.z=mobile?13.7:11.5;title.scale.setScalar(mobile?.68:1);});ro.observe(mount);

 const clock=new THREE.Clock(); let raf;
 function draw(){const t=clock.getElapsedTime();objects.forEach((o,i)=>{const [x,y,z]=o.userData.base,p=o.userData.phase;if(!reduced){o.position.set(x+Math.cos(t*.38+p)*.08,y+Math.sin(t*.72+p)*.12,z+Math.sin(t*.31+p)*.12);o.rotation.y+=.004+i*.00035;o.rotation.x=Math.sin(t*.4+p)*.08}});if(!reduced){title.rotation.y=Math.sin(t*.28)*.035;title.position.y=Math.sin(t*.5)*.025}renderer.render(scene,camera);raf=requestAnimationFrame(draw)} draw();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else draw()});
}