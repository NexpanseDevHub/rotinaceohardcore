document.addEventListener('DOMContentLoaded', function() {
    // Dados da rotina
    const routineData = [
        { time: "09h - 09h30", block: "Despertar", objective: "Café + banho + sol + água" },
        { time: "09h30 - 10h00", block: "Corrida curta + banho", objective: "Ativar o modo máquina" },
        { time: "10h00 - 11h30", block: "📈 Prospecção / Follow-up / LinkedIn", objective: "Estratégico e de alto impacto" },
        { time: "11h30 - 13h30", block: "⚒️ Execução Profunda – Montarsul", objective: "Posts, design, materiais, suporte" },
        { time: "13h30 - 14h00", block: "🍽️ Almoço", objective: "Alinha com ela (pré-expediente)" },
        { time: "14h00 - 17h30", block: "⚒️ Execução Profunda – Energy Global", objective: "Criação de módulos, vídeos, IA" },
        { time: "17h30 - 18h30", block: "❤️ Conexão com Nicoly", objective: "Intervalo dela = tempo VIP" },
        { time: "18h30 - 20h00", block: "⚒️ Execução Light – Tarefas menores", objective: "Revisões, ajustes, coisas rápidas" },
        { time: "20h00 - 21h30", block: "📚 Estudo, leitura ou hobby leve", objective: "Violão, Kindle, inglês, etc." },
        { time: "21h30 - 22h30", block: "🍽️ Jantar + Casal CEO", objective: "Conversa, planejamento, amor" },
        { time: "22h30 - 01h00", block: "⚡ Sprint Noturno – Execução Crítica", objective: "Energy Global, entregas extras" },
        { time: "01h00 - 02h00", block: "🧘 Organização / Preparo do Dia Seguinte", objective: "Checklist, backup, reflexão" },
        { time: "02h00 - 03h00", block: "🌙 Descompressão", objective: "Relaxar a mente, desacelerar" }
    ];

    const routineItemsContainer = document.getElementById('routine-items');
    const activityLogsContainer = document.getElementById('activity-logs');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Carrega logs do localStorage
    let activityLogs = JSON.parse(localStorage.getItem('activityLogs')) || [];

    // Renderiza a rotina
    function renderRoutine() {
        routineItemsContainer.innerHTML = '';
        
        routineData.forEach((item, index) => {
            const routineItem = document.createElement('div');
            routineItem.className = 'routine-item';
            routineItem.dataset.index = index;
            
            routineItem.innerHTML = `
                <div class="time-column">${item.time}</div>
                <div class="block-column">${item.block}</div>
                <div class="objective-column">
                    ${item.objective}
                    <input type="text" class="comment-input" placeholder="Adicionar comentário..." data-index="${index}">
                </div>
                <div class="actions-column">
                    <button class="action-btn start-btn" data-index="${index}">Iniciar</button>
                    <button class="action-btn complete-btn" data-index="${index}">Concluir</button>
                </div>
            `;
            
            routineItemsContainer.appendChild(routineItem);
        });

        // Adiciona event listeners aos botões
        document.querySelectorAll('.start-btn').forEach(btn => {
            btn.addEventListener('click', startActivity);
        });
        
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', completeActivity);
        });
        
        document.querySelectorAll('.comment-input').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    saveComment(this.dataset.index, this.value);
                    this.value = '';
                }
            });
        });
    }

    // Renderiza os logs de atividade
    function renderActivityLogs() {
        activityLogsContainer.innerHTML = '';
        
        if (activityLogs.length === 0) {
            activityLogsContainer.innerHTML = '<div class="log-entry">Nenhuma atividade registrada ainda.</div>';
            return;
        }
        
        // Ordena logs por data (mais recente primeiro)
        const sortedLogs = [...activityLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        sortedLogs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            const logTime = new Date(log.timestamp).toLocaleString('pt-BR');
            const comment = log.comment ? `<span class="log-comment"> - ${log.comment}</span>` : '';
            
            logEntry.innerHTML = `
                <span class="log-time">[${logTime}]</span> 
                ${log.action}: ${log.block} (${log.time})${comment}
            `;
            
            activityLogsContainer.appendChild(logEntry);
        });
    }

    // Registra início de atividade
    function startActivity(e) {
        const index = e.target.dataset.index;
        const item = routineData[index];
        const commentInput = document.querySelector(`.comment-input[data-index="${index}"]`);
        const comment = commentInput.value || null;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: 'INÍCIO',
            time: item.time,
            block: item.block,
            objective: item.objective,
            comment: comment
        };
        
        activityLogs.push(logEntry);
        saveLogs();
        renderActivityLogs();
        
        if (comment) {
            commentInput.value = '';
        }
    }

    // Registra conclusão de atividade
    function completeActivity(e) {
        const index = e.target.dataset.index;
        const item = routineData[index];
        const commentInput = document.querySelector(`.comment-input[data-index="${index}"]`);
        const comment = commentInput.value || null;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: 'CONCLUÍDO',
            time: item.time,
            block: item.block,
            objective: item.objective,
            comment: comment
        };
        
        activityLogs.push(logEntry);
        saveLogs();
        renderActivityLogs();
        
        if (comment) {
            commentInput.value = '';
        }
    }

    // Salva um comentário
    function saveComment(index, comment) {
        if (!comment.trim()) return;
        
        const item = routineData[index];
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: 'COMENTÁRIO',
            time: item.time,
            block: item.block,
            objective: item.objective,
            comment: comment
        };
        
        activityLogs.push(logEntry);
        saveLogs();
        renderActivityLogs();
    }

    // Salva logs no localStorage
    function saveLogs() {
        localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
    }

    // Exporta logs para arquivo JSON
    function exportLogs() {
        const dataStr = JSON.stringify(activityLogs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `logs-rotina-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Limpa todos os logs
    function clearLogs() {
        if (confirm('Tem certeza que deseja limpar todos os logs de atividade? Esta ação não pode ser desfeita.')) {
            activityLogs = [];
            saveLogs();
            renderActivityLogs();
        }
    }

    // Event listeners para botões de controle
    exportBtn.addEventListener('click', exportLogs);
    clearBtn.addEventListener('click', clearLogs);

    // Inicializa a aplicação
    renderRoutine();
    renderActivityLogs();
});
