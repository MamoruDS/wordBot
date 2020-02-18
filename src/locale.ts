import { readFileSync } from 'fs'
import yaml = require('js-yaml')

import * as config from './config'

const langDoc = yaml.safeLoad(readFileSync(`${config.LANG}en.yml`, 'utf-8'))

const getLangStr = (
    field: string,
    lang: string = 'en',
    warn: boolean = true,
    altLang: string = 'en'
) => {
    let _lang = ''
    try {
        _lang = yaml.safeLoad(
            readFileSync(`${config.LANG}${lang}.yml`, 'utf-8')
        )[field]
    } catch (e) {
        if (e instanceof yaml.YAMLException && warn) {
            console.log(`[ERROR] Can not parse yaml file ${lang}.yml`)
        }
    } finally {
        if (_lang === undefined || _lang === null) {
            _lang = ''
            if (warn)
                console.log(
                    `[ERROR] Can not get field:["${field}"] in lang[${lang}]`
                )
        }
        if (_lang === '') {
            if (lang === altLang) {
                return '[UNKNOWN_FIELD]'
            } else {
                return getLangStr(field)
            }
        } else {
            return _lang
        }
    }
}

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
            readFileSync(`${config.LANG}${lang}.yml`, 'utf-8')
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
