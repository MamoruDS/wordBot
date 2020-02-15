export interface serverInfo {
    url?: string
    addr: string
    protocol: 'http' | 'https'
    port: number | 80 | 443
    prefix?: string
}

export interface resData {
    data: object[]
}

export interface reqRes {
    data: resData
    err: boolean
    errMsg?: string
}

interface wordRender {
    alias: aliasInfo[]
    render: string
    render_style: string
}

interface aliasInfo {
    renderField: string
    renderTag: string
    wordField: string
}

export interface bookObj {
    book_id: string
    book_name: string
    book_field: object
    word_render: wordRender
    book_cover_url: string
}

export interface inlineKeyboard {
    text: string
    url?: string
    callback_data?: string
    switch_inline_query?: string
    switch_inline_query_current_chat?: string
}

export interface inlineKBData {
    text: string
    url?: string
    callbackData?: object
    switchInlineQuery?: string
    switchInlineQueryCurrentChat?: string
}

export interface inlineMenuBtn {
    type: 'data' | 'static'
    text?: string
    redir: string | 'prevent'
    data?: object
}

export interface inlineMenuInfo {
    name: string
    back: false | string
    btns: inlineMenuBtn[]
}

export interface inlineMenu {
    name: string
    // keys: inlineKeyboard[]
    keys: inlineKeyboard[][]
}
