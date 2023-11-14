const API_KEY = "80be65bb9f8bdedbaad796daa223490e3787e4204e2de2c14b2aa7fea96928da";

const myWorker = new SharedWorker('/sharedWorker.js');

// получает сообщение
myWorker.port.onmessage = (e) => {
  console.log(e.data)
};

myWorker.port.postMessage('sdfsdf');

const tickersHandlers = new Map();

// вынесим логику работы сокета в наш вебворкет
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREAGTE_INDEX = '5';

socket.addEventListener('message', e => { // прослушаем его в шаредворкере
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data) // логика воркера
  if(type !== AGGREAGTE_INDEX) {
    return;
  }
  // логика апи, будем подставлять полученные значения из воркера
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));
  
})

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

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    "action": "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    "action": "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
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