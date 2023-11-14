// Массив для хранения всех соединений портов Shared Worker
let connections = [];

// Событие onconnect вызывается, когда устанавливается новое соединение с Shared Worker
self.onconnect = function (e) {
  const port = e.ports[0]; // Получение порта для взаимодействия с основным потоком

  connections.push(port); // Добавление порта в массив соединений

  // Обработчик сообщений для порта Shared Worker
  port.onmessage = function (e) {
    const message = e.data; // Получение данных из сообщения

    // Отправка сообщения всем портам в массиве соединений
    connections.forEach(function (workerPort) {
      // Отправка сообщения от Shared Worker каждому соединенному порту
      workerPort.postMessage(`Message from Shared Worker: ${message}`);
    });
  };

  port.start(); // Запуск порта для обмена сообщениями между основным потоком и Shared Worker
};