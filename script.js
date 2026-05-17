import axios from 'axios';
import QRCode from 'qrcode';
import crypto from 'crypto';

// ============================
// ⚙️ CONFIGURAÇÕES
// ============================
const CONFIG = {
  // ⬇️ COLOQUE SEUS DADOS DA PIX GG AQUI ⬇️
  streamerId: process.env.PIXGG_STREAMER_ID || 'SEU_STREAMER_ID_AQUI',
  email: process.env.PIXGG_EMAIL || 'SEU_EMAIL_AQUI',
  password: process.env.PIXGG_PASSWORD || 'SUA_SENHA_AQUI'
};

const API = {
  LOGIN: 'https://app.pixgg.com/users/login',
  CHECKOUT: 'https://app.pixgg.com/checkouts',
  REPORTS: 'https://app.pixgg.com/Reports/Donations'
};

let authToken = null;

// ============================
// 🔧 UTILITÁRIOS
// ============================
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

function getHeaders(auth = false) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Origin': 'https://pixgg.com',
    'Referer': 'https://pixgg.com/'
  };
  if (auth) {
    headers['Authorization'] = authToken ? `Bearer ${authToken}` : 'Bearer null';
  }
  return headers;
}

// ============================
// 🔐 AUTENTICAÇÃO
// ============================
export async function login(email, password) {
  const userEmail = email || CONFIG.email;
  const userPass = password || CONFIG.password;

  if (!userEmail || !userPass) {
    console.error('❌ Email e senha são obrigatórios.');
    return false;
  }

  try {
    console.log('🔐 Fazendo login na PIX GG...');
    const { data } = await axios.post(API.LOGIN, {
      email: userEmail,
      password: userPass
    }, { headers: getHeaders(), timeout: 10000 });

    if (data?.authToken) {
      authToken = data.authToken;
      console.log('✅ Login realizado com sucesso!');
      return true;
    }
    console.log('❌ Login falhou.');
    return false;
  } catch (err) {
    console.error('🔥 Erro no login:', err.message);
    return false;
  }
}

// ============================
// 💰 GERAR PAGAMENTO PIX
// ============================
export async function generatePixPayment(paymentData) {
  const { amount, productName, customerMessage } = paymentData || {};

  if (!amount || isNaN(amount)) {
    return { success: false, error: 'Valor inválido ou não informado.' };
  }

  console.log(`💰 Gerando PIX: R$ ${amount} — ${productName || 'Sem descrição'}`);

  if (!authToken) {
    const ok = await login();
    if (!ok) {
      return { success: false, error: 'Falha na autenticação com PIX GG.' };
    }
  }

  try {
    const token = generateToken();
    const payload = {
      streamerId: CONFIG.streamerId,
      donatorNickname: token,
      donatorMessage: customerMessage || 'Pagamento via Bot',
      donatorAmount: parseFloat(amount),
      minimumDonateAmount: null,
      fileId: null,
      youTubeVideoId: '',
      YouTubeVideoStart: 0,
      YouTubeVideoEnd: 0,
      country: 'Brazil',
      cryptoCoin: null,
      cryptoNetwork: 'ETH'
    };

    const { data } = await axios.post(API.CHECKOUT, payload, {
      headers: getHeaders(true),
      timeout: 15000
    });

    if (data?.pixUrl) {
      const qrCode = await QRCode.toDataURL(data.pixUrl);
      console.log('✅ PIX gerado com sucesso!');
      return {
        success: true,
        pixId: token,
        paymentToken: token,
        pixUrl: data.pixUrl,
        qrCode,
        amount: parseFloat(amount)
      };
    }

    return { success: false, error: 'Resposta inválida da PIX GG.' };
  } catch (err) {
    console.error('❌ Erro ao gerar PIX:', err.message);
    return { success: false, error: 'Erro ao gerar pagamento: ' + err.message };
  }
}

// ============================
// 🔍 VERIFICAR PAGAMENTO
// ============================
export async function checkPayment(paymentToken) {
  if (!paymentToken) {
    return { confirmed: false, status: 'error', error: 'Token não informado.' };
  }

  console.log(`🔍 Verificando pagamento: ${paymentToken}`);

  if (!authToken) {
    const ok = await login();
    if (!ok) {
      return { confirmed: false, status: 'error', error: 'Falha na autenticação.' };
    }
  }

  try {
    const { data } = await axios.get(API.REPORTS, {
      headers: getHeaders(true),
      params: { page: 1, pageSize: 20, donatorNickName: paymentToken },
      timeout: 10000
    });

    if (Array.isArray(data) && data.length > 0) {
      const donation = data[0];
      if (donation.status === 3) {
        console.log('✅ Pagamento confirmado!');
        return { confirmed: true, status: 'paid', paymentData: donation };
      }
      console.log(`⏳ Status: ${donation.status} (pendente)`);
      return { confirmed: false, status: 'pending' };
    }

    console.log('⏳ Pagamento não encontrado.');
    return { confirmed: false, status: 'pending' };
  } catch (err) {
    console.error('❌ Erro na verificação:', err.message);
    return { confirmed: false, status: 'error', error: err.message };
  }
}
