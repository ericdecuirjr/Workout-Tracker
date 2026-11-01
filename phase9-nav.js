/* Phase 9 navigation polish: accessible five-item navigation and deep feature shortcuts. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const toggle=$('moreToggle'),menu=$('moreMenu');
  const primary=[...document.querySelectorAll('.main-nav [data-tab]')];
  const destinations=[...document.querySelectorAll('[data-tab]')];
  function closeMore(){
    menu.hidden=true;
    toggle.setAttribute('aria-expanded','false');
    toggle.classList.remove('active');
  }
  function openMore(){
    menu.hidden=false;
    toggle.setAttribute('aria-expanded','true');
    toggle.classList.add('active');
  }
  toggle.addEventListener('click',()=>menu.hidden?openMore():closeMore());
  function updateNav(selected){
    const isMore=['power','history'].includes(selected);
    destinations.forEach(button=>{
      const active=button.dataset.tab===selected;
      button.classList.toggle('active',active);
      if(button.closest('.main-nav')) {
        if(active)button.setAttribute('aria-current','page');
        else button.removeAttribute('aria-current');
      }
    });
    toggle.classList.toggle('selected-destination',isMore);
    toggle.setAttribute('aria-label',isMore?'More features: '+selected+' selected':'More features');
    closeMore();
  }
  function goTo(tab,anchor){
    const target=document.querySelector('[data-tab="'+tab+'"]');
    if(!target)return;
    target.click();
    updateNav(tab);
    if(anchor){
      const destination=$(anchor);
      if(destination){
        if(destination.tagName==='DETAILS')destination.open=true;
        // Avoid sticky bottom bar obscuring the heading.
        destination.scrollIntoView({block:'start',behavior:'instant'});
      }
    }else window.scrollTo({top:0,behavior:'instant'});
  }
  destinations.forEach(button=>button.addEventListener('click',()=>updateNav(button.dataset.tab)));
  document.querySelectorAll('[data-quick-tab]').forEach(button=>button.addEventListener('click',()=>goTo(button.dataset.quickTab,button.dataset.target)));
  document.querySelectorAll('[data-jump-to]').forEach(button=>button.addEventListener('click',()=>{
    const destination=$(button.dataset.jumpTo);
    if(!destination)return;
    if(destination.tagName==='DETAILS')destination.open=true;
    destination.scrollIntoView({block:'start',behavior:'smooth'});
  }));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!menu.hidden){
      closeMore();toggle.focus();
    }
  });
  document.addEventListener('pointerdown',event=>{
    if(!menu.hidden&&!menu.contains(event.target)&&!toggle.contains(event.target))closeMore();
  });
  // Keep programmatic navigation working (power cycle, shortcuts, plan imports).
  const originalGo=window.goTab;
  // Existing app.js goTab is a top-level function declaration; its clicks are
  // handled by the native data-tab event handlers above.
  void originalGo;
  updateNav('dashboard');
})();
