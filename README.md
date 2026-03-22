# Carta interativa

Projeto: carta digital interativa;

## Estrutura do projeto

- `index.html` - HTML principal com a carta, botões, segredos, e lugar para o conteúdo.
- `styles.css` - estilo e animações visuais (papel, luz, selo, estrelas, etc.).
- `script.js` - lógica de segredos, botão de compromisso, contador, animações de partículas, áudio.

## Funcionalidades

- Carta com design realista de papel queimado e luz aconchegante.
- Texto romantico e personalizacao para Ana Clara.
- Segredos interativos:
  - 3 estrelas que revelam mensagem completa
  - palavras clicáveis (manuscrito) com revelações
  - canto dobrado (PS), borrões, frase oculta, assinatura com tinta invisível, selo de cera
  - painel de segredos com contagem e persistência local
- Botão de compromisso único "Aceita namorar comigo?" (salva data em localStorage e mostra contagem de tempo)
- Música/som produzidos via Web Audio API
- Persistência com `localStorage` para estado de segredos, selo e data

## Uso

1. Abra `index.html` num navegador moderno (Chrome/Firefox recomendados).
2. Interaja com as estrelas, palavras e selo para descobrir segredos.
3. Clique no botão para iniciar contador e gravar início do namoro.
4. Ative/desative som com botão `♪`.

## Licença

MIT
