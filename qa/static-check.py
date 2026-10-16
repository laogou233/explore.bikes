from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, xml.etree.ElementTree as ET
root=Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.nodes=[];self.feed(text)
    def handle_starttag(self,tag,attrs):self.nodes.append((tag,dict(attrs)))
pages={p.name:Page(p.read_text()) for p in root.glob('*.html')}
errors=[];links=0;anchors=0
for name,page in pages.items():
    ids=[a['id'] for t,a in page.nodes if 'id' in a]
    if len(ids)!=len(set(ids)):errors.append(name+': duplicate IDs')
    headings=[int(t[1]) for t,a in page.nodes if t in ['h1','h2','h3','h4','h5','h6']]
    if headings.count(1)!=1:errors.append(name+': expected one h1')
    if any(b>a+1 for a,b in zip(headings,headings[1:])):errors.append(name+': skipped heading level')
    if not any(t=='meta' and a.get('name')=='description' for t,a in page.nodes):errors.append(name+': missing description')
    if name!='404.html' and not any(t=='link' and a.get('rel')=='canonical' for t,a in page.nodes):errors.append(name+': missing canonical')
    if name in ['picks.html','order.html','404.html'] and not any(t=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content','') for t,a in page.nodes):errors.append(name+': missing noindex')
    for tag,attr in page.nodes:
        if tag=='img' and not attr.get('alt'):errors.append(name+': missing alt')
        for ref in ['aria-labelledby','aria-describedby','aria-controls','for']:
            for id in attr.get(ref,'').split():
                if id not in ids:errors.append(name+': missing ID '+id)
        for key in ['href','src','poster']:
            if key not in attr:continue
            url=urlsplit(attr[key])
            if url.scheme or url.netloc:continue
            target=unquote(url.path).removeprefix('/explore.bikes/') or name
            links+=1
            if not (root/target).is_file():errors.append(name+': missing file '+target)
            if url.fragment:
                anchors+=1
                if target in pages and not any(a.get('id')==unquote(url.fragment) for t,a in pages[target].nodes):errors.append(name+': missing anchor '+attr[key])
locs=[e.text for e in ET.parse(root/'sitemap.xml').getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
expected={'index.html','coastal-tee.html','coastal-hoodie.html','freedom-jersey.html','story.html','journal.html','archive.html','site-map.html'}
actual={u.rsplit('/',1)[-1] or 'index.html' for u in locs}
if actual!=expected:errors.append('sitemap page set mismatch')
if len(locs)!=len(actual):errors.append('duplicate sitemap entries')
if 'Sitemap: https://laogou233.github.io/explore.bikes/sitemap.xml' not in (root/'robots.txt').read_text():errors.append('robots sitemap mismatch')
result={'htmlPages':len(pages),'localLinksAndAssets':links,'fragments':anchors,'sitemapEntries':len(locs),'errors':errors}
(root/'qa/evidence/static-results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
raise SystemExit(bool(errors))
