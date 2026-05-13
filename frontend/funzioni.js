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

/* CHECK LOGIN */
function checkLogged() {
    if (!localStorage.getItem('gymbros-token')) {
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}
 
