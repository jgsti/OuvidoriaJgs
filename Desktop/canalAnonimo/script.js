 // Sistema de persistência de dados
        const STORAGE_KEY_REPORTS = 'anonymous_reports_data';
        const STORAGE_KEY_ADMIN = 'admin_session';
        const STORAGE_KEY_CREDENTIALS = 'admin_credentials';
        const STORAGE_KEY_TERMS = 'terms_accepted';
        
        // Credenciais padrão - ALTERE ESTAS CREDENCIAIS!
        const DEFAULT_ADMIN_USER = 'jgsadmin';
        const DEFAULT_ADMIN_PASS = 'JgS@2025!';
        
        // Dados em memória
        let reports = [];
        let isAdminLoggedIn = false;

        // Função para verificar se os termos foram aceitos
        function checkTermsAcceptance() {
            try {
                const termsAccepted = localStorage.getItem(STORAGE_KEY_TERMS);
                if (termsAccepted === 'true') {
                    document.getElementById('terms-overlay').style.display = 'none';
                } else {
                    document.getElementById('terms-overlay').style.display = 'flex';
                }
            } catch (e) {
                document.getElementById('terms-overlay').style.display = 'flex';
            }
        }

        // Função para aceitar termos
        function acceptTerms() {
            try {
                localStorage.setItem(STORAGE_KEY_TERMS, 'true');
                document.getElementById('terms-overlay').style.display = 'none';
            } catch (e) {
                console.warn('Não foi possível salvar a aceitação dos termos:', e);
                document.getElementById('terms-overlay').style.display = 'none';
            }
        }

        // Função para rejeitar termos
        function rejectTerms() {
            alert('Para utilizar o sistema, é necessário aceitar os termos de uso e LGPD.');
        }

        // Habilita/desabilita botão de aceitar baseado no checkbox
        document.getElementById('accept-terms').addEventListener('change', function() {
            document.getElementById('accept-btn').disabled = !this.checked;
        });

        // Funções de persistência
        function saveReports() {
            try {
                localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
            } catch (e) {
                console.warn('Não foi possível salvar os dados:', e);
            }
        }

        function loadReports() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
                if (saved) {
                    reports = JSON.parse(saved);
                }
            } catch (e) {
                console.warn('Não foi possível carregar os dados:', e);
                reports = [];
            }
        }

        function saveAdminCredentials() {
            try {
                // Hash simples das credenciais para segurança básica
                const credentials = {
                    user: btoa(DEFAULT_ADMIN_USER), // Base64 encoding
                    pass: btoa(DEFAULT_ADMIN_PASS)  // Base64 encoding
                };
                localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(credentials));
            } catch (e) {
                console.warn('Não foi possível salvar as credenciais:', e);
            }
        }

        function loadAdminCredentials() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
                if (saved) {
                    const credentials = JSON.parse(saved);
                    return {
                        user: atob(credentials.user), // Base64 decoding
                        pass: atob(credentials.pass)  // Base64 decoding
                    };
                }
            } catch (e) {
                console.warn('Não foi possível carregar as credenciais:', e);
            }
            // Retorna credenciais padrão se não conseguir carregar
            return {
                user: DEFAULT_ADMIN_USER,
                pass: DEFAULT_ADMIN_PASS
            };
        }

        function updateAdminCredentials(newUser, newPass) {
            try {
                const credentials = {
                    user: btoa(newUser),
                    pass: btoa(newPass)
                };
                localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(credentials));
                return true;
            } catch (e) {
                console.warn('Não foi possível atualizar as credenciais:', e);
                return false;
            }
        }

        function saveAdminSession() {
            try {
                localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify({
                    loggedIn: isAdminLoggedIn,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('Não foi possível salvar a sessão:', e);
            }
        }
        function loadAdminSession() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY_ADMIN);
                if (saved) {
                    const session = JSON.parse(saved);
                    // Sessão expira em 2 horas
                    const twoHours = 2 * 60 * 60 * 1000;
                    if (session.loggedIn && (Date.now() - session.timestamp) < twoHours) {
                        isAdminLoggedIn = true;
                        document.getElementById('admin-login').classList.add('hidden');
                        document.getElementById('admin-panel').classList.remove('hidden');
                    }
                }
            } catch (e) {
                console.warn('Não foi possível carregar a sessão:', e);
            }
        }

        function clearAllData() {
            if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODAS as denúncias e dados do sistema. Esta ação não pode ser desfeita. Continuar?')) {
                try {
                    localStorage.removeItem(STORAGE_KEY_REPORTS);
                    localStorage.removeItem(STORAGE_KEY_ADMIN);
                    // NÃO remove as credenciais para manter o acesso
                    reports = [];
                    isAdminLoggedIn = false;
                    document.getElementById('admin-login').classList.remove('hidden');
                    document.getElementById('admin-panel').classList.add('hidden');
                    loadAdminReports();
                    alert('✅ Todos os dados foram apagados com sucesso!');
                } catch (e) {
                    console.warn('Erro ao limpar dados:', e);
                }
            }
        }

        // Inicialização ao carregar a página
        function initializeSystem() {
            // Verifica aceitação dos termos primeiro
            checkTermsAcceptance();
            
            loadReports();
            loadAdminSession();
            
            // Inicializa credenciais se não existirem
            const credentials = loadAdminCredentials();
            if (!localStorage.getItem(STORAGE_KEY_CREDENTIALS)) {
                saveAdminCredentials();
            }
            
            // Se estiver na aba admin e logado, carrega os relatórios
            if (isAdminLoggedIn) {
                loadAdminReports();
            }
            
            // Adiciona dados de exemplo apenas se não houver dados salvos
            if (reports.length === 0) {
                addExampleData();
            }
        }

        // Dados de exemplo
        function addExampleData() {
            reports.push({
                id: 'ABC12345',
                type: 'assedio',
                location: 'Departamento RH',
                date: '2024-12-15',
                description: 'Exemplo de denúncia para demonstração do sistema.',
                evidence: 'Mencionou ter testemunhas do ocorrido.',
                submittedAt: '15/12/2024 14:30:25',
                status: 'responded',
                responses: [{
                    message: 'Recebemos sua denúncia e já iniciamos a investigação. Em breve entraremos em contato com mais informações.',
                    date: '16/12/2024 09:15:10'
                }]
            });
            saveReports();
        }

        // Função para gerar código único
        function generateUniqueCode() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }

        // Função para alternar abas
        function showTab(tabName) {
            // Remove active de todas as abas
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Ativa a aba selecionada
            event.target.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');

            // Se for aba admin e estiver logado, carrega os relatórios
            if (tabName === 'admin' && isAdminLoggedIn) {
                loadAdminReports();
            }
        }

        // Função para enviar denúncia
        document.getElementById('report-form').addEventListener('submit', function(e) {
            e.preventDefault();

            const report = {
                id: generateUniqueCode(),
                type: document.getElementById('report-type').value,
                location: document.getElementById('report-location').value,
                date: document.getElementById('report-date').value,
                description: document.getElementById('report-description').value,
                evidence: document.getElementById('report-evidence').value,
                submittedAt: new Date().toLocaleString('pt-BR'),
                status: 'pending',
                responses: []
            };

            reports.push(report);
            saveReports(); // Salva os dados

            // Exibe código de acesso
            document.getElementById('access-code').textContent = report.id;
            document.getElementById('report-success').classList.remove('hidden');
            this.style.display = 'none';

            // Scroll para o código
            document.getElementById('report-success').scrollIntoView({ behavior: 'smooth' });
        });

        // Função para consultar denúncia
        function checkReport() {
            const code = document.getElementById('check-code').value.toUpperCase().trim();
            const resultDiv = document.getElementById('check-result');

            if (!code) {
                resultDiv.innerHTML = '<div class="alert alert-error">Por favor, digite o código de acesso.</div>';
                resultDiv.classList.remove('hidden');
                return;
            }

            const report = reports.find(r => r.id === code);

            if (!report) {
                resultDiv.innerHTML = '<div class="alert alert-error">Código não encontrado. Verifique se digitou corretamente.</div>';
                resultDiv.classList.remove('hidden');
                return;
            }

            let statusBadge = report.status === 'pending' ? 
                '<span class="status-badge status-pending">Pendente</span>' : 
                '<span class="status-badge status-responded">Respondida</span>';

            let responsesHtml = '';
            if (report.responses.length > 0) {
                responsesHtml = '<div class="response-section"><h4>📬 Respostas:</h4>';
                report.responses.forEach(response => {
                    responsesHtml += `
                        <div class="response-item">
                            <div class="response-date">${response.date}</div>
                            <div>${response.message}</div>
                        </div>
                    `;
                });
                responsesHtml += '</div>';
            }

            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    <h3>📋 Status da Denúncia ${code}</h3>
                    <div style="margin: 15px 0;">
                        <strong>Status:</strong> ${statusBadge}<br>
                        <strong>Enviada em:</strong> ${report.submittedAt}<br>
                        <strong>Tipo:</strong> ${getTypeLabel(report.type)}
                    </div>
                    ${responsesHtml}
                </div>
            `;
            resultDiv.classList.remove('hidden');
        }

        // Função para login admin
        function adminLogin() {
            const user = document.getElementById('admin-user').value.trim();
            const pass = document.getElementById('admin-pass').value;
            const errorDiv = document.getElementById('login-error');

            // Limpa erro anterior
            errorDiv.classList.add('hidden');

            if (!user || !pass) {
                errorDiv.textContent = '❌ Por favor, preencha usuário e senha.';
                errorDiv.classList.remove('hidden');
                return;
            }

            // Carrega credenciais salvas
            const savedCredentials = loadAdminCredentials();

            if (user === savedCredentials.user && pass === savedCredentials.pass) {
                isAdminLoggedIn = true;
                saveAdminSession();
                document.getElementById('admin-login').classList.add('hidden');
                document.getElementById('admin-panel').classList.remove('hidden');
                
                // Limpa os campos
                document.getElementById('admin-user').value = '';
                document.getElementById('admin-pass').value = '';
                
                loadAdminReports();
            } else {
                errorDiv.textContent = '❌ Credenciais inválidas! Verifique usuário e senha.';
                errorDiv.classList.remove('hidden');
                
                // Limpa apenas a senha
                document.getElementById('admin-pass').value = '';
            }
        }

        // Função para logout admin
        function adminLogout() {
            isAdminLoggedIn = false;
            try {
                localStorage.removeItem(STORAGE_KEY_ADMIN);
            } catch (e) {
                console.warn('Erro ao fazer logout:', e);
            }
            document.getElementById('admin-login').classList.remove('hidden');
            document.getElementById('admin-panel').classList.add('hidden');
            
            // Limpa os campos de login
            document.getElementById('admin-user').value = '';
            document.getElementById('admin-pass').value = '';
            document.getElementById('login-error').classList.add('hidden');
        }

        // Função para carregar relatórios no admin
        function loadAdminReports() {
            document.getElementById('total-reports').textContent = reports.length;
            const container = document.getElementById('admin-reports');

            if (reports.length === 0) {
                container.innerHTML = '<div class="alert alert-info">📭 Nenhuma denúncia recebida ainda.</div>';
                return;
            }

            let html = '';
            reports.forEach(report => {
                let statusBadge = report.status === 'pending' ? 
                    '<span class="status-badge status-pending">Pendente</span>' : 
                    '<span class="status-badge status-responded">Respondida</span>';

                html += `
                    <div class="report-card">
                        <div class="report-header">
                            <span class="report-code">${report.id}</span>
                            <div>
                                ${statusBadge}
                                <span class="report-date">${report.submittedAt}</span>
                            </div>
                        </div>
                        
                        <div><strong>Tipo:</strong> ${getTypeLabel(report.type)}</div>
                        ${report.location ? `<div><strong>Local:</strong> ${report.location}</div>` : ''}
                        ${report.date ? `<div><strong>Data:</strong> ${new Date(report.date).toLocaleDateString('pt-BR')}</div>` : ''}
                        
                        <div class="report-content">
                            <strong>Descrição:</strong><br>
                            ${report.description}
                        </div>
                        
                        ${report.evidence ? `
                            <div class="report-content">
                                <strong>Evidências:</strong><br>
                                ${report.evidence}
                            </div>
                        ` : ''}

                        <div style="margin-top: 15px;">
                            <textarea id="response-${report.id}" placeholder="Digite sua resposta ou pedido de esclarecimento..." style="width: 100%; margin-bottom: 10px; padding: 10px;"></textarea>
                            <button onclick="sendResponse('${report.id}')" class="btn" style="width: auto; padding: 10px 20px; margin-right: 10px;">📤 Enviar Resposta</button>
                            <button onclick="deleteReport('${report.id}')" class="btn" style="width: auto; padding: 10px 20px; background: linear-gradient(135deg, #dc3545, #c82333);">🗑️ Excluir</button>
                        </div>

                        ${report.responses.length > 0 ? `
                            <div class="response-section">
                                <h5>📬 Respostas Enviadas:</h5>
                                ${report.responses.map(r => `
                                    <div class="response-item">
                                        <div class="response-date">${r.date}</div>
                                        <div>${r.message}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        // Função para enviar resposta
        function sendResponse(reportId) {
            const textarea = document.getElementById(`response-${reportId}`);
            const message = textarea.value.trim();

            if (!message) {
                alert('Por favor, digite uma resposta.');
                return;
            }

            const report = reports.find(r => r.id === reportId);
            if (report) {
                report.responses.push({
                    message: message,
                    date: new Date().toLocaleString('pt-BR')
                });
                report.status = 'responded';
                
                saveReports(); // Salva as alterações
                textarea.value = '';
                loadAdminReports();
                alert('✅ Resposta enviada com sucesso!');
            }
        }

        // Função para excluir denúncia
        function deleteReport(reportId) {
            if (confirm('⚠️ Tem certeza que deseja excluir esta denúncia? Esta ação não pode ser desfeita.')) {
                const index = reports.findIndex(r => r.id === reportId);
                if (index !== -1) {
                    reports.splice(index, 1);
                    saveReports(); // Salva as alterações
                    loadAdminReports();
                    alert('✅ Denúncia excluída com sucesso!');
                }
            }
        }

        // Funções para alterar senha
        function showChangePassword() {
            document.getElementById('change-password-form').classList.remove('hidden');
            document.getElementById('password-change-result').classList.add('hidden');
            
            // Carrega credenciais atuais
            const currentCredentials = loadAdminCredentials();
            document.getElementById('new-admin-user').value = currentCredentials.user;
        }

        function hideChangePassword() {
            document.getElementById('change-password-form').classList.add('hidden');
            document.getElementById('new-admin-user').value = '';
            document.getElementById('new-admin-pass').value = '';
            document.getElementById('password-change-result').classList.add('hidden');
        }

        function changeAdminPassword() {
            const newUser = document.getElementById('new-admin-user').value.trim();
            const newPass = document.getElementById('new-admin-pass').value;
            const resultDiv = document.getElementById('password-change-result');

            if (!newUser || !newPass) {
                resultDiv.innerHTML = '<div class="alert alert-error">❌ Por favor, preencha usuário e senha.</div>';
                resultDiv.classList.remove('hidden');
                return;
            }

            if (newPass.length < 6) {
                resultDiv.innerHTML = '<div class="alert alert-error">❌ A senha deve ter pelo menos 6 caracteres.</div>';
                resultDiv.classList.remove('hidden');
                return;
            }

            if (updateAdminCredentials(newUser, newPass)) {
                resultDiv.innerHTML = '<div class="alert alert-success">✅ Credenciais alteradas com sucesso!</div>';
                resultDiv.classList.remove('hidden');
                
                setTimeout(() => {
                    hideChangePassword();
                    alert('📢 IMPORTANTE: Anote suas novas credenciais!\n\nUsuário: ' + newUser + '\nSenha: ' + newPass);
                }, 1500);
            } else {
                resultDiv.innerHTML = '<div class="alert alert-error">❌ Erro ao alterar credenciais. Tente novamente.</div>';
                resultDiv.classList.remove('hidden');
            }
        }

        // Função para obter label do tipo
        function getTypeLabel(type) {
            const types = {
                'assedio': 'Assédio',
                'discriminacao': 'Discriminação',
                'corrupcao': 'Corrupção',
                'fraude': 'Fraude',
                'violencia': 'Violência',
                'outro': 'Outro'
            };
            return types[type] || type;
        }

        // Formato automático do código
        document.getElementById('check-code').addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });

        // Inicializa o sistema quando a página carrega
        document.addEventListener('DOMContentLoaded', function() {
            initializeSystem();
        });

        // Inicialização imediata para compatibilidade
        initializeSystem();