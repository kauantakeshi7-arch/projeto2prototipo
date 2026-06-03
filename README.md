<div align="center">
  <img src="https://img.icons8.com/nolan/128/artificial-intelligence.png" alt="AI PC Builder Logo"/>
  <h1>💻 AI PC Builder (V5 Architecture)</h1>
  <p><strong>A primeira Inteligência Artificial Explicável que atua como Arquiteto de Hardware e Caçador de Preços em Tempo Real.</strong></p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)]()
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)]()
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)]()
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)]()
</div>

---

## 🚀 O que é o projeto?

O **AI PC Builder** não é apenas um buscador de peças. É uma plataforma que aplica conceitos de Engenharia de Software Avançada para extrair a intenção do usuário (via NLP e Regex), calcular matematicamente o melhor setup (evitando gargalos físicos e lógicos) e fazer *Scraping* em tempo real nas maiores lojas de hardware do Brasil.

Para coroar a experiência, a plataforma utiliza **Server-Sent Events (SSE)** para transmitir a montagem da máquina ao vivo para a tela do usuário, finalizando com um Benchmark Dinâmico de Quadros por Segundo (FPS).

## 🛠️ Arquitetura Suprema (V5)

A arquitetura foi iterada 5 vezes até atingir o estado da arte em performance e resiliência:

1. **Explainable AI (IA Explicável):** Ao invés de uma caixa-preta, a IA justifica tecnicamente cada escolha de peça na interface ("Por que escolhi esta Placa Mãe B650M?").
2. **Motor Determinístico de Hardware (`HardwareEngine.ts`):** Protege contra alucinações de IA genativas. Ele dita as regras fixas (Sockets LGA1700/AM5, compatibilidade DDR4/DDR5) impedindo a criação de PCs incompatíveis.
3. **Scraper Militar Resiliente (`ScraperService.ts`):** Utiliza conexões TCP *Keep-Alive* para economizar Handshakes TLS, contorna bloqueios (WAF) com respiração de requisições, normaliza as fotos fragmentadas da loja e conta com Cache em Memória (TTL).
4. **Streaming Contínuo (SSE):** O protocolo HTTP tradicional congela a tela do usuário enquanto o backend trabalha. Nós substituímos isso por *Streams*. Cada peça chega magicamente na tela assim que é encontrada.
5. **Benchmark Dinâmico Imparável (`BenchmarkEngine.ts`):** Extrai o nome da GPU encontrada, normaliza o texto usando Regex e cruza com um banco de dados local para estimar o FPS em jogos AAA (Cyberpunk, GTA V, CS2).
6. **Micro-Componentização React:** O Frontend blinda a árvore de renderização. O botão de justificativa (`<PartCard>`) isola o estado, impedindo que animações e cálculos da página inteira travem processadores de celulares.

---

## ⚙️ Como rodar o projeto localmente

### 1. Clonando o Repositório
```bash
git clone https://github.com/seu-usuario/ai-pc-builder.git
cd ai-pc-builder
```

### 2. Configurando o Backend (API)
O Backend exige a chave de API do Google Gemini para a extração avançada de intenções de linguagem natural.
```bash
cd backend
npm install
# Crie um arquivo .env e coloque sua GEMINI_API_KEY
npm run dev
```

### 3. Configurando o Frontend (UI)
```bash
cd frontend
npm install
# Opcional: Crie um .env contendo NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

Acesse `http://localhost:3000` e seja bem-vindo ao futuro da montagem de computadores.

---

## 🔒 Segurança Aplicada
- **Proteção contra JSON Poisoning:** O Express limita cargas a `10kb`.
- **CORS Estrito:** Regras claras no Backend.
- **Race Condition Prevention:** O Frontend possui `AbortController` bloqueando duplo-submits de formulário e vazamento de memória.
- **Strict Mode Compilation:** Todo o ecossistema TypeScript está blindado contra injeções nulas.

> Construído com dedicação, lógica impecável e orgulho por **[Seu Nome / Portfólio]**.
