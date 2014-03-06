CommuniqueAPI
=============

[G0V Communique API](http://g0v-communique-api.herokuapp.com/api/1.0/entry/all). Parsing from [g0v hackpad](https://g0v.hackpad.com/ep/group/yZ9JT9UlJf4).

## Usage

- GET all data of the tag
    + /api/1.0/entry/${tag}
- GET tag's data by date (YY or YY-MM or YY-MM-DD)
    + /api/1.0/entry/{$tag}?start=YY-MM
    + /api/1.0/entry/${tag}?start=YY-MM&end=YY-MM
- GET List of tags
    + /api/1.0/tags
- GET data by limit = x
    + /api/1.0/entry/${tag}?limit=x

## Tag List

You can get from [API](http://g0v-communique-api.herokuapp.com/api/1.0/tags).

"All" is also one of tags and is used to get all data.

```tags.json
[
    "動民主",
    "g0v外交",
    "專案中心",
    "對外宣傳和媒體報導",
    "hackathon",
    "基礎建設",
    "立法院專案",
    "leve1up",
    "g0v文化部",
    "萌典",
    "g0v專案中心",
    "環境儀表板",
    "爬資料",
    "g0v冷知識",
    "政誌",
    "irc",
    "服貿協議",
    "iHelp",
    "待整理",
    "對外宣傳",
    "鄉民關心你",
    "福利請聽",
    "新聞小幫手",
    "公務人員考察網"
]
```

## Data format

```data.json
[
    {
        date: "2014/02/05",
        padID: "6hGHxaQ0yjb",
        tags: [
            "對外宣傳和媒體報導"
        ],
        content: "g0v 社群與英國推動數位民主的非營利組織 mySociety 及智利 Ciudadano Inteligente 基金會進行 irc 聊天室群談（紀錄），介紹彼此專案與合作可能，共二十餘人參與。 ",
        comment: [],
        urls: [
            {
                name: "mySociety",
                url: "http://www.mysociety.org/"
            }
        ],
        _id: "52f3be549d718d0200000026"
    }
]
```

## Config

Generate `config.js`.

```config.js
module.exports = {
    hackpad: {
        site: "Your hackpad's site",
        client: "You can find it on your account page in your site",
        secret: "You can find it on your account page in your site"
    }
}
```

## Change Log

### 2014/03/07 v0.1.2
- It parses the communique form [http://g0v.hackpad.com](http://g0v.hackpad.com) automatically.It didn't config pad's ID anymore.

### 2014/03/06 v0.1.1
- It can get entry by limit length. Like /api/1.0/entry/${tag}?limit=x

## Installation

`npm i`

## License

The MIT License (MIT)

Copyright (c) 2014 Lee  < jessy1092@gmail.com >

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
