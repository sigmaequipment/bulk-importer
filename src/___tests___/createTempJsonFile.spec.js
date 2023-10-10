const fs = require("fs");
const createTempJSONFile = require('../javascript/createTempJson/createTempJsonFile');
import {describe,it,expect,vi} from "vitest";

describe('createTempJSONFile', () => {
    it('should create a temp JSON file and return a destroy function', async () => {
        const rows = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
        const destroy = await createTempJSONFile(rows, fs);
        expect(typeof destroy).toBe('function');
        // Call the destroy function to delete the temp file
        await destroy();
    });

    it('should throw an error if there is an error writing the file', async () => {
        const rows = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
        const mockFs = {
            writeFile: vi.fn((path, data, callback) => {
                callback(new Error('Failed to write file'));
            }),
        };
        await expect(createTempJSONFile(rows, mockFs)).rejects.toThrow('Failed to write file');
    });

    it('should throw an error if there is an error deleting the file', async () => {
        const rows = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
        const mockFs = {
            writeFile: vi.fn((path, data, callback) => {
                callback(null);
            }),
            unlink: vi.fn((path, callback) => {
                callback(new Error('Failed to delete file'));
            }),
        };
        const destroy = await createTempJSONFile(rows, mockFs);
        await expect(destroy()).rejects.toThrow('Failed to delete file');
    });
});

