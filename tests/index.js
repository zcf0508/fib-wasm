import assert from "assert";
import { fib } from "../build/debug.js";
assert.strictEqual(fib(7), 13);
console.log("ok");
