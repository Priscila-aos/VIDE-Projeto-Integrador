/**
 * V.I.D.E. | Importação de planilhas — SOMENTE DADOS FICTÍCIOS.
 * Excel (.xlsx): importa múltiplas abas estruturadas de uma só vez.
 * CSV (.csv): importa uma aba por vez, escolhida pelo usuário.
 * Preserva registros existentes; gera UUIDs novos; vincula registros ao aluno.
 * Não importa arquivos de Anexos, notas ou credenciais de Usuários.
 * Não habilita operação institucional ou tratamento de dados reais.
 */
const VIDE2_TABELAS = ['Alunos','Contatos','Atestados','Atendimentos','Ocorrencias','Evidencias','EducacaoEspecial'];
const VIDE2_MAX_BYTES = 2500000;
const VIDE2_MAX_UNZIP = 18000000;
const VIDE2_MAX_LINHAS = 3000;
const VIDE2_ALIASES = {
  aluno:'Alunos', alunos:'Alunos', estudantes:'Alunos',
  contato:'Contatos', contatos:'Contatos',
  atestado:'Atestados', atestados:'Atestados',
  atendimento:'Atendimentos', atendimentos:'Atendimentos', registros:'Atendimentos', registro:'Atendimentos',
  ocorrencia:'Ocorrencias', ocorrencias:'Ocorrencias',
  evidencia:'Evidencias', evidencias:'Evidencias',
  educacaoespecial:'EducacaoEspecial', educacao_especial:'EducacaoEspecial'
};
const VIDE2_COLUNAS = {
  Alunos:{ra_prodesp:'ra',codigo_inep:'codigo_inep',n:'numero_chamada',nº:'numero_chamada',
    filiacao:'filiacao',data_nascimento:'data_nascimento',data_matricula:'data_matricula'},
  Contatos:{telefone_whatsapp:'whatsapp',mail:'email',telefone_celular:'telefone'},
  Atestados:{data:'data_inicio'},
  Atendimentos:{bme_responsavel:'nome_responsavel',bme_responsav:'nome_responsavel',acao:'acao_realizada'},
  Ocorrencias:{},
  Evidencias:{},
  EducacaoEspecial:{}
};
function vide2Norm_(v) {
  return String(v == null ? '' : v).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}
function vide2NomeModulo_(nome) {
  const normal = vide2Norm_(nome).replace(/_/g,'');
  return VIDE2_ALIASES[vide2Norm_(nome)] ||
    VIDE2_ALIASES[normal] || '';
}
function vide2Payload_(entrada) {
  if (!entrada || typeof entrada !== 'object' || !/^[\w .()\-]+?\.(xlsx|csv)$/i.test(entrada.nome || ''))
    throw new Error('Envie um arquivo .xlsx ou .csv válido.');
  if (!entrada.base64 || typeof entrada.base64 !== 'string' ||
      entrada.base64.length > Math.ceil(VIDE2_MAX_BYTES*4/3)+30)
    throw new Error('Arquivo inválido ou acima do limite de 2,5 MB.');
  const bytes = Utilities.base64Decode(entrada.base64);
  if (bytes.length > VIDE2_MAX_BYTES) throw new Error('Arquivo acima do limite de 2,5 MB.');
  return bytes;
}
function vide2Coluna_(ref) {
  const letras = String(ref || '').match(/^[A-Z]+/i);
  if (!letras) return -1;
  let n=0;
  for (const letra of letras[0].toUpperCase()) n=n*26+letra.charCodeAt(0)-64;
  return n-1;
}
function vide2Texto_(elem) {
  if (!elem) return '';
  let saida = elem.getName()==='t' ? elem.getText() : '';
  elem.getChildren().forEach(filho => { saida+=vide2Texto_(filho); });
  return saida;
}
function vide2PlanilhaXLSX_(bytes) {
  const blob=Utilities.newBlob(bytes,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','origem.xlsx');
  let arquivos;
  try { arquivos=Utilities.unzip(blob); }
  catch(e){ throw new Error('Não foi possível abrir o arquivo Excel (.xlsx).'); }
  const mapa={};let totalTamanho=0;
  arquivos.forEach(a=>{
    totalTamanho+=a.getBytes().length;
    if(totalTamanho>VIDE2_MAX_UNZIP)throw new Error('Conteúdo do Excel excede o limite permitido.');
    mapa[a.getName().replace(/^\/+/, '')]=a.getDataAsString('UTF-8');
  });
  const ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const nsDoc=XmlService.getNamespace(ns);
  const nsAttr=XmlService.getNamespace('r','http://schemas.openxmlformats.org/officeDocument/2006/relationships');
  const nsPkg=XmlService.getNamespace('http://schemas.openxmlformats.org/package/2006/relationships');
  const xml=nome=>{
    if(!Object.prototype.hasOwnProperty.call(mapa,nome))throw new Error('Arquivo Excel incompleto: '+nome);
    try{return XmlService.parse(mapa[nome]).getRootElement();}
    catch(e){throw new Error('Não foi possível interpretar a guia Excel: '+nome);}
  };
  const wb=xml('xl/workbook.xml');
  const rels=xml('xl/_rels/workbook.xml.rels').getChildren('Relationship',nsPkg);
  const destinos={};
  rels.forEach(r=>{
    const id=r.getAttribute('Id'),target=r.getAttribute('Target');
    const modo=r.getAttribute('TargetMode');
    if (!id||!target||(modo&&modo.getValue()==='External'))return;
    let caminho=target.getValue().replace(/^\/+/,'');
    if(!caminho.startsWith('xl/')) caminho='xl/'+caminho.replace(/^\.\//,'');
    if(/(^|\/)\.\.(\/|$)/.test(caminho))return;
    destinos[id.getValue()]=caminho;
  });
  const strings=[];
  if(mapa['xl/sharedStrings.xml']){
    xml('xl/sharedStrings.xml').getChildren('si',nsDoc).forEach(si=>strings.push(vide2Texto_(si)));
  }
  const ret=[];
  const sheets=wb.getChild('sheets',nsDoc);
  if(!sheets)throw new Error('Não foram encontradas guias no arquivo Excel.');
  sheets.getChildren('sheet',nsDoc).forEach(sh=>{
    const nome=sh.getAttribute('name')?.getValue()||'';
    const id=sh.getAttribute('id',nsAttr)?.getValue();
    const modulo=vide2NomeModulo_(nome);
    if(!modulo){ret.push({nome:nome,modulo:'',linhas:[]});return;}
    const local=destinos[id];
    if(!local)throw new Error('Não foi possível localizar a guia '+nome+'.');
    const plan=xml(local);
    const sheetData=plan.getChild('sheetData',nsDoc);
    const linhas=[];
    if(sheetData)sheetData.getChildren('row',nsDoc).forEach(row=>{
      const valores=[];
      row.getChildren('c',nsDoc).forEach(c=>{
        const ref=c.getAttribute('r')?.getValue()||'';
        const col=vide2Coluna_(ref);
        if(col<0||col>100) return;
        const tipo=c.getAttribute('t')?.getValue()||'';
        const v=c.getChild('v',nsDoc);
        const is=c.getChild('is',nsDoc);
        const raw=tipo==='inlineStr'?vide2Texto_(is):(v?v.getText():'');
        valores[col]=tipo==='s'?strings[Number(raw)]||'':raw;
      });
      if(valores.some(v=>String(v==null?'':v).trim()))linhas.push(valores);
      if(linhas.length>VIDE2_MAX_LINHAS+1)throw new Error('Guia '+nome+': limite de 3.000 registros.');
    });
    ret.push({nome:nome,modulo:modulo,linhas:linhas});
  });
  return ret;
}
function vide2CSV_(bytes,modulo) {
  if(!VIDE2_TABELAS.includes(modulo))throw new Error('Selecione a aba correspondente ao arquivo CSV.');
  const texto=Utilities.newBlob(bytes,'text/csv','origem.csv').getDataAsString('UTF-8').replace(/^\uFEFF/,'');
  const primeira=texto.split(/\r?\n/,1)[0]||'';
  const sep=[';',',','\t'].sort((a,b)=>primeira.split(b).length-primeira.split(a).length)[0];
  const linhas=Utilities.parseCsv(texto,sep).filter(row=>row.some(v=>String(v||'').trim()));
  if(linhas.length>VIDE2_MAX_LINHAS+1)throw new Error('Limite de 3.000 registros por CSV.');
  return [{nome:modulo,modulo:modulo,linhas:linhas}];
}
function vide2Data_(valor,campo,contexto) {
  const s=String(valor||'').trim();
  if(!s)return '';
  let m=s.match(/^(\d{4}-\d{2}-\d{2})(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/);
  if(m)return m[1];
  m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(m)return m[3]+'-'+m[2]+'-'+m[1];
  if(/^\d+(\.\d+)?$/.test(s)){
    const n=Number(s);
    if(n>10000&&n<100000){
      return Utilities.formatDate(new Date(Math.round((n-25569)*86400000)),'UTC','yyyy-MM-dd');
    }
  }
  throw new Error(contexto+': data inválida em '+campo+'.');
}
function vide2PreparaTabela_(guia) {
  if(guia.linhas.length===0)return [];
  const schema=VIDE_TABELAS[guia.modulo];
  const cab=guia.linhas[0].map(vide2Norm_);
  const map={};
  cab.forEach((c,i)=>{
    let campo=(VIDE2_COLUNAS[guia.modulo]||{})[c]||c;
    // Nunca reusar o UUID da fonte para identificar os novos registros.
    if(c==='id'||c==='_id')campo='_id';
    if(!schema.includes(campo)&&!['_id','eol','aluno_id'].includes(campo))return;
    if(map[campo]!=null)throw new Error('Guia '+guia.nome+': colunas duplicadas para '+campo+'.');
    map[campo]=i;
  });
  const required=guia.modulo==='Alunos'?['nome','eol']:['aluno_id'];
  if(guia.modulo==='Alunos'&&(!('nome'in map)||!('eol'in map)))
    throw new Error('Guia Alunos: faltam as colunas Nome e EOL.');
  if(guia.modulo!=='Alunos'&&map.aluno_id==null&&map.eol==null)
    throw new Error('Guia '+guia.nome+': informe aluno_id ou EOL para vincular os registros.');
  return guia.linhas.slice(1).filter(row=>row.some(v=>String(v||'').trim()))
    .map((row,i)=>{
      const contexto=guia.nome+' (linha '+(i+2)+')';
      const d={};
      Object.keys(map).forEach(k=>{d[k]=String(row[map[k]]==null?'':row[map[k]]).trim();});
      ['data','data_inicio','data_fim','data_nascimento','data_matricula'].forEach(k=>{
        if(d[k])d[k]=vide2Data_(d[k],k,contexto);
      });
      if(guia.modulo==='Atestados'&&d.data_inicio&&!d.data_fim&&/^[1-9]\d*$/.test(d.numero_dias||'')){
        const ini=new Date(d.data_inicio+'T00:00:00Z');
        ini.setUTCDate(ini.getUTCDate()+Number(d.numero_dias)-1);
        d.data_fim=Utilities.formatDate(ini,'UTC','yyyy-MM-dd');
      }
      if(guia.modulo==='Alunos'&&d.situacao){
        const situacoes={ativo:'Matriculado',matriculado:'Matriculado',transferido:'Transferido',inativo:'Inativo',desistente:'Desistente',outros:'Outros'};
        d.situacao=situacoes[vide2Norm_(d.situacao)]||d.situacao;
      }
      // Código associado ao estudante será resolvido depois da leitura de todas as guias.
      const dados={_fonteId:d._id||'',_origemEol:d.eol||'',_refAluno:d.aluno_id||'',_contexto:contexto};
      VIDE_EDITAVEIS[guia.modulo].forEach(campo=>{
        dados[campo]=textoSeguro_(d[campo]||'');
      });
      if(guia.modulo==='Alunos'&&(!dados.nome||!dados.eol))
        throw new Error(contexto+': Nome e EOL são obrigatórios.');
      return dados;
    });
}
function vide2Chave_(modulo,registro) {
  return [registro.aluno_id].concat(VIDE_EDITAVEIS[modulo].map(k=>String(registro[k]||'').trim())).join('\u001F');
}
function vide2Plano_(entrada) {
  const bytes=vide2Payload_(entrada);
  const guias=/\.xlsx$/i.test(entrada.nome)?
    vide2PlanilhaXLSX_(bytes):vide2CSV_(bytes,entrada.moduloCsv);
  const agrupadas={}; const ignoradas=[];
  guias.forEach(g=>{
    if(!g.modulo){ignoradas.push(g.nome);return;}
    if(agrupadas[g.modulo])throw new Error('Existem duas guias correspondentes a '+g.modulo+'.');
    agrupadas[g.modulo]=vide2PreparaTabela_(g);
  });
  if(!Object.keys(agrupadas).length)throw new Error('Nenhuma guia compatível encontrada.');
  const atuais=todos_('Alunos');
  const eolParaId=new Map(atuais.map(a=>[String(a.eol).trim(),a._id]));
  const idFonteParaId=new Map(atuais.map(a=>[String(a._id),String(a._id)]));
  const plano={}; const qtd={};
  let quantidadeTotal=0;
  const alunos=agrupadas.Alunos||[];
  const vistosEol=new Set();
  plano.Alunos=[];
  alunos.forEach(d=>{
    const eol=String(d.eol||'').trim();
    if(vistosEol.has(eol))throw new Error(d._contexto+': EOL duplicado no arquivo.');
    vistosEol.add(eol);
    const idAtual=eolParaId.get(eol)||'';
    const idDestino=idAtual||Utilities.getUuid();
    eolParaId.set(eol,idDestino);
    if(d._fonteId){
      if(idFonteParaId.has(d._fonteId)&&idFonteParaId.get(d._fonteId)!==idDestino)
        throw new Error(d._contexto+': identificador de origem duplicado entre alunos.');
      idFonteParaId.set(d._fonteId,idDestino);
    }
    if(!idAtual) {
      validarCampos_('Alunos',d);
      plano.Alunos.push(Object.assign({},d,{_id:idDestino}));
    }
  });
  qtd.Alunos={origem:alunos.length,novos:plano.Alunos.length,ignorados:alunos.length-plano.Alunos.length};
  quantidadeTotal+=plano.Alunos.length;
  VIDE2_TABELAS.slice(1).forEach(modulo=>{
    const fonte=agrupadas[modulo]||[];
    const existentes=new Set(todos_(modulo).map(d=>vide2Chave_(modulo,d)));
    plano[modulo]=[];
    fonte.forEach(d=>{
      const id=(d._origemEol&&eolParaId.get(d._origemEol))||
        (d._refAluno&&idFonteParaId.get(d._refAluno));
      if(!id)throw new Error(d._contexto+': aluno não localizado. Inclua a aba Alunos ou a coluna EOL.');
      const novo=Object.assign({},d,{aluno_id:id});
      validarCampos_(modulo,novo);
      const chave=vide2Chave_(modulo,novo);
      if(existentes.has(chave))return;
      existentes.add(chave);
      plano[modulo].push(Object.assign(novo,{_id:Utilities.getUuid()}));
    });
    qtd[modulo]={origem:fonte.length,novos:plano[modulo].length,
      ignorados:fonte.length-plano[modulo].length};
    quantidadeTotal+=plano[modulo].length;
  });
  if(quantidadeTotal>VIDE2_MAX_LINHAS*VIDE2_TABELAS.length)
    throw new Error('Quantidade de registros excede o limite.');
  return {plano:plano,contagem:qtd,ignorado:ignoradas,totalNovo:quantidadeTotal};
}
function analisarImportacaoV2(entrada) {
  const r=vide2Plano_(entrada);
  return {contagem:r.contagem,ignorado:r.ignorado,totalNovo:r.totalNovo};
}
function importarPlanilhaV2(entrada) {
  const lock=LockService.getDocumentLock()||LockService.getScriptLock();
  lock.waitLock(25000);
  const escritas=[];
  try{
    // Revalida contra a planilha atual para impedir importações duplicadas em paralelo.
    const r=vide2Plano_(entrada);
    const agora=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd HH:mm:ss');
    VIDE2_TABELAS.forEach(modulo=>{
      const itens=r.plano[modulo]||[];
      if(!itens.length)return;
      const aba=obterAba_(modulo);
      const colunas=VIDE_TABELAS[modulo];
      const inicio=aba.getLastRow()+1;
      const dados=itens.map(obj=>colunas.map(c=>{
        const valor=c==='criado_em'||c==='atualizado_em'?agora:obj[c];
        return String(valor==null?'':valor);
      }));
      aba.getRange(inicio,1,dados.length,colunas.length).setNumberFormat('@').setValues(dados);
      escritas.push({aba:aba,inicio:inicio,tamanho:dados.length});
    });
    SpreadsheetApp.flush();
    return {contagem:r.contagem,ignorado:r.ignorado,totalNovo:r.totalNovo};
  }catch(erro){
    // Remove apenas as linhas acrescentadas por esta operação.
    for(let i=escritas.length-1;i>=0;i--){
      try{
        const a=escritas[i];
        a.aba.deleteRows(a.inicio,a.tamanho);
      }catch(e){}
    }
    throw erro;
  }finally{lock.releaseLock();}
}
