/* ==================== STATE ==================== */
let sidebarCollapsed = false;
let chatOpen = false;
let notifOpen = false;
let profileOpen = false;
let currentLang = 'EN';
let trafficData = Array.from({length: 60}, () => Math.floor(Math.random() * 300 + 100));
let activityEventCount = 248;
const charts = {};

/* ==================== DATA ==================== */
const platforms = [
  {id:'instagram', name:'Instagram', icon:'fa-brands fa-instagram', color:'#E4405F'},
  {id:'facebook', name:'Facebook', icon:'fa-brands fa-facebook-f', color:'#1877F2'},
  {id:'tiktok', name:'TikTok', icon:'fa-brands fa-tiktok', color:'#00f2ea'},
  {id:'twitter', name:'X', icon:'fa-brands fa-x-twitter', color:'#eff3f4'},
  {id:'linkedin', name:'LinkedIn', icon:'fa-brands fa-linkedin-in', color:'#0A66C2'},
  {id:'youtube', name:'YouTube', icon:'fa-brands fa-youtube', color:'#FF0000'}
];

const activityTemplates = [
  {type:'like', icon:'fa-solid fa-heart', color:'text-nx-pink', tpl:'liked your post on {platform}'},
  {type:'comment', icon:'fa-solid fa-comment', color:'text-nx-cyan', tpl:'commented on {platform}: "{text}"'},
  {type:'share', icon:'fa-solid fa-share', color:'text-nx-green', tpl:'shared your {platform} story'},
  {type:'mention', icon:'fa-solid fa-at', color:'text-nx-amber', tpl:'mentioned you on {platform}'},
  {type:'follow', icon:'fa-solid fa-user-plus', color:'text-nx-cyan', tpl:'started following you on {platform}'}
];
const commentTexts = ['Amazing content!','Love this approach','So insightful','Can you share more?','This is fire','Great strategy','Need to try this','Incredible results'];
const hashtags = ['#SocialMediaAI','#ContentStrategy','#ViralMarketing','#DigitalGrowth','#EngagementHacks','#AnalyticsPro','#AIContent','#TrendingNow','#GrowthHacking','#BrandBuilding'];

const topPosts = [
  {title:'Behind the scenes of our latest product launch', platform:'instagram', likes:24500, comments:892, shares:1200, img:'launch1', ctr:'6.2%'},
  {title:'5 strategies that doubled our engagement rate', platform:'linkedin', likes:18300, comments:654, shares:3400, img:'strategy2', ctr:'8.7%'},
  {title:'The future of AI in content creation', platform:'tiktok', likes:89200, comments:4200, shares:15600, img:'aifuture', ctr:'4.1%'},
  {title:'Quick tutorial: Advanced analytics walkthrough', platform:'youtube', likes:32100, comments:1800, shares:2800, img:'tutorial3', ctr:'5.5%'},
  {title:'Our team retreat highlights and key takeaways', platform:'facebook', likes:12800, comments:420, shares:890, img:'retreat4', ctr:'3.8%'}
];
const videoMetrics = [
  {title:'Product Launch Teaser', views:'1.2M', watchTime:'4:32 avg', retention:'78%', completion:'62%', img:'vid1'},
  {title:'How-To Tutorial Series', views:'890K', watchTime:'6:18 avg', retention:'65%', completion:'48%', img:'vid2'},
  {title:'Customer Testimonial Reel', views:'456K', watchTime:'2:45 avg', retention:'82%', completion:'71%', img:'vid3'},
  {title:'Behind the Scenes Vlog', views:'234K', watchTime:'3:55 avg', retention:'58%', completion:'39%', img:'vid4'}
];
const viralContent = [
  {title:'AI predicts next viral trend', velocity:'+2.4K/hr', platform:'tiktok', score:97, img:'viral1'},
  {title:'Unboxing experience gone wrong', velocity:'+1.8K/hr', platform:'youtube', score:92, img:'viral2'},
  {title:'Employee dance challenge', velocity:'+1.2K/hr', platform:'instagram', score:88, img:'viral3'}
];
const campaigns = [
  {name:'Summer Launch 2025', platform:'instagram', spent:'$12,400', budget:'$20,000', roi:'340%', status:'active', progress:62},
  {name:'Brand Awareness Push', platform:'tiktok', spent:'$8,200', budget:'$15,000', roi:'280%', status:'active', progress:55},
  {name:'Lead Gen Campaign', platform:'linkedin', spent:'$4,100', budget:'$10,000', roi:'520%', status:'active', progress:41}
];
const funnelData = [
  {stage:'Impressions', value:67340000, color:'from-nx-cyan/40 to-nx-cyan/10'},
  {stage:'Clicks', value:2340000, color:'from-nx-cyan/50 to-nx-cyan/15'},
  {stage:'Engagements', value:890000, color:'from-nx-pink/40 to-nx-pink/10'},
  {stage:'Leads', value:45000, color:'from-nx-pink/50 to-nx-pink/15'},
  {stage:'Conversions', value:8200, color:'from-nx-green/40 to-nx-green/10'}
];
const teamMembers = [
  {name:'Sarah Kim', role:'Content Lead', img:'sarah', action:'Published 3 posts', time:'2m ago', status:'online'},
  {name:'Marcus Lee', role:'Analytics Manager', img:'marcus', action:'Updated dashboard filters', time:'8m ago', status:'online'},
  {name:'Priya Patel', role:'Social Strategist', img:'priya', action:'Scheduled 12 posts', time:'15m ago', status:'away'},
  {name:'Jake Torres', role:'Video Editor', img:'jake', action:'Uploaded 2 videos', time:'32m ago', status:'offline'}
];
const tasks = [
  {text:'Review Q3 campaign creatives', assignee:'Sarah K.', priority:'high', done:false},
  {text:'Finalize TikTok content calendar', assignee:'Priya P.', priority:'medium', done:false},
  {text:'Export monthly analytics report', assignee:'Marcus L.', priority:'low', done:true},
  {text:'Approve YouTube thumbnail designs', assignee:'Jake T.', priority:'medium', done:false}
];
const aiSuggestions = [
  {type:'time', icon:'fa-solid fa-clock', color:'text-nx-cyan', title:'Optimal Posting Window', desc:'Post on Instagram between 6:00-7:30 PM EST today for 2.3x higher engagement based on your audience activity patterns.', confidence:'94%'},
  {type:'content', icon:'fa-solid fa-pen-fancy', color:'text-nx-pink', title:'Content Recommendation', desc:'Your audience responds strongly to behind-the-scenes content. Consider a series showing your product development process — predicted +45% engagement.', confidence:'89%'},
  {type:'platform', icon:'fa-solid fa-arrow-trend-up', color:'text-nx-green', title:'Growth Opportunity', desc:'TikTok short-form tutorials are trending in your niche. Allocating 20% more budget could yield 3.1x follower growth this month.', confidence:'91%'},
  {type:'crisis', icon:'fa-solid fa-shield', color:'text-nx-amber', title:'Risk Alert', desc:'Sentiment analysis detected a slight negative shift on X (Twitter) regarding your recent pricing changes. Recommended: proactive response post within 4 hours.', confidence:'87%'}
];
const aiPredictions = [
  {metric:'Follower Growth', current:'246.8K', predicted:'312.4K', change:'+26.6%', timeline:'Next 30 days', trend:'up'},
  {metric:'Engagement Rate', current:'4.82%', predicted:'5.14%', change:'+6.6%', timeline:'Next 30 days', trend:'up'},
  {metric:'Viral Content Probability', current:'12%', predicted:'28%', change:'+133%', timeline:'Next 7 days', trend:'up'},
  {metric:'Churn Risk', current:'2.1%', predicted:'3.4%', change:'+61%', timeline:'Next 14 days', trend:'down'}
];
const notifications = [
  {icon:'fa-solid fa-chart-line', color:'text-nx-cyan', title:'Milestone Reached', desc:'Instagram followers hit 1M', time:'5m ago', unread:true},
  {icon:'fa-solid fa-triangle-exclamation', color:'text-nx-amber', title:'Budget Alert', desc:'TikTok campaign at 82% spend', time:'18m ago', unread:true},
  {icon:'fa-solid fa-fire', color:'text-nx-pink', title:'Viral Content', desc:'TikTok video trending #4', time:'42m ago', unread:true},
  {icon:'fa-solid fa-check-circle', color:'text-nx-green', title:'Post Approved', desc:'LinkedIn article approved by team', time:'1h ago', unread:false},
  {icon:'fa-solid fa-robot', color:'text-nx-cyan', title:'AI Insight', desc:'New audience segment identified', time:'2h ago', unread:false}
];

/* ==================== UTILITIES ==================== */
function formatNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}
function formatFullNum(n) { return n.toLocaleString(); }
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }

function animateCounter(el, target, duration, decimals = 0, suffix = '') {
  const start = performance.now();
  const initial = 0;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = initial + (target - initial) * ease;
    el.textContent = (decimals > 0 ? val.toFixed(decimals) : formatFullNum(Math.floor(val))) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function showToast(msg, type = 'info') {
  const colors = { info: 'border-nx-cyan/30 text-nx-cyan', success: 'border-nx-green/30 text-nx-green', warning: 'border-nx-amber/30 text-nx-amber', error: 'border-nx-pink/30 text-nx-pink' };
  const icons = { info: 'fa-circle-info', success: 'fa-circle-check', warning: 'fa-triangle-exclamation', error: 'fa-circle-xmark' };
  const toast = document.createElement('div');
  toast.className = `toast glass border ${colors[type]} px-4 py-3 flex items-center gap-3 text-xs min-w-[280px]`;
  toast.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span class="text-nx-text flex-1">${msg}</span>`;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ==================== CHARTS ==================== */
function initCharts() {
  Chart.defaults.color = '#64748b';
  Chart.defaults.borderColor = 'rgba(0,240,255,0.05)';
  Chart.defaults.font.family = 'DM Sans';
  Chart.defaults.font.size = 10;

  // Follower Growth
  const fCtx = document.getElementById('followerChart').getContext('2d');
  const fGrad1 = fCtx.createLinearGradient(0, 0, 0, 220);
  fGrad1.addColorStop(0, 'rgba(0,240,255,0.15)');
  fGrad1.addColorStop(1, 'rgba(0,240,255,0.0)');
  const fGrad2 = fCtx.createLinearGradient(0, 0, 0, 220);
  fGrad2.addColorStop(0, 'rgba(255,45,111,0.12)');
  fGrad2.addColorStop(1, 'rgba(255,45,111,0.0)');
  const fGrad3 = fCtx.createLinearGradient(0, 0, 0, 220);
  fGrad3.addColorStop(0, 'rgba(0,255,136,0.1)');
  fGrad3.addColorStop(1, 'rgba(0,255,136,0.0)');
  charts.follower = new Chart(fCtx, {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [
        {label:'Instagram', data:[1020000,1025000,1032000,1038000,1045000,1051000,1058000], borderColor:'#00f0ff', backgroundColor:fGrad1, fill:true, tension:0.4, borderWidth:2, pointRadius:0, pointHoverRadius:5, pointHoverBackgroundColor:'#00f0ff'},
        {label:'TikTok', data:[580000,588000,595000,604000,615000,622000,631000], borderColor:'#ff2d6f', backgroundColor:fGrad2, fill:true, tension:0.4, borderWidth:2, pointRadius:0, pointHoverRadius:5, pointHoverBackgroundColor:'#ff2d6f'},
        {label:'YouTube', data:[420000,422000,425000,428000,431000,434000,438000], borderColor:'#00ff88', backgroundColor:fGrad3, fill:true, tension:0.4, borderWidth:2, pointRadius:0, pointHoverRadius:5, pointHoverBackgroundColor:'#00ff88'}
      ]
    },
    options: { responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false}, plugins:{legend:{position:'top',align:'end',labels:{usePointStyle:true,pointStyle:'circle',boxWidth:6,padding:15,font:{size:10}}},tooltip:{backgroundColor:'rgba(6,10,19,0.95)',borderColor:'rgba(0,240,255,0.15)',borderWidth:1,titleFont:{size:11},bodyFont:{size:10},padding:10,cornerRadius:8,callbacks:{label:function(c){return c.dataset.label+': '+formatFullNum(c.raw)+' followers'}}}},scales:{x:{grid:{display:false},ticks:{font:{size:9}}},y:{grid:{color:'rgba(0,240,255,0.03)'},ticks:{font:{size:9},callback:v=>formatNum(v)}}},animation:{duration:1200,easing:'easeOutQuart'}}
  });

  // Engagement Bar Chart
  charts.engagement = new Chart(document.getElementById('engagementChart'), {
    type: 'bar',
    data: {
      labels: ['Instagram','Facebook','TikTok','X','LinkedIn','YouTube'],
      datasets: [
        {label:'Likes', data:[24500,12300,89200,8900,5600,32100], backgroundColor:'rgba(0,240,255,0.6)', borderRadius:4, barPercentage:0.6},
        {label:'Comments', data:[890,420,4200,680,340,1800], backgroundColor:'rgba(255,45,111,0.6)', borderRadius:4, barPercentage:0.6},
        {label:'Shares', data:[1200,680,15600,1200,3400,2800], backgroundColor:'rgba(0,255,136,0.5)', borderRadius:4, barPercentage:0.6}
      ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom',labels:{usePointStyle:true,pointStyle:'circle',boxWidth:6,padding:12,font:{size:9}}},tooltip:{backgroundColor:'rgba(6,10,19,0.95)',borderColor:'rgba(0,240,255,0.15)',borderWidth:1,cornerRadius:8,padding:10,callbacks:{label:function(c){return c.dataset.label+': '+formatFullNum(c.raw)}}}},scales:{x:{grid:{display:false},ticks:{font:{size:8}}},y:{grid:{color:'rgba(0,240,255,0.03)'},ticks:{font:{size:9},callback:v=>formatNum(v)}}},animation:{duration:1000,easing:'easeOutQuart'}}
  });

  // Demographics Doughnut
  const demoColors = ['#00f0ff','#ff2d6f','#00ff88','#ffaa00','#a78bfa','#f472b6'];
  const demoData = [28,22,18,15,10,7];
  const demoLabels = ['18-24','25-34','35-44','45-54','55-64','65+'];
  charts.demo = new Chart(document.getElementById('demoChart'), {
    type: 'doughnut',
    data: { labels:demoLabels, datasets:[{data:demoData, backgroundColor:demoColors, borderColor:'rgba(6,10,19,0.8)', borderWidth:2, hoverOffset:6}] },
    options: { responsive:true, maintainAspectRatio:true, cutout:'65%', plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(6,10,19,0.95)',borderColor:'rgba(0,240,255,0.15)',borderWidth:1,cornerRadius:8,padding:10,callbacks:{label:function(c){return c.label+': '+c.raw+'%'}}}},animation:{animateRotate:true,duration:1200}}
  });
  // Legend
  const legendEl = document.getElementById('demoLegend');
  demoLabels.forEach((l,i) => {
    legendEl.innerHTML += `<div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-sm flex-shrink-0" style="background:${demoColors[i]}"></div><span class="text-nx-muted">${l}</span><span class="font-semibold text-white ml-auto">${demoData[i]}%</span></div>`;
  });

  // Real-time Traffic
  const tCtx = document.getElementById('trafficChart').getContext('2d');
  const tGrad = tCtx.createLinearGradient(0, 0, 0, 80);
  tGrad.addColorStop(0, 'rgba(0,240,255,0.2)');
  tGrad.addColorStop(1, 'rgba(0,240,255,0.0)');
  charts.traffic = new Chart(tCtx, {
    type: 'line',
    data: {
      labels: trafficData.map((_,i) => i),
      datasets: [{data:[...trafficData], borderColor:'#00f0ff', backgroundColor:tGrad, fill:true, tension:0.3, borderWidth:1.5, pointRadius:0}]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{display:false},y:{display:false,min:0}},animation:{duration:0},elements:{line:{borderCapStyle:'round'}}}
  });
}

/* ==================== HEATMAP ==================== */
function buildHeatmap() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const grid = document.getElementById('heatmapGrid');
  // Pre-computed engagement data (higher on weekdays 9-11am and 6-9pm)
  const data = days.map((_, d) => Array.from({length:24}, (_, h) => {
    let base = 0.1;
    if (h >= 9 && h <= 11) base += 0.5 + (d < 5 ? 0.3 : 0.1);
    if (h >= 18 && h <= 21) base += 0.6 + (d < 5 ? 0.2 : 0.3);
    if (h >= 12 && h <= 14) base += 0.2;
    if (h >= 0 && h <= 5) base -= 0.05;
    base += Math.random() * 0.15;
    return Math.max(0, Math.min(1, base));
  }));
  grid.innerHTML = '';
  days.forEach((day, d) => {
    const row = document.createElement('div');
    row.className = 'flex gap-1 items-center';
    row.innerHTML = `<div class="w-6 text-[8px] text-nx-muted text-right pr-1">${day}</div>`;
    const cellsWrap = document.createElement('div');
    cellsWrap.className = 'flex-1 grid grid-cols-12 gap-px';
    data[d].forEach((val, h) => {
      // Each cell represents 2 hours (12 cells for 24 hours)
      const avgVal = (data[d][h*2] !== undefined ? data[d][h*2] : val);
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.style.background = `rgba(0,240,255,${Math.max(0.03, val)})`;
      cell.title = `${day} ${h*2}:00 - ${Math.min(24,h*2+2)}:00\nEngagement: ${Math.round(val*100)}%`;
      cellsWrap.appendChild(cell);
    });
    row.appendChild(cellsWrap);
    grid.appendChild(row);
  });
}

/* ==================== LIVE FEED ==================== */
function generateActivity() {
  const tmpl = pick(activityTemplates);
  const plat = pick(platforms);
  return {
    ...tmpl,
    platform: plat.name,
    platformIcon: plat.icon,
    platformColor: plat.color,
    text: pick(commentTexts),
    time: 'just now'
  };
}
function addLiveActivity() {
  const feed = document.getElementById('liveFeed');
  const a = generateActivity();
  const div = document.createElement('div');
  div.className = 'feed-item flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] transition-colors';
  div.innerHTML = `
    <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style="background:${a.platformColor}15">
      <i class="${a.platformIcon} text-[10px]" style="color:${a.platformColor}"></i>
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-[11px] text-nx-text leading-relaxed"><span class="${a.color}"><i class="${a.icon} text-[9px]"></i></span> ${a.tpl.replace('{platform}','<span class="font-medium text-white">'+a.platform+'</span>').replace('{text}',a.text)}</div>
      <div class="text-[9px] text-nx-muted mt-0.5">${a.time}</div>
    </div>`;
  feed.insertBefore(div, feed.firstChild);
  if (feed.children.length > 20) feed.removeChild(feed.lastChild);
  activityEventCount++;
  document.getElementById('activityCount').textContent = activityEventCount + ' events';
}
function initTrendingHashtags() {
  const el = document.getElementById('trendingHashtags');
  const shuffled = [...hashtags].sort(() => Math.random() - 0.5).slice(0, 6);
  el.innerHTML = shuffled.map(h => `<span class="flex-shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-nx-cyan/5 text-nx-cyan border border-nx-cyan/10 whitespace-nowrap">${h}</span>`).join('');
}

/* ==================== CONTENT SECTIONS ==================== */
function renderTopPosts() {
  document.getElementById('contentPosts').innerHTML = topPosts.map((p, i) => {
    const plat = platforms.find(x => x.id === p.platform);
    return `<div class="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors group">
      <img src="https://picsum.photos/seed/${p.img}/56/56.jpg" class="w-14 h-14 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform" alt="">
      <div class="flex-1 min-w-0">
        <div class="text-xs font-medium text-white truncate">${p.title}</div>
        <div class="flex items-center gap-2 mt-1">
          <span class="platform-icon text-[9px]" style="background:${plat.color}15;color:${plat.color}"><i class="${plat.icon}"></i></span>
          <span class="text-[9px] text-nx-muted"><i class="fa-solid fa-heart text-nx-pink text-[8px]"></i> ${formatNum(p.likes)}</span>
          <span class="text-[9px] text-nx-muted"><i class="fa-solid fa-comment text-nx-cyan text-[8px]"></i> ${formatNum(p.comments)}</span>
          <span class="text-[9px] text-nx-muted"><i class="fa-solid fa-share text-nx-green text-[8px]"></i> ${formatNum(p.shares)}</span>
        </div>
      </div>
      <div class="text-right flex-shrink-0"><div class="text-xs font-bold text-nx-cyan">${p.ctr}</div><div class="text-[9px] text-nx-muted">CTR</div></div>
    </div>`;
  }).join('');
}
function renderVideoMetrics() {
  document.getElementById('contentVideos').innerHTML = videoMetrics.map(v => `
    <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
      <img src="https://picsum.photos/seed/${v.img}/64/40.jpg" class="w-16 h-10 rounded-lg object-cover flex-shrink-0" alt="">
      <div class="flex-1 min-w-0"><div class="text-xs font-medium text-white truncate">${v.title}</div><div class="text-[9px] text-nx-muted mt-0.5">${v.views} views &middot; ${v.watchTime}</div></div>
      <div class="flex gap-3 flex-shrink-0 text-center"><div><div class="text-[11px] font-bold text-nx-green">${v.retention}</div><div class="text-[8px] text-nx-muted">Retention</div></div><div><div class="text-[11px] font-bold text-nx-cyan">${v.completion}</div><div class="text-[8px] text-nx-muted">Completion</div></div></div>
    </div>`).join('');
}
function renderViralTracker() {
  document.getElementById('contentViral').innerHTML = viralContent.map(v => {
    const plat = platforms.find(x => x.id === v.platform);
    return `<div class="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
      <img src="https://picsum.photos/seed/${v.img}/56/56.jpg" class="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="">
      <div class="flex-1 min-w-0">
        <div class="text-xs font-medium text-white truncate">${v.title}</div>
        <div class="flex items-center gap-2 mt-1"><span class="platform-icon text-[9px]" style="background:${plat.color}15;color:${plat.color}"><i class="${plat.icon}"></i></span><span class="text-[9px] text-nx-green font-semibold"><i class="fa-solid fa-arrow-up text-[8px]"></i> ${v.velocity}</span></div>
      </div>
      <div class="text-right flex-shrink-0"><div class="text-lg font-display font-bold ${v.score>=95?'text-nx-green':v.score>=90?'text-nx-cyan':'text-nx-amber'}">${v.score}</div><div class="text-[8px] text-nx-muted">Viral Score</div></div>
    </div>`;
  }).join('');
}
function renderCampaigns() {
  document.getElementById('campActive').innerHTML = campaigns.map(c => {
    const plat = platforms.find(x => x.id === c.platform);
    return `<div class="glass-sm p-3">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2"><span class="platform-icon text-[9px]" style="background:${plat.color}15;color:${plat.color}"><i class="${plat.icon}"></i></span><span class="text-xs font-semibold text-white">${c.name}</span></div>
        <span class="badge bg-nx-green/10 text-nx-green">Active</span>
      </div>
      <div class="flex items-center justify-between text-[10px] text-nx-muted mb-2"><span>${c.spent} / ${c.budget}</span><span class="text-nx-green font-semibold">ROI: ${c.roi}</span></div>
      <div class="h-1.5 bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-nx-cyan to-nx-green rounded-full transition-all duration-1000" style="width:${c.progress}%"></div></div>
    </div>`;
  }).join('');
}
function renderFunnel() {
  const maxVal = funnelData[0].value;
  document.getElementById('campFunnel').innerHTML = funnelData.map(f => `
    <div class="flex items-center gap-3">
      <div class="w-20 text-[10px] text-nx-muted text-right flex-shrink-0">${f.stage}</div>
      <div class="flex-1 h-8 relative"><div class="funnel-bar h-full bg-gradient-to-r ${f.color}" style="width:${Math.max(8, (f.value/maxVal)*100)}%"></div></div>
      <div class="w-20 text-[11px] font-semibold text-white text-right flex-shrink-0">${formatNum(f.value)}</div>
    </div>`).join('');
  // Trigger animation
  setTimeout(() => { document.querySelectorAll('.funnel-bar').forEach(b => { const w = b.style.width; b.style.width = '0%'; requestAnimationFrame(() => { b.style.width = w; }); }); }, 50);
}
function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const scheduled = [3,7,10,14,18,21,25,28];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  let html = `<div class="text-xs font-semibold text-white mb-3">${monthNames[month]} ${year}</div>`;
  html += `<div class="grid grid-cols-7 gap-1 text-center mb-1">${dayNames.map(d => `<div class="text-[8px] text-nx-muted py-1">${d}</div>`).join('')}</div>`;
  html += '<div class="grid grid-cols-7 gap-1">';
  for (let i = 0; i < firstDay; i++) html += '<div></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === now.getDate();
    const isScheduled = scheduled.includes(d);
    html += `<div class="aspect-square rounded-lg flex items-center justify-center text-[10px] relative cursor-pointer transition-colors ${isToday ? 'bg-nx-cyan/20 text-nx-cyan font-bold' : 'text-nx-muted hover:bg-white/5'}">${d}${isScheduled ? '<div class="absolute bottom-0.5 w-1 h-1 rounded-full bg-nx-pink"></div>' : ''}</div>`;
  }
  html += '</div>';
  document.getElementById('campCalendar').innerHTML = html;
}
function renderTeam() {
  document.getElementById('teamActivity').innerHTML = teamMembers.map(m => {
    const statusColors = { online: 'bg-nx-green', away: 'bg-nx-amber', offline: 'bg-nx-muted' };
    return `<div class="flex items-center gap-3">
      <div class="relative flex-shrink-0"><img src="https://picsum.photos/seed/${m.img}/32/32.jpg" class="w-8 h-8 rounded-full object-cover" alt=""><div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-nx-card ${statusColors[m.status]}"></div></div>
      <div class="flex-1 min-w-0"><div class="text-[11px] font-medium text-white">${m.name} <span class="text-nx-muted font-normal text-[9px]">${m.role}</span></div><div class="text-[9px] text-nx-muted truncate">${m.action}</div></div>
      <span class="text-[9px] text-nx-muted flex-shrink-0">${m.time}</span>
    </div>`;
  }).join('');
  document.getElementById('taskList').innerHTML = tasks.map((t, i) => {
    const prioColors = { high: 'bg-nx-pink/10 text-nx-pink', medium: 'bg-nx-amber/10 text-nx-amber', low: 'bg-nx-cyan/10 text-nx-cyan' };
    return `<div class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer" onclick="toggleTask(${i})">
      <div class="w-4 h-4 rounded border ${t.done ? 'bg-nx-cyan/20 border-nx-cyan' : 'border-nx-border'} flex items-center justify-center flex-shrink-0">${t.done ? '<i class="fa-solid fa-check text-nx-cyan text-[7px]"></i>' : ''}</div>
      <span class="text-[11px] ${t.done ? 'text-nx-muted line-through' : 'text-nx-text'} flex-1">${t.text}</span>
      <span class="badge ${prioColors[t.priority]} text-[8px]">${t.priority}</span>
    </div>`;
  }).join('');
}
function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  renderTeam();
  showToast(tasks[i].done ? 'Task completed' : 'Task reopened', tasks[i].done ? 'success' : 'info');
}
function renderAISuggestions() {
  document.getElementById('aiSuggestions').innerHTML = aiSuggestions.map(s => `
    <div class="glass-sm p-4 hover:border-nx-cyan/20 transition-colors cursor-pointer group">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-nx-cyan/10 transition-colors"><i class="${s.icon} ${s.color} text-xs"></i></div>
        <div class="flex-1">
          <div class="flex items-center gap-2"><span class="text-xs font-semibold text-white">${s.title}</span><span class="badge bg-nx-green/10 text-nx-green text-[8px]">${s.confidence} confidence</span></div>
          <p class="text-[11px] text-nx-muted mt-1 leading-relaxed">${s.desc}</p>
        </div>
        <button class="text-nx-muted hover:text-nx-cyan text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><i class="fa-solid fa-arrow-right"></i></button>
      </div>
    </div>`).join('');
}
function renderAIHashtags() {
  const groups = [
    {label:'High Impact', tags:['#AIContentCreation','#SocialMediaStrategy','#DigitalMarketing2025','#ContentCreatorTips','#ViralGrowthHacks'], color:'text-nx-green'},
    {label:'Trending Now', tags:['#ShortFormVideo','#ReelsStrategy','#LinkedInGrowth','#TikTokAlgorithm','#BrandStorytelling'], color:'text-nx-cyan'},
    {label:'Niche Specific', tags:['#SaaSMarketing','#B2BSocial','#AnalyticsDashboard','#MarketingAutomation','#DataDrivenGrowth'], color:'text-nx-amber'}
  ];
  document.getElementById('aiHashtags').innerHTML = groups.map(g => `
    <div class="mb-4">
      <div class="text-[10px] font-semibold ${g.color} uppercase tracking-wider mb-2">${g.label}</div>
      <div class="flex flex-wrap gap-1.5">${g.tags.map(t => `<span class="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-nx-border hover:border-nx-cyan/20 hover:bg-nx-cyan/5 cursor-pointer transition-all text-nx-text">${t}</span>`).join('')}</div>
    </div>`).join('') + `<div class="glass-sm p-3 flex items-center gap-2 mt-2"><i class="fa-solid fa-wand-magic-sparkles text-nx-cyan text-xs"></i><span class="text-[11px] text-nx-muted">Click any hashtag to add it to your content queue</span></div>`;
}
function renderAIPredictions() {
  document.getElementById('aiPredictions').innerHTML = aiPredictions.map(p => `
    <div class="glass-sm p-4 flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
        <i class="fa-solid ${p.trend === 'up' ? 'fa-arrow-trend-up text-nx-green' : 'fa-arrow-trend-down text-nx-pink'} text-lg"></i>
      </div>
      <div class="flex-1">
        <div class="text-xs font-semibold text-white">${p.metric}</div>
        <div class="text-[10px] text-nx-muted mt-0.5">${p.timeline}</div>
      </div>
      <div class="text-right flex-shrink-0">
        <div class="text-[11px] text-nx-muted">Current</div>
        <div class="text-sm font-bold text-white">${p.current}</div>
      </div>
      <div class="w-px h-8 bg-nx-border"></div>
      <div class="text-right flex-shrink-0">
        <div class="text-[11px] text-nx-muted">Predicted</div>
        <div class="text-sm font-bold text-nx-cyan">${p.predicted}</div>
        <div class="text-[9px] ${p.trend === 'up' ? 'text-nx-green' : 'text-nx-pink'} font-semibold">${p.change}</div>
      </div>
    </div>`).join('');
}
function renderNotifications() {
  document.getElementById('notifList').innerHTML = notifications.map(n => `
    <div class="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer ${n.unread ? 'bg-white/[0.01]' : ''}">
      <div class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0"><i class="${n.icon} ${n.color} text-[10px]"></i></div>
      <div class="flex-1 min-w-0"><div class="text-[11px] font-medium text-white">${n.title}</div><div class="text-[10px] text-nx-muted mt-0.5">${n.desc}</div></div>
      <div class="flex flex-col items-end gap-1 flex-shrink-0"><span class="text-[9px] text-nx-muted">${n.time}</span>${n.unread ? '<div class="w-1.5 h-1.5 rounded-full bg-nx-cyan"></div>' : ''}</div>
    </div>`).join('');
}

/* ==================== REAL-TIME UPDATES ==================== */
function updateTraffic() {
  trafficData.push(Math.floor(Math.random() * 300 + 100));
  trafficData.shift();
  charts.traffic.data.labels = trafficData.map((_,i) => i);
  charts.traffic.data.datasets[0].data = [...trafficData];
  charts.traffic.update('none');
  document.getElementById('currentRPS').textContent = trafficData[trafficData.length - 1];
}
function updateActiveUsers() {
  const el = document.querySelector('[data-kpi="active"] [data-counter]');
  const current = parseInt(el.textContent.replace(/,/g, '')) || 14832;
  const next = current + rand(-150, 180);
  el.textContent = formatFullNum(Math.max(12000, next));
}
function triggerAnomaly() {
  const anomalies = [
    'Spike detected: Instagram engagement is 340% above normal for this time window. Possible bot activity or viral content.',
    'Unusual drop: TikTok follower growth reversed by -2.3% in the last hour. Investigating potential cause.',
    'Pattern break: X (Twitter) impression rate deviates 4.2 standard deviations from the 30-day baseline.'
  ];
  const banner = document.getElementById('anomalyBanner');
  document.getElementById('anomalyText').textContent = pick(anomalies);
  banner.classList.remove('hidden');
  banner.style.animation = 'slideIn 0.4s ease';
  showToast('AI anomaly detection alert triggered', 'warning');
}

/* ==================== UI INTERACTIONS ==================== */
function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  const sb = document.getElementById('sidebar');
  const mw = document.querySelector('.main-wrap');
  if (sidebarCollapsed) { sb.style.width = '64px'; mw.style.marginLeft = '64px'; }
  else { sb.style.width = '240px'; mw.style.marginLeft = '240px'; }
}
function toggleMobileSidebar() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
}
function toggleSubmenu(id) {
  const el = document.getElementById(id);
  const arrow = document.getElementById(id + '-arrow');
  el.classList.toggle('open');
  if (arrow) arrow.style.transform = el.classList.contains('open') ? 'rotate(180deg)' : '';
}
function toggleNotifications() {
  notifOpen = !notifOpen;
  document.getElementById('notifPanel').classList.toggle('hidden', !notifOpen);
  document.getElementById('profilePanel').classList.add('hidden');
  profileOpen = false;
}
function toggleProfile() {
  profileOpen = !profileOpen;
  document.getElementById('profilePanel').classList.toggle('hidden', !profileOpen);
  document.getElementById('notifPanel').classList.add('hidden');
  notifOpen = false;
}
function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chatPanel').classList.toggle('hidden', !chatOpen);
  document.getElementById('chatToggle').innerHTML = chatOpen ? '<i class="fa-solid fa-xmark text-sm"></i>' : '<i class="fa-solid fa-message text-sm"></i>';
}
function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  const container = document.getElementById('chatMessages');
  container.innerHTML += `<div class="flex gap-2 justify-end feed-item"><div class="text-right"><div class="text-[9px] text-nx-muted mb-1">You</div><div class="chat-bubble user">${msg}</div></div></div>`;
  input.value = '';
  container.scrollTop = container.scrollHeight;
  // Auto-reply
  setTimeout(() => {
    const replies = ['Got it, will review shortly.','Thanks for the update!','Let me check on that.','Great point, let\'s discuss in the next standup.','Noted. I\'ll add it to the task board.'];
    container.innerHTML += `<div class="flex gap-2 feed-item"><img src="https://picsum.photos/seed/sarah/28/28.jpg" class="w-6 h-6 rounded-full flex-shrink-0 mt-1"><div><div class="text-[9px] text-nx-muted mb-1">Sarah K.</div><div class="chat-bubble ai">${pick(replies)}</div></div></div>`;
    container.scrollTop = container.scrollHeight;
  }, 1200);
}
function switchChartPeriod(btn, period) {
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.classList.add('text-nx-muted'); });
  btn.classList.add('active'); btn.classList.remove('text-nx-muted');
  const datasets = charts.follower.data.datasets;
  if (period === '7d') {
    datasets[0].data = [1020000,1025000,1032000,1038000,1045000,1051000,1058000];
    datasets[1].data = [580000,588000,595000,604000,615000,622000,631000];
    datasets[2].data = [420000,422000,425000,428000,431000,434000,438000];
    charts.follower.data.labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  } else if (period === '30d') {
    datasets[0].data = Array.from({length:30}, (_,i) => 980000 + i * 2600 + rand(-5000, 5000));
    datasets[1].data = Array.from({length:30}, (_,i) => 540000 + i * 3000 + rand(-3000, 3000));
    datasets[2].data = Array.from({length:30}, (_,i) => 400000 + i * 1300 + rand(-2000, 2000));
    charts.follower.data.labels = Array.from({length:30}, (_,i) => i+1);
  } else {
    datasets[0].data = Array.from({length:12}, (_,i) => 800000 + i * 22000 + rand(-10000, 10000));
    datasets[1].data = Array.from({length:12}, (_,i) => 420000 + i * 18000 + rand(-8000, 8000));
    datasets[2].data = Array.from({length:12}, (_,i) => 350000 + i * 7500 + rand(-5000, 5000));
    charts.follower.data.labels = ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'];
  }
  charts.follower.update();
}
function switchContentTab(btn, tab) {
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.classList.add('text-nx-muted'); });
  btn.classList.add('active'); btn.classList.remove('text-nx-muted');
  document.getElementById('contentPosts').classList.toggle('hidden', tab !== 'posts');
  document.getElementById('contentVideos').classList.toggle('hidden', tab !== 'videos');
  document.getElementById('contentViral').classList.toggle('hidden', tab !== 'viral');
}
function switchCampaignTab(btn, tab) {
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.classList.add('text-nx-muted'); });
  btn.classList.add('active'); btn.classList.remove('text-nx-muted');
  document.getElementById('campActive').classList.toggle('hidden', tab !== 'active');
  document.getElementById('campFunnel').classList.toggle('hidden', tab !== 'funnel');
  document.getElementById('campCalendar').classList.toggle('hidden', tab !== 'calendar');
  if (tab === 'funnel') renderFunnel();
}
function switchAITab(btn, tab) {
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.classList.add('text-nx-muted'); });
  btn.classList.add('active'); btn.classList.remove('text-nx-muted');
  document.getElementById('aiSuggestions').classList.toggle('hidden', tab !== 'suggestions');
  document.getElementById('aiHashtags').classList.toggle('hidden', tab !== 'hashtags');
  document.getElementById('aiPredictions').classList.toggle('hidden', tab !== 'predictions');
}
function togglePlatform(btn, id) {
  document.querySelectorAll('.platform-filter').forEach(b => { b.classList.remove('active','text-nx-cyan','bg-nx-cyan/10'); b.classList.add('text-nx-muted'); });
  btn.classList.add('active','text-nx-cyan','bg-nx-cyan/10');
  btn.classList.remove('text-nx-muted');
  showToast(`Filtering by ${id === 'all' ? 'all platforms' : id}`, 'info');
}
function toggleLanguage() {
  const langs = ['EN', 'ES', 'JP'];
  const idx = (langs.indexOf(currentLang) + 1) % langs.length;
  currentLang = langs[idx];
  document.getElementById('langBtn').textContent = currentLang;
  showToast(`Language switched to ${currentLang}`, 'info');
}
function handleExport() {
  showToast('Generating analytics report...', 'info');
  setTimeout(() => showToast('Report exported successfully', 'success'), 1500);
}
function openAIPanel() {
  document.querySelector('.main-wrap').scrollTo({ top: document.querySelector('.main-wrap').scrollHeight, behavior: 'smooth' });
}

/* ==================== DRAG & DROP KPI ==================== */
function initDragDrop() {
  const grid = document.getElementById('kpiGrid');
  let dragEl = null;
  grid.querySelectorAll('.kpi-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      dragEl = card;
      card.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      grid.querySelectorAll('.kpi-card').forEach(c => c.classList.remove('drag-over'));
      dragEl = null;
    });
    card.addEventListener('dragover', e => { e.preventDefault(); card.classList.add('drag-over'); });
    card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
    card.addEventListener('drop', e => {
      e.preventDefault();
      card.classList.remove('drag-over');
      if (dragEl !== card) {
        const allCards = [...grid.children];
        const fromIdx = allCards.indexOf(dragEl);
        const toIdx = allCards.indexOf(card);
        if (fromIdx < toIdx) grid.insertBefore(dragEl, card.nextSibling);
        else grid.insertBefore(dragEl, card);
      }
    });
  });
}

/* ==================== SEARCH ==================== */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    if (q.length > 2) {
      showToast(`Searching for "${q}"...`, 'info');
    }
  });
});

/* ==================== CLOSE DROPDOWNS ON OUTSIDE CLICK ==================== */
document.addEventListener('click', e => {
  if (notifOpen && !e.target.closest('#notifPanel') && !e.target.closest('[onclick*="toggleNotifications"]')) {
    notifOpen = false; document.getElementById('notifPanel').classList.add('hidden');
  }
  if (profileOpen && !e.target.closest('#profilePanel') && !e.target.closest('[onclick*="toggleProfile"]')) {
    profileOpen = false; document.getElementById('profilePanel').classList.add('hidden');
  }
});

/* ==================== INITIALIZATION ==================== */
function init() {
  // Show skeleton for 1.5s, then reveal content
  setTimeout(() => {
    const overlay = document.getElementById('skeleton-overlay');
    overlay.style.transition = 'opacity 0.4s ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      document.getElementById('mainContent').style.display = '';
      // Initialize everything
      initCharts();
      buildHeatmap();
      initTrendingHashtags();
      renderTopPosts();
      renderVideoMetrics();
      renderViralTracker();
      renderCampaigns();
      renderFunnel();
      renderCalendar();
      renderTeam();
      renderAISuggestions();
      renderAIHashtags();
      renderAIPredictions();
      renderNotifications();
      initDragDrop();
      // Animate KPI counters
      document.querySelectorAll('[data-counter]').forEach(el => {
        const target = parseFloat(el.dataset.counter);
        const decimals = parseInt(el.dataset.decimals || '0');
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 1500, decimals, suffix);
      });
      // Seed live feed
      for (let i = 0; i < 5; i++) addLiveActivity();
      // Start real-time updates
      setInterval(updateTraffic, 1000);
      setInterval(updateActiveUsers, 3000);
      setInterval(addLiveActivity, 4000);
      setInterval(() => { if (Math.random() < 0.15) triggerAnomaly(); }, 15000);
      setInterval(initTrendingHashtags, 20000);
    }, 400);
  }, 1500);
}

document.addEventListener('DOMContentLoaded', init);