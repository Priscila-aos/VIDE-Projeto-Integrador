# Validações observadas na demonstração (28/10/2026)

- Busca e filtros, cadastro/edição/exclusão com dados fictícios; EOL duplicado e datas inválidas rejeitados.
- Separação por `aluno_id`; documento do Aluno Fictício Teste 01 não exibido para o Aluno Fictício Teste 02.
- Contatos: cadastro e edição de prioridade.
- Atestados: período, CID, abrangência `Aulas`; upload, visualizar, baixar, substituir e excluir anexos (testado ao menos em atestados).
- Anexos enviados nos módulos Documentos, Ocorrências e Atendimentos.
- Ocorrência: cadastro e impressão.
- Atendimento: cadastro e edição sem duplicar, mantendo registro anterior.
- Evidências pedagógicas e educação especial: cadastros apareceram no portfólio.
- Relatório individual com data vazia: consolidação e impressão/PDF em duas páginas; atualização de abrangência confirmada no PDF.

**Escopo da evidência:** testes manuais com capturas de tela. Não cobre todos os perfis, concorrência, carga, acessibilidade, segurança ou integração real à escola.
