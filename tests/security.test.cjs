const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

// Lightweight DOM fixture: verifies application logic, not browser rendering.
function app(storage = {}, now = '2026-11-21T21:30:00Z') {
  const nodes = new Map();
  function element(id = '') {
    const classes = new Set();
    const node = { id, value: '', textContent: '', innerHTML: '', style: {}, dataset: {},
      events: {}, attrs: {}, checked: false, selectedOptions: [{textContent:'Morning'}],
      classList: {add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle(c,on) {if(on ?? !classes.has(c)) classes.add(c); else classes.delete(c);}},
      addEventListener(type, fn) {this.events[type]=fn;},
      setAttribute(key,val) {this.attrs[key]=val;}, getAttribute(key) {return this.attrs[key];},
      removeAttribute(key) {delete this.attrs[key];},
      focus() {document.activeElement=this;}, closest() {return this.label;},
      querySelector() {return null;},querySelectorAll() {return [];},
      scrollIntoView() {}, reportValidity() {return true;}, pause() {}, play() {return Promise.reject(new Error('autoplay blocked'));}, load() {}
    };
    return node;
  }
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) nodes.set(match[1], element(match[1]));
  const translated = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(match => {
    const node=element();node.attrs['data-i18n']=match[1];return node;
  });
  const document = { activeElement:null, documentElement:element(),body:element(),events:{},
    getElementById:id=>nodes.get(id) || null,
    querySelector(selector) {const match=selector.match(/^\[data-calc-service="([^"]+)"\]$/);return match?nodes.get('calc:'+match[1]) || null:null;},
    querySelectorAll(selector) {return selector === '[data-i18n]' ? translated : [];},
    addEventListener(type,fn) {this.events[type]=fn;}, title:''
  };
  const opens=[];
  class FixedDate extends Date {constructor(...args) {super(...(args.length?args:[now]));}}
  const context = vm.createContext({document,Date:FixedDate,Intl,console,
    localStorage:{getItem:key=>storage[key] ?? null,setItem:(key,val)=>{storage[key]=val;}},
    window:{open:(...args)=>{opens.push(args);return null;},addEventListener(){}},alert(){},
    setTimeout(){throw new Error('Dispatch must remain synchronous');}
  });
  vm.runInContext(source,context);
  return {run:code=>vm.runInContext(code,context),nodes,document,opens,element,storage,translated};
}

test('all four languages contain every HTML translation key', () => {
  const a=app();
  for(const lang of ['uz','ru','en','ar']) {
    for(const match of html.matchAll(/data-i18n(?:-ph)?="([^"]+)"/g)) assert.equal(a.run(`typeof translations.${lang}[${JSON.stringify(match[1])}]`),'string',`${lang}:${match[1]}`);
    a.run(`setLanguage('${lang}')`);
    assert.equal(a.document.documentElement.attrs.lang,lang);
    assert.equal(a.document.documentElement.attrs.dir,lang==='ar'?'rtl':'ltr');
  }
});
test('invalid and prototype language/currency names are ignored', () => {
  const a=app();a.run("setLanguage('__proto__');setLanguage('constructor');setCurrency('eur')");
  assert.equal(a.run('currentLang'),'uz');assert.equal(a.run('currentCurrency'),'uzs');
});
test('invalid stored preferences fall back safely',()=>{
  const a=app({kd_lang:'<script>',kd_currency:'eur'});
  assert.equal(a.run('currentLang'),'uz');assert.equal(a.run('currentCurrency'),'uzs');
});
test('clinic date uses Tashkent, including UTC date boundaries',()=>{
  assert.equal(app().run('clinicToday()'),'2026-11-22');
  assert.equal(app({},'2026-11-21T18:59:00Z').run('clinicToday()'),'2026-11-21');
});
test('calculator applies discount exactly at two services and preserves focused checkbox',()=>{
  const a=app();
  a.run("toggleCalcItem('plasmalifting')");
  assert.equal(a.nodes.get('calcTotalVal').textContent,a.run('formatPrice(400000,31)'));
  const input=a.element();input.label=a.element();a.nodes.set('calc:filler',input);input.focus();
  a.run("toggleCalcItem('filler')");
  assert.equal(a.nodes.get('calcTotalVal').textContent,a.run('formatPrice(990000,77)'));
  assert.equal(a.nodes.get('calcDiscountNotice').style.display,'flex');assert.equal(a.document.activeElement,input);
  assert.equal(input.checked,true);
  a.run("setCurrency('usd')");assert.equal(a.nodes.get('calcTotalVal').textContent,'$77');
  a.run("toggleCalcItem('filler');toggleCalcItem('plasmalifting');toggleCalcItem('unknown')");
  assert.equal(a.nodes.get('btnCalcBook').disabled,true);assert.equal(a.run('selectedCalcItems.size'),0);
});
test('calculator checkbox has one change handler and no label click handler',()=>{
  const a=app();a.run('renderCalculator();initActions()');
  assert.doesNotMatch(a.nodes.get('calcItemsGrid').innerHTML,/onclick=/);
  const input={matches:()=>true,dataset:{calcService:'filler'}};
  a.nodes.get('calcItemsGrid').events.change({target:input});
  assert.equal(a.run('selectedCalcItems.size'),1);
});
test('dynamic names are escaped before insertion as HTML',()=>{
  const a=app();a.run(`servicesData[0].name.uz='<img src=x onerror=alert(1)>';renderServices();renderCalculator();populateServiceSelect()`);
  for(const id of ['servicesGrid','calcItemsGrid','bookingServiceSelect']) {
    assert.doesNotMatch(a.nodes.get(id).innerHTML,/<img src=x/);assert.match(a.nodes.get(id).innerHTML,/&lt;img/);
  }
});
test('native phone pattern accepts international formats and rejects empty/letters/too few digits',()=>{
  const pattern=html.match(/id="bookPhone"[^>]*pattern="([^"]+)"/)[1];
  const regex=new RegExp(`^(?:${pattern})$`,'v');
  for(const phone of ['+998 90 123 45 67','+1 (212) 555-1234','901234567']) assert.equal(regex.test(phone),true,phone);
  for(const phone of ['       ','+------','abcdefg','+123456','+1234567890123456','1234567<script>']) assert.equal(regex.test(phone),false,phone);
});
test('booking obeys validity before dispatching',()=>{
  const a=app();a.nodes.get('bookName').value=' Test ';
  a.nodes.get('bookingForm').reportValidity=()=>false;
  a.run('handleBookingSubmit({preventDefault(){}})');assert.equal(a.opens.length,0);
  assert.equal(a.nodes.get('bookName').value,'Test');assert.equal(a.nodes.get('bookDate').min,'2026-11-22');
});
test('booking synchronously opens encoded draft with opener protection and fallback',()=>{
  const a=app();
  a.nodes.get('bookName').value=' Test & Name ';
  a.nodes.get('bookPhone').value='+998901234567';a.nodes.get('bookNotes').value='a&b#c? مرحبا';
  a.nodes.get('bookingServiceSelect').value='filler';
  a.run('handleBookingSubmit({preventDefault(){}})');
  assert.equal(a.opens.length,1);
  const [url,target,flags]=a.opens[0];
  assert.equal(target,'_blank');assert.equal(flags,'noopener,noreferrer');
  const parsed=new URL(url);assert.equal(parsed.hostname,'wa.me');assert.equal([...parsed.searchParams].length,1);
  assert.match(parsed.searchParams.get('text'),/Test & Name/);assert.match(parsed.searchParams.get('text'),/a&b#c\? مرحبا/);
  assert.equal(a.nodes.get('whatsappFallback').href,url);
  assert.equal(a.nodes.get('successModal').classList.contains('open'),true);
  a.run('closeSuccessModal()');assert.equal(a.nodes.get('bookName').value,'Test & Name');
});
test('video modal only accepts known local media and handles autoplay rejection',async()=>{
  const a=app();a.run("openVideoModal('https://evil.example/test.mp4')");
  assert.equal(a.nodes.get('videoModal').classList.contains('open'),false);
  a.run('openVideoModal(clinicReels[0].file)');assert.equal(a.nodes.get('videoModal').classList.contains('open'),true);
  await new Promise(resolve=>setImmediate(resolve));a.run('closeVideoModal()');
  assert.equal(a.nodes.get('videoModal').classList.contains('open'),false);
});
test('before/after slider clips the full-size image instead of resizing it',()=>{
  const a=app();a.run('initBeforeAfterSlider()');
  a.nodes.get('baRange').events.input({target:{value:'75'}});
  assert.equal(a.nodes.get('baAfterWrap').style.clipPath,'inset(0 25% 0 0)');
  assert.equal(a.nodes.get('baHandle').style.left,'75%');
});
test('hosting enforces external scripts only and rejects framing',()=>{
  const config=JSON.parse(fs.readFileSync(path.join(root,'firebase.json'),'utf8')).hosting;
  const headers=Object.fromEntries(config.headers[0].headers.map(h=>[h.key,h.value]));
  const script=headers['Content-Security-Policy'].split(';').map(x=>x.trim()).find(x=>x.startsWith('script-src '));
  assert.equal(script,"script-src 'self'");assert.match(headers['Content-Security-Policy'],/frame-ancestors 'none'/);
  assert.equal(headers['X-Content-Type-Options'],'nosniff');assert.equal(headers['Referrer-Policy'],'no-referrer');
  assert.equal(config.public,'public');assert.deepEqual(config.predeploy,['node build.mjs']);assert.equal(config.rewrites,undefined);
  assert.doesNotMatch(html,/\son\w+\s*=|<script(?![^>]*\bsrc=)/i);
});
test('repeatable build includes exactly referenced assets and excludes project data',()=>{
  for(let i=0;i<2;i++) execFileSync(process.execPath,['build.mjs'],{cwd:root});
  const expected=new Set(['index.html','styles.css','script.js']);
  for(const match of html.matchAll(/\bsrc="([^"]+)"/g)) if(!match[1].startsWith('https://')) expected.add(match[1]);
  for(const match of source.matchAll(/\bfile:\s*"([^"]+)"/g)) expected.add(match[1]);
  assert.deepEqual(fs.readdirSync(path.join(root,'public')).sort(),[...expected].sort());
  assert.equal(expected.has('tg_page.html'),false);assert.equal(expected.has('extracted_messages.txt'),false);
});
