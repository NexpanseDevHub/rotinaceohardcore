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
    const exportJsonBtn = document.getElementById('export-json-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Carrega logs do localStorage
    let activityLogs = JSON.parse(localStorage.getItem('activityLogs')) || [];
    let activeTimers = JSON.parse(localStorage.getItem('activeTimers')) || {};
    let timerIntervals = {};

    // Inicializa os timers ativos
    function initializeTimers() {
        for (const index in activeTimers) {
            if (activeTimers.hasOwnProperty(index)) {
                startTimerVisual(index, activeTimers[index].startTime);
            }
        }
    }

    // Renderiza a rotina
    function renderRoutine() {
        routineItemsContainer.innerHTML = '';
        
        routineData.forEach((item, index) => {
            const routineItem = document.createElement('div');
            routineItem.className = `routine-item ${activeTimers[index] ? 'active' : ''}`;
            routineItem.dataset.index = index;
            
            const timerValue = activeTimers[index] 
                ? formatTime(Math.floor((Date.now() - new Date(activeTimers[index].startTime).getTime()) / 1000))
                : '00:00';
            
            routineItem.innerHTML = `
                <div class="time-column">${item.time}</div>
                <div class="block-column">${item.block}</div>
                <div class="objective-column">
                    ${item.objective}
                    <input type="text" class="comment-input" placeholder="Adicionar comentário..." data-index="${index}">
                </div>
                <div class="actions-column">
                    <button class="action-btn start-btn" data-index="${index}" ${activeTimers[index] ? 'disabled' : ''}>Iniciar</button>
                    <button class="action-btn complete-btn" data-index="${index}" ${!activeTimers[index] ? 'disabled' : ''}>Concluir</button>
                </div>
                <div class="timer-column" data-timer="${index}">${timerValue}</div>
            `;
            
            routineItemsContainer.appendChild(routineItem);
        });

        // Adiciona event listeners
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
            const comment = log.comment ? `<div class="log-comment">${log.comment}</div>` : '';
            
            logEntry.innerHTML = `
                <span class="log-time">[${logTime}]</span>
                <span class="log-action">${log.action}:</span>
                <span class="log-block">${log.block}</span>
                <span>(${log.time})</span>
                ${comment}
            `;
            
            activityLogsContainer.appendChild(logEntry);
        });
    }

    // Inicia uma atividade
    function startActivity(e) {
        const index = e.target.dataset.index;
        const item = routineData[index];
        const commentInput = document.querySelector(`.comment-input[data-index="${index}"]`);
        const comment = commentInput.value || null;
        
        const startTime = new Date().toISOString();
        
        // Registra o timer ativo
        activeTimers[index] = { startTime };
        saveActiveTimers();
        
        // Atualiza a UI
        document.querySelector(`.routine-item[data-index="${index}"]`).classList.add('active');
        e.target.disabled = true;
        document.querySelector(`.complete-btn[data-index="${index}"]`).disabled = false;
        
        // Inicia o timer visual
        startTimerVisual(index, startTime);
        
        // Cria log de início
        const logEntry = {
            timestamp: startTime,
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

    // Conclui uma atividade
    function completeActivity(e) {
        const index = e.target.dataset.index;
        const item = routineData[index];
        const commentInput = document.querySelector(`.comment-input[data-index="${index}"]`);
        const comment = commentInput.value || null;
        
        const endTime = new Date().toISOString();
        const startTime = new Date(activeTimers[index].startTime);
        const duration = Math.floor((new Date(endTime) - startTime) / 1000);
        
        // Remove o timer ativo
        clearTimer(index);
        
        // Atualiza a UI
        document.querySelector(`.routine-item[data-index="${index}"]`).classList.remove('active');
        e.target.disabled = true;
        document.querySelector(`.start-btn[data-index="${index}"]`).disabled = false;
        
        // Cria log de conclusão
        const logEntry = {
            timestamp: endTime,
            action: 'CONCLUÍDO',
            time: item.time,
            block: item.block,
            objective: item.objective,
            comment: comment,
            duration: duration
        };
        
        activityLogs.push(logEntry);
        saveLogs();
        renderActivityLogs();
        
        if (comment) {
            commentInput.value = '';
        }
    }

    // Inicia o timer visual
    function startTimerVisual(index, startTime) {
        const timerElement = document.querySelector(`.timer-column[data-timer="${index}"]`);
        
        // Limpa qualquer intervalo existente
        if (timerIntervals[index]) {
            clearInterval(timerIntervals[index]);
        }
        
        // Atualiza imediatamente
        updateTimerDisplay(index, startTime, timerElement);
        
        // Configura a atualização contínua
        timerIntervals[index] = setInterval(() => {
            updateTimerDisplay(index, startTime, timerElement);
        }, 1000);
    }

    // Atualiza o display do timer
    function updateTimerDisplay(index, startTime, timerElement) {
        const elapsedSeconds = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
        timerElement.textContent = formatTime(elapsedSeconds);
    }

    // Formata o tempo (segundos para MM:SS)
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Limpa um timer
    function clearTimer(index) {
        if (timerIntervals[index]) {
            clearInterval(timerIntervals[index]);
            delete timerIntervals[index];
        }
        
        if (activeTimers[index]) {
            delete activeTimers[index];
            saveActiveTimers();
        }
        
        const timerElement = document.querySelector(`.timer-column[data-timer="${index}"]`);
        if (timerElement) {
            timerElement.textContent = '00:00';
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

    // Salva timers ativos no localStorage
    function saveActiveTimers() {
        localStorage.setItem('activeTimers', JSON.stringify(activeTimers));
    }

    // Exporta logs para JSON
    function exportToJson() {
        const dataStr = JSON.stringify(activityLogs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `logs-rotina-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Exporta logs para CSV
    function exportToCsv() {
        if (activityLogs.length === 0) {
            alert('Nenhum dado para exportar!');
            return;
        }
        
        // Cabeçalhos do CSV
        let csv = 'Data,Hora,Ação,Bloco,Período,Objetivo,Duração (segundos),Comentário\n';
        
        // Adiciona cada linha
        activityLogs.forEach(log => {
            const dateTime = new Date(log.timestamp);
            const date = dateTime.toLocaleDateString('pt-BR');
            const time = dateTime.toLocaleTimeString('pt-BR');
            
            const duration = log.duration || '';
            const comment = log.comment ? `"${log.comment.replace(/"/g, '""')}"` : '';
            
            csv += `"${date}","${time}","${log.action}","${log.block}","${log.time}","${log.objective}",${duration},${comment}\n`;
        });
        
        // Cria o arquivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `logs-rotina-${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
    exportJsonBtn.addEventListener('click', exportToJson);
    exportCsvBtn.addEventListener('click', exportToCsv);
    clearBtn.addEventListener('click', clearLogs);

    // Inicializa a aplicação
    initializeTimers();
    renderRoutine();
    renderActivityLogs();
});
