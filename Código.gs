/**
 * PROJETO V.I.D.E. — protótipo de testes, com dados fictícios.
 * Use SOMENTE em uma PLANILHA NOVA, vazia e privada, para avaliação.
 * NÃO publique como aplicativo web nem utilize com dados reais de estudantes
 * antes de validar autenticação, autorizações, LGPD e requisitos da escola.
 */

// Colunas novas são acrescentadas ao final, sem alterar a ordem nem os dados existentes.
const VIDE_TABELAS = {
  Alunos: ['_id','nome','eol','ra','serie','turma','periodo','situacao','responsavel','telefone','criado_em','atualizado_em',
    'codigo_inep','numero_chamada','filiacao','data_nascimento','data_matricula','origem','ensino','teg'],
  Ocorrencias: ['_id','aluno_id','nome_responsavel','telefone','data','responsavel_registro','rf_registro','relato','estrategia','encaminhamento','criado_em','atualizado_em'],
  Atestados: ['_id','aluno_id','data_inicio','data_fim','tipo','observacao','registrado_por','criado_em','atualizado_em',
    'cid','numero_dias','conteudo','abrangencia'],
  Atendimentos: ['_id','aluno_id','data','tipo','descricao','responsavel_registro','encaminhamento','criado_em','atualizado_em',
    'nome_responsavel','acao_realizada','observacao'],
  Contatos: ['_id','aluno_id','nome','parentesco','telefone','whatsapp','email','prioridade','observacao','criado_em','atualizado_em'],
  Anexos: ['_id','aluno_id','modulo','registro_id','nome','mime_type','arquivo_id','criado_em','status'],
  Evidencias: ['_id','aluno_id','data','atividade','objetivo','descricao','responsavel_registro','observacao','criado_em','atualizado_em'],
  EducacaoEspecial: ['_id','aluno_id','data','tipo_documento','orientacao','responsavel_registro','observacao','criado_em','atualizado_em']
};
const VIDE_EDITAVEIS = {
  Alunos: ['nome','eol','ra','serie','turma','periodo','situacao','responsavel','telefone',
    'codigo_inep','numero_chamada','filiacao','data_nascimento','data_matricula','origem','ensino','teg'],
  Ocorrencias: ['nome_responsavel','telefone','data','responsavel_registro','rf_registro','relato','estrategia','encaminhamento'],
  Atestados: ['data_inicio','data_fim','tipo','observacao','registrado_por','cid','numero_dias','conteudo','abrangencia'],
  Atendimentos: ['data','tipo','descricao','responsavel_registro','encaminhamento','nome_responsavel','acao_realizada','observacao'],
  Contatos: ['nome','parentesco','telefone','whatsapp','email','prioridade','observacao'],
  Evidencias: ['data','atividade','objetivo','descricao','responsavel_registro','observacao'],
  EducacaoEspecial: ['data','tipo_documento','orientacao','responsavel_registro','observacao']
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu('V.I.D.E. — Projeto Integrado')
    .addItem('Abrir sistema', 'AbrirSistema')
    .addItem('Atualizar estrutura das abas', 'PrepararAmbienteDeTestes')
    .addToUi();
}

function include(nome) { return HtmlService.createHtmlOutputFromFile(nome).getContent(); }
function AbrirSistema() {
  const html = HtmlService.createTemplateFromFile('Index').evaluate().setWidth(1140).setHeight(690);
  SpreadsheetApp.getUi().showModalDialog(html, 'V.I.D.E. — ambiente de testes');
}
function BuscaAluno() { AbrirSistema(); }
function AbrirPortfolio() { AbrirSistema(); }

/** Cria abas novas e acrescenta SOMENTE as colunas faltantes, preservando dados e IDs. */
function PrepararAmbienteDeTestes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abra este projeto a partir da planilha integrada.');
  const feitas = [];
  Object.keys(VIDE_TABELAS).forEach(nome => {
    const cols = VIDE_TABELAS[nome];
    let aba = ss.getSheetByName(nome);
    if (!aba) {
      aba = ss.insertSheet(nome);
      aba.getRange(1,1,1,cols.length).setValues([cols]);
      aba.setFrozenRows(1);
      feitas.push(nome + ': aba criada');
    } else {
      const existentes = aba.getLastColumn();
      const cab = existentes ? aba.getRange(1,1,1,existentes).getDisplayValues()[0] : [];
      // Não alterar a planilha se alguém editou ou reorganizou os cabeçalhos.
      if (cab.some((c,i) => cols[i] !== c) || cab.length > cols.length)
        throw new Error('Cabeçalhos incompatíveis na aba '+nome+'. Não alterei esta aba.');
      if (cab.length < cols.length) {
        const extras = cols.slice(cab.length);
        aba.getRange(1,cab.length+1,1,extras.length).setValues([extras]);
        feitas.push(nome + ': '+extras.length+' colunas adicionadas');
      }
    }
    aba.getRange(1,1,1,cols.length).setBackground('#17477d').setFontColor('white').setFontWeight('bold');
  });
  return feitas.length ? feitas.join('\n') : 'Estrutura já está atualizada.';
}

function obterAba_(tabela) {
  if (!Object.prototype.hasOwnProperty.call(VIDE_TABELAS, tabela)) throw new Error('Módulo inválido.');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abra o sistema a partir da planilha de testes.');
  const aba = ss.getSheetByName(tabela);
  if (!aba) throw new Error('Falta a aba ' + tabela + '. Execute PrepararAmbienteDeTestes uma vez.');
  validarCabecalho_(aba, tabela);
  return aba;
}
function validarCabecalho_(aba, tabela) {
  const esperado = VIDE_TABELAS[tabela];
  const atual = aba.getRange(1, 1, 1, esperado.length).getDisplayValues()[0];
  if (atual.some((valor, i) => valor !== esperado[i]))
    throw new Error('Aba ' + tabela + ' tem cabeçalhos diferentes. Não alteramos esta aba. Use uma planilha NOVA e vazia.');
}
function todos_(tabela) {
  const sheet = obterAba_(tabela);
  const headers = VIDE_TABELAS[tabela];
  if (sheet.getLastRow() < 2) return [];
  // Mantém o número real da linha mesmo quando existem linhas vazias entre registros.
  // É essencial para editar e excluir a linha certa.
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getDisplayValues()
    .map((row, i) => {
      const obj = { __linha: i + 2 };
      headers.forEach((h, c) => { obj[h] = row[c]; });
      return obj;
    })
    .filter(registro => registro._id);
}
function normalizar_(valor) {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
function pesquisarAlunos(filtros) {
  filtros = filtros || {};
  const termo = normalizar_(filtros.termo);
  const serie = normalizar_(filtros.serie);
  const periodo = normalizar_(filtros.periodo);
  const achados = todos_('Alunos').filter(a =>
    (!termo || [a.nome,a.eol,a.ra].some(v => normalizar_(v).includes(termo))) &&
    (!serie || normalizar_(a.serie) === serie) &&
    (!periodo || normalizar_(a.periodo) === periodo));
  const porPagina = 10;
  const totalPaginas = Math.max(1, Math.ceil(achados.length / porPagina));
  const solicitada = Number(filtros.pagina);
  const pagina = Number.isSafeInteger(solicitada) && solicitada > 0
    ? Math.min(solicitada, totalPaginas) : 1;
  const inicio = (pagina - 1) * porPagina;
  return {total: achados.length, pagina: pagina, porPagina: porPagina, totalPaginas: totalPaginas,
    alunos: achados.slice(inicio, inicio + porPagina).map(limparInternos_)};
}
function limparInternos_(obj) {
  const copia = Object.assign({}, obj);
  delete copia.__linha;
  return copia;
}
function obterAluno(id) {
  return limparInternos_(todos_('Alunos').find(a => a._id === String(id)) || (() => { throw new Error('Aluno não encontrado.'); })());
}
function listarRegistros(tabela, alunoId) {
  if (tabela === 'Alunos') throw new Error('Utilize pesquisarAlunos para estudantes.');
  obterAluno(alunoId);
  return todos_(tabela).filter(r => r.aluno_id === String(alunoId)).map(limparInternos_);
}
function obterRegistro(tabela, id) {
  const registro = todos_(tabela).find(r => r._id === String(id));
  if (!registro) throw new Error('Registro não encontrado.');
  return limparInternos_(registro);
}
function textoSeguro_(valor) {
  let v = String(valor == null ? '' : valor).trim();
  if (v.length > 5000) throw new Error('Um dos campos excedeu 5.000 caracteres.');
  // Impede avaliação de fórmulas introduzidas por valores do formulário.
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}
function validarCampos_(tabela, dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) throw new Error('Dados inválidos.');
  const requeridos = {
    Alunos: ['nome','eol'],
    Ocorrencias: ['data','responsavel_registro','relato'],
    Atestados: ['data_inicio','data_fim','tipo','numero_dias','conteudo'],
    Atendimentos: ['data','tipo','descricao','nome_responsavel','acao_realizada'],
    Contatos: ['nome','parentesco','telefone'],
    Evidencias: ['data','atividade','descricao','responsavel_registro'],
    EducacaoEspecial: ['data','tipo_documento','orientacao','responsavel_registro']
  }[tabela];
  requeridos.forEach(c => { if (!String(dados[c] || '').trim()) throw new Error('Preencha o campo: ' + c); });
  if (tabela === 'Atestados') {
    if (dados.data_fim < dados.data_inicio) throw new Error('A data final é anterior à inicial.');
    if (dados.numero_dias && (!/^\d+$/.test(String(dados.numero_dias)) || Number(dados.numero_dias)<1))
      throw new Error('Número de dias inválido.');
    if (dados.abrangencia && !['Aulas','Educação física','Aulas e educação física'].includes(String(dados.abrangencia)))
      throw new Error('Abrangência do afastamento inválida.');
  }
  ['data','data_inicio','data_fim','data_nascimento','data_matricula'].forEach(c => {
    if (dados[c] && !/^\d{4}-\d{2}-\d{2}$/.test(String(dados[c]))) throw new Error('Data inválida: '+c);
  });
}
function salvarRegistro(tabela, dados) {
  if (!Object.prototype.hasOwnProperty.call(VIDE_EDITAVEIS, tabela)) throw new Error('Módulo inválido.');
  validarCampos_(tabela, dados);
  const lock = LockService.getDocumentLock() || LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = obterAba_(tabela);
    const schema = VIDE_TABELAS[tabela];
    const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const id = String(dados._id || '');
    const anteriores = todos_(tabela);
    const existente = id ? anteriores.find(x => x._id === id) : null;
    if (id && !existente) throw new Error('Registro não encontrado para atualização.');
    // Bloqueia EOL repetido no cadastro e na edição de estudantes.
    // Usa _id para permitir que o aluno mantenha o próprio EOL ao editar seus dados.
    if (tabela === 'Alunos') {
      const eolInformado = String(dados.eol == null ? '' : dados.eol).trim();
      const duplicado = anteriores.some(aluno =>
        aluno._id !== (existente ? existente._id : '') &&
        String(aluno.eol == null ? '' : aluno.eol).trim() === eolInformado
      );
      if (duplicado) throw new Error('Este EOL já está cadastrado para outro estudante.');
    }
    if (tabela !== 'Alunos') {
      if (!dados.aluno_id) throw new Error('Aluno não selecionado.');
      obterAluno(dados.aluno_id);
      if (existente && existente.aluno_id !== String(dados.aluno_id))
        throw new Error('Não é permitido transferir um registro para outro aluno.');
    }
    const novo = existente ? Object.assign({}, existente) : {};
    novo._id = id || Utilities.getUuid();
    if (tabela !== 'Alunos') novo.aluno_id = String(dados.aluno_id);
    VIDE_EDITAVEIS[tabela].forEach(c => { novo[c] = textoSeguro_(dados[c]); });
    novo.criado_em = existente ? existente.criado_em : agora;
    novo.atualizado_em = agora;
    const linha = schema.map(h => String(novo[h] == null ? '' : novo[h]));
    const destino = existente ? existente.__linha : sheet.getLastRow() + 1;
    // Preserva identificadores com zeros à esquerda e datas no formato ISO de entrada.
    sheet.getRange(destino, 1, 1, linha.length).setNumberFormat("@").setValues([linha]);
    SpreadsheetApp.flush();
    return { sucesso: true, id: novo._id, acao: existente ? 'atualizado' : 'criado' };
  } finally { lock.releaseLock(); }
}
function excluirRegistro(tabela, id) {
  if (tabela === 'Alunos') throw new Error('Exclusão de alunos desabilitada neste protótipo.');
  const lock = LockService.getDocumentLock() || LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const row = todos_(tabela).find(r => r._id === String(id));
    if (!row) throw new Error('Registro não encontrado.');
    if (['Ocorrencias','Atestados','Atendimentos','Evidencias','EducacaoEspecial'].includes(tabela) &&
        todos_('Anexos').some(a=>a.modulo===tabela && a.registro_id===String(id) && a.status==='ativo'))
      throw new Error('Exclua os anexos deste registro antes de excluí-lo.');
    obterAba_(tabela).deleteRow(row.__linha);
    return { sucesso: true };
  } finally { lock.releaseLock(); }
}


// ======================= ANEXOS NO GOOGLE DRIVE =======================
// IMPORTANTE: use somente com dados fictícios até a escola aprovar controles de acesso.
// Os arquivos NÃO são compartilhados publicamente pelo código.
const VIDE_TIPOS_ANEXO = ['application/pdf','image/png','image/jpeg'];
const VIDE_TAMANHO_MAX = 5 * 1024 * 1024; // 5 MiB por arquivo
const VIDE_MODULOS_ANEXO = ['Atestados','Ocorrencias','Atendimentos','Documentos','Evidencias','EducacaoEspecial'];

function pastaAnexos_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const idPlanilha = ss.getId();
  let cfg = ss.getSheetByName('_VIDE_Config');
  if (!cfg) { cfg = ss.insertSheet('_VIDE_Config'); cfg.hideSheet(); }
  const registradaPlanilha = String(cfg.getRange('A1').getValue() || '');
  const pastaId = String(cfg.getRange('B1').getValue() || '');
  if (registradaPlanilha === idPlanilha && pastaId) {
    try {return DriveApp.getFolderById(pastaId);} catch (_) { /* Se perdeu acesso, criar outra */ }
  }
  const nome = 'V.I.D.E. - Anexos - ' + idPlanilha.slice(0,10);
  const pais = DriveApp.getFileById(idPlanilha).getParents();
  const pasta = pais.hasNext() ? pais.next().createFolder(nome) : DriveApp.createFolder(nome);
  cfg.getRange('A1:B1').setValues([[idPlanilha,pasta.getId()]]);
  return pasta;
}
function validarVinculoAnexo_(alunoId, modulo, registroId) {
  obterAluno(alunoId);
  if (!VIDE_MODULOS_ANEXO.includes(modulo)) throw new Error('Tipo de anexo inválido.');
  if (modulo !== 'Documentos') {
    const r = obterRegistro(modulo, registroId);
    if (r.aluno_id !== String(alunoId)) throw new Error('Registro de outro aluno.');
  } else if (registroId) throw new Error('Documento geral não recebe ID de registro.');
}
function listarAnexos(alunoId, modulo, registroId) {
  obterAluno(alunoId);
  return todos_('Anexos').filter(a => a.aluno_id === String(alunoId) && a.status === 'ativo' &&
    (!modulo || a.modulo === modulo) && (!registroId || a.registro_id === registroId))
    .map(a => ({_id:a._id,modulo:a.modulo,registro_id:a.registro_id,nome:a.nome,
      mime_type:a.mime_type,criado_em:a.criado_em,
      // Link do Drive respeita as permissões concedidas ao usuário.
      visualizar:'https://drive.google.com/file/d/'+encodeURIComponent(a.arquivo_id)+'/view',
      baixar:'https://drive.google.com/uc?export=download&id='+encodeURIComponent(a.arquivo_id)}));
}
function anexarArquivo(dados) {
  if (!dados || typeof dados !== 'object') throw new Error('Arquivo inválido.');
  const alunoId=String(dados.aluno_id||''), modulo=String(dados.modulo||'');
  const registroId=String(dados.registro_id||'');
  validarVinculoAnexo_(alunoId,modulo,registroId);
  const mime=String(dados.mime_type||'');
  if (!VIDE_TIPOS_ANEXO.includes(mime)) throw new Error('Envie PDF, PNG ou JPG.');
  const base64=String(dados.base64||'');
  if (!base64 || base64.length>Math.ceil(VIDE_TAMANHO_MAX*4/3)+16)
    throw new Error('Arquivo vazio ou acima de 5 MB.');
  const bytes=Utilities.base64Decode(base64);
  if (bytes.length>VIDE_TAMANHO_MAX) throw new Error('Arquivo acima de 5 MB.');
  let nome=String(dados.nome||'anexo').replace(/[\/\\<>:"|?*\x00-\x1f]/g,'_').slice(0,150);
  if (!nome.trim()) nome='anexo';
  const antId=String(dados.substituir_id||'');
  const lock=LockService.getDocumentLock()||LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const antigos=todos_('Anexos');
    const antigo=antId?antigos.find(a=>a._id===antId && a.status==='ativo'):null;
    if (antId && (!antigo || antigo.aluno_id!==alunoId || antigo.modulo!==modulo || antigo.registro_id!==registroId))
      throw new Error('Anexo anterior não corresponde ao registro.');
    const pasta=pastaAnexos_();
    const pastaAlunoNome='Aluno_'+alunoId.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,50);
    const pastas=pasta.getFoldersByName(pastaAlunoNome);
    const pastaAluno=pastas.hasNext()?pastas.next():pasta.createFolder(pastaAlunoNome);
    const arquivo=pastaAluno.createFile(Utilities.newBlob(bytes,mime,nome));
    const novoId=Utilities.getUuid();
    const agora=Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    obterAba_('Anexos').appendRow([novoId,alunoId,modulo,registroId,nome,mime,arquivo.getId(),agora,'ativo']);
    if (antigo) {
      // Primeiro mantém o novo arquivo. Só então arquiva o antigo.
      const colunaStatus=VIDE_TABELAS.Anexos.indexOf('status')+1;
      obterAba_('Anexos').getRange(antigo.__linha,colunaStatus).setValue('substituido');
      try {DriveApp.getFileById(antigo.arquivo_id).setTrashed(true);} catch(e) { /* manter histórico */ }
    }
    return {sucesso:true,id:novoId};
  } finally {lock.releaseLock();}
}
function excluirAnexo(anexoId) {
  const lock=LockService.getDocumentLock()||LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const a=todos_('Anexos').find(x=>x._id===String(anexoId) && x.status==='ativo');
    if (!a) throw new Error('Anexo não encontrado.');
    DriveApp.getFileById(a.arquivo_id).setTrashed(true);
    obterAba_('Anexos').getRange(a.__linha, VIDE_TABELAS.Anexos.indexOf('status')+1).setValue('excluido');
    return {sucesso:true};
  } finally {lock.releaseLock();}
}

function excluirAluno(id) {
  const lock=LockService.getDocumentLock()||LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const aluno=todos_('Alunos').find(a=>a._id===String(id));
    if(!aluno) throw new Error('Aluno não encontrado.');
    if(['Contatos','Ocorrencias','Atestados','Atendimentos','Evidencias','EducacaoEspecial','Anexos'].some(t=>
        todos_(t).some(r=>r.aluno_id===String(id) && (t!=='Anexos'||r.status==='ativo'))))
      throw new Error('Há contatos, registros ou anexos associados. Remova-os antes de excluir o aluno fictício.');
    obterAba_('Alunos').deleteRow(aluno.__linha);
    return {sucesso:true};
  } finally {lock.releaseLock();}
}


// =================== RELATÓRIO INDIVIDUAL DEMONSTRATIVO ===================
// Sem prontuário de Educação Especial, CID ou arquivos sensíveis no PDF consolidado.
// Não é declaração oficial, nem substitui documentos ou registros da escola.
function obterRelatorioIndividual(alunoId, dataInicio, dataFim) {
  const aluno = obterAluno(alunoId);
  const ini = String(dataInicio || ''), fim = String(dataFim || '');
  if ((ini && !/^\d{4}-\d{2}-\d{2}$/.test(ini)) ||
      (fim && !/^\d{4}-\d{2}-\d{2}$/.test(fim)) || (ini && fim && ini > fim))
    throw new Error('Período do relatório inválido.');
  const dentroDoPeriodo = (reg, campo) => {
    const valor = String(reg[campo] || '').slice(0,10);
    return (!ini || (valor && valor >= ini)) && (!fim || (valor && valor <= fim));
  };
  function selecionar(modulo, campo, permitidos) {
    return todos_(modulo).filter(r => r.aluno_id === String(alunoId) && dentroDoPeriodo(r,campo))
      .map(r => Object.fromEntries(permitidos.map(k=>[k,r[k]||''])));
  }
  return {
    aluno: {nome: aluno.nome, eol: aluno.eol, ra: aluno.ra, serie: aluno.serie,
      turma: aluno.turma, periodo: aluno.periodo, situacao: aluno.situacao},
    data_inicio: ini, data_fim: fim,
    contatos: todos_('Contatos').filter(r=>r.aluno_id===String(alunoId))
      .map(r=>({nome:r.nome,parentesco:r.parentesco,telefone:r.telefone,prioridade:r.prioridade})),
    atendimentos: selecionar('Atendimentos','data',['data','tipo','descricao','responsavel_registro','encaminhamento']),
    ocorrencias: selecionar('Ocorrencias','data',['data','relato','estrategia','encaminhamento','responsavel_registro']),
    atestados: selecionar('Atestados','data_inicio',['data_inicio','data_fim','tipo','abrangencia']),
    evidencias: selecionar('Evidencias','data',['data','atividade','objetivo','descricao','responsavel_registro'])
  };
}
