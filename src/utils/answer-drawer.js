class AnswerDrawer {
    // TODO:
    // create hide method

    constructor(context, answers) {
        this._context        = context
        this._answers        = answers
        this._answer         = answers[0]
        this._drawerFragment = new DocumentFragment()
        this._generate_elements()
    }


    _generate_elements() {
        const drawer            = document.createElement('div')
        const drawerContent     = document.createElement('div')
        const infoBar           = this._createInfoBar(this._answer)

        drawerContent.innerHTML = this._answer.body

        drawer.className        = 'answer-drawer'
        drawerContent.className = 'drawer-content'

        drawer.appendChild(drawerContent)
        drawer.appendChild(infoBar)

        this._drawerFragment.appendChild(drawer)
        this._drawerFragment.querySelectorAll('pre').forEach(block => {
            hljs.highlightBlock(block)
        })
    }


    _createInfoBar(answer) {
        for (const a of this._answers) {
            console.log(a)
        }

        return document.createRange().createContextualFragment(`
            <table class="info-bar">
                <tbody>
                    <tr>
                        <td>
                            <div>
                              <img src="${answer.owner.profile_image}">
                            </div>
                            <div>
                                <h4>
                                    <a href="${answer.owner.link}" target="_blank">${answer.owner.display_name}</a>
                                </h4>
                                <h4>${this._formatNumber(answer.owner.reputation)}</h4>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h5>${this._toReadableDate(answer.last_edit_date)}</h5>
                        </td>
                    <tr>
                </tbody>
            </table>
        `)
    }

    _toReadableDate(timestamp) {
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
               date = new Date(timestamp * 1000)

        return date.toLocaleDateString("en-US", options)
    }


    show() {
        this._context.parent().append(this._drawerFragment)
        this._context.attr('drawner-shown', 'yes')
    }


    _formatNumber(value) {
        if (value < 10000)
            return value

        let suffixes = ['', 'K', 'M', 'B', 'T'],
             suffixN = Math.floor(('' + value).length / 4),
          shortValue = parseFloat((suffixN != 0 ? (value / Math.pow(1000, suffixN)) : value).toPrecision(6))

        if (shortValue % 1 != 0)
            shortValue = shortValue.toFixed(1)

        return shortValue + suffixes[suffixN]
    }
}
