const API_KEY = "80be65bb9f8bdedbaad796daa223490e3787e4204e2de2c14b2aa7fea96928da";

const tickersHandlers = new Map();

// вынесим логику работы сокета в наш вебворкет
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREAGTE_INDEX = '5';

// функция отправляет сообщение об установке/удалении тикера
function sendToWebSocket(message) {
  const stringifyMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifyMessage);
    return;
  }

  socket.addEventListener('open', () => {
    socket.send(stringifyMessage);
  }, 
  { once: true })
}

// отправка сокету данных для установки тикера
function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    "action": "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

// отправка сокету данных для удаления тикера
function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    "action": "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

// функция прослушивает ответы сокета и получает данные для изменения цены
socket.addEventListener('message', e => {
  const { TYPE: type, MESSAGE: message, PARAMETER: parameter, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data)
  if(message === 'INVALID_SUB') {
    const parts = parameter.split('~');
    setPrice(parts[2], '-')
  }
  else if(type !== AGGREAGTE_INDEX) {
    return;
  }
  setPrice(currency, newPrice)
})

// функция устанавливает цену для отправленной сокетом валюты
function setPrice(currency, newPrice) {
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker)
  
}

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWs(ticker)
}