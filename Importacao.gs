/**
 * Importação em lote de estudantes fictícios por CSV (UTF-8).
 * Apenas a aba Alunos. Não importa ou altera registros relacionados.
 * O _id fornecido pelo CSV é ignorado: cada novo aluno recebe um UUID do V.I.D.E.
 * Não utilizar com dados reais sem revisão institucional de segurança e LGPD.
 */
const VIDE_IMPORT_MAX_BYTES = 1000000;
const VIDE_IMPORT_MAX_ALUNOS = 2000;

const VIDE_IMPORT_CAMPOS = {
  nome:'nome', eol:'eol', ra:'ra', ra_prodesp:'ra',
  serie:'serie', turma:'turma', periodo:'periodo', situacao:'situacao',
  responsavel:'responsavel', telefone:'telefone',
  codigo_inep:'codigo_inep', numero_chamada:'numero_chamada', numero:'numero_chamada', n:'numero_chamada',
  filiacao:'filiacao', data_nascimento:'data_nascimento',
  data_matricula:'data_matricula', escola_origem:'origem',
  ensino:'ensino', teg:'teg'
};
// Atenção: a coluna "Origem" do exemplo AranhaMello significa modalidade da
// matrícula ("INICIAL") e NÃO o campo "Escola de origem" do formulário V.I.D.E.

function videCabecalhoImport_(texto) {
  return String(texto == null ? '' : texto).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function videSeparadorCSV_(texto) {
  let linha = '', aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c === '"') {
      if (aspas && texto[i+1] === '"') { i++; continue; }
      aspas = !aspas;
    }
    if (!aspas && (c === '\r' || c === '\n')) break;
    linha += c;
  }
  const contagens = { ',': 0, ';': 0, '\t': 0 };
  aspas = false;
  for (let i = 0; i < linha.length; i++) {
    if (linha[i] === '"') {
      if (aspas && linha[i+1] === '"') { i++; continue; }
      aspas = !aspas;
    } else if (!aspas && Object.prototype.hasOwnProperty.call(contagens, linha[i])) {
      contagens[linha[i]]++;
    }
  }
  return Object.keys(contagens).sort((a, b) => contagens[b] - contagens[a])[0];
}

function videLerCSV_(conteudo) {
  if (typeof conteudo !== 'string' || !conteudo.trim())
    throw new Error('Selecione um arquivo CSV não vazio.');
  if (conteudo.length > VIDE_IMPORT_MAX_BYTES)
    throw new Error('CSV muito grande. Limite: 1 MB.');
  const texto = conteudo.replace(/^\uFEFF/, '');
  const separador = videSeparadorCSV_(texto);
  const linhas = [];
  let celula = '', linha = [], emAspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c === '"') {
      if (emAspas && texto[i+1] === '"') { celula += '"'; i++; }
      else emAspas = !emAspas;
    } else if (!emAspas && c === separador) {
      linha.push(celula); celula = '';
    } else if (!emAspas && (c === '\r' || c === '\n')) {
      if (c === '\r' && texto[i+1] === '\n') i++;
      linha.push(celula);
      if (linha.some(v => v.trim())) linhas.push(linha);
      linha = []; celula = '';
      if (linhas.length > VIDE_IMPORT_MAX_ALUNOS + 1)
        throw new Error('Limite de 2.000 alunos por arquivo.');
    } else {
      celula += c;
    }
  }
  if (emAspas) throw new Error('O arquivo CSV contém aspas não fechadas.');
  linha.push(celula);
  if (linha.some(v => v.trim())) linhas.push(linha);
  if (linhas.length < 2) throw new Error('CSV sem linhas de alunos.');
  if (linhas.length > VIDE_IMPORT_MAX_ALUNOS + 1)
    throw new Error('Limite de 2.000 alunos por arquivo.');
  return linhas;
}

function videDataCSV_(texto, nomeCampo, numLinha) {
  const v = String(texto || '').trim();
  if (!v) return '';
  let m = v.match(/^(\d{4}-\d{2}-\d{2})(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/);
  if (m) return m[1];
  m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return m[3] + '-' + m[2] + '-' + m[1];
  throw new Error('Data inválida em ' + nomeCampo + ', linha ' + numLinha + '. Use AAAA-MM-DD.');
}

function videSituacaoCSV_(texto, numLinha) {
  const v = String(texto || '').trim();
  if (!v) return '';
  const mapa = {
    ativo:'Matriculado', matriculado:'Matriculado',
    transferido:'Transferido', inativo:'Inativo',
    desistente:'Desistente', outros:'Outros', deslocamento:'Deslocamento'
  };
  const traduzido = mapa[videCabecalhoImport_(v)];
  if (!traduzido)
    throw new Error('Situação não reconhecida na linha ' + numLinha +
      '. Utilize Matriculado, Ativo, Transferido, Inativo, Desistente, Deslocamento ou Outros.');
  return traduzido;
}

function videPrepararCSV_(conteudo) {
  const linhas = videLerCSV_(conteudo);
  const cabecalhos = linhas[0].map(videCabecalhoImport_);
  const mapeamento = {};
  const reconhecidas = [], ignoradas = [];
  cabecalhos.forEach((nome, indice) => {
    const campo = VIDE_IMPORT_CAMPOS[nome];
    if (!campo) {
      if (nome) ignoradas.push(linhas[0][indice].trim());
    } else {
      if (Object.prototype.hasOwnProperty.call(mapeamento, campo))
        throw new Error('Há duas colunas correspondentes ao campo ' + campo + '.');
      mapeamento[campo] = indice;
      reconhecidas.push(campo);
    }
  });
  if (!Object.prototype.hasOwnProperty.call(mapeamento,'nome') ||
      !Object.prototype.hasOwnProperty.call(mapeamento,'eol'))
    throw new Error('O CSV precisa conter as colunas Nome e EOL.');
  const alunos = [], vistos = new Set();
  linhas.slice(1).forEach((linha, indice) => {
    const numero = indice + 2;
    const dados = {};
    Object.keys(mapeamento).forEach(campo => {
      dados[campo] = String(linha[mapeamento[campo]] == null ? '' : linha[mapeamento[campo]]).trim();
    });
    ['data_nascimento','data_matricula'].forEach(campo => {
      if (dados[campo]) dados[campo] = videDataCSV_(dados[campo], campo, numero);
    });
    if (dados.situacao) dados.situacao = videSituacaoCSV_(dados.situacao, numero);
    try {
      validarCampos_('Alunos', dados);
      VIDE_EDITAVEIS.Alunos.forEach(campo => { dados[campo] = textoSeguro_(dados[campo]); });
    } catch (erro) {
      throw new Error('Linha ' + numero + ': ' + erro.message);
    }
    const eol = String(dados.eol).trim();
    if (vistos.has(eol))
      throw new Error('EOL duplicado dentro do arquivo, linha ' + numero + '.');
    vistos.add(eol);
    alunos.push(dados);
  });
  return { alunos: alunos, reconhecidas: reconhecidas, ignoradas: ignoradas };
}

function analisarImportacaoAlunosCSV(conteudo) {
  const dados = videPrepararCSV_(conteudo);
  const existentes = new Set(todos_('Alunos').map(a => String(a.eol).trim()));
  const repetidos = dados.alunos.filter(a => existentes.has(a.eol)).length;
  return {
    total: dados.alunos.length,
    novos: dados.alunos.length - repetidos,
    jaExistentes: repetidos,
    campos: dados.reconhecidas,
    ignorados: dados.ignoradas
  };
}

function importarAlunosCSV(conteudo) {
  const dados = videPrepararCSV_(conteudo);
  const lock = LockService.getDocumentLock() || LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const aba = obterAba_('Alunos');
    const existentes = new Set(todos_('Alunos').map(a => String(a.eol).trim()));
    const novos = dados.alunos.filter(a => !existentes.has(a.eol));
    const ignorados = dados.alunos.length - novos.length;
    const schema = VIDE_TABELAS.Alunos;
    const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const linhas = novos.map(dadosAluno => {
      const aluno = Object.assign({}, dadosAluno, {
        _id: Utilities.getUuid(), criado_em: agora, atualizado_em: agora
      });
      return schema.map(campo => String(aluno[campo] == null ? '' : aluno[campo]));
    });
    if (linhas.length) {
      const primeira = aba.getLastRow() + 1;
      aba.getRange(primeira, 1, linhas.length, schema.length)
        .setNumberFormat('@').setValues(linhas);
      SpreadsheetApp.flush();
    }
    return { importados: novos.length, ignorados: ignorados };
  } finally {
    lock.releaseLock();
  }
}
