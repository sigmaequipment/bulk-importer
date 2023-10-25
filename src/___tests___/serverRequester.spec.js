import {describe,expect,it} from "vitest";
const Limiter = require('../javascript/limiter/limiter');
const ServerRequest = require('../javascript/serverRequester/serverRequester');


describe('ServerRequest', () => {
    it('should set the method to GET by default', () => {
        const serverRequest = new ServerRequest(new Limiter(1));
        expect(serverRequest.method).toBe('GET');
    });

    it('should throw an error if an invalid method is set', () => {
        const serverRequest = new ServerRequest(new Limiter(1));
        expect(() => {
            serverRequest.method = 'invalid';
        }).toThrow('Invalid method');
    });

    it('should set the method to uppercase', () => {
        const serverRequest = new ServerRequest(new Limiter(1));
        serverRequest.method = 'post';
        expect(serverRequest.method).toBe('POST');
    });

    it('should set the headers', () => {
        const serverRequest = new ServerRequest(new Limiter(1));
        serverRequest.headers = {
            'Content-Type': 'application/json'
        };
        expect(serverRequest._headers).toEqual({
            'Content-Type': 'application/json'
        });
    });

    it('should merge the headers', () => {
        const serverRequest = new ServerRequest(new Limiter(1));
        serverRequest.headers = {
            'Content-Type': 'application/json'
        };
        serverRequest.headers = {
            'Authorization': 'Bearer token'
        };
        expect(serverRequest._headers).toEqual({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token'
        });
    });

    it('should set a single header', () => {
        const serverRequest = new ServerRequest(new Limiter(1));
        serverRequest.header = {
            key: 'Content-Type',
            value: 'application/json'
        };
        expect(serverRequest._headers).toEqual({
            'Content-Type': 'application/json'
        });
    });

    it('should merge the body', () => {
        const serverRequest = new ServerRequest(new Limiter(1));
        serverRequest.body = {
            name: 'John'
        };
        serverRequest.body = {
            age: 30
        };
        expect(JSON.stringify(serverRequest._body)).toEqual('{"name":"John","age":30}');
    });

    it('should merge the body with an existing object', () => {
        const serverRequest = new ServerRequest(new Limiter(1));
        serverRequest.body = {
            name: 'John'
        };
        serverRequest.body = {
            age: 30
        };
        serverRequest.body = {
            age: 31
        };
        expect(JSON.stringify(serverRequest._body)).toEqual('{"name":"John","age":31}');
    });

    it('should merge the body with an existing string', () => {
        const serverRequest = new ServerRequest(new Limiter(1));
        serverRequest.body = {
            name: 'John'
        };
        serverRequest.body = '{"age":30}';
        expect(JSON.stringify(serverRequest._body)).toEqual('{"name":"John","age":30}');
    });

});

