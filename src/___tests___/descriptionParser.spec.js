import {describe,expect,it} from "vitest";
import descriptionParser from "../javascript/utils/parseDescription"




describe(" The Description parser takes a string and an array of expected keys and returns an object with the keys and values",()=>{
    it("Takes a test string a returns an object with the expected keys and values",()=>{
        const testString = `THIS IS A TEST ITEM FOR TESTING ATTRIBUTES, DO NOT APPROVE THIS ITEM||VOLTAGE: 44||RPM: 15||FRAME: TEST FRAME||HORSEPOWER RATING: 52||PHASE: TEST PHASE`
         const expectedKeys = [
            "VOLTAGE",
            "RPM",
            "FRAME",
            "HORSEPOWER RATING",
            "PHASE"
        ]
        const result = descriptionParser(testString,expectedKeys)
        expect(result).toEqual({
            "VOLTAGE": "44",
            "RPM": "15",
            "FRAME": "TEST FRAME",
            "HORSEPOWER RATING": "52",
            "PHASE": "TEST PHASE"
        })
    })
    it("Still works when missing keys",()=>{
        const testString = `THIS IS A TEST ITEM FOR TESTING ATTRIBUTES, DO NOT APPROVE THIS ITEM||VOLTAGE: 44||RPM: 15||HORSEPOWER RATING: 52||PHASE: TEST PHASE`
        const expectedKeys = [
            "VOLTAGE",
            "RPM",
            "FRAME",
            "HORSEPOWER RATING",
            "PHASE"
        ]
        const result = descriptionParser(testString,expectedKeys)
        expect(result).toEqual({
            "VOLTAGE": "44",
            "RPM": "15",
            "FRAME": "",
            "HORSEPOWER RATING": "52",
            "PHASE": "TEST PHASE"
        })
    })
    it("Still works when all keys are missing",()=>{
        const testString = `THIS IS A TEST ITEM FOR TESTING ATTRIBUTES, DO NOT APPROVE THIS ITEM`
        const expectedKeys = [
            "VOLTAGE",
            "RPM",
            "FRAME",
            "HORSEPOWER RATING",
            "PHASE"
        ]
        const result = descriptionParser(testString,expectedKeys)
        expect(result).toEqual({
            "VOLTAGE": "",
            "RPM": "",
            "FRAME": "",
            "HORSEPOWER RATING": "",
            "PHASE": ""
        })
    })
    it("Still works when the string contains white space",()=> {
        const testString = `THIS IS A TEST ITEM FOR TESTING ATTRIBUTES, DO NOT APPROVE THIS ITEM||VOLTAGE: 44||RPM: 15||FRAME: TEST FRAME ||HORSEPOWER RATING: 52 ||PHASE: TEST PHASE`
        const expectedKeys = [
            "VOLTAGE",
            "RPM",
            "FRAME",
            "HORSEPOWER RATING",
            "PHASE"
        ]
        const result = descriptionParser(testString, expectedKeys)
        expect(result).toEqual({
            "VOLTAGE": "44",
            "RPM": "15",
            "FRAME": "TEST FRAME",
            "HORSEPOWER RATING": "52",
            "PHASE": "TEST PHASE"
        })
    })
})