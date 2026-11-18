// Aprende Mais — login + quizzes interativos

(function () {
    const pagina = window.location.pathname.split('/').pop() || 'index.html';
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
            } catch {}
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
})();

// ===== Sistema de aulas + quiz (estilo Quizizz) =====
function iniciarMateria(aulas, cor) {
    let aulaAtual = null;
    let perguntaAtual = 0;
    let acertos = 0;
    let respondida = false;

    const listaAulas = document.getElementById('listaAulas');
    const areaAula = document.getElementById('areaAula');
    const conteudoAula = document.getElementById('conteudoAula');
    const quizPergunta = document.getElementById('quizPergunta');
    const quizOpcoes = document.getElementById('quizOpcoes');
    const quizFeedback = document.getElementById('quizFeedback');
    const quizProgresso = document.getElementById('quizProgresso');
    const btnProxima = document.getElementById('btnProxima');
    const btnVerResultado = document.getElementById('btnVerResultado');
    const quizResultado = document.getElementById('quizResultado');
    const btnVoltarLista = document.getElementById('btnVoltarLista');

    document.querySelectorAll('.card-aula').forEach(card => {
        card.querySelector('.btn-abrir').addEventListener('click', () => {
            const idx = parseInt(card.dataset.aula, 10);
            abrirAula(idx);
        });
    });

    btnVoltarLista.addEventListener('click', () => {
        areaAula.style.display = 'none';
        listaAulas.style.display = 'flex';
        quizResultado.style.display = 'none';
    });

    function abrirAula(idx) {
        aulaAtual = aulas[idx];
        perguntaAtual = 0;
        acertos = 0;
        respondida = false;

        listaAulas.style.display = 'none';
        areaAula.style.display = 'block';
        quizResultado.style.display = 'none';
        document.getElementById('quizBox').style.display = 'block';

        conteudoAula.innerHTML = `<h2>${aulaAtual.titulo}</h2>${aulaAtual.texto}`;
        mostrarPergunta();
    }

    function mostrarPergunta() {
        respondida = false;
        const p = aulaAtual.perguntas[perguntaAtual];
        const total = aulaAtual.perguntas.length;

        quizPergunta.innerHTML = `<p class="pergunta-texto">${p.q}</p>`;
        quizOpcoes.innerHTML = '';
        quizFeedback.style.display = 'none';
        btnProxima.style.display = 'none';
        btnVerResultado.style.display = 'none';
        quizProgresso.textContent = `Pergunta ${perguntaAtual + 1} de ${total}`;

        p.opcoes.forEach((texto, i) => {
            const btn = document.createElement('button');
            btn.className = 'opcao-quiz';
            btn.textContent = texto;
            btn.addEventListener('click', () => responder(i, btn));
            quizOpcoes.appendChild(btn);
        });
    }

    function responder(indice, botaoClicado) {
        if (respondida) return;
        respondida = true;

        const p = aulaAtual.perguntas[perguntaAtual];
        const botoes = quizOpcoes.querySelectorAll('.opcao-quiz');

        botoes.forEach((b, i) => {
            b.disabled = true;
            if (i === p.correta) b.classList.add('correta');
            if (i === indice && indice !== p.correta) b.classList.add('errada');
        });

        if (indice === p.correta) {
            acertos++;
            quizFeedback.textContent = '✅ Correto!';
            quizFeedback.className = 'quiz-feedback ok';
        } else {
            quizFeedback.textContent = '❌ Errado. A resposta certa está marcada em verde.';
            quizFeedback.className = 'quiz-feedback erro';
        }
        quizFeedback.style.display = 'block';

        if (perguntaAtual < aulaAtual.perguntas.length - 1) {
            btnProxima.style.display = 'inline-block';
        } else {
            btnVerResultado.style.display = 'inline-block';
        }
    }

    btnProxima.addEventListener('click', () => {
        perguntaAtual++;
        mostrarPergunta();
    });

    btnVerResultado.addEventListener('click', () => {
        const total = aulaAtual.perguntas.length;
        const pct = Math.round((acertos / total) * 100);
        let msg = '';
        if (pct === 100) msg = '🎉 Perfeito! Você mandou bem!';
        else if (pct >= 70) msg = '👍 Muito bom! Continue estudando.';
        else if (pct >= 40) msg = '📚 Revise a aula e tente de novo.';
        else msg = '💪 Não desista! Leia a aula outra vez e refaça o quiz.';

        document.getElementById('quizBox').style.display = 'none';
        quizResultado.style.display = 'block';
        quizResultado.innerHTML = `
            <h2>Resultado</h2>
            <p class="score">${acertos} de ${total} acertos (${pct}%)</p>
            <p>${msg}</p>
            <button class="btn-primario" id="btnRefazer">Refazer quiz</button>
            <button class="btn-secundario" id="btnOutraAula">Outra aula</button>
        `;

        document.getElementById('btnRefazer').addEventListener('click', () => {
            perguntaAtual = 0;
            acertos = 0;
            document.getElementById('quizBox').style.display = 'block';
            quizResultado.style.display = 'none';
            mostrarPergunta();
        });
        document.getElementById('btnOutraAula').addEventListener('click', () => {
            areaAula.style.display = 'none';
            listaAulas.style.display = 'flex';
        });
    });
}
