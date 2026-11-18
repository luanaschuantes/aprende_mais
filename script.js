// Aprende Mais — proteção de páginas e logout

(function () {
    const pagina = window.location.pathname.split('/').pop() || 'index.html';

    // Páginas que exigem login
    const protegidas = ['aulas.html', 'biologia.html', 'quimica.html', 'fisica.html', 'matematica.html'];

    if (protegidas.includes(pagina)) {
        const user = localStorage.getItem('aprendeMaisUser');
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        try {
            const dados = JSON.parse(user);
            if (!dados.logado) {
                window.location.href = 'index.html';
                return;
            }
        } catch {
            window.location.href = 'index.html';
            return;
        }
    }

    // Se já está logado e abre o login, vai para aulas
    if (pagina === 'index.html' || pagina === '' || pagina === '/') {
        const user = localStorage.getItem('aprendeMaisUser');
        if (user) {
            try {
                const dados = JSON.parse(user);
                if (dados.logado) {
                    window.location.href = 'aulas.html';
                }
            } catch {}
        }
    }

    // Botão Sair
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('aprendeMaisUser');
            window.location.href = 'index.html';
        });
    }
})();
