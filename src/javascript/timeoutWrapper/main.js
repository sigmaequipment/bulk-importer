function timeout(ms,rej) {
    let timeoutId;
    timeoutId = setTimeout(() => {
        rej("Timeout")
    },ms)
    return () => clearTimeout(timeoutId)
}

module.exports = function timeoutWrapper (ms) {
    return (handler,...args) => new Promise(async (res,rej) => {
        if(!handler) return rej("No handler");
        let cancel = timeout(ms,rej);
        try {
            res(await handler(...args))
        }
        catch (e) {
            rej(e)
        }
        finally {
            cancel()
        }
    })
}