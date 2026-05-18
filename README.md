<p align="center">
  <img src="banner.png" alt="PIX GG Bot" width="100%">
</p>

<h1 align="center">Pix GG Payment Automation</h1>
<p align="center">
  <b>Geração e verificação automática de pagamentos PIX via PIX GG</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square&logo=node.js">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square">
  <img src="https://img.shields.io/badge/Status-Funcional-success?style=flat-square">
</p>

---

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/Felix404snow/pixggbot.git
cd pixggbot

# Instale as dependências
npm install axios qrcode
```

---

## ⚙️ Configuração

Você pode configurar de **duas formas**:

### 1. Variáveis de Ambiente (Recomendado)

```bash
export PIXGG_STREAMER_ID="seu-id-aqui"
export PIXGG_EMAIL="seu@email.com"
export PIXGG_PASSWORD="sua-senha"
```

### 2. Direto no Código

Edite o objeto `CONFIG` no arquivo `script.js`:

```js
const CONFIG = {
  streamerId: 'seu-id-aqui',
  email: 'seu@email.com',
  password: 'sua-senha'
};
```

---

## 🚀 Uso

```js
import { generatePixPayment, checkPayment, login } from './script.js';

// 1. Gerar um pagamento PIX
const pix = await generatePixPayment({
  amount: 10.00,                          // Valor em R$
  productName: 'Produto X',               // Nome do produto (opcional)
  customerMessage: 'Pagamento teste'      // Mensagem (opcional)
});

console.log(pix.qrCode);   // QR Code em base64
console.log(pix.pixUrl);   // URL ou BR Code PIX

// 2. Verificar se foi pago
const status = await checkPayment(pix.paymentToken);
console.log(status.confirmed); // true ou false
```

---

## 📁 Estrutura

```
pixggbot/
├── banner.png      # Banner do projeto
├── script.js       # Código principal
├── README.md       # Este arquivo
└── package.json    # Dependências
```

---

## ✨ Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| 🔐 Login automático | Faz login na PIX GG automaticamente |
| 💰 Geração de PIX | Cria pagamentos com QR Code em base64 |
| 🔍 Verificação | Checa status de pagamento pelo token |
| ⚙️ Configurável | Email e senha via env ou código |

---

## 🛠️ Tecnologias

- [Node.js](https://nodejs.org/) — Runtime JavaScript
- [Axios](https://axios-http.com/) — Requisições HTTP
- [QRCode](https://www.npmjs.com/package/qrcode) — Geração de QR Codes

---

## 📝 Licença

Este projeto está sob a licença **MIT**.

```
Feito com 💚 por isnouu
```

---

<p align="center">
  ⭐ Se esse projeto te ajudou, deixa uma estrela no repositório!
</p>
