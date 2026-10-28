# V.I.D.E. — Visibilidade das Informações de Dados Estudantis

**Projeto Integrador em Computação II | Protótipo acadêmico (2026)**

O **V.I.D.E.** é um protótipo para organizar informações escolares em portfólios individuais de estudantes. A solução utiliza **Google Apps Script**, **Google Planilhas** e uma interface em **HTML, CSS e JavaScript**. Os arquivos anexados são gerenciados no **Google Drive**.

> **Atenção:** ambiente acadêmico de demonstração, desenvolvido e testado com dados fictícios. Não é um sistema oficial da escola, não está homologado para operação institucional e **não deve receber dados reais de estudantes** sem autorização e controles de segurança adequados.

## Funcionalidades

| Módulo | Recursos disponíveis no protótipo |
| --- | --- |
| Estudantes | Cadastro e edição; pesquisa por nome, EOL ou RA; filtros por série e período; prevenção de EOL duplicado |
| Contatos | Registro de responsáveis, parentesco, telefone e prioridade |
| Atestados | Período, tipo, número de dias, abrangência do afastamento e anexos |
| Atendimentos | Registro de ações, participantes, profissionais responsáveis e encaminhamentos |
| Ocorrências | Histórico, estratégias, encaminhamentos e impressão de registro demonstrativo |
| Documentos | Anexos e modelos demonstrativos de declaração de matrícula e frequência |
| Evidências pedagógicas | Atividades, objetivos, descrições, responsáveis e anexos |
| Educação Especial | Registro demonstrativo de orientações pedagógicas |
| Relatório individual | Consolidação dos registros de um estudante, filtro opcional por período e impressão/PDF |

O relatório individual não inclui CID, laudos, anexos ou registros detalhados de Educação Especial. Os modelos de declaração não têm validade oficial; a frequência escolar não é calculada.

## Arquitetura e fluxo

```text
Interface HTML/CSS/JavaScript
          |
          | google.script.run
          v
Google Apps Script (Código.gs)
          |
          +-- Google Planilhas: dados e vínculos por aluno_id
          |
          +-- Google Drive: arquivos anexados
```

A planilha do protótipo possui oito abas de dados: **Alunos, Contatos, Atestados, Atendimentos, Ocorrencias, Anexos, Evidencias e EducacaoEspecial**. Uma aba técnica oculta, `_VIDE_Config`, pode registrar a referência à pasta de anexos.

## Arquivos do projeto

Após a disponibilização dos demais arquivos deste repositório, a estrutura prevista é:

```text
Código.gs                 Regras de negócio, acesso aos dados, anexos e relatórios
Index.html                Interface principal do protótipo
appsscript.json           Manifesto do Google Apps Script
legacy/                   Arquivos HTML auxiliares preservados
screenshots/              Capturas das telas de teste
docs/                     Documentação técnica e cenários de utilização
```

Os arquivos em `legacy/` foram preservados como material auxiliar e não devem ser interpretados como uma segunda interface em produção.

## Como reproduzir

1. Crie uma **planilha Google nova, vazia e privada**.
2. Abra **Extensões → Apps Script**.
3. Insira o conteúdo de `Código.gs`, crie o arquivo HTML `Index` com o conteúdo de `Index.html` e configure `appsscript.json` conforme o manifesto fornecido.
4. Salve e execute `PrepararAmbienteDeTestes` para criar a estrutura de dados. Autorize somente as permissões solicitadas que forem compatíveis com o uso pretendido.
5. Atualize a planilha e abra o menu **V.I.D.E. — Projeto Integrado → Abrir sistema**.
6. Cadastre **apenas dados fictícios** e execute os cenários descritos na documentação.

O primeiro envio de anexo pode criar uma pasta própria no Google Drive vinculada à planilha. A cópia da planilha **não copia automaticamente** os arquivos armazenados nessa pasta.

## Imagens e documentação

A pasta `screenshots/` reúne imagens dos módulos com dados fictícios. O manual em `docs/` documenta o desenvolvimento, as regras e um roteiro de utilização e testes.

**Versão integrada usada nos testes:** [abrir Google Planilhas](https://docs.google.com/spreadsheets/d/1dd6w0zA1OEzZtK6L5UeVDKzPwPUZlXkCZrJefhpNfQQ/edit?gid=188152873#gid=188152873). O acesso depende das permissões concedidas na planilha; o link não torna o sistema público.

## Segurança e limitações

- Não há autorização institucional por perfil ou restrição específica de acesso por módulo.
- Não há trilha de auditoria imutável de todas as ações.
- As permissões dos anexos no Drive são independentes das permissões da planilha.
- Não houve homologação institucional, ensaio formal de carga ou auditoria completa de acessibilidade e segurança.
- Nunca publique dados escolares reais, credenciais, identificadores privados de arquivos ou exportações de planilhas com informações pessoais.

## Autoria e créditos

O **V.I.D.E. é um projeto acadêmico coletivo**. A identificação nominal da equipe e das contribuições individuais deve ser confirmada com os integrantes antes de ser acrescentada aqui.

**Status:** protótipo funcional em ambiente de testes; não homologado para uso real.