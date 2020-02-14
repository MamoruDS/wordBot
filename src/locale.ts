import { readFileSync } from 'fs'
import yaml = require('js-yaml')

const langDir = `./static/locales/`
const langDoc = yaml.safeLoad(readFileSync(`${langDir}en.yml`, 'utf-8'))

const format = (str: string, args: [string | number] | []): string => {
    return str.replace(/(%%)|(%[d|s|j])/g, (x, y, z) => {
        if (y) {
            return '%'
        }
        const arg = args.shift()
        if (z) {
            if (z === '%d') {
                return `${arg}`
            }
            if (z === '%s') {
                return arg.toString()
            }
            if (z === '%j') {
                return JSON.stringify(arg)
            }
        }
        return x
    })
}

class localization {
    private _lang: string
    private _langDoc: object

    constructor(lang: string) {
        this._lang = lang
        this._langDoc = yaml.safeLoad(
            readFileSync(`${langDir}${lang}.yml`, 'utf-8')
        )
    }

    public str = (key: string, args: [string | number] | [] = []): string => {
        if (this._langDoc.hasOwnProperty(key)) {
            return format(this._langDoc[key], args)
        } else {
            return format(langDoc[key], args)
        }
    }
}

export = localization
