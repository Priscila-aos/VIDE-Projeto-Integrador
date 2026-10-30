# Atualizações do V.I.D.E. — 30/10/2026

> Complemento técnico à [documentação-base](Documentacao_Completa_VIDE.pdf), datada de 28/10/2026. As operações descritas foram documentadas no protótipo acadêmico com dados fictícios. Este arquivo não substitui o relatório no modelo da UNIVESP.

## 1. Importação de planilhas Excel e CSV

A tela **Busca de estudantes** oferece **Importar planilha (Excel / CSV)**. O fluxo é:

1. Selecionar o arquivo de origem.
2. Clicar em **Verificar planilha** para revisar, **sem gravar registros**.
3. Quando existirem novos registros, clicar em **Confirmar importação** para solicitar a gravação.
4. Conferir a mensagem de conclusão e, quando oferecido, **Ver detalhes por módulo**.

- **Excel (.xlsx):** admite várias abas no mesmo arquivo, reconhecidas pelos nomes.
- **CSV (.csv):** uma aba por vez, com seleção do módulo correspondente.
- **Abas aceitas:** Alunos, Contatos, Atestados, Atendimentos (também denominados Registros em algumas origens), Ocorrências, Evidências e Educação Especial.
- **Fora do escopo:** Anexos, Notas, Usuários, arquivos binários, senhas e credenciais.
- **Limites informados na interface:** 5 MB por arquivo e 3.000 linhas por aba. Isso não constitui garantia de desempenho para qualquer volume ou formato.
- Antes do envio, consulte a seção expansível **Como preparar a planilha, vincular registros e entender os limites**.

### Identificadores e relacionamento entre abas

- Em **Alunos**, **Nome** e **EOL** são obrigatórios.
- O campo `_id` pode ficar vazio na origem de novos alunos. A importação gera identificadores internos para os registros incluídos.
- Nos módulos vinculados, use **EOL** ou **aluno_id** correspondente ao `_id` da aba Alunos na planilha de origem. Quando `aluno_id` for utilizado, os identificadores de origem devem estar preenchidos e consistentes.
- Os registros relacionados incluídos recebem novos valores de `_id`, sem reaproveitar os identificadores internos da origem.
- A verificação procura evitar a reinserção de registros repetidos, preservando os existentes.

### Resumo da verificação

A interface apresenta **Registros novos** e **Não adicionados**, com detalhamento por aba quando aplicável.

**Não adicionados** é um rótulo de resultado, não necessariamente um erro. Pode abranger registros já existentes e outros registros repetidos segundo as regras de verificação; o motivo de cada caso depende dos dados analisados.

Quando não há registros novos, o botão **Confirmar importação** não aparece. Após uma importação efetiva, a interface apresenta uma confirmação visual (em verde na implementação registrada) e permite expandir o detalhamento por módulo.

## 2. Paginação da busca

- A pesquisa exibe **até 10 estudantes por página**.
- Os controles **Anterior** e **Próxima** permitem navegar pelos resultados encontrados, mantendo os filtros.
- O limite de itens visíveis **não limita o total de estudantes cadastráveis**.
- Exemplo registrado em tela: **16 encontrados**, **página 2 de 2**, exibindo os estudantes **11–16 de 16**.

## 3. Evidências observadas em testes manuais

| Teste | Evidência registrada |
| --- | --- |
| Importação de alunos | 12 estudantes fictícios incluídos, com `_id` automático; EOLs repetidos não foram reinseridos |
| Testes adicionais | Arquivos de 5 e 2 estudantes fictícios também foram exercitados |
| Módulos vinculados | Um registro fictício importado em cada uma das seis abas vinculadas |
| Nova verificação dos módulos | **0 novos; 6 não adicionados**, discriminados por aba; sem botão de confirmação |
| Verificação de dois estudantes inéditos | **2 novos; 0 não adicionados**, com opção de confirmar |
| Confirmação da importação | Mensagem de conclusão indicando inclusão de 2 registros e detalhe expansível |
| Paginação | 16 resultados distribuídos em 2 páginas; a segunda apresenta os itens 11–16 |

As capturas referentes a essas verificações foram incorporadas ao documento Word **VIDE_Documentacao_Atualizada_30-10-2026.docx** (Figuras 13–20), preparado para a documentação acadêmica. **Essas imagens ainda precisam ser publicadas individualmente na pasta `screenshots/` deste repositório** para que também possam ser consultadas diretamente no GitHub.

## 4. Procedimentos de demonstração

1. **Abrir importação:** na tela de busca, escolher *Importar planilha (Excel / CSV)*.
2. **Conferir orientações:** expandir o texto de preparação, IDs, módulos e limites.
3. **Rever dados repetidos:** selecionar um arquivo anteriormente importado, executar *Verificar planilha*, conferir os contadores e a ausência de confirmação quando não existirem novos registros.
4. **Importar novos dados:** verificar uma planilha com dois alunos fictícios inéditos, conferir o resumo e confirmar.
5. **Conferir conclusão:** examinar a mensagem de sucesso e expandir *Ver detalhes por módulo*.
6. **Conferir paginação:** executar busca que retorne mais de dez alunos e navegar entre páginas.

## 5. Limites da evidência

Não estão comprovados por essas capturas:

- Conferência individual e sistemática, nos respectivos portfólios, de cada um dos seis registros importados nos módulos vinculados.
- Testes automatizados, de grande volume, controle de acesso por papéis, acessibilidade integral, auditoria de segurança e recuperação de desastres.
- Homologação institucional, validação participativa em ambiente escolar ou autorização para uso com informações reais.

**Segurança:** o V.I.D.E. é um protótipo acadêmico e não está apto a receber dados reais de estudantes. Dados de saúde e informações de Educação Especial requerem proteção específica, governança, autorizações e medidas de LGPD. Não inclua dados identificáveis, credenciais nem planilhas escolares reais no repositório.

## 6. Siglas e termos utilizados

| Termo | Significado |
| --- | --- |
| V.I.D.E. | Visibilidade das Informações de Dados Estudantis |
| EOL | Escola Online — sistema escolar da rede municipal de São Paulo |
| RA | Registro do Aluno — identificação escolar da rede estadual de São Paulo |
| INEP | Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira |
| TEG | Transporte Escolar Gratuito |
| RF | Registro Funcional |
| CID | Classificação Internacional de Doenças |
| LGPD | Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) |
| WCAG | Web Content Accessibility Guidelines |
| CSV | Comma-Separated Values |
| XLSX | Formato de planilha do Excel baseado em Office Open XML |
| PDF | Portable Document Format |
| `_id` / ID | Identificador interno do registro |
| `aluno_id` | Identificador utilizado para associar um registro ao estudante |

Referências para nomenclatura escolar: [SME São Paulo — Transporte Escolar Gratuito](https://educacao.sme.prefeitura.sp.gov.br/transporte-escolar-gratuito/), [SED São Paulo — Consulta Pública de Matrícula](https://sed.educacao.sp.gov.br/ConsultaPublica/Index), [Prefeitura de São Paulo — identidade funcional](https://www2.prefeitura.sp.gov.br/web/gestao/w/identidade-funcional-est%C3%A1-de-cara-nova).

---

**Documentação de referência:** Word atualizado em 30/10/2026, com capturas originais de testes fictícios. O PDF `Documentacao_Completa_VIDE.pdf` atualmente disponível no repositório corresponde à versão-base anterior; este complemento registra as funcionalidades posteriores até que a versão ilustrada atualizada seja publicada em PDF.
