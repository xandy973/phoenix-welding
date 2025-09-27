// Shared side chat handler with simulated IA responses and persistent storage
(function(){
    var STORAGE_KEY = 'phoenix_chat_messages_v1';

    function nowISO(){ return new Date().toISOString(); }

    function saveMessage(obj){
        var arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        arr.push(obj);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }

    function loadMessages(){
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }

    function renderMessage(list, text, cls, ts){
        var li = document.createElement('li');
        li.className = cls;
        var wrap = document.createElement('div');
        wrap.className = 'msg-wrap ' + cls;
        var p = document.createElement('p'); p.textContent = text;
        var meta = document.createElement('small'); meta.className='msg-ts'; meta.textContent = ts ? (new Date(ts)).toLocaleString() : '';
        wrap.appendChild(p); wrap.appendChild(meta);
        li.appendChild(wrap);
        list.appendChild(li);
        list.scrollTop = list.scrollHeight;
    }

    function generateAIReply(userText){
        // Simple prompt-based simulated responses. Replace with real API integration in production.
        var t = userText.toLowerCase();
        if(t.includes('precio') || t.includes('valor') || t.includes('cotiz')){
            return 'Gracias por la consulta sobre precios. Para darte un presupuesto preciso necesito: material, medidas aproximadas y si requieres acabado. ¿Puedes darme esos detalles?';
        }
        if(t.includes('horario') || t.includes('abre') || t.includes('atend')){
            return 'Nuestro horario de atención es Lunes a Viernes de 9:00 a 18:00. Si necesitas una visita fuera de ese horario, indícanos y lo coordinamos.';
        }
        if(t.includes('servicio') || t.includes('soldadur') || t.includes('repar')){
            return 'Ofrecemos soldadura TIG, MIG y por electrodo para industria y particulares. ¿Cuál es el material y tamaño aproximado del trabajo?';
        }
        if(t.includes('gracias') || t.includes('ok') || t.includes('perfecto')){
            return '¡Con gusto! Si quieres, deja tu teléfono y te contactamos por WhatsApp para afinar los detalles.';
        }
        // default friendly assistant style
        var starters = [
            'Buena pregunta.','Perfecto,','Gracias por escribir.','Claro:','Con gusto:'
        ];
        var idx = Math.floor(Math.random()*starters.length);
        return starters[idx] + ' ' + '¿Puedes darme un poco más de contexto sobre tu proyecto para poder ayudarte mejor?';
    }

    function showTyping(list){
        var li = document.createElement('li'); li.className='typing';
        li.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        list.appendChild(li);
        list.scrollTop = list.scrollHeight;
        return li;
    }

    function removeTyping(listItem){ if(listItem && listItem.parentNode) listItem.parentNode.removeChild(listItem); }

    document.addEventListener('DOMContentLoaded', function(){
        // Hydrate existing messages in every side-chat .messages list
        var stored = loadMessages();
        document.querySelectorAll('.side-chat').forEach(function(side){
            var list = side.querySelector('.messages');
            if(!list) return;
            // clear then render messages relevant to this side (no per-room filtering implemented yet)
            list.innerHTML = '';
            stored.forEach(function(m){ renderMessage(list, m.text, m.role==='user'?'from-user':'from-bot', m.ts); });
        });

        document.querySelectorAll('.chat-form').forEach(function(form){
            form.addEventListener('submit', function(e){
                e.preventDefault();
                var input = form.querySelector('input[name="message"]');
                if(!input || !input.value.trim()) return;
                var text = input.value.trim();
                var list = form.parentNode.querySelector('.messages');

                // push user message
                var userMsg = { id: 'u-'+Date.now(), role:'user', text: text, ts: nowISO() };
                saveMessage(userMsg);
                renderMessage(list, text, 'from-user', userMsg.ts);
                input.value = '';

                // send to Formspree if configured (keeps original behavior)
                var endpoint = form.getAttribute('data-formspree');
                if(endpoint){
                    fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
                    .catch(function(){ /* ignore network errors for UX; admin will use stored copy */ });
                }

                // show typing indicator and attempt remote AI reply via serverless endpoint
                var typing = showTyping(list);
                (function(){
                    var payload = { prompt: text };
                    // try serverless endpoint first (deploy-dependent). Hosts like Netlify/Vercel set this to /.netlify/functions/ai_reply or /api/ai-reply
                    var endpoints = ['/.netlify/functions/ai_reply', '/api/ai-reply', '/.vercel/functions/ai-reply'];
                    var tried = 0;
                    function tryNext(){
                        if(tried >= endpoints.length){
                            // fallback to local generator
                            removeTyping(typing);
                            var replyText = generateAIReply(text);
                            var botMsg = { id: 'b-'+Date.now(), role:'bot', text: replyText, ts: nowISO() };
                            saveMessage(botMsg);
                            renderMessage(list, replyText, 'from-bot', botMsg.ts);
                            return;
                        }
                        var url = endpoints[tried++];
                        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) , credentials: 'same-origin'})
                        .then(function(res){
                            if(!res.ok) throw new Error('no-remote');
                            return res.json();
                        })
                        .then(function(data){
                            removeTyping(typing);
                            var replyText = (data && data.reply) ? data.reply : generateAIReply(text);
                            var botMsg = { id: 'b-'+Date.now(), role:'bot', text: replyText, ts: nowISO() };
                            saveMessage(botMsg);
                            renderMessage(list, replyText, 'from-bot', botMsg.ts);
                        })
                        .catch(function(){
                            // try next endpoint
                            tryNext();
                        });
                    }
                    tryNext();
                })();
            }, false);
        });
    });
})();
