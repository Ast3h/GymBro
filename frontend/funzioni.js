/*  SIDEBAR  */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
}
 
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
}
 
 
/*  SWITCH ACCENT COLOR  */
let accentIsPink = true;
 
function applyAccent(isPink) {
    const root = document.documentElement;
    const sw   = document.getElementById('color-switch');
    const logo = document.querySelector('.logo span');
    const tema = document.getElementById('impost-tema');
 
    const c    = isPink ? '#ed249b' : '#8cc63f';
    const dim  = isPink ? 'rgba(237, 36, 155, 0.12)' : 'rgba(140, 198, 63, 0.12)';
    const glow = isPink ? 'rgba(237, 36, 155, 0.055)' : 'rgba(140, 198, 63, 0.055)';
 
    root.style.setProperty('--accent',      c);
    root.style.setProperty('--accent-dim',  dim);
    root.style.setProperty('--accent-glow', glow);
 
    if (sw)   { sw.classList.toggle('pink', isPink); sw.classList.toggle('green', !isPink); }
    if (dot)  { dot.style.background = c; }
    if (logo) { logo.style.color = c; }
    if (tema) { tema.textContent = isPink ? 'Rosa' : 'Verde'; }
 
    let dynStyle = document.getElementById('dyn-accent');
    if (dynStyle) {
        dynStyle.textContent = `
            #svg-fem #am23:hover path,
            #svg-fem #am37:hover path,
            #svg-fem #am43:hover path,
            #svg-fem #am49:hover path,
            #svg-fem #am52:hover path,
            #svg-fem #am55:hover path,
            #svg-male #am17:hover path,
            #svg-male #am21:hover path,
            #svg-male #am23:hover path,
            #svg-male #am27:hover path,
            #svg-male #am32:hover path { fill: ${c} !important; }
        `;
    }
}
 
function toggleAccent() {
    accentIsPink = !accentIsPink;
    applyAccent(accentIsPink);
    localStorage.setItem('gymbros-accent', accentIsPink ? 'pink' : 'green');
}
 
/* applica il tema salvato al caricamento della pagina */
(function initAccent() {
    accentIsPink = localStorage.getItem('gymbros-accent') !== 'green';
    applyAccent(accentIsPink);
})();
 
 
/*  NOTIFICHE  */
const NOTIF_ICONS = {
    scheda: `<svg viewBox="0 0 24 24">
                <rect x="4" y="3" width="16" height="18" rx="2"/>
                <line x1="8" y1="8" x2="16" y2="8"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="8" y1="16" x2="12" y2="16"/>
             </svg>`,
    esercizio: `<svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>`,
    sistema: `<svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>`,
};
 
