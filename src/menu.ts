import { readFileSync } from 'fs'
import yaml = require('js-yaml')
import redis = require('redis')

import * as types from './types'
import * as config from './config'

const menu = yaml.safeLoad(readFileSync(`${config.MENU}routes.yml`, 'utf-8'))

const app = 'wordBot'
import loc from './locale'

// const loc = new Locale('zh-Hans')
const maxLineWidth = 50

const redisCli = redis.createClient()

redisCli.flushall()

redisCli.on('error', err => {
    // console.error(err)
})

export const dataGet = async (key: string, rm?: boolean): Promise<object> => {
    return new Promise(resolve => {
        redisCli.get(key, (err, val) => {
            if (rm) redisCli.del(key)
            if (val != null) resolve(JSON.parse(val))
            else resolve({})
        })
    })
}

export const dataSet = async (key: string, val: object) => {
    return new Promise(resolve => {
        redisCli.set(key, JSON.stringify(val), (err, res) => {
            resolve(res)
        })
    })
}

const genCallBackData = async (
    route: string,
    data: object = {}
): Promise<string> => {
    const length = route.length
    const targetLength = 3
    const space = Math.floor(length / targetLength)
    const o = Math.round(Math.random() * targetLength)
    const s = route
        .split('')
        .map((v, i, a) => {
            if (i % space === o) return v
        })
        .filter(v => v != undefined)
        .join('')
    const key = `D-${Date.now()}${s}`
    await dataSet(key, {
        app: app,
        redir: route,
        data: data,
    })
    return key
}

const genBackInlineKey = async (
    redir?: string
): Promise<types.inlineKeyboard> => {
    let inlineKey: types.inlineKeyboard = {
        text: loc('common_back'),
    }
    inlineKey.callback_data = await genCallBackData(redir)
    return inlineKey
}

export const inlineMenu = async (
    route: string,
    data?: types.inlineKBData[]
): Promise<types.inlineMenu> => {
    if (!menu.hasOwnProperty(route)) {
        const notFound = route
        route = 'app/404'
    }
    const inlineMenuInfo: types.inlineMenuInfo = menu[route]
    let kb = new inlineKB()
    for (const btn of Object.values(inlineMenuInfo.btns)) {
        if (btn.type === 'static') {
            let inlineKey: types.inlineKeyboard = {
                text: '',
            }
            inlineKey.text = loc(btn.text)
            inlineKey.callback_data = await genCallBackData(btn.redir, btn.data)
            kb.addKey(inlineKey)
        }

        if (btn.type === 'data') {
            for (let d of data) {
                let inlineKey: types.inlineKeyboard = Object.assign(
                    {},
                    { ...d }
                )
                inlineKey.callback_data = await genCallBackData(
                    btn.redir,
                    d.callbackData
                )
                kb.addKey(inlineKey)
            }
        }
    }
    if (inlineMenuInfo.back) {
        kb.addKey(await genBackInlineKey(inlineMenuInfo.back), true)
    }
    return {
        name: loc(inlineMenuInfo.name),
        keys: kb.getInlineKB(),
    }
}

class inlineKB {
    private _btnGrp: types.inlineKeyboard[][]
    private _lineWidth: number[]
    private _curLine: number

    constructor() {
        this._btnGrp = []
        this._lineWidth = []
        this._curLine = -1
        this.addLine()
    }

    private addLine(): void {
        this._btnGrp.push([])
        this._curLine++
        this._lineWidth.push(0)
    }

    public addKey(
        inlineKey: types.inlineKeyboard,
        isNewLine?: boolean,
        isAutoAppend?: boolean
    ): void {
        if (isNewLine) {
            this.addLine()
            this._btnGrp[this._curLine].push(inlineKey)
            this._lineWidth[this._curLine] = Infinity
            return
        }
        const lineCheck = this._lineWidth
            .map((v, i) => {
                if (v + inlineKey.text.length > maxLineWidth) return -1
                else return i
            })
            .filter(v => v != -1)
        if (lineCheck.length === 0) {
            this.addLine()
            return this.addKey(inlineKey, isAutoAppend)
        }
        let inertLine = this._curLine
        if (lineCheck[0] !== this._curLine && isAutoAppend) {
            inertLine = lineCheck[0]
        }
        this._btnGrp[inertLine].push(inlineKey)
        this._lineWidth[inertLine] += inlineKey.text.length
        return
    }

    public getInlineKB(): types.inlineKeyboard[][] {
        return this._btnGrp
    }
}
