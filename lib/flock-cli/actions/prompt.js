"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Inquirer = require("inquirer");
/*
 * Ensures that prompting for questions has answers merged into already provided
 * answers, and removes questions that don't need to be asked (i.e. already
 * have an answer). Ensures that all properties on a question definition that
 * are functions have the all answers up to that point in the questions sequence
 * provided as args (i.e. same as the inquirer API).
 */
function prompt(questions, { answers = {} } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const bind = fn => a => fn(Object.assign({}, a, answers));
        const bind2 = fn => (input, a) => fn(input, Object.assign({}, a, answers));
        questions.filter(x => {
            // Filter out questions that already have an answer provided.
            return answers[x.name] === undefined;
        }).map(x => {
            // Bind all options that are defined as a function so that the provided
            // answers and the prompted answers are merged and passed to the function.
            return Object.assign({}, x, {
                message: typeof x.message === 'function' ? bind(x.message) : x.message,
                default: typeof x.default === 'function' ? bind(x.default) : x.default,
                choices: typeof x.choices === 'function' ? bind(x.choices) : x.choices,
                when: typeof x.when === 'function' ? bind(x.when) : x.when,
                validate: typeof x.validate === 'function' ? bind2(x.validate) : x.validate,
                transformer: typeof x.transformer === 'function' ? bind2(x.transformer) : x.transformer
            });
        });
        // If we have questions that don't already have an answer provided then we ask
        // them. We do this to avoid the unterminated process bug in Inquirer when
        // there are no questsion to ask (i.e. when resolves to false for each question).
        if (questions.length > 0) {
            const a = yield Inquirer.prompt(questions);
            answers = Object.assign({}, a, answers);
        }
        return answers;
    });
}
exports.prompt = prompt;
