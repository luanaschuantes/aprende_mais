// ===== Meu Arquivo de Memória =====

const CHAVE_STORAGE = 'meuArquivoDeMemoria';

const emojisPorCategoria = {
    familia: ['👨‍👩‍👧‍👦', '🏠', '❤️', '👩‍👩‍👧', '👨‍👨‍👦', '👶', '👵', '👴', '🥰', '💕'],
    amigos: ['🤝', '👯', '🎉', '😊', '🤗', '💕', '🍻', '👥', '✨', '😘'],
    pets: ['🐶', '🐱', '🐾', '🐰', '🐔', '🐠', '🐹', '🐈', '🐕', '❤️'],
    outros: ['✨', '🌟', '🎈', '☀️', '🌈', '💖', '🌺', '🎂', '💫', '🌞']
};

const exemplosPorCategoria = {
    familia: {
        titulo: 'Almoço de domingo em família',
        descricao: 'Todo mundo junto na mesa, risadas, comida boa e aquele abraço demorado no final...'
    },
    amigos: {
        titulo: 'Sábado com os amigos no parque',
        descricao: 'Solzinho, conversa fiada, foto em grupo e aquela sensação gostosa de amizade verdadeira...'
    },
    pets: {
        titulo: 'Banho da Flora',
        descricao: 'Ela ficou toda molhadinha e engraçada. Saiu correndo pela casa depois, mas valeu cada segundo de fofura...'
    },
    outros: {
        titulo: 'Um momento especial',
        descricao: 'Conte o que aconteceu, o que sentiu, quem estava junto...'
    }
};

let memorias = [];
let filtroAtual = 'todos';
let fotoAtualBase64 = null;

function carregarMemorias() {
    const salvas = localStorage.getItem(CHAVE_STORAGE);
    memorias = salvas ? JSON.parse(salvas) : [];
}

function salvarMemorias() {
    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(memorias));
    } catch (e) {
        alert('O espaço de armazenamento está cheio. Tente usar fotos menores ou apague algumas memórias antigas.');
    }
}

function formatarData(dataStr) {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

function nomeCategoria(cat) {
    const mapa = {
        familia: '🏠 Família',
        amigos: '🤝 Amigos',
        pets: '🐾 Pets',
        outros: '✨ Outros'
    };
    return mapa[cat] || cat;
}

// ===== Navegação por abas =====
function irPara(tab) {
    document.querySelectorAll('.pagina').forEach(p => p.classList.remove('ativa'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('ativo'));

    const pagina = document.getElementById('pagina-' + tab);
    if (pagina) pagina.classList.add('ativa');

    document.querySelectorAll('.tab').forEach(t => {
        if (t.dataset.tab === tab) t.classList.add('ativo');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tab === 'album') renderizarMemorias();
}

function renderizarMemorias() {
    const lista = document.getElementById('listaMemorias');
    const vazio = document.getElementById('vazio');
    if (!lista || !vazio) return;

    let filtradas = filtroAtual === 'todos'
        ? memorias
        : memorias.filter(m => m.categoria === filtroAtual);

    filtradas = [...filtradas].sort((a, b) => (b.data || '').localeCompare(a.data || ''));

    if (filtradas.length === 0) {
        lista.innerHTML = '';
        vazio.style.display = 'block';
        return;
    }

    vazio.style.display = 'none';
    lista.innerHTML = filtradas.map(m => {
        const temFoto = m.foto && m.foto.length > 10;
        return `
        <article class="card-memoria">
            <button class="btn-apagar" onclick="apagarMemoria(${m.id})" title="Apagar">🗑️</button>
            ${temFoto ? `<img class="foto-memoria" src="${m.foto}" alt="${m.titulo}">` : ''}
            <div class="conteudo-card">
                <div class="emoji-memoria">${m.emoji || '✨'}</div>
                <h3>${m.titulo}</h3>
                <div class="meta">
                    <span>${nomeCategoria(m.categoria)}</span>
                    <span>📅 ${formatarData(m.data)}</span>
                </div>
                <p class="descricao">${m.descricao}</p>
            </div>
        </article>`;
    }).join('');
}

function apagarMemoria(id) {
    if (!confirm('Tem certeza que deseja apagar esta memória?')) return;
    memorias = memorias.filter(m => m.id !== id);
    salvarMemorias();
    renderizarMemorias();
}

function processarFoto(arquivo) {
    return new Promise((resolve, reject) => {
        if (!arquivo || !arquivo.type.startsWith('image/')) {
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const MAX = 900;
                let w = img.width, h = img.height;
                if (w > MAX) { h = Math.round(h * (MAX / w)); w = MAX; }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.75));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(arquivo);
    });
}

function limparFoto() {
    fotoAtualBase64 = null;
    document.getElementById('foto').value = '';
    document.getElementById('previewFoto').style.display = 'none';
    document.getElementById('imgPreview').src = '';
    document.getElementById('removerFoto').style.display = 'none';
}

function atualizarSugestoesPorCategoria() {
    const categoria = document.getElementById('categoria').value;
    const container = document.getElementById('sugestoesEmoji');
    const inputTitulo = document.getElementById('titulo');
    const inputDescricao = document.getElementById('descricao');

    if (!categoria || !emojisPorCategoria[categoria]) {
        container.innerHTML = '<span class="dica-sugestao">Escolha a categoria para ver sugestões ✨</span>';
    } else {
        container.innerHTML = emojisPorCategoria[categoria].map(e =>
            `<button type="button" class="btn-emoji" data-emoji="${e}">${e}</button>`
        ).join('');
        container.querySelectorAll('.btn-emoji').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('emoji').value = btn.dataset.emoji;
            });
        });
    }

    if (categoria && exemplosPorCategoria[categoria]) {
        inputTitulo.value = exemplosPorCategoria[categoria].titulo;
        inputDescricao.placeholder = exemplosPorCategoria[categoria].descricao;
        inputDescricao.value = '';
    } else {
        inputTitulo.value = '';
        inputTitulo.placeholder = 'Escolha a categoria para ver um exemplo';
        inputDescricao.placeholder = 'Conte o que aconteceu, o que sentiu, quem estava junto...';
        inputDescricao.value = '';
    }
}

async function adicionarMemoria(evento) {
    evento.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const categoria = document.getElementById('categoria').value;
    const data = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value.trim();
    const emoji = document.getElementById('emoji').value.trim() || '✨';

    if (!titulo || !categoria || !data || !descricao) {
        alert('Preencha todos os campos obrigatórios ✨');
        return;
    }

    memorias.push({
        id: Date.now(),
        titulo, categoria, data, descricao, emoji,
        foto: fotoAtualBase64 || null
    });
    salvarMemorias();

    document.getElementById('formMemoria').reset();
    limparFoto();
    atualizarSugestoesPorCategoria();

    alert('💖 Momento guardado com carinho!');
    irPara('album');
}

document.addEventListener('DOMContentLoaded', () => {
    carregarMemorias();

    // Abas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => irPara(tab.dataset.tab));
    });

    // Botões que mudam de aba
    document.querySelectorAll('[data-ir]').forEach(btn => {
        btn.addEventListener('click', () => irPara(btn.dataset.ir));
    });

    // Filtros
    document.querySelectorAll('.filtro').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            filtroAtual = btn.dataset.filtro;
            renderizarMemorias();
        });
    });

    document.getElementById('formMemoria').addEventListener('submit', adicionarMemoria);

    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = hoje;

    // Foto
    document.getElementById('foto').addEventListener('change', async function () {
        const arquivo = this.files[0];
        if (!arquivo) return;
        try {
            fotoAtualBase64 = await processarFoto(arquivo);
            document.getElementById('imgPreview').src = fotoAtualBase64;
            document.getElementById('previewFoto').style.display = 'block';
            document.getElementById('removerFoto').style.display = 'inline-block';
        } catch {
            alert('Não foi possível carregar a foto.');
            limparFoto();
        }
    });

    document.getElementById('removerFoto').addEventListener('click', limparFoto);
    document.getElementById('categoria').addEventListener('change', atualizarSugestoesPorCategoria);
});
