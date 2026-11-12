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
        emoji: '🍴'
    },
    {
        id: 2,
        titulo: 'Passeio no parque com os amigos',
        categoria: 'amigos',
        data: '2025-10-18',
        descricao: 'Solzinho, conversa fiada, foto em grupo e aquela sensação gostosa de amizade verdadeira.',
        emoji: '🌿'
    },
    {
        id: 3,
        titulo: 'Primeiro banho do Thor',
        categoria: 'pets',
        data: '2025-09-05',
        descricao: 'Ele ficou todo molhadinho e engraçado. Saiu correndo pela casa depois, mas valeu cada segundo de fofura.',
        emoji: '🐶'
    }
];

let memorias = [];
let filtroAtual = 'todos';

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
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(memorias));
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

    lista.innerHTML = filtradas.map(m => `
        <article class="card-memoria" data-id="${m.id}">
            <button class="btn-apagar" onclick="apagarMemoria(${m.id})" title="Apagar memória">🗑️</button>
            <div class="emoji-memoria">${m.emoji || '✨'}</div>
            <h3>${m.titulo}</h3>
            <div class="meta">
                <span>${nomeCategoria(m.categoria)}</span>
                <span>📅 ${formatarData(m.data)}</span>
            </div>
            <p class="descricao">${m.descricao}</p>
        </article>
    `).join('');
}

function apagarMemoria(id) {
    if (!confirm('Tem certeza que deseja apagar esta memória?')) return;
    memorias = memorias.filter(m => m.id !== id);
    salvarMemorias();
    renderizarMemorias();
}

function adicionarMemoria(evento) {
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
        emoji
    };

    memorias.push(nova);
    salvarMemorias();
    renderizarMemorias();

    // Limpa o formulário
    document.getElementById('formMemoria').reset();

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
});
