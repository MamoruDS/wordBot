import * as fs from 'fs'
import yaml = require('js-yaml')

import * as types from './types'

const CONFIG_PATH = `./config.yml`
const CONFIG_PATH_DEFAULT = `./static/_config.yml`
export const LANG = `./static/locales/`
export const MENU = `./static/inlineMenu/`

if (!fs.existsSync(CONFIG_PATH)) {
    fs.copyFileSync(CONFIG_PATH_DEFAULT, CONFIG_PATH)
}

const getProfile = (): types.profile => {
    let _profile = {} as types.profile
    try {
        _profile = yaml.safeLoad(fs.readFileSync(CONFIG_PATH, 'utf-8'))
    } catch (e) {
        // if(e instanceof yaml.YAMLException)
        console.log('[ERROR] Can not parse yaml config file.')
        process.exit(1)
    } finally {
        return _profile
    }
}

export const getServer = (): types.serverInfo => {
    return getProfile().server
}

export const getBot = (): { token: string; owner_id?: string | number } => {
    return getProfile().bot
}

export const getLang = (): string => {
    return getProfile().lang
}

export const getLineWidth = (): number => {
    return getProfile()['line-width']
}
