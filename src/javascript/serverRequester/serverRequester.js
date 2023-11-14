const fetch = require('node-fetch');

class ServerRequest {
    constructor(limiter) {
        this.limiter = limiter;
        this._headers = null;
        this._body = null;
        this.method = 'GET';
    }
    sanitize(data){
        if(typeof data === 'string'){
            return this.sanitize(JSON.parse(data));
        }
        return JSON.parse(JSON.stringify(data));
    }

    set body(body) {
        if(!this._body){
            this._body = body;
        }else{
            let oldBody = this.sanitize(this._body);
            let newBody = this.sanitize(body);
            this._body = this.sanitize({...oldBody, ...newBody});
        }
    }
    get body() {
        return this._body;
    }


    set headers(headers) {
        let temp = headers
        if(this._headers) {
            temp = {...this._headers, ...headers}
        }
        this._headers = temp;
    }
    set header (header) {
        if(!this._headers) {
            this._headers = {};
        }
        this._headers[header.key] = header.value;
    }
    set method(method) {
        method = method.toUpperCase();
        if(method !== 'GET' && method !== 'POST' && method !== 'PUT' && method !== 'DELETE') {
            throw new Error('Invalid method');
        }
        this._method = method;
    }
    get method() {
        return this._method;
    }
    async executeRequest(url) {
        return this.limiter.schedule(() => {
            return fetch(url, {
                method: this.method,
                headers: this._headers,
                body: this.body
            })
        })
    }
}

module.exports = ServerRequest;