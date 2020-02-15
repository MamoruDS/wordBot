import { readFileSync } from 'fs'
import yaml = require('js-yaml')
import redis = require('redis')

import * as types from './types'

const menuDir = `./static/inlineMenu/`
const menu = yaml.safeLoad(readFileSync(`${menuDir}routes.yml`, 'utf-8'))

const app = 'wordBot'
import Locale from './locale'
import { resolve } from 'dns'
import { rejects } from 'assert'

const loc = new Locale('zh-Hans')

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
        text: loc.str('common_back'),
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
    let btns = [] as types.inlineKeyboard[]
    for (const btn of Object.values(inlineMenuInfo.btns)) {
        if (btn.type === 'static') {
            let inlineKey: types.inlineKeyboard = {
                text: '',
            }
            inlineKey.text = loc.str(btn.text)
            inlineKey.callback_data = await genCallBackData(btn.redir, btn.data)
            btns.push(inlineKey)
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
                btns.push(inlineKey)
            }
        }
    }
    if (inlineMenuInfo.back) {
        btns.push(await genBackInlineKey(inlineMenuInfo.back))
    }
    return {
        name: loc.str(inlineMenuInfo.name),
        keys: btns,
    }
}
