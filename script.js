// ===== Meu Arquivo de Memória =====

const CHAVE_STORAGE = 'meuArquivoDeMemoria';

// Sugestões de emoji por categoria
const emojisPorCategoria = {
    familia: ['👨‍👩‍👧‍👦', '🏠', '❤️', '👩‍👩‍👧', '👨‍👨‍👦', '👶', '👵', '👴', '🥰', '💕'],
    amigos: ['🤝', '👯', '🎉', '😊', '🤗', '💕', '🍻', '👥', '✨', '😘'],
    pets: ['🐶', '🐱', '🐾', '🐰', '🐔', '🐠', '🐹', '🐈', '🐕', '❤️'],
    outros: ['✨', '🌟', '🎈', '☀️', '🌈', '💖', '🌺', '🎂', '💫', '🌞']
};

let memorias = [];
let filtroAtual = 'todos';
let fotoAtualBase64 = null;

function carregarMemorias() {
    const salvas = localStorage.getItem(CHAVE_STORAGE);
    if (salvas) {
        memorias = JSON.parse(salvas);
    } else {
        memorias = []; // Começa vazio — você adiciona suas próprias memórias e fotos
    }
}

function salvarMemorias() {
    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(memorias));
    } catch (e) {
        alert('O espaço de armazenamento está cheio. Tente usar fotos menores ou apague algumas memórias antigas.');
        console.error(e);
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

function renderizarMemorias() {
    const lista = document.getElementById('listaMemorias');
    const vazio = document.getElementById('vazio');

    let filtradas = memorias;
    if (filtroAtual !== 'todos') {
        filtradas = memorias.filter(m => m.categoria === filtroAtual);
    }

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
        <article class="card-memoria" data-id="${m.id}">
            <button class="btn-apagar" onclick="apagarMemoria(${m.id})" title="Apagar memória">🗑️</button>
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
        </article>
    `}).join('');
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
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const MAX = 900;
                let width = img.width;
                let height = img.height;

                if (width > MAX) {
                    height = Math.round(height * (MAX / width));
                    width = MAX;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL('image/jpeg', 0.75);
                resolve(base64);
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

// Atualiza as sugestões de emoji conforme a categoria
function atualizarSugestoesEmoji() {
    const categoria = document.getElementById('categoria').value;
    const container = document.getElementById('sugestoesEmoji');

    if (!categoria || !emojisPorCategoria[categoria]) {
        container.innerHTML = '<span class="dica-sugestao">Escolha a categoria para ver sugestões ✨</span>';
        return;
    }

    const lista = emojisPorCategoria[categoria];
    container.innerHTML = lista.map(emoji =>
        `<button type="button" class="btn-emoji" data-emoji="${emoji}">${emoji}</button>`
    ).join('');

    container.querySelectorAll('.btn-emoji').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('emoji').value = btn.dataset.emoji;
        });
    });
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

    const nova = {
        id: Date.now(),
        titulo,
        categoria,
        data,
        descricao,
        emoji,
        foto: fotoAtualBase64 || null
    };

    memorias.push(nova);
    salvarMemorias();
    renderizarMemorias();

    document.getElementById('formMemoria').reset();
    limparFoto();
    atualizarSugestoesEmoji();

    alert('💖 Momento guardado com carinho no seu arquivo!');
    document.getElementById('memorias').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarMemorias();
    renderizarMemorias();

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
    const inputFoto = document.getElementById('foto');
    const btnRemover = document.getElementById('removerFoto');

    inputFoto.addEventListener('change', async function() {
        const arquivo = this.files[0];
        if (!arquivo) return;

        try {
            const base64 = await processarFoto(arquivo);
            fotoAtualBase64 = base64;
            document.getElementById('imgPreview').src = base64;
            document.getElementById('previewFoto').style.display = 'block';
            btnRemover.style.display = 'inline-block';
        } catch (err) {
            alert('Não foi possível carregar a foto. Tente outra imagem.');
            limparFoto();
        }
    });

    btnRemover.addEventListener('click', limparFoto);

    // Sugestões de emoji mudam com a categoria
    document.getElementById('categoria').addEventListener('change', atualizarSugestoesEmoji);
});
