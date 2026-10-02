import './styles.css';
import { games } from './games.js';
document.documentElement.dataset.catalogSize=games.length>=9?'large':games.length>=5?'medium':'small';
renderGames();

function renderGames(){
 const grid=document.querySelector('#games-grid');
 games.forEach((game,index)=>{
  const article=document.createElement('article'); article.className='game-card'; article.style.setProperty('--card-accent',game.accent);
  const link=document.createElement('a'); link.className='game-card__link'; link.href=game.url; link.setAttribute('aria-label','Jugar a '+game.title);
  const isNew=index===games.length-1;
  link.innerHTML='<span class="game-card__tab" aria-hidden="true"></span><div class="game-card__meta"><span class="game-card__icon" aria-hidden="true">'+game.icon+'</span><span>'+String(index+1).padStart(2,'0')+'</span>'+(isNew?'<strong>NUEVO</strong>':'')+'</div><h3>'+game.title+'</h3><p>'+game.description+'</p><span class="game-card__cta">UNA MÁS <span aria-hidden="true">↗</span></span>';
  article.append(link); grid.append(article);
 });
}
