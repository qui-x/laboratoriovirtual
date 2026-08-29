/* ═══════════════════════════════════════════════════════════════
   CAMADA: APLICAÇÃO — Lista de substâncias
   ARQUIVO: app-substancias.js
   ───────────────────────────────────────────────────────────────
   Constrói as abas de categoria e a lista de substâncias (com
   busca), e trata a seleção de uma substância: recalibra o slider
   de temperatura, atualiza o painel de dados e reinicia a simulação
   para a nova substância.
   Adiciona a App.prototype: _buildSubCatTabs, _buildList,
   _selectEntry.
   Depende de: app/app-core.js, data/catalogo-substancias.js
               (CATALOG).
═══════════════════════════════════════════════════════════════ */

'use strict';

App.prototype._buildSubCatTabs = function() {
    const wrap=document.getElementById('sub-cat-tabs');
    if (!wrap) return;
    // Categorias na ordem em que aparecem no catálogo (sem duplicar)
    const cats=[];
    for (const e of CATALOG) if (!cats.includes(e.cat)) cats.push(e.cat);

    wrap.innerHTML='';
    const makeBtn=(label,cat)=>{
      const btn=document.createElement('button');
      btn.type='button'; btn.className='mol-cat-btn'+(cat==='all'?' active-cat':'');
      btn.dataset.cat=cat; btn.textContent=label;
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-selected', cat==='all'?'true':'false');
      btn.addEventListener('click',()=>{
        this._activeSubCat=cat;
        wrap.querySelectorAll('.mol-cat-btn').forEach(b=>{
          const isActive=b===btn;
          b.classList.toggle('active-cat',isActive);
          b.setAttribute('aria-selected',isActive?'true':'false');
        });
        const search=document.getElementById('sub-search');
        this._buildList(search?search.value:'');
      });
      return btn;
    };
    wrap.appendChild(makeBtn('Todas','all'));
    cats.forEach(cat=>wrap.appendChild(makeBtn(cat,cat)));
  };

  App.prototype._buildList = function(filter='') {
    const list=document.getElementById('sub-list');
    const q=filter.toLowerCase().trim();
    const mapaEstado = { solid:'solido', liquid:'liquido', gas:'gasoso' };
    const cats={};
    for (const e of CATALOG) {
      if (this._activeSubCat && this._activeSubCat!=='all' && e.cat!==this._activeSubCat) continue;
      // Filtro de MÓDULO (Gases/Líquidos/Sólidos, sidebar esquerda) — além
      // do filtro de categoria química (abas acima da lista). Com um
      // módulo ativo, só aparecem substâncias daquele estado físico de
      // referência (25°C, 1atm — ver estadoPadrao() em termodinamica.js).
      if (this._activeModulo && mapaEstado[estadoPadrao(e)] !== this._activeModulo) continue;
      if (q && !e.name.toLowerCase().includes(q) && !e.formula.toLowerCase().includes(q)) continue;
      if (!cats[e.cat]) cats[e.cat]=[];
      cats[e.cat].push(e);
    }
    list.innerHTML='';
    let visiveis = 0;
    for (const [cat,items] of Object.entries(cats)) {
      const hdr=document.createElement('li'); hdr.className='sub-group-hdr'; hdr.setAttribute('role','presentation'); hdr.textContent=cat;
      list.appendChild(hdr);
      for (const e of items) {
        visiveis++;
        const li=document.createElement('li');
        li.className='sub-item'; li.setAttribute('role','option'); li.setAttribute('tabindex','0');
        li.innerHTML=`<span class="si-dot" style="background:${e.color};color:${e.color}"></span>
          <span class="si-formula">${e.formula}</span>
          <span class="si-name">${e.name}</span>`;
        li.addEventListener('click',()=>this._selectEntry(e,li));
        li.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' ')this._selectEntry(e,li);});
        list.appendChild(li);
      }
    }
    if (visiveis === 0) {
      const vazio = document.createElement('li');
      vazio.className = 'sub-lista-vazia';
      vazio.setAttribute('role', 'note');
      vazio.textContent = 'Nenhuma substância nesta combinação de filtros.';
      list.appendChild(vazio);
    }
  };

  App.prototype._selectEntry = function(entry, liEl) {
    document.querySelectorAll('.sub-item').forEach(el=>{el.classList.remove('active');el.removeAttribute('aria-selected');});
    liEl.classList.add('active'); liEl.setAttribute('aria-selected','true');
    this.sim.entry=entry;
    this._calibrateTempSlider(entry);
    // Pressão sempre reinicia em 1 atm (pressão atmosférica padrão) ao
    // trocar de substância — ponto de partida didaticamente coerente,
    // consistente com os 25°C padrão da temperatura.
    const pressSl = document.getElementById('press-slider');
    pressSl.value = 0; // slider é log10(atm); 0 → 10^0 = 1 atm
    document.getElementById('press-val').textContent = '1.00 atm';
    this.sim.T_C=+document.getElementById('temp-slider').value;
    this.sim.P_atm=1.0;
    this.sim.N=+document.getElementById('n-slider').value;
    this.sim.init();
    this._populateDataPanel(entry);
    this._populateAtomLegend(entry);
    this._updateMeasures();
  };

