// Minimal focus-trap for side-nav and improved keyboard navigation
(function(){
    function trapFocus(container){
        var focusable = container.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
        if(!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length -1];
        function keyHandler(e){
            if(e.key === 'Tab'){
                if(e.shiftKey){ // shift + tab
                    if(document.activeElement === first){
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if(document.activeElement === last){
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
            // Escape handled at document level by closePanel; avoid calling undefined close()
        }
        container._keyHandler = keyHandler;
        document.addEventListener('keydown', keyHandler);
    }
    function releaseFocus(container){
        if(container && container._keyHandler){
            document.removeEventListener('keydown', container._keyHandler);
            delete container._keyHandler;
        }
    }
    function openPanel(panel, overlay, btn){
        panel.classList.add('open');
        overlay.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        panel.setAttribute('aria-hidden','false');
        overlay.setAttribute('aria-hidden','false');
        // trap focus inside panel
        trapFocus(panel);
        var first = panel.querySelector('a, button, input');
        if(first) first.focus();
    }
    function closePanel(panel, overlay, btn){
        panel.classList.remove('open');
        overlay.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        panel.setAttribute('aria-hidden','true');
        overlay.setAttribute('aria-hidden','true');
        releaseFocus(panel);
        btn.focus();
    }
    function init(){
        var btn = document.getElementById('hamburger');
        var panel = document.getElementById('side-nav');
        var overlay = document.getElementById('side-overlay');
        if(!panel || !overlay) return;
        if(btn){
            btn.addEventListener('click', function(){ if(panel.classList.contains('open')) closePanel(panel, overlay, btn); else openPanel(panel, overlay, btn); });
        } else {
            // fallback: delegate clicks on any element with class 'hamburger'
            document.addEventListener('click', function(ev){
                var h = ev.target.closest && ev.target.closest('.hamburger');
                if(!h) return;
                if(panel.classList.contains('open')) closePanel(panel, overlay, h); else openPanel(panel, overlay, h);
            });
        }
        overlay.addEventListener('click', function(){ closePanel(panel, overlay, btn || document.querySelector('.hamburger')); });
        // ensure Escape closes
        document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && panel.classList.contains('open')) closePanel(panel, overlay, btn || document.querySelector('.hamburger')); });
    }

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
