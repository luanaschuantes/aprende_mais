// Aprende Mais — login + correção de formulários

(function () {
    const pagina = (window.location.pathname.split('/').pop() || 'index.html').split('?')[0];
    const protegidas = ['aulas.html', 'biologia.html', 'quimica.html', 'fisica.html', 'matematica.html'];

    if (protegidas.includes(pagina)) {
        const user = localStorage.getItem('aprendeMaisUser');
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        try {
            if (!JSON.parse(user).logado) {
                window.location.href = 'index.html';
                return;
            }
        } catch {
            window.location.href = 'index.html';
            return;
        }
    }

    if (pagina === 'index.html' || pagina === '' || pagina === '/') {
        const user = localStorage.getItem('aprendeMaisUser');
        if (user) {
            try {
                if (JSON.parse(user).logado) window.location.href = 'aulas.html';
            } catch (e) {}
        }
    }

    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('aprendeMaisUser');
            window.location.href = 'index.html';
        });
    }

    // Corrigir formulários de exercício
    document.querySelectorAll('.form-exercicio').forEach(function (form) {
        const btn = form.querySelector('.btn-corrigir');
        const resultado = form.querySelector('.resultado-form');
        if (!btn || !resultado) return;

        btn.addEventListener('click', function () {
            const corretas = (form.getAttribute('data-respostas') || '').split(',').map(Number);
            const fieldsets = form.querySelectorAll('fieldset');
            let acertos = 0;
            let respondidas = 0;

            fieldsets.forEach(function (fs, i) {
                const marcado = fs.querySelector('input[type="radio"]:checked');
                if (marcado) {
                    respondidas++;
                    if (parseInt(marcado.value, 10) === corretas[i]) acertos++;
                }
            });

            if (respondidas < fieldsets.length) {
                resultado.textContent = 'Responda todas as perguntas antes de corrigir.';
                resultado.className = 'resultado-form aviso';
                return;
            }

            const total = fieldsets.length;
            const pct = Math.round((acertos / total) * 100);
            resultado.textContent = 'Você acertou ' + acertos + ' de ' + total + ' (' + pct + '%).';
            resultado.className = 'resultado-form ' + (pct >= 70 ? 'ok' : 'erro');
        });
    });
})();
