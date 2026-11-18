// Aprende Mais

document.addEventListener('DOMContentLoaded', function () {

    // --- Login / proteção ---
    var path = window.location.pathname || '';
    var pagina = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    if (pagina.indexOf('?') !== -1) pagina = pagina.split('?')[0];

    var protegidas = ['aulas.html', 'biologia.html', 'quimica.html', 'fisica.html', 'matematica.html'];

    if (protegidas.indexOf(pagina) !== -1) {
        var user = localStorage.getItem('aprendeMaisUser');
        var ok = false;
        if (user) {
            try { ok = JSON.parse(user).logado === true; } catch (e) { ok = false; }
        }
        if (!ok) {
            window.location.href = 'index.html';
            return;
        }
    }

    if (pagina === 'index.html' || pagina === '') {
        var u = localStorage.getItem('aprendeMaisUser');
        if (u) {
            try {
                if (JSON.parse(u).logado) window.location.href = 'aulas.html';
            } catch (e) {}
        }
    }

    var btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.onclick = function (e) {
            e.preventDefault();
            localStorage.removeItem('aprendeMaisUser');
            window.location.href = 'index.html';
        };
    }

    // --- Formulário de login ---
    var formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.onsubmit = function (e) {
            e.preventDefault();
            var email = document.getElementById('email').value.trim();
            var senha = document.getElementById('senha').value;
            var erro = document.getElementById('erroLogin');
            if (email && senha.length >= 4) {
                localStorage.setItem('aprendeMaisUser', JSON.stringify({ email: email, logado: true }));
                window.location.href = 'aulas.html';
            } else if (erro) {
                erro.style.display = 'block';
            }
        };
    }

    // --- Corrigir exercícios ---
    var forms = document.querySelectorAll('.form-exercicio');
    for (var f = 0; f < forms.length; f++) {
        (function (form) {
            var btn = form.querySelector('.btn-corrigir');
            var resultado = form.querySelector('.resultado-form');
            if (!btn || !resultado) return;

            btn.onclick = function () {
                var respostasStr = form.getAttribute('data-respostas') || '';
                var corretas = respostasStr.split(',');
                var fieldsets = form.querySelectorAll('fieldset');
                var acertos = 0;
                var total = fieldsets.length;
                var faltando = false;

                for (var i = 0; i < fieldsets.length; i++) {
                    var fs = fieldsets[i];
                    var radios = fs.querySelectorAll('input[type="radio"]');
                    var marcado = null;
                    var corretaIdx = parseInt(corretas[i], 10);

                    // limpa classes antigas
                    var labels = fs.querySelectorAll('label');
                    for (var L = 0; L < labels.length; L++) {
                        labels[L].classList.remove('certa', 'errada', 'revelada');
                    }

                    for (var r = 0; r < radios.length; r++) {
                        if (radios[r].checked) marcado = radios[r];
                        // marca a resposta correta sempre
                        if (parseInt(radios[r].value, 10) === corretaIdx) {
                            radios[r].parentElement.classList.add('revelada');
                        }
                    }

                    if (!marcado) {
                        faltando = true;
                    } else {
                        var val = parseInt(marcado.value, 10);
                        if (val === corretaIdx) {
                            acertos++;
                            marcado.parentElement.classList.add('certa');
                        } else {
                            marcado.parentElement.classList.add('errada');
                        }
                    }
                }

                if (faltando) {
                    resultado.innerHTML = '⚠️ Responda todas as perguntas.';
                    resultado.className = 'resultado-form aviso';
                    return;
                }

                var pct = Math.round((acertos / total) * 100);
                var msg = 'Você acertou <strong>' + acertos + ' de ' + total + '</strong> (' + pct + '%).<br>';
                msg += 'As respostas corretas estão em <span style="color:#047857;font-weight:800">verde</span>.';
                if (pct === 100) msg += '<br>🎉 Perfeito!';
                else if (pct >= 70) msg += '<br>👍 Muito bem!';
                else msg += '<br>📚 Revise o texto da aula.';

                resultado.innerHTML = msg;
                resultado.className = 'resultado-form ' + (pct >= 70 ? 'ok' : 'erro');
            };
        })(forms[f]);
    }
});
