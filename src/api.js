const API_KEY = "ce3fd966e7a1d10d65f907b20bf000552158fd3ed1bd614110baa0ac6cb57a7e";

export const loadTickers = tickers =>
    fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(',')}&tsyms=USD&api_key=${API_KEY}`
    )
        .then(res => res.json())
        .then(rawData =>
            Object.fromEntries(
                Object.entries(rawData).map(([key, value]) => [key, value.USD])
            )
        );
