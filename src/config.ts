import * as fs from 'fs'
import yaml = require('js-yaml')

import * as types from './types'

const CONFIG_PATH = `./config.yml`
const CONFIG_PATH_DEFAULT = `./static/_config.yml`
export const LANG = `./static/locales/`
export const MENU = `./static/inlineMenu/`
