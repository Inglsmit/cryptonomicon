//0. register in the service https://min-api.cryptocompare.com/ and get your API KEY

const API_KEY = "380ec498044c900f249ad39326e8320a2cb4ee09b94afe4dff6911e37ef56bfc";

const tickersHandlers = new Map(); // {}
//1. socket link
const socket = new WebSocket(
    `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

// 5. when WS opened -> subscribe on channel (we're listening messages)
socket.addEventListener("message", e => {

    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(
        e.data
    );
    if (type !== AGGREGATE_INDEX || newPrice === undefined) {
        return;
    }

    const handlers = tickersHandlers.get(currency) ?? [];
    // We can see
    console.log(currency, newPrice);
    handlers.forEach(fn => fn(newPrice));
});

function sendToWebSocket(message) {
    const stringifiedMessage = JSON.stringify(message);

    // 3. if WS open then we just send prepared message
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifiedMessage);
        return;
    }

    // 4. when WS will be first open
    socket.addEventListener(
        "open",
        () => {
            socket.send(stringifiedMessage);
        },
        { once: true }
    );
}

// 2. pass string with action for WS.
// String specified for current API https://min-api.cryptocompare.com/documentation/websockets
function subscribeToTickerOnWs(ticker) {
    sendToWebSocket({
        action: "SubAdd",
        subs: [`5~CCCAGG~${ticker}~USD`]
    });
}

function unsubscribeFromTickerOnWs(ticker) {
    sendToWebSocket({
        action: "SubRemove",
        subs: [`5~CCCAGG~${ticker}~USD`]
    });
}

// Inside this Map object - functions list - which we call when some ticker will update
export const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, cb]);
    subscribeToTickerOnWs(ticker);
};

// We left only fn's which is not equal of current cb
export const unsubscribeFromTicker = ticker => {
    tickersHandlers.delete(ticker);
    unsubscribeFromTickerOnWs(ticker);
};
