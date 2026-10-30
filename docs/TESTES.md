# Validações observadas na demonstração (28 a 30/10/2026)

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

## Verificações adicionais — 29 e 30/10/2026

- **Importação de alunos:** 12 registros fictícios incluídos, com `_id` gerado; EOLs já existentes não foram reinseridos. Testes adicionais com cinco e dois alunos.
- **Módulos vinculados:** um registro de teste importado em cada uma das seis abas relacionadas.
- **Reverificação:** 0 novos e 6 **Não adicionados**, com discriminação por módulo; não foi oferecida confirmação quando não existiam novos dados.
- **Dois alunos inéditos:** a verificação apresentou 2 novos e 0 não adicionados; após confirmação, a interface exibiu sucesso e detalhamento expansível.
- **Paginação:** 16 resultados distribuídos em duas páginas, exibindo 11–16 na segunda.
- **Pendente:** inspeção registro a registro nos seis portfólios relacionados, testes de carga, acessibilidade integral, auditoria de segurança e validação institucional.

Consulte [o detalhamento das novidades de 30/10](ATUALIZACOES_30-10-2026.md). As capturas originais dessas etapas estão no Word atualizado e **ainda não constam como arquivos individuais em `screenshots/`**.
