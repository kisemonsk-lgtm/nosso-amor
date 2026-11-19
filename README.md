# Nosso Amor ❤️

Site de contagem do namoro: tela de entrada, corações caindo, tempo juntos (anos, meses, dias, horas, minutos e segundos), fotos do casal e música do Spotify.

Tudo é personalizado dentro do próprio site, no botão **✎ Personalizar**:

- título / nome do casal
- data e hora do início do namoro
- mensagem e assinatura
- **fotos do casal** (toque na foto ou na miniatura para escolher da galeria; nomes embaixo de cada foto)
- link ou código da música do Spotify

Fica salvo no aparelho (localStorage), então cada celular personaliza o seu. Funciona como app na tela inicial do celular e abre offline depois da primeira visita.

- `index.html` — o site inteiro (HTML, CSS e JS num só arquivo).
- `manifest.webmanifest`, `sw.js`, `icone-*.png` — instalação como app e funcionamento offline.
- `.deploy.cjs` — publica a pasta no GitHub pela API (sem precisar de git instalado).
