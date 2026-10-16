// Requires Playwright + Chrome. Serve the repository locally, then node qa/verify.cjs.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=process.env.QA_URL || 'http://127.0.0.1:8765/';
const key='explore-bike-order-draft-v1';
const out=path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const result={testedAt:new Date().toISOString(),browser:'Chrome (Playwright, isolated test profile)',matrix:[],checks:[],errors:[]};
const seed=[{id:'coastal-tee',size:'M',quantity:99},{id:'coastal-hoodie',size:'L',quantity:2},{id:'freedom-jersey',size:'Not sure',quantity:1}];
const pages=['index.html','picks.html','coastal-tee.html','coastal-hoodie.html','freedom-jersey.html','story.html','journal.html','archive.html','site-map.html','404.html'];
const ok=(name,condition=true)=>{assert.ok(condition,name);result.checks.push(name)};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 result.browserVersion=browser.version();
 try {
  const ctx=await browser.newContext({reducedMotion:'reduce'});
  await ctx.addInitScript(({key,seed})=>{if(!sessionStorage.getItem('qa-seeded')){localStorage.setItem(key,JSON.stringify(seed));sessionStorage.setItem('qa-seeded','1')}},{key,seed});
  for(const width of [375,390,430,768,1280,1440,1728]) {
   const page=await ctx.newPage();await page.setViewportSize({width,height:900});
   page.on('pageerror',e=>result.errors.push({type:'pageerror',width,message:e.message}));
   for(const file of pages) {
    await page.goto(base+file,{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('details.piece-save').evaluateAll(es=>es.forEach(e=>e.open=true));
    await page.evaluate(async()=>{for(const img of document.images){if(img.loading!=='lazy')await img.decode().catch(()=>{})}});
    const metrics=await page.evaluate(()=>{
     const nodes=[...document.querySelectorAll('main,header,footer,h1,h2,h3,p,button,select,.order-row,.product-info,.journal-card,.archive-item')];
     const overflow=nodes.filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.left < -1 || r.right >innerWidth+1)}).map(e=>e.tagName+'.'+e.className);
     const clipped=[...document.querySelectorAll('button,h1,h2,h3,select')].filter(e=>e.clientWidth>0&&e.scrollWidth>e.clientWidth+2).map(e=>e.tagName+'.'+e.className);
     return {documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,overflow,clipped,h1:document.querySelectorAll('h1').length};
    });
    assert.equal(metrics.documentWidth,width,`${file} ${width}: page overflow`);
    assert.deepEqual(metrics.overflow,[],`${file} ${width}: element overflow`);
    assert.deepEqual(metrics.clipped,[],`${file} ${width}: clipped controls/headings`);
    assert.equal(metrics.h1,1,`${file}: exactly one h1`);
    let menu='desktop';
    if(width<=430){
     await page.locator('.menu-button').click();
     const clear=await page.evaluate(()=>document.querySelector('main').getBoundingClientRect().top>=document.querySelector('.site-nav').getBoundingClientRect().bottom-1);
     ok(`${file} ${width}: menu pushes content`,clear);
     await page.keyboard.press('Escape');
     ok(`${file} ${width}: Escape restores focus`,await page.locator('.menu-button').evaluate(e=>document.activeElement===e&&e.getAttribute('aria-expanded')==='false'));
     menu='expanded / Escape checked';
    }
    result.matrix.push({file,width,...metrics,menu});
    if([375,1440].includes(width)&&['index.html','picks.html','coastal-tee.html','story.html','journal.html','archive.html'].includes(file)) {
     await page.evaluate(()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager')});
     await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
     await page.screenshot({path:path.join(out,`${file.replace('.html','')}-${width}.png`),fullPage:true});
    }
   }
   await page.close();
  }
  await ctx.close();
  const functional=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
  const p=await functional.newPage();p.on('pageerror',e=>result.errors.push({type:'functional',message:e.message}));
  await p.goto(base+'picks.html');ok('Empty state',await p.locator('#empty-order').isVisible());
  await p.goto(base+'index.html');
  await p.locator('#coastal-tee summary').click();
  await p.locator('#tee-size').selectOption('M');await p.locator('#coastal-tee button[type=submit]').click();
  ok('Home Save + toast',await p.locator('.toast').textContent()==='Coastal Tee saved to your picks.');
  ok('Home count = 1',await p.locator('[data-cart-count]').textContent()==='1');
  await p.reload();ok('LocalStorage persists reload',await p.locator('[data-cart-count]').textContent()==='1');
  const observer=await functional.newPage();await observer.goto(base+'picks.html');
  await p.goto(base+'coastal-tee.html');
  await p.locator('input[name=size][value=M]').check();await p.locator('[name=quantity]').fill('98');await p.locator('button[type=submit]').click();
  await observer.waitForFunction(()=>document.querySelector('[data-summary-count]').textContent==='99');ok('Cross-tab storage synchronization');
  await p.locator('input[name=size][value=M]').check();await p.locator('button[type=submit]').click();
  ok('99 upper bound',await p.locator('.toast').textContent()==='Maximum quantity reached for this size.');
  ok('Invalid quantity HTML validation',await p.locator('[name=quantity]').evaluate(e=>{e.value='100';return !e.checkValidity()}));
  for(const view of ['detail','construction','front']) {await p.locator(`[data-view="${view}"].detail-view-button`).click();ok(`Gallery ${view}`,await p.locator('.detail-stage').getAttribute('data-view')===view)}
  await observer.locator('[data-action=decrease]').click();ok('Quantity rerender keeps keyboard focus',await observer.locator('[data-action=decrease]').evaluate(e=>e===document.activeElement));
  await observer.bringToFront();await observer.locator('#copy-summary').click();await observer.waitForFunction(()=>document.querySelector('#copy-status').textContent!=='');ok('Copy success status',(await observer.locator('#copy-status').textContent()).startsWith('Summary copied'));
  const copied=await observer.evaluate(()=>navigator.clipboard.readText());ok('Copied list is My Picks / not order',copied.includes('Explore — My Picks')&&copied.includes('No order has been submitted.'));
  await observer.locator('[data-action=remove]').click();ok('Removing last item restores empty CTA focus',await observer.locator('#empty-order a').evaluate(e=>document.activeElement===e));
  await p.goto(base+'index.html?category=hoodies#collection');ok('Category URL deep link',await p.locator('.product-card:visible').count()===1&&await p.locator('#coastal-hoodie').isVisible());
  await p.locator('[data-category-filter=jerseys]').click();ok('Category button updates URL',p.url().includes('category=jerseys')&&await p.locator('#freedom-jersey').isVisible());
  await p.locator('[data-category-filter=all]').click();ok('All category restores 3 products',await p.locator('.product-card:visible').count()===3);
  const invalid=[{id:'missing',size:'M',quantity:1},{id:'coastal-tee',size:'invalid',quantity:1},{id:'coastal-tee',size:'M',quantity:0},{id:'coastal-tee',size:'M',quantity:100},{id:'coastal-tee',size:'M',quantity:1.5},{id:'__proto__',size:'M',quantity:1},{id:'coastal-tee',size:'M',quantity:70},{id:'coastal-tee',size:'M',quantity:60}];
  await p.evaluate(({key,invalid})=>localStorage.setItem(key,JSON.stringify(invalid)),{key,invalid});await p.goto(base+'picks.html');
  ok('Product / size / quantity validation and duplicate cap',await p.locator('.order-row').count()===1&&await p.locator('[data-summary-count]').textContent()==='99');
  for(const corrupt of ['not json','{}','null']) {await p.evaluate(({key,corrupt})=>localStorage.setItem(key,corrupt),{key,corrupt});await p.reload();ok(`Corrupt storage recovery: ${corrupt}`,await p.locator('#empty-order').isVisible())}
  await p.evaluate(({key,seed})=>localStorage.setItem(key,JSON.stringify(seed)),{key,seed});
  await p.goto(base+'order.html');await p.waitForURL('**/picks.html');ok('Legacy order.html redirects and preserves picks',await p.locator('.order-row').count()===3);
  await p.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','QuotaExceededError')}});await p.locator('[data-action=decrease]').first().click();
  ok('Storage failure is visible and list unchanged',(await p.locator('.toast').textContent()).includes('could not update your picks')&&await p.locator('[data-summary-count]').textContent()==='102');
  await p.reload();await p.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('denied')}});await p.locator('#copy-summary').click();ok('Clipboard denial is visible',(await p.locator('#copy-status').textContent()).includes('Could not copy'));
  await functional.close();
  for(const mode of ['reducedMotion','saveData','default']) {
   const ctx=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:mode==='reducedMotion'?'reduce':'no-preference'});
   if(mode==='saveData')await ctx.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,addEventListener(){}}}));
   const p=await ctx.newPage();let videoRequests=0;p.on('request',r=>{if(r.url().includes('.mp4'))videoRequests++});await p.goto(base+'index.html');
   if(mode!=='default'){await p.waitForTimeout(400);ok(`${mode}: poster only / zero video requests`,videoRequests===0&&await p.locator('video').evaluate(v=>v.paused))}
   else {await p.waitForFunction(()=>!document.querySelector('video').paused);ok('Visible hero autoplays muted',await p.locator('video').evaluate(v=>v.muted));await p.locator('footer').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('video').paused);ok('Video pauses outside viewport');await p.locator('video').scrollIntoViewIfNeeded();await p.waitForFunction(()=>!document.querySelector('video').paused);await p.locator('.hero-motion-toggle').click();ok('Manual video pause',await p.locator('video').evaluate(v=>v.paused));}
   await ctx.close();
  }
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:850}});const n=await nojs.newPage();await n.goto(base+'index.html');ok('No-JS mobile navigation stays visible',await n.locator('.site-nav').isVisible());ok('No-JS save limitation disclosed',await n.locator('noscript').isVisible());await nojs.close();
  assert.deepEqual(result.errors,[],'No browser exceptions');
 } catch(e) {result.errors.push({type:'assertion',message:e.message,stack:e.stack});console.error(e)}
 finally {await browser.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({matrix:result.matrix.length,checks:result.checks.length,errors:result.errors},null,2));if(result.errors.length)process.exitCode=1}
})();
