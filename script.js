// ===== Meu Arquivo de Memória =====

const CHAVE_STORAGE = 'meuArquivoDeMemoria';

// Memórias de exemplo (só aparecem se o arquivo estiver vazio)
const memoriasIniciais = [
    {
        id: 1,
        titulo: 'Almoço de domingo em família',
        categoria: 'familia',
        data: '2025-11-02',
        descricao: 'Todo mundo junto na mesa, risadas, comida boa e aquele abraço demorado no final. Momentos assim valem ouro.',
        emoji: '🍴',
        foto: null
    },
    {
        id: 2,
        titulo: 'Passeio no parque com os amigos',
        categoria: 'amigos',
        data: '2025-10-18',
        descricao: 'Solzinho, conversa fiada, foto em grupo e aquela sensação gostosa de amizade verdadeira.',
        emoji: '🌿',
        foto: null
    },
    {
        id: 3,
        titulo: 'Primeiro banho do Thor',
        categoria: 'pets',
        data: '2025-09-05',
        descricao: 'Ele ficou todo molhadinho e engraçado. Saiu correndo pela casa depois, mas valeu cada segundo de fofura.',
        emoji: '🐶',
        foto: null
    }
];

let memorias = [];
let filtroAtual = 'todos';
let fotoAtualBase64 = null; // guarda a foto selecionada temporariamente

// Carrega do localStorage ou usa as iniciais
function carregarMemorias() {
    const salvas = localStorage.getItem(CHAVE_STORAGE);
    if (salvas) {
        memorias = JSON.parse(salvas);
    } else {
        memorias = [...memoriasIniciais];
        salvarMemorias();
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

    // Ordena por data (mais recente primeiro)
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

// Converte arquivo de imagem para Base64 (e redimensiona se for grande)
function processarFoto(arquivo) {
    return new Promise((resolve, reject) => {
        if (!arquivo || !arquivo.type.startsWith('image/')) {
            resolve(null);
            return;
        }

        // Limite de ~1.2 MB para não estourar o localStorage
        if (arquivo.size > 1.5 * 1024 * 1024) {
            // Vamos redimensionar
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Redimensiona se a imagem for muito grande
                const MAX = 900; // largura máxima
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

                // Qualidade 0.75 para economizar espaço
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

    // Limpa o formulário
    document.getElementById('formMemoria').reset();
    limparFoto();

    // Feedback fofo
    alert('💖 Momento guardado com carinho no seu arquivo!');

    // Rola até as memórias
    document.getElementById('memorias').scrollIntoView({ behavior: 'smooth' });
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    carregarMemorias();
    renderizarMemorias();

    // Filtros
    document.querySelectorAll('.filtro').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            filtroAtual = btn.dataset.filtro;
            renderizarMemorias();
        });
    });

    // Formulário
    document.getElementById('formMemoria').addEventListener('submit', adicionarMemoria);

    // Data de hoje como padrão
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = hoje;

    // ===== Foto =====
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
});
