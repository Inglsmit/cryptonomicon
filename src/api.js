const API_KEY = "ce3fd966e7a1d10d65f907b20bf000552158fd3ed1bd614110baa0ac6cb57a7e";
const tickersHandlers = new Map();

const loadTickers = () => {
    if(tickersHandlers.size === 0) return;

    fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`
    )
        .then(res => res.json())
        .then(rawData => {
            const updatedPrices = Object.fromEntries(
                Object.entries(rawData).map(([key, value]) => [key, value.USD])
            );

            Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
                const handlers = tickersHandlers.get(currency) ?? [];
                handlers.forEach((fn) => fn(newPrice));
            })

        });
}

// Inside this Map object - functions list - which we call when some ticker will update
export const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, cb]);
};

// We left only fn's which is not equal of current cb
export const unsubscribeFromTicker = (ticker, cb) => {
    // const subscribers = tickersHandlers.get(ticker) || [];
    // tickersHandlers.set(ticker, subscribers.filter(fn => fn !== cb));
    tickersHandlers.delete(ticker)
};

setInterval(loadTickers, 5000);
window.tickers = tickersHandlers;
