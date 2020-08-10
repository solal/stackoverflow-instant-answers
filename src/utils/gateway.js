class Gateway {
    constructor() {}


    get(url, handler) {
        fetch(url)
        .then(response => response.json())
        .then(data => { return handler(data) })
        .catch(err => {
            console.log("Something went wrong with GET to " + url)
        })
    }


    post(url, payload, handler) {
        fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload, null, '\t')
        })
        .then(response => response.json())
        .then(data => { return handler(data) })
        .catch(err => {
            console.log("Something went wrong with POST to " + url)
        })
    }
}